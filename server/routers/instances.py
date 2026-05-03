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
)
from config import UPLOAD_DIR

router = APIRouter(prefix="/api/instances", tags=["instances"])


@router.get("")
def list_instances(db: Session = Depends(get_db)):
    instances = db.query(Instance).order_by(Instance.created_at.desc()).all()
    available_results = list_available_results()
    items = []
    for inst in instances:
        d = InstanceResponse.model_validate(inst).model_dump()
        d["available_modules"] = sorted(available_results.get(inst.instance_id, []))
        items.append(d)
    return {"status": "success", "data": items}


@router.get("/preloaded-list")
def list_preloaded():
    """列出算法仓库中可导入的原始算例"""
    ids = list_available_raw_instances()
    available = list_available_results()
    return {
        "status": "success",
        "data": [
            {"instance_id": iid, "has_results": sorted(available.get(iid, []))}
            for iid in ids
        ],
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

    # 尝试从原始数据目录读取 .txt 文件
    raw_path = os.path.join(RAW_DATA_DIR, f"{instance_id}.txt")
    n_nodes = 0
    
    if os.path.exists(raw_path):
        # 从 .txt 文件计算节点数
        with open(raw_path, "r") as f:
            for line in f:
                if line.strip():
                    n_nodes += 1
    else:
        # 尝试从扩展数据目录读取 .json 文件
        from services.algorithm_runner import EXTENDED_DATA_DIR
        
        found = False
        for f in os.listdir(EXTENDED_DATA_DIR):
            # 匹配格式：public_xxx_r{instance_id}.json
            if f.endswith(f"_r{instance_id}.json"):
                json_path = os.path.join(EXTENDED_DATA_DIR, f)
                try:
                    with open(json_path, "r", encoding="utf-8") as jf:
                        data = json.load(jf)
                        # 从 JSON 数据中获取节点数
                        if "nodes" in data:
                            n_nodes = len(data["nodes"])
                        elif "installations" in data:
                            n_nodes = len(data["installations"])
                        else:
                            # 如果没有明确的节点信息，设置默认值
                            n_nodes = 100
                        found = True
                        raw_path = json_path  # 更新文件路径
                        break
                except Exception as e:
                    print(f"Error reading JSON file {f}: {e}")
        
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
