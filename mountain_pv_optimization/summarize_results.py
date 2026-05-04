import json
import os

def load_result(instance_id):
    result_path = os.path.join('data', 'results', 'module3', f'M3-Output_{instance_id}.json')
    with open(result_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def summarize_result(instance_id):
    result = load_result(instance_id)

    module1 = result.get('module1_output', {})
    total_panels = module1.get('total_pva_count', 0)
    total_perimeter = module1.get('total_perimeter', 0)
    zone_summary = module1.get('zone_summary', [])
    zone_count = len(zone_summary)

    total_cost_summary = result.get('total_cost_summary', {})
    total_cost = total_cost_summary.get('total_cost', 0)

    optimized_params = result.get('optimized_params', {})
    efficiency = optimized_params.get('efficiency', 0)
    reliability = optimized_params.get('reliability', 0)

    constraint_satisfaction = result.get('constraint_satisfaction', {})
    constraint_values = list(constraint_satisfaction.values()) if constraint_satisfaction else []
    constraint_avg = sum(float(str(v).replace('%', '')) for v in constraint_values) / len(constraint_values) if constraint_values else 0

    performance_metrics = result.get('performance_metrics', {})

    return {
        'instance_id': instance_id,
        'total_panels': total_panels,
        'zone_count': zone_count,
        'total_perimeter': total_perimeter,
        'total_cost': total_cost,
        'efficiency': efficiency,
        'reliability': reliability,
        'constraint_satisfaction': constraint_avg,
        'best_cost': performance_metrics.get('best_cost', 0),
        'convergence_iterations': performance_metrics.get('convergence_iterations', 0)
    }

def main():
    instances = ['r1', 'r10', 'r100']

    print("=" * 100)
    print("山地光伏电站优化结果汇总")
    print("=" * 100)

    summaries = []
    for instance in instances:
        try:
            summary = summarize_result(instance)
            summaries.append(summary)

            print(f"\n算例 {instance}:")
            print("-" * 100)
            print(f"光伏板数量: {summary['total_panels']}")
            print(f"分区数量: {summary['zone_count']}")
            print(f"总周长: {summary['total_perimeter']:.1f} m")
            print(f"全生命周期总成本: {summary['total_cost']:.2f} 万元")
            print(f"系统效率: {summary['efficiency']:.4f}")
            print(f"系统可靠性: {summary['reliability']:.4f}")
            print(f"约束满足度: {summary['constraint_satisfaction']:.2f}%")
            print(f"模块三最优成本: {summary['best_cost']:.2f} 万元")
            print(f"收敛迭代次数: {summary['convergence_iterations']}")
        except Exception as e:
            print(f"\n算例 {instance} 读取失败: {e}")

    print("\n" + "=" * 100)
    print("汇总对比表格")
    print("=" * 100)
    print(f"{'算例':<10} | {'光伏板':<8} | {'分区':<6} | {'总周长(m)':<12} | {'总成本(万元)':<14} | {'效率':<10} | {'可靠性':<10} | {'约束满足':<10}")
    print("-" * 100)
    for s in summaries:
        print(f"{s['instance_id']:<10} | {s['total_panels']:<8} | {s['zone_count']:<6} | {s['total_perimeter']:<12.1f} | {s['total_cost']:<14.2f} | {s['efficiency']:<10.4f} | {s['reliability']:<10.4f} | {s['constraint_satisfaction']:<10.2f}%")

if __name__ == '__main__':
    main()
