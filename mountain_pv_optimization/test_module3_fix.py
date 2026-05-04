import os
import sys
import json
import logging

# 添加项目根目录到Python路径
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(message)s')

from modules.module3.model.model_integration import IntegrationOptimizationModel

def test_module3():
    """测试模块三的修复"""
    print("="*60)
    print("测试模块三成本计算修复")
    print("="*60)
    
    # 设置算例路径
    test_instance_path = os.path.join(project_root, "data", "processed", "PV", "public", "easy", "public_easy_r1.json")
    test_module2_output_path = os.path.join(project_root, "data", "results", "module2", "M2-Output_r1.json")
    
    # 检查文件是否存在
    if not os.path.exists(test_instance_path):
        print(f"错误：找不到算例文件 {test_instance_path}")
        return
    
    if not os.path.exists(test_module2_output_path):
        print(f"错误：找不到模块二输出文件 {test_module2_output_path}")
        return
    
    print(f"\n找到算例文件：{test_instance_path}")
    print(f"找到模块二输出：{test_module2_output_path}")
    
    try:
        # 加载模块三
        print("\n【模块三】开始运行...")
        model = IntegrationOptimizationModel(test_instance_path, test_module2_output_path)
        result = model.run()
        
        print("\n" + "="*60)
        print("模块三运行完成！")
        print("="*60)
        
        # 显示结果摘要
        print(f"\n全生命周期总成本：{result['total_cost_summary']['total_cost']:.2f}万元")
        print(f"建设成本：{result['total_cost_summary']['construction_cost']:.2f}万元")
        print(f"运行损耗成本（未加权）：{result['total_cost_summary']['operation_loss_cost']:.2f}万元")
        
    except Exception as e:
        print(f"\n运行模块三时遇到错误：{e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_module3()
