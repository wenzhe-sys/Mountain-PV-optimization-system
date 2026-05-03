import os
import json
import argparse
import logging
import numpy as np
import torch

# 配置日志（简化时间戳格式）
logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

# 尝试导入依赖库
try:
    from utils.data_preprocess import PVDataPreprocessor
    from modules.module1.model.model_cutting_partition import CuttingPartitionModel
    from modules.module2.model.model_equipment_cable import EquipmentCableModel
    from modules.module3.model.model_integration import IntegrationOptimizationModel
    from utils.load_instance import load_instance
    from utils.metric_calculation import metric_calculator
    from utils.visualization import result_visualizer
    from utils.cache_manager import cache_manager
    from modules.module1.algorithm.dqn_agent import DQNPartitionAgent
    IMPORT_SUCCESS = True
except Exception as e:
    logger.warning(f"导入库时遇到错误: {e}")
    logger.warning("将尝试使用最小依赖运行...")
    IMPORT_SUCCESS = False

def set_random_seed(seed=42):
    """设置随机种子，保证结果可复现"""
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed(seed)
    torch.backends.cudnn.deterministic = True
    logger.info(f"已设置随机种子: {seed}")

def main(instance_id: str = "r1", use_dqn: bool = True, max_iter: int = 20, verbose: bool = True, fast_mode: bool = False, progress_callback=None):
    """
    主流程：数据预处理 → 模块一（混合策略） → 模块二 → 模块三 → 指标计算 → 可视化
    
    Args:
        instance_id: 算例ID
        use_dqn: 是否使用DQN进行分区优化
        max_iter: Benders分解最大迭代次数
        verbose: 是否打印详细日志
        fast_mode: 是否使用快速模式（跳过可视化步骤）
        progress_callback: 进度更新回调函数
    """
    
    # 发送进度更新的辅助函数
    def send_progress(progress, stage, stage_progress=0):
        if progress_callback:
            import asyncio
            asyncio.run(progress_callback(progress, stage, stage_progress))
    print("="*60)
    print(f"开始大型山地光伏电站设计优化（算例ID：{instance_id}）")
    print("="*60)

    if not IMPORT_SUCCESS:
        print("错误：无法导入必要的库，请检查Python环境和依赖安装。")
        return

    try:
        # 设置随机种子
        set_random_seed()
        
        # 步骤1：数据预处理（raw→processed）
        print("\n【步骤1/6】数据预处理...")
        send_progress(10, "数据预处理")
        preprocessor = PVDataPreprocessor()
        # 尝试处理不同难度的算例
        try:
            preprocessor.process_single_file(f"{instance_id}.txt")
        except Exception as e:
            print(f"处理原始文件失败，尝试直接加载已处理的算例：{e}")
        
        # 尝试加载不同难度级别的算例文件
        project_root = os.path.dirname(os.path.abspath(__file__))
        processed_instance_path = None
        for difficulty in ["easy", "medium", "hard"]:
            candidate_path = os.path.join(project_root, "data", "processed", "PV", "public", difficulty, f"public_{difficulty}_{instance_id}.json")
            if os.path.exists(candidate_path):
                processed_instance_path = candidate_path
                print(f"找到算例文件：{processed_instance_path}")
                break
        
        if not processed_instance_path:
            # 尝试加载扩展目录中的算例
            extended_path = os.path.join(project_root, "data", "processed", "PV", "public", "extended")
            if os.path.exists(extended_path):
                for file in os.listdir(extended_path):
                    # 使用精确匹配，避免r2匹配到r28
                    if file == f"public_easy_{instance_id}.json" or file == f"public_medium_{instance_id}.json" or file == f"public_hard_{instance_id}.json":
                        processed_instance_path = os.path.join(extended_path, file)
                        print(f"找到扩展算例文件：{processed_instance_path}")
                        break
        
        if not processed_instance_path:
            raise FileNotFoundError(f"无法找到算例文件：{instance_id}")

        # 步骤2：加载标准化算例
        print("\n【步骤2/6】加载算例...")
        send_progress(20, "加载算例")
        # 尝试从缓存中获取算例数据
        instance = cache_manager.get('instance_data', instance_id)
        if not instance:
            instance = load_instance(instance_id)
            # 缓存算例数据
            cache_manager.set('instance_data', instance, instance_id)

        # 步骤3：运行模块一（切割及分区）- 使用混合策略
        print("\n【步骤3/6】运行模块一：光伏面板切割及分区...")
        print(f"  - 使用混合策略：启发式 + {'DQN' if use_dqn else '传统算法'}")
        print(f"  - 最大迭代次数：{max_iter}")
        send_progress(35, "光伏面板切割及分区")
        model1 = CuttingPartitionModel(processed_instance_path)
        
        # 配置模块一使用混合策略
        # 尝试从缓存中获取模块一输出
        module1_output = cache_manager.get('module1_output', instance_id, use_dqn, max_iter)
        if not module1_output:
            module1_output = model1.run(verbose=verbose, max_iter=max_iter)
            # 缓存模块一输出
            cache_manager.set('module1_output', module1_output, instance_id, use_dqn, max_iter)

        # 步骤4：运行模块二（设备选型+电缆共沟）
        print("\n【步骤4/6】运行模块二：电气设备选型及电缆共沟...")
        send_progress(50, "电气设备选型及电缆共沟")
        project_root = os.path.dirname(os.path.abspath(__file__))
        module1_output_path = os.path.join(project_root, "data", "results", "module1", f"M1-Output_{instance_id}.json")
        # 使用经过validate_instance处理后的instance变量，而不是原始文件路径
        model2 = EquipmentCableModel(processed_instance_path, module1_output_path, module1_output)
        # 手动添加缺失的transformer字段
        if "transformer" not in model2.instance_data["equipment_params"]:
            model2.instance_data["equipment_params"]["transformer"] = {
                "Q_box_options": [1600, 3200],
                "c_box": {"1600": 30.0, "3200": 50.0},
                "c_install_box": {"1600": 5.0, "3200": 3.0}
            }
        # 尝试从缓存中获取模块二输出
        module2_output = cache_manager.get('module2_output', instance_id, use_dqn, max_iter)
        if not module2_output:
            module2_output = model2.run()
            # 缓存模块二输出
            cache_manager.set('module2_output', module2_output, instance_id, use_dqn, max_iter)

        # 步骤5：运行模块三（集成优化）
        print("\n【步骤5/6】运行模块三：全生命周期集成优化...")
        print(f"  - 最大迭代次数：{max_iter}")
        send_progress(65, "全生命周期集成优化")
        module2_output_path = os.path.join(project_root, "data", "results", "module2", f"M2-Output_{instance_id}.json")
        model3 = IntegrationOptimizationModel(processed_instance_path, module2_output_path, module1_output, max_iter=max_iter)
        # 尝试从缓存中获取模块三输出
        module3_output = cache_manager.get('module3_output', instance_id, use_dqn, max_iter)
        if not module3_output:
            module3_output = model3.run()
            # 缓存模块三输出
            cache_manager.set('module3_output', module3_output, instance_id, use_dqn, max_iter)

        # 步骤6：指标计算与可视化
        print("\n【步骤6/6】指标计算与结果可视化...")
        send_progress(80, "指标计算与结果可视化")
        # 计算核心指标
        # 尝试从缓存中获取指标计算结果
        metrics = cache_manager.get('metrics', instance_id, use_dqn, max_iter)
        if not metrics:
            coverage_rate = metric_calculator.calculate_coverage_rate(module1_output, instance)
            trench_optimization_rate = metric_calculator.calculate_trench_optimization_rate(module2_output)
            constraint_satisfaction = metric_calculator.calculate_constraint_satisfaction_rate(module3_output["constraint_satisfaction"])
            
            # 多目标优化指标
            efficiency = module3_output.get('optimized_params', {}).get('efficiency', 0.0)
            reliability = module3_output.get('optimized_params', {}).get('reliability', 0.0)
            pareto_solutions = len(module3_output.get('pareto_front', []))
            
            # 缓存指标计算结果
            metrics = {
                'coverage_rate': coverage_rate,
                'trench_optimization_rate': trench_optimization_rate,
                'constraint_satisfaction': constraint_satisfaction,
                'efficiency': efficiency,
                'reliability': reliability,
                'pareto_solutions': pareto_solutions
            }
            cache_manager.set('metrics', metrics, instance_id, use_dqn, max_iter)
        else:
            coverage_rate = metrics['coverage_rate']
            trench_optimization_rate = metrics['trench_optimization_rate']
            constraint_satisfaction = metrics['constraint_satisfaction']
            efficiency = metrics['efficiency']
            reliability = metrics['reliability']
            pareto_solutions = metrics['pareto_solutions']
        
        # 输出指标汇总
        print(f"\n===== 核心指标汇总 =====")
        print(f"1. 覆盖面积利用率：{coverage_rate}%")
        print(f"2. 共沟成本优化率：{trench_optimization_rate}%")
        print(f"3. 约束满足度：{constraint_satisfaction}%")
        print(f"4. 全生命周期总成本：{module3_output['total_cost_summary']['total_cost']:.2f}万元")
        print(f"5. 系统效率：{efficiency:.4f}")
        print(f"6. 系统可靠性：{reliability:.4f}")
        print(f"7. 帕累托最优解数量：{pareto_solutions}")
        
        # 输出模块间反馈
        if 'module_feedback' in module3_output:
            print(f"\n===== 模块间反馈 =====")
            feedback = module3_output['module_feedback']
            if 'module1' in feedback:
                print(f"模块一建议：")
                print(f"  - 推荐分区数量：{feedback['module1'].get('suggested_zone_count', 'N/A')}")
                print(f"  - 推荐面板密度：{feedback['module1'].get('recommended_panel_density', 'N/A')}")
            if 'module2' in feedback:
                print(f"模块二建议：")
                print(f"  - 最优电缆半径：{feedback['module2'].get('optimal_cable_radius', 'N/A'):.4f}m")
                print(f"  - 建议管沟数量：{feedback['module2'].get('suggested_trench_count', 'N/A')}")
                print(f"  - 推荐每沟电缆数：{feedback['module2'].get('recommended_cable_count_per_trench', 'N/A')}")
        
        # 增强可视化
        if not fast_mode:
            print("\n【可视化】生成结果图表...")
            result_visualizer.plot_partition(module1_output, instance_id)
            result_visualizer.plot_cost_breakdown(module3_output, instance_id)
            result_visualizer.plot_loss_trend(module3_output, instance_id)
            
            # 新增：生成性能雷达图
            if 'performance_metrics' in module3_output:
                result_visualizer.plot_performance_radar(module3_output, instance_id)
            
            # 新增：生成帕累托前沿图
            if 'pareto_front' in module3_output and len(module3_output['pareto_front']) > 0:
                result_visualizer.plot_pareto_front(module3_output, instance_id)

        print("\n" + "="*60)
        print(f"优化流程全部完成！所有结果已保存至 data/results 目录")
        print("="*60)
        send_progress(100, "优化完成")
        
        # 返回结果，便于后续分析
        return {
            'module1_output': module1_output,
            'module2_output': module2_output,
            'module3_output': module3_output,
            'metrics': {
                'coverage_rate': coverage_rate,
                'trench_optimization_rate': trench_optimization_rate,
                'constraint_satisfaction': constraint_satisfaction,
                'efficiency': efficiency,
                'reliability': reliability,
                'pareto_solutions': pareto_solutions,
                'total_cost': module3_output['total_cost_summary']['total_cost'],
                'civil_cost': module3_output['total_cost_summary'].get('civil_cost', 0.0),
                'operation_cost': module3_output['total_cost_summary'].get('operation_cost', 0.0),
                'lcoe': module3_output['total_cost_summary'].get('lcoe', 0.0)
            }
        }
        
    except Exception as e:
        logger.error(f"运行过程中遇到错误: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    # 添加命令行参数支持
    parser = argparse.ArgumentParser(description="山地光伏电站设计优化")
    parser.add_argument("--instance_id", type=str, default="r1", help="算例ID（如r1、r2...r17）")
    parser.add_argument("--use_dqn", action="store_true", default=True, help="是否使用DQN进行分区优化")
    parser.add_argument("--max_iter", type=int, default=20, help="Benders分解最大迭代次数")
    parser.add_argument("--verbose", action="store_true", default=True, help="是否打印详细日志")
    parser.add_argument("--batch_run", action="store_true", default=False, help="是否批量运行多个算例")
    parser.add_argument("--instances", type=str, default="r1,r2,r3", help="批量运行的算例ID列表，逗号分隔")
    args = parser.parse_args()
    
    if args.batch_run:
        # 批量运行多个算例
        instances = args.instances.split(',')
        print(f"批量运行算例：{instances}")
        results = {}
        for instance_id in instances:
            print(f"\n" + "="*80)
            print(f"开始运行算例：{instance_id}")
            print("="*80)
            result = main(
                instance_id=instance_id,
                use_dqn=args.use_dqn,
                max_iter=args.max_iter,
                verbose=args.verbose
            )
            if result:
                results[instance_id] = result
        
        # 汇总批量运行结果
        if results:
            print(f"\n" + "="*80)
            print("批量运行结果汇总")
            print("="*80)
            for instance_id, result in results.items():
                metrics = result['metrics']
                print(f"\n算例 {instance_id}:")
                print(f"  覆盖面积利用率：{metrics['coverage_rate']}%")
                print(f"  共沟成本优化率：{metrics['trench_optimization_rate']}%")
                print(f"  全生命周期总成本：{metrics['total_cost']:.2f}万元")
                print(f"  系统效率：{metrics['efficiency']:.4f}")
                print(f"  系统可靠性：{metrics['reliability']:.4f}")
    else:
        # 运行单个算例
        main(
            instance_id=args.instance_id,
            use_dqn=args.use_dqn,
            max_iter=args.max_iter,
            verbose=args.verbose
        )