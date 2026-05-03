import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Instance, ComputationJob, ModuleResult, User
from schemas import JobStatusResponse
from routers.auth import get_current_user
from services.algorithm_runner import executor, run_algorithm_pipeline, load_existing_result

router = APIRouter(prefix="/api/compute", tags=["computation"])

# 内存中跟踪运行中的任务
_running_jobs: dict[int, dict] = {}


def _make_update_callback(job_id: int, db_url: str):
    """创建一个回调函数用于在后台线程中更新任务状态"""
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
                    # 同时更新实例状态
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


def _run_and_save(job_id: int, instance_id_str: str, raw_file_path: str, db_url: str):
    """在后台线程中运行算法并保存结果"""
    callback = _make_update_callback(job_id, db_url)
    results = run_algorithm_pipeline(instance_id_str, raw_file_path, callback)

    if results:
        from sqlalchemy import create_engine
        from sqlalchemy.orm import Session as SA_Session
        engine = create_engine(db_url, connect_args={"check_same_thread": False})
        with SA_Session(engine) as session:
            for module_num, result_data in results.items():
                if result_data:
                    mr = ModuleResult(
                        job_id=job_id,
                        instance_id=instance_id_str,
                        module=module_num,
                        result_json=json.dumps(result_data, ensure_ascii=False),
                    )
                    session.add(mr)
            session.commit()


@router.post("/{instance_id}")
def start_computation(
    instance_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """触发算法运行"""
    inst = db.query(Instance).filter(Instance.instance_id == instance_id).first()
    if not inst:
        raise HTTPException(404, "算例不存在")

    # 检查是否有正在运行的任务
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
    executor.submit(_run_and_save, job.id, inst.instance_id, inst.file_path, DATABASE_URL)

    return {
        "status": "success",
        "data": JobStatusResponse.model_validate(job).model_dump(),
    }


@router.get("/{job_id}/status")
def get_job_status(job_id: int, db: Session = Depends(get_db)):
    job = db.query(ComputationJob).filter(ComputationJob.id == job_id).first()
    if not job:
        raise HTTPException(404, "任务不存在")
    return {
        "status": "success",
        "data": JobStatusResponse.model_validate(job).model_dump(),
    }
