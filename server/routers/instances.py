import json
import os
import shutil

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from database import get_db
from models import Instance, User
from schemas import InstanceResponse
from routers.auth import get_current_user
from services.algorithm_runner import (
    list_available_raw_instances,
    list_available_results,
    load_processed_instance,
    load_existing_result,
    RAW_DATA_DIR,
    EXTENDED_DATA_DIR,
)
from config import UPLOAD_DIR, ALGORITHM_REPO_PATH

router = APIRouter(prefix="/api/instances", tags=["instances"])


@router.get("")
def list_instances(db: Session = Depends(get_db)):
    instances = db.query(Instance).order_by(Instance.created_at.desc()).all()
    available_results = list_available_results()
    items = []
    for inst in instances:
        d = InstanceResponse.model_validate(inst).model_dump()
        d["available_modules"] = sorted(available_results.get(inst.instance_id, []))
        d["has_results"] = len(d["available_modules"]) > 0
        
        # 如果有可用结果，状态改为 completed
        if d["has_results"]:
            d["status"] = "completed"
        
        items.append(d)
    
    items.sort(key=lambda x: (-x["has_results"], x["instance_id"]))
    
    return {"status": "success", "data": items}


@router.get("/preloaded-list")
def list_preloaded():
    """列出算法仓库中可导入的原始算例"""
    ids = list_available_raw_instances()
    available = list_available_results()
    
    items = [
        {"instance_id": iid, "has_results": sorted(available.get(iid, []))}
        for iid in ids
    ]
    
    items.sort(key=lambda x: (-len(x["has_results"]), x["instance_id"]))
    
    return {
        "status": "success",
        "data": items,
    }


@router.post("/preloaded")
def import_preloaded(
    body: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """导入算法仓库中已有的算例"""
    import os
    
    instance_id = body.get("instance_id")
    if not instance_id:
        raise HTTPException(400, "缺少 instance_id")

    existing = db.query(Instance).filter(Instance.instance_id == instance_id).first()
    if existing:
        raise HTTPException(400, f"算例 {instance_id} 已存在")

    # 尝试从各个目录查找算例文件
    found = False
    search_dirs = [
        RAW_DATA_DIR,  # 原始数据目录
        os.path.join(ALGORITHM_REPO_PATH, "data", "processed", "PV", "public", "easy"),
        os.path.join(ALGORITHM_REPO_PATH, "data", "processed", "PV", "public", "medium"),
        os.path.join(ALGORITHM_REPO_PATH, "data", "processed", "PV", "public", "hard"),
        EXTENDED_DATA_DIR,  # 扩展数据目录
    ]
    
    for search_dir in search_dirs:
        if os.path.exists(search_dir):
            for f in os.listdir(search_dir):
                # 匹配格式：包含 _r{instance_id}.json 的文件
                # 例如：public_easy_r1.json -> 包含 "_r1.json"
                instance_num = instance_id.lstrip('r')  # 'r1' -> '1'
                if (("_r" + instance_id + ".json" in f) or 
                    ("_r" + instance_num + ".json" in f) or 
                    ("r" + instance_id + ".json" in f) or
                    ("r" + instance_num + ".json" in f) or
                    f == instance_id + ".txt"):
                    file_path = os.path.join(search_dir, f)
                    try:
                        if f.endswith(".json"):
                            with open(file_path, "r", encoding="utf-8") as jf:
                                data = json.load(jf)
                                # 从 JSON 数据中获取节点数
                                if "nodes" in data:
                                    n_nodes = len(data["nodes"])
                                elif "installations" in data:
                                    n_nodes = len(data["installations"])
                                elif "pva_list" in data:
                                    n_nodes = len(data.get("pva_list", []))
                                else:
                                    n_nodes = 100
                        else:  # .txt 文件
                            with open(file_path, "r") as tf:
                                n_nodes = sum(1 for line in tf if line.strip())
                        
                        found = True
                        raw_path = file_path
                        print(f"Found instance {instance_id} at {file_path}")
                        break
                    except Exception as e:
                        print(f"Error reading file {f}: {e}")
        
        if found:
            break
    
    if not found:
        raise HTTPException(404, f"数据文件不存在: {instance_id}.txt 或 {instance_id}.json")

    # 检查是否有已有结果
    has_results = any(
        load_existing_result(instance_id, m) is not None for m in [1, 2, 3]
    )
    status = "completed" if has_results else "uploaded"

    inst = Instance(
        name=f"算例 {instance_id}",
        instance_id=instance_id,
        file_path=raw_path,
        n_nodes=n_nodes,
        status=status,
        uploaded_by=current_user.id,
    )
    db.add(inst)
    db.commit()
    db.refresh(inst)

    # 如果有已有结果，自动导入到 module_results 表
    if has_results:
        from models import ComputationJob, ModuleResult
        from datetime import datetime

        job = ComputationJob(
            instance_id=inst.id,
            status="completed",
            progress=100.0,
            started_at=datetime.utcnow(),
            completed_at=datetime.utcnow(),
        )
        db.add(job)
        db.commit()
        db.refresh(job)

        for m in [1, 2, 3]:
            result = load_existing_result(instance_id, m)
            if result:
                mr = ModuleResult(
                    job_id=job.id,
                    instance_id=instance_id,
                    module=m,
                    result_json=json.dumps(result, ensure_ascii=False),
                )
                db.add(mr)
        db.commit()

    return {"status": "success", "data": InstanceResponse.model_validate(inst).model_dump()}


@router.post("/upload")
async def upload_instance(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """上传新的算例文件(.txt)"""
    if not file.filename.endswith(".txt"):
        raise HTTPException(400, "仅支持 .txt 格式的算例文件")

    instance_id = file.filename.replace(".txt", "")

    existing = db.query(Instance).filter(Instance.instance_id == instance_id).first()
    if existing:
        raise HTTPException(400, f"算例 {instance_id} 已存在")

    # 保存文件
    save_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(save_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # 计算节点数
    n_nodes = len([l for l in content.decode("utf-8").split("\n") if l.strip()])

    inst = Instance(
        name=f"算例 {instance_id}",
        instance_id=instance_id,
        file_path=save_path,
        n_nodes=n_nodes,
        status="uploaded",
        uploaded_by=current_user.id,
    )
    db.add(inst)
    db.commit()
    db.refresh(inst)

    return {"status": "success", "data": InstanceResponse.model_validate(inst).model_dump()}


@router.get("/{instance_id}")
def get_instance(instance_id: str, db: Session = Depends(get_db)):
    inst = db.query(Instance).filter(Instance.instance_id == instance_id).first()
    if not inst:
        raise HTTPException(404, "算例不存在")

    data = InstanceResponse.model_validate(inst).model_dump()

    # 尝试加载预处理后的数据
    processed = load_processed_instance(instance_id)
    if processed:
        data["processed_data"] = processed

    data["available_modules"] = sorted(
        [m for m in [1, 2, 3] if load_existing_result(instance_id, m) is not None]
    )

    return {"status": "success", "data": data}


@router.delete("/{instance_id}")
def delete_instance(
    instance_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """删除算例"""
    inst = db.query(Instance).filter(Instance.instance_id == instance_id).first()
    if not inst:
        raise HTTPException(404, "算例不存在")

    # 删除相关的计算任务和结果
    from models import ComputationJob, ModuleResult
    jobs = db.query(ComputationJob).filter(ComputationJob.instance_id == inst.id).all()
    for job in jobs:
        # 删除相关的模块结果
        db.query(ModuleResult).filter(ModuleResult.job_id == job.id).delete()
        db.delete(job)

    # 删除算例文件（如果是上传的文件）
    if inst.file_path and os.path.exists(inst.file_path):
        try:
            os.remove(inst.file_path)
        except Exception as e:
            print(f"删除文件失败: {e}")

    # 删除算例记录
    db.delete(inst)
    db.commit()

    return {"status": "success", "message": f"算例 {instance_id} 已成功删除"}


def load_instances_from_directory():
    """从算法仓库目录自动加载所有可用算例到数据库（启动时调用）"""
    from database import SessionLocal
    from models import Instance

    print("开始加载算例数据...")

    db = SessionLocal()
    try:
        # 检查是否已有数据
        existing_count = db.query(Instance).count()
        if existing_count > 0:
            print(f"数据库已有 {existing_count} 个算例，跳过自动加载")
            return

        # 获取所有可用的原始算例
        available = list_available_raw_instances()
        print(f"找到 {len(available)} 个可用算例")

        loaded_count = 0
        for instance_id in available:
            # 检查是否已存在
            existing = db.query(Instance).filter(Instance.instance_id == instance_id).first()
            if existing:
                continue

            # 创建新记录
            instance = Instance(
                instance_id=instance_id,
                name=instance_id,
                node_count=0,
                status="preloaded"  # 标记为预置算例
            )
            db.add(instance)
            loaded_count += 1

        db.commit()
        print(f"✓ 成功自动加载 {loaded_count} 个算例")

    except Exception as e:
        print(f"自动加载算例失败: {e}")
        db.rollback()
    finally:
        db.close()
