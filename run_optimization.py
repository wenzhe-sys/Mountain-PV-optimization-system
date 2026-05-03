import requests
import json

# 定义API端点
url = "http://localhost:8000/api/optimize"

# 定义请求参数
payload = {
    "instance_id": "r100",
    "use_dqn": True,
    "max_iter": 10,
    "verbose": True,
    "fast_mode": True
}

# 设置请求头
headers = {
    "Content-Type": "application/json"
}

print("开始运行r100算例优化...")
print(f"请求参数: {json.dumps(payload, indent=2)}")

try:
    # 发送POST请求
    response = requests.post(url, json=payload, headers=headers)
    
    # 检查响应状态
    if response.status_code == 200:
        result = response.json()
        print("\n优化成功!")
        print(f"状态: {result.get('status')}")
        if 'data' in result:
            data = result['data']
            print(f"\n核心指标:")
            if 'metrics' in data:
                metrics = data['metrics']
                print(f"全生命周期总成本: {metrics.get('total_cost', 'N/A')} 万元")
                print(f"运维成本: {metrics.get('operation_cost', 'N/A')} 万元")
                print(f"土建成本: {metrics.get('civil_cost', 'N/A')} 万元")
                print(f"LCOE: {metrics.get('lcoe', 'N/A')}")
            if 'module3_output' in data:
                module3 = data['module3_output']
                if 'total_cost_summary' in module3:
                    cost_summary = module3['total_cost_summary']
                    print(f"\n成本明细:")
                    print(f"建设成本: {cost_summary.get('construction_cost', 'N/A')} 万元")
                    print(f"运行损耗成本: {cost_summary.get('operation_loss_cost', 'N/A')} 万元")
                    print(f"运维成本: {cost_summary.get('operation_cost', 'N/A')} 万元")
                    print(f"总土建成本: {cost_summary.get('civil_cost', 'N/A')} 万元")
    else:
        print(f"\n优化失败，状态码: {response.status_code}")
        print(f"错误信息: {response.text}")
        
except Exception as e:
    print(f"\n请求失败: {str(e)}")
