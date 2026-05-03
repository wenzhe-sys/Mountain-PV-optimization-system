import json
import os
import sys
import traceback
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from config import ALGORITHM_REPO_PATH
from database import get_db
from models import Instance, ComputationJob, ModuleResult, User
from routers.auth import get_current_user

router = APIRouter(prefix="/algorithm", tags=["algorithm"])

executor = ThreadPoolExecutor(max_workers=2)

RAW_DATA_DIR = os.path.join(ALGORITHM_REPO_PATH, "data", "raw", "PV", "real")
EXTENDED_DATA_DIR = os.path.join(ALGORITHM_REPO_PATH, "data", "processed", "PV", "public", "extended")

ALGORITHM_REPO_EXISTS = os.path.exists(ALGORITHM_REPO_PATH)


class OptimizationRequest(BaseModel):
    instance_id: str
    use_dqn: bool = True
    max_iter: int = 20
    verbose: bool = True
    fast_mode: bool = False


def _make_update_callback(job_id: int, db_url: str):
    def callback(status: str, progress: float, error: str = None):
        from sqlalchemy import create_engine
        from sqlalchemy.orm import Session as SA_Session
        engine = create_engine(db_url, connect_args={"check_same_thread": False})
        with SA_Session(engine) as session:
            job = session.query(ComputationJob).filter(ComputationJob.id == job_id).first()
            if job:
                job.status = status
                job.progress = progress
                if error:
                    job.error_message = error
                if status == "completed":
                    job.completed_at = datetime.utcnow()
                    inst = session.query(Instance).filter(Instance.id == job.instance_id).first()
                    if inst:
                        inst.status = "completed"
                elif status == "failed":
                    job.completed_at = datetime.utcnow()
                    inst = session.query(Instance).filter(Instance.id == job.instance_id).first()
                    if inst:
                        inst.status = "failed"
                session.commit()
    return callback


def _run_optimization(job_id: int, instance_id: str, use_dqn: bool, max_iter: int, verbose: bool, fast_mode: bool, db_url: str):
    callback = _make_update_callback(job_id, db_url)

    try:
        if not ALGORITHM_REPO_EXISTS:
            callback("failed", 0, error="算法仓库不存在")
            return

        callback("running_m1", 10)

        import subprocess

        main_script = os.path.join(ALGORITHM_REPO_PATH, "main.py")

        cmd = [
            sys.executable, main_script,
            "--instance_id", instance_id,
            "--max_iter", str(max_iter),
        ]
        if use_dqn:
            cmd.append("--use_dqn")
        if verbose:
            cmd.append("--verbose")
        if fast_mode:
            cmd.append("--fast_mode")

        process = subprocess.Popen(
            cmd,
            cwd=ALGORITHM_REPO_PATH,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        progress_map = {
            "数据预处理": 15,
            "加载算例": 25,
            "光伏面板切割及分区": 40,
            "电气设备选型及电缆共沟": 60,
            "全生命周期集成优化": 80,
            "指标计算与结果可视化": 95
        }

        while True:
            line = process.stdout.readline()
            if not line and process.poll() is not None:
                break
            if line:
                print(line.strip())
                for step, progress in progress_map.items():
                    if step in line:
                        callback(f"running_{step}", progress)
                        break

        stdout, stderr = process.communicate()

        if process.returncode != 0:
            error_message = stderr or "Unknown error"
            callback("failed", 0, error=error_message)
            return

        callback("completed", 100)

        from sqlalchemy import create_engine
        from sqlalchemy.orm import Session as SA_Session
        engine = create_engine(db_url, connect_args={"check_same_thread": False})
        with SA_Session(engine) as session:
            for module in [1, 2, 3]:
                result_path = os.path.join(ALGORITHM_REPO_PATH, "data", "results", f"module{module}", f"M{module}-Output_{instance_id}.json")
                if os.path.exists(result_path):
                    with open(result_path, "r", encoding="utf-8") as f:
                        result_data = json.load(f)
                    mr = ModuleResult(
                        job_id=job_id,
                        instance_id=instance_id,
                        module=module,
                        result_json=json.dumps(result_data, ensure_ascii=False),
                    )
                    session.add(mr)
            session.commit()

    except Exception as e:
        callback("failed", 0, error=f"{type(e).__name__}: {e}\n{traceback.format_exc()}")


@router.post("/optimize")
def run_optimization(
    request: OptimizationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    instance_id = request.instance_id

    inst = db.query(Instance).filter(Instance.instance_id == instance_id).first()
    if not inst:
        raise HTTPException(404, "算例不存在")

    running = (
        db.query(ComputationJob)
        .filter(
            ComputationJob.instance_id == inst.id,
            ComputationJob.status.in_(["pending", "running_m1", "running_m2", "running_m3"]),
        )
        .first()
    )
    if running:
        raise HTTPException(400, "该算例已有正在运行的计算任务")

    job = ComputationJob(
        instance_id=inst.id,
        status="pending",
        progress=0.0,
        started_at=datetime.utcnow(),
    )
    db.add(job)
    inst.status = "processing"
    db.commit()
    db.refresh(job)

    from config import DATABASE_URL
    executor.submit(
        _run_optimization,
        job.id,
        instance_id,
        request.use_dqn,
        request.max_iter,
        request.verbose,
        request.fast_mode,
        DATABASE_URL,
    )

    return {
        "status": "success",
        "data": {
            "job_id": job.id,
            "instance_id": instance_id,
            "message": "优化任务已提交"
        }
    }


@router.get("/task/{job_id}")
def get_task_status(job_id: int, db: Session = Depends(get_db)):
    job = db.query(ComputationJob).filter(ComputationJob.id == job_id).first()
    if not job:
        raise HTTPException(404, "任务不存在")

    result = {
        "task_id": job.id,
        "status": job.status,
        "progress": job.progress,
        "instance_id": job.instance_id,
    }

    if job.status == "completed":
        inst = db.query(Instance).filter(Instance.id == job.instance_id).first()
        if inst:
            result["result"] = {
                "instance_id": inst.instance_id,
                "available_modules": [1, 2, 3]
            }

    if job.error_message:
        result["error"] = job.error_message

    return result


@router.get("/health")
def health_check():
    return {"status": "ok", "service": "algorithm-backend"}


@router.get("/instances")
def list_instances():
    if not ALGORITHM_REPO_EXISTS:
        return {"status": "success", "data": []}

    ids = set()

    raw_path = os.path.join(RAW_DATA_DIR)
    if os.path.exists(raw_path):
        for f in sorted(os.listdir(raw_path)):
            if f.endswith(".txt"):
                ids.add(f.replace(".txt", ""))

    if os.path.exists(EXTENDED_DATA_DIR):
        try:
            for f in sorted(os.listdir(EXTENDED_DATA_DIR)):
                if f.endswith(".json"):
                    parts = f.split('_')
                    if len(parts) >= 3:
                        instance_id = parts[-1].replace('.json', '')
                        ids.add(instance_id)
        except Exception as e:
            print(f"Error reading extended data directory: {e}")

    return {"status": "success", "data": sorted(list(ids))}


@router.get("/instances/preloaded-list")
def list_preloaded_instances():
    if not ALGORITHM_REPO_EXISTS:
        return {"status": "success", "data": []}

    ids = set()

    if os.path.exists(RAW_DATA_DIR):
        for f in sorted(os.listdir(RAW_DATA_DIR)):
            if f.endswith(".txt"):
                ids.add(f.replace(".txt", ""))

    if os.path.exists(EXTENDED_DATA_DIR):
        try:
            for f in sorted(os.listdir(EXTENDED_DATA_DIR)):
                if f.endswith(".json"):
                    parts = f.split('_')
                    if len(parts) >= 3:
                        instance_id = parts[-1].replace('.json', '')
                        ids.add(instance_id)
        except Exception as e:
            print(f"Error reading extended data directory: {e}")

    return {
        "status": "success",
        "data": [
            {"instance_id": iid, "has_results": []}
            for iid in sorted(list(ids))
        ],
    }


class DashboardMetricsRequest(BaseModel):
    instance_id: str


@router.post("/dashboard-metrics")
def get_dashboard_metrics(
    request: DashboardMetricsRequest,
    db: Session = Depends(get_db),
):
    instance_id = request.instance_id

    inst = db.query(Instance).filter(Instance.instance_id == instance_id).first()

    metrics = {
        "instance_id": instance_id,
        "total_panels": 0,
        "total_area": 0.0,
        "total_cost": 0.0,
        "total_power": 0.0,
        "lifecycle_carbon": 0.0,
        "lifecycle_cost": 0.0,
        "status": inst.status if inst else "unknown",
    }

    if inst and inst.status == "completed":
        results = db.query(ModuleResult).filter(
            ModuleResult.instance_id == instance_id
        ).all()

        for r in results:
            try:
                data = json.loads(r.result_json)
                if "total_panels" in data:
                    metrics["total_panels"] = data["total_panels"]
                if "total_area" in data:
                    metrics["total_area"] = data["total_area"]
                if "total_cost" in data:
                    metrics["total_cost"] = data["total_cost"]
                if "total_power" in data:
                    metrics["total_power"] = data["total_power"]
                if "lifecycle_carbon" in data:
                    metrics["lifecycle_carbon"] = data["lifecycle_carbon"]
                if "lifecycle_cost" in data:
                    metrics["lifecycle_cost"] = data["lifecycle_cost"]
            except:
                pass

    return {"status": "success", "data": metrics}