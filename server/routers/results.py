import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import ModuleResult
from services.algorithm_runner import load_existing_result

router = APIRouter(prefix="/api/results", tags=["results"])


def _get_result(instance_id: str, module: int, db: Session) -> dict:
    """从数据库或文件获取模块结果"""
    # 先查数据库
    mr = (
        db.query(ModuleResult)
        .filter(ModuleResult.instance_id == instance_id, ModuleResult.module == module)
        .order_by(ModuleResult.created_at.desc())
        .first()
    )
    if mr:
        return json.loads(mr.result_json)

    # 再查文件
    result = load_existing_result(instance_id, module)
    if result:
        return result

    return None


@router.get("/{instance_id}/module1")
def get_module1(instance_id: str, db: Session = Depends(get_db)):
    result = _get_result(instance_id, 1, db)
    if not result:
        raise HTTPException(404, f"算例 {instance_id} 模块一结果不存在")
    return {"status": "success", "data": result}


@router.get("/{instance_id}/module2")
def get_module2(instance_id: str, db: Session = Depends(get_db)):
    result = _get_result(instance_id, 2, db)
    if not result:
        raise HTTPException(404, f"算例 {instance_id} 模块二结果不存在")
    return {"status": "success", "data": result}


@router.get("/{instance_id}/module3")
def get_module3(instance_id: str, db: Session = Depends(get_db)):
    result = _get_result(instance_id, 3, db)
    if not result:
        raise HTTPException(404, f"算例 {instance_id} 模块三结果不存在")
    return {"status": "success", "data": result}


@router.get("/{instance_id}/summary")
def get_summary(instance_id: str, db: Session = Depends(get_db)):
    """汇总指标"""
    m1 = _get_result(instance_id, 1, db)
    m2 = _get_result(instance_id, 2, db)
    m3 = _get_result(instance_id, 3, db)

    summary = {"instance_id": instance_id}

    if m1:
        # 提取模块一 — 可能嵌套在 module1_output 里 (M2 格式) 或直接在顶层 (M1 格式)
        m1_data = m1.get("module1_output", m1)
        summary["module1"] = {
            "total_pva_count": m1_data.get("total_pva_count", len(m1_data.get("partition_result", []))),
            "zone_count": len(m1_data.get("zone_summary", [])),
            "zone_summary": m1_data.get("zone_summary", []),
            "constraint_satisfaction": m1_data.get("constraint_satisfaction"),
            "solver_method": m1_data.get("solver_method", "benders"),
            "solution_quality": m1_data.get("solution_quality"),
        }

    if m2:
        m2_data = m2
        summary["module2"] = {
            "equipment_count": len(m2_data.get("equipment_selection", [])),
            "cable_route_count": len(m2_data.get("cable_routes", [])),
            "trench_count": len(m2_data.get("trench_summary", [])),
            "total_cost": m2_data.get("total_cost", 0),
            "constraint_satisfaction": m2_data.get("constraint_satisfaction"),
        }

    if m3:
        m3_data = m3
        summary["module3"] = {
            "total_cost": m3_data.get("total_cost_summary", {}).get("total_cost", 0),
            "total_cost_summary": m3_data.get("total_cost_summary"),
            "optimized_params": m3_data.get("optimized_params"),
            "pareto_solutions": len(m3_data.get("pareto_front", [])),
            "constraint_satisfaction": m3_data.get("constraint_satisfaction"),
        }

    return {"status": "success", "data": summary}


@router.get("/{instance_id}/all")
def get_all_results(instance_id: str, db: Session = Depends(get_db)):
    """返回所有模块结果"""
    m1 = _get_result(instance_id, 1, db)
    m2 = _get_result(instance_id, 2, db)
    m3 = _get_result(instance_id, 3, db)

    return {
        "status": "success",
        "data": {
            "instance_id": instance_id,
            "module1": m1,
            "module2": m2,
            "module3": m3,
        },
    }
