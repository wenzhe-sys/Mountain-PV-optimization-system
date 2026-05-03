"""算法运行器 — 封装对 mountain_pv_optimization 算法仓库的调用"""

import json
import os
import sys
import traceback
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from typing import Optional

from config import ALGORITHM_REPO_PATH

# 线程池用于后台运行算法
executor = ThreadPoolExecutor(max_workers=2)

# 已有结果目录
RESULTS_DIR = os.path.join(ALGORITHM_REPO_PATH, "data", "results")
RAW_DATA_DIR = os.path.join(ALGORITHM_REPO_PATH, "data", "raw", "PV", "real")
PROCESSED_DATA_DIR = os.path.join(ALGORITHM_REPO_PATH, "data", "processed", "PV", "public", "easy")
EXTENDED_DATA_DIR = os.path.join(ALGORITHM_REPO_PATH, "data", "processed", "PV", "public", "extended")

# 检查算法仓库是否存在
ALGORITHM_REPO_EXISTS = os.path.exists(ALGORITHM_REPO_PATH)


def load_existing_result(instance_id: str, module: int) -> Optional[dict]:
    """加载算法仓库中已有的结果 JSON"""
    if not ALGORITHM_REPO_EXISTS:
        return None
    filename = f"M{module}-Output_{instance_id}.json"
    path = os.path.join(RESULTS_DIR, f"module{module}", filename)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return None


def load_processed_instance(instance_id: str) -> Optional[dict]:
    """加载预处理后的算例 JSON"""
    if not ALGORITHM_REPO_EXISTS:
        return None
    
    # 先尝试从 easy 目录加载
    filename = f"public_easy_{instance_id}.json"
    path = os.path.join(PROCESSED_DATA_DIR, filename)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    
    # 再尝试从 extended 目录加载
    for f in os.listdir(EXTENDED_DATA_DIR):
        if f.endswith(f"_{instance_id}.json"):
            path = os.path.join(EXTENDED_DATA_DIR, f)
            if os.path.exists(path):
                with open(path, "r", encoding="utf-8") as f:
                    return json.load(f)
    
    return None


def list_available_raw_instances() -> list[str]:
    """列出算法仓库中可用的原始算例 ID"""
    if not ALGORITHM_REPO_EXISTS:
        return []
    
    ids = set()
    
    # 从原始数据目录读取
    if os.path.exists(RAW_DATA_DIR):
        for f in sorted(os.listdir(RAW_DATA_DIR)):
            if f.endswith(".txt"):
                ids.add(f.replace(".txt", ""))
    
    # 从扩展数据目录读取
    if os.path.exists(EXTENDED_DATA_DIR):
        try:
            for f in sorted(os.listdir(EXTENDED_DATA_DIR)):
                if f.endswith(".json"):
                    # 提取算例 ID (例如 public_easy_r100.json -> r100)
                    parts = f.split('_')
                    if len(parts) >= 3:
                        instance_id = parts[-1].replace('.json', '')
                        ids.add(instance_id)
        except Exception as e:
            print(f"Error reading extended data directory: {e}")
    
    return sorted(list(ids))


def list_available_results() -> dict[str, list[int]]:
    """列出每个算例已有的模块结果"""
    if not ALGORITHM_REPO_EXISTS:
        return {}
    result = {}
    for module in [1, 2, 3]:
        module_dir = os.path.join(RESULTS_DIR, f"module{module}")
        if not os.path.exists(module_dir):
            continue
        for f in os.listdir(module_dir):
            if f.startswith(f"M{module}-Output_") and f.endswith(".json"):
                iid = f.replace(f"M{module}-Output_", "").replace(".json", "")
                result.setdefault(iid, []).append(module)
    return result


def run_algorithm_pipeline(instance_id: str, raw_file_path: str, job_update_callback):
    """
    运行完整算法流水线。在后台线程中执行。
    job_update_callback(status, progress, error=None) 用于更新任务状态。
    """
    try:
        if not ALGORITHM_REPO_EXISTS:
            job_update_callback("failed", 0, error="算法仓库不存在，请检查配置")
            return None
        
        # 检查算例 ID 是否为 r1-r17
        if instance_id.startswith('r') and instance_id[1:].isdigit():
            instance_num = int(instance_id[1:])
            if 1 <= instance_num <= 17:
                # 使用 main.py 脚本运行
                job_update_callback("running_m1", 10)
                
                # 构建命令
                main_script = os.path.join(ALGORITHM_REPO_PATH, "main.py")
                import subprocess
                
                # 运行 main.py 脚本
                process = subprocess.Popen(
                    [sys.executable, main_script, "--instance_id", instance_id, "--verbose", "true"],
                    cwd=ALGORITHM_REPO_PATH,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                
                # 实时读取输出并更新进度
                output = []
                progress_map = {
                    "数据预处理": 15,
                    "加载算例": 25,
                    "运行模块一": 40,
                    "运行模块二": 60,
                    "运行模块三": 80,
                    "指标计算与结果可视化": 95
                }
                
                current_progress = 10
                
                while True:
                    line = process.stdout.readline()
                    if not line and process.poll() is not None:
                        break
                    if line:
                        output.append(line)
                        print(line.strip())
                        
                        # 更新进度
                        for step, progress in progress_map.items():
                            if step in line:
                                current_progress = progress
                                job_update_callback(f"running_{step}", current_progress)
                                break
                
                # 等待进程完成
                stdout, stderr = process.communicate()
                output.extend(stdout.split('\n'))
                
                if process.returncode != 0:
                    error_message = '\n'.join(output + stderr.split('\n'))
                    job_update_callback("failed", 0, error=error_message)
                    return None
                
                job_update_callback("completed", 100)
                
                # 加载生成的结果
                results = {}
                for module in [1, 2, 3]:
                    result_path = os.path.join(ALGORITHM_REPO_PATH, "data", "results", f"module{module}", f"M{module}-Output_{instance_id}.json")
                    if os.path.exists(result_path):
                        with open(result_path, "r", encoding="utf-8") as f:
                            results[module] = json.load(f)
                
                return results
        
        # 对于其他算例，使用原有逻辑
        # 将算法仓库加入 Python 路径
        if ALGORITHM_REPO_PATH not in sys.path:
            sys.path.insert(0, ALGORITHM_REPO_PATH)

        job_update_callback("running_m1", 10)

        # 步骤 1: 数据预处理
        from utils.data_preprocess import PVDataPreprocessor
        preprocessor = PVDataPreprocessor()
        preprocessor.process_single_file(f"{instance_id}.txt")
        processed_path = os.path.join(preprocessor.processed_pv_path, f"public_easy_{instance_id}.json")

        job_update_callback("running_m1", 20)

        # 步骤 2: 运行模块一
        from model.model_cutting_partition import CuttingPartitionModel
        model1 = CuttingPartitionModel(processed_path)
        module1_output = model1.run()

        job_update_callback("running_m2", 40)

        # 步骤 3: 运行模块二
        from model.model_equipment_cable import EquipmentCableModel
        m1_output_path = os.path.join(ALGORITHM_REPO_PATH, "data", "results", "module1", f"M1-Output_{instance_id}.json")
        model2 = EquipmentCableModel(processed_path, m1_output_path, module1_output)
        module2_output = model2.run()

        job_update_callback("running_m3", 65)

        # 步骤 4: 运行模块三
        from modules.module3.model.model_integration import IntegrationOptimizationModel
        m2_output_path = os.path.join(ALGORITHM_REPO_PATH, "data", "results", "module2", f"M2-Output_{instance_id}.json")
        model3 = IntegrationOptimizationModel(processed_path, m2_output_path)
        module3_output = model3.run()

        job_update_callback("completed", 100)

        return {
            1: module1_output if isinstance(module1_output, dict) else {},
            2: module2_output if isinstance(module2_output, dict) else {},
            3: module3_output if isinstance(module3_output, dict) else {},
        }

    except Exception as e:
        job_update_callback("failed", 0, error=f"{type(e).__name__}: {e}\n{traceback.format_exc()}")
        return None
