import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Target,
  BarChart3,
  Activity,
  Settings,
  TrendingUp,
  Lightbulb,
  Server,
  ClipboardList,
  Clock,
  User,
  CheckCircle,
  AlertTriangle,
  Info,
  Loader2
} from 'lucide-react';
import useAppStore from '../store/useAppStore';
import dashboardService from '../services/dashboardService';
import {
  QuickActionItem,
  KpiCard,
  PowerGenerationChart,
  CostBreakdownChart,
  MonthlyPowerChart,
  SystemHealthItem,
  CostTrendChart,
  AiInsightItem,
  EquipmentStatusItem,
  MaintenanceTaskItem,
  ActivityItem,
  WeatherForecastItem,
  AlgorithmFeatureItem,
  AlertItem
} from '../components/DashboardComponents';

// Mock data for charts
const powerData = [
  { time: '00:00', generated: 0, consumed: 15, grid: 15 },
  { time: '04:00', generated: 0, consumed: 12, grid: 12 },
  { time: '08:00', generated: 45, consumed: 35, grid: 0, exported: 10 },
  { time: '12:00', generated: 85, consumed: 55, grid: 0, exported: 30 },
  { time: '16:00', generated: 65, consumed: 48, grid: 0, exported: 17 },
  { time: '20:00', generated: 15, consumed: 42, grid: 27, exported: 0 },
  { time: '23:59', generated: 0, consumed: 25, grid: 25, exported: 0 },
];

const costBreakdown = [
  { name: '设备采购', value: 45, color: '#00d4ff' },
  { name: '电缆敷设', value: 25, color: '#10b981' },
  { name: '土建工程', value: 20, color: '#f59e0b' },
  { name: '运维成本', value: 7, color: '#8b5cf6' },
  { name: '其他费用', value: 3, color: '#ef4444' },
];

const alerts = [
  { id: 1, type: 'warning' as const, message: '3号逆变器温度偏高', time: '10分钟前', severity: 'high' as const },
  { id: 2, type: 'info' as const, message: '今日发电量突破预期', time: '1小时前', severity: 'low' as const },
  { id: 3, type: 'success' as const, message: '优化算法运行完成', time: '2小时前', severity: 'low' as const },
  { id: 4, type: 'warning' as const, message: '5号电缆温度异常', time: '30分钟前', severity: 'medium' as const },
  { id: 5, type: 'info' as const, message: '新算例导入成功', time: '3小时前', severity: 'low' as const },
];

// Algorithm performance data
const algorithmPerformance = [
  { name: '遗传算法', value: 85, color: '#00d4ff', iterations: 100, convergence: 0.92 },
  { name: '粒子群优化', value: 92, color: '#10b981', iterations: 80, convergence: 0.95 },
  { name: '模拟退火', value: 78, color: '#f59e0b', iterations: 120, convergence: 0.88 },
  { name: 'NSGA-II', value: 95, color: '#8b5cf6', iterations: 90, convergence: 0.98 },
];

// Project timeline data
const projectTimeline = [
  { phase: '地形勘测', completed: 100, planned: 100, actual: 100, status: 'completed' },
  { phase: '设备选型', completed: 85, planned: 100, actual: 90, status: 'in_progress' },
  { phase: '面板布局', completed: 70, planned: 100, actual: 75, status: 'in_progress' },
  { phase: '电缆路由', completed: 60, planned: 100, actual: 65, status: 'in_progress' },
  { phase: '系统调试', completed: 30, planned: 100, actual: 35, status: 'in_progress' },
  { phase: '并网运行', completed: 0, planned: 100, actual: 0, status: 'not_started' },
];

// Weather forecast data
const weatherForecast = [
  { day: '今天', temperature: 28, solar: 850, icon: '☀️', humidity: 65, wind: 12 },
  { day: '明天', temperature: 26, solar: 780, icon: '⛅', humidity: 70, wind: 10 },
  { day: '后天', temperature: 27, solar: 820, icon: '☀️', humidity: 60, wind: 15 },
  { day: '周四', temperature: 29, solar: 900, icon: '☀️', humidity: 55, wind: 8 },
  { day: '周五', temperature: 25, solar: 750, icon: '⛅', humidity: 75, wind: 14 },
  { day: '周六', temperature: 24, solar: 700, icon: '☁️', humidity: 80, wind: 16 },
  { day: '周日', temperature: 26, solar: 800, icon: '☀️', humidity: 65, wind: 10 },
];

// Monthly power generation data
const monthlyPowerData = [
  { month: '1月', generated: 250, consumed: 180, exported: 70 },
  { month: '2月', generated: 220, consumed: 160, exported: 60 },
  { month: '3月', generated: 280, consumed: 190, exported: 90 },
  { month: '4月', generated: 320, consumed: 200, exported: 120 },
  { month: '5月', generated: 350, consumed: 210, exported: 140 },
  { month: '6月', generated: 380, consumed: 230, exported: 150 },
  { month: '7月', generated: 400, consumed: 250, exported: 150 },
  { month: '8月', generated: 390, consumed: 240, exported: 150 },
  { month: '9月', generated: 360, consumed: 220, exported: 140 },
  { month: '10月', generated: 330, consumed: 200, exported: 130 },
  { month: '11月', generated: 290, consumed: 180, exported: 110 },
  { month: '12月', generated: 260, consumed: 170, exported: 90 },
];

// System health data
const systemHealthData = [
  { component: '逆变器', status: 'healthy' as const, value: 95 },
  { component: '面板', status: 'healthy' as const, value: 92 },
  { component: '电缆', status: 'warning' as const, value: 75 },
  { component: '汇流箱', status: 'healthy' as const, value: 90 },
  { component: '监控系统', status: 'healthy' as const, value: 98 },
];

// Cost trend data
const costTrendData = [
  { month: '1月', cost: 120000, budget: 150000 },
  { month: '2月', cost: 130000, budget: 150000 },
  { month: '3月', cost: 110000, budget: 150000 },
  { month: '4月', cost: 140000, budget: 150000 },
  { month: '5月', cost: 125000, budget: 150000 },
  { month: '6月', cost: 115000, budget: 150000 },
];

// Efficiency trend data
const efficiencyTrendData = [
  { month: '1月', efficiency: 85, target: 90 },
  { month: '2月', efficiency: 86, target: 90 },
  { month: '3月', efficiency: 87, target: 90 },
  { month: '4月', efficiency: 88, target: 90 },
  { month: '5月', efficiency: 89, target: 90 },
  { month: '6月', efficiency: 90, target: 90 },
];

// AI prediction data
const aiPredictionData = [
  { month: '7月', predicted: 390, actual: null },
  { month: '8月', predicted: 410, actual: null },
  { month: '9月', predicted: 370, actual: null },
  { month: '10月', predicted: 340, actual: null },
  { month: '11月', predicted: 300, actual: null },
  { month: '12月', predicted: 270, actual: null },
];

// Equipment status data
const equipmentStatusData = [
  { id: 1, type: '逆变器', status: 'online' as const, temperature: 45, power: 12000, efficiency: 95 },
  { id: 2, type: '逆变器', status: 'online' as const, temperature: 42, power: 11500, efficiency: 94 },
  { id: 3, type: '逆变器', status: 'warning' as const, temperature: 55, power: 10500, efficiency: 90 },
  { id: 4, type: '汇流箱', status: 'online' as const, temperature: 38, power: 25000, efficiency: 98 },
  { id: 5, type: '汇流箱', status: 'online' as const, temperature: 39, power: 24500, efficiency: 97 },
];

// Energy distribution data
const energyDistributionData = [
  { sector: '工业', value: 45 },
  { sector: '商业', value: 30 },
  { sector: '居民', value: 15 },
  { sector: '其他', value: 10 },
];

// Carbon emission reduction data
const carbonReductionData = [
  { month: '1月', reduction: 120 },
  { month: '2月', reduction: 110 },
  { month: '3月', reduction: 130 },
  { month: '4月', reduction: 140 },
  { month: '5月', reduction: 150 },
  { month: '6月', reduction: 160 },
];

// Key performance indicators
const kpis = [
  { name: '总发电量', value: '3.2亿kWh', unit: '', change: 8.3, trend: 'up' as const, icon: 'Zap' },
  { name: '系统效率', value: '92.5%', unit: '', change: 2.1, trend: 'up' as const, icon: 'Activity' },
  { name: '设备利用率', value: '98.2%', unit: '', change: 1.5, trend: 'up' as const, icon: 'Target' },
  { name: '故障次数', value: '5', unit: '次', change: -3, trend: 'down' as const, icon: 'AlertTriangle' },
  { name: '维护成本', value: '¥128万', unit: '', change: -5.2, trend: 'down' as const, icon: 'DollarSign' },
  { name: '碳减排量', value: '1.8万吨', unit: '', change: 10.5, trend: 'up' as const, icon: 'Leaf' },
];

// AI insights
const aiInsights = [
  { id: 1, title: '发电量预测', message: '基于历史数据，预计下月发电量将增加 5%', confidence: 92, type: 'info' as const },
  { id: 2, title: '设备异常', message: '3号逆变器温度持续偏高，建议检查冷却系统', confidence: 85, type: 'warning' as const },
  { id: 3, title: '优化建议', message: '调整面板角度可提高效率约 3%', confidence: 90, type: 'success' as const },
  { id: 4, title: '成本分析', message: '电缆损耗成本高于预期，建议优化路由', confidence: 88, type: 'info' as const },
];

// Maintenance schedule
const maintenanceSchedule = [
  { id: 1, task: '逆变器例行检查', date: '2024-01-15', priority: 'medium' as const, status: 'scheduled' as const },
  { id: 2, task: '电缆绝缘测试', date: '2024-01-20', priority: 'high' as const, status: 'scheduled' as const },
  { id: 3, task: '面板清洁', date: '2024-01-25', priority: 'low' as const, status: 'scheduled' as const },
  { id: 4, task: '监控系统升级', date: '2024-01-30', priority: 'medium' as const, status: 'scheduled' as const },
];

// Recent activities
const recentActivities = [
  { id: 1, action: '导入新算例', user: 'admin', time: '10分钟前', status: 'success' as const },
  { id: 2, action: '运行优化算法', user: 'admin', time: '30分钟前', status: 'success' as const },
  { id: 3, action: '导出优化结果', user: 'user1', time: '1小时前', status: 'success' as const },
  { id: 4, action: '系统自动备份', user: 'system', time: '2小时前', status: 'success' as const },
  { id: 5, action: '设备状态更新', user: 'system', time: '3小时前', status: 'warning' as const },
];

// System alerts
const systemAlerts = [
  { id: 1, type: 'warning' as const, message: '3号逆变器温度偏高', time: '10分钟前', severity: 'high' as const },
  { id: 2, type: 'info' as const, message: '今日发电量突破预期', time: '1小时前', severity: 'low' as const },
  { id: 3, type: 'success' as const, message: '优化算法运行完成', time: '2小时前', severity: 'low' as const },
  { id: 4, type: 'warning' as const, message: '5号电缆温度异常', time: '30分钟前', severity: 'medium' as const },
  { id: 5, type: 'info' as const, message: '新算例导入成功', time: '3小时前', severity: 'low' as const },
];

// Energy consumption by sector
const energyConsumptionBySector = [
  { name: '工业', value: 45, color: '#00d4ff' },
  { name: '商业', value: 30, color: '#10b981' },
  { name: '居民', value: 15, color: '#f59e0b' },
  { name: '其他', value: 10, color: '#8b5cf6' },
];

// Power quality data
const powerQualityData = [
  { parameter: '电压偏差', value: '2.1%', status: 'normal' },
  { parameter: '频率偏差', value: '0.3%', status: 'normal' },
  { parameter: '谐波含量', value: '3.2%', status: 'normal' },
  { parameter: '功率因数', value: '0.98', status: 'good' },
  { parameter: '三相不平衡', value: '1.5%', status: 'normal' },
];

// Weather impact on generation
const weatherImpactData = [
  { condition: '晴天', generation: 100, efficiency: 95 },
  { condition: '多云', generation: 75, efficiency: 90 },
  { condition: '阴天', generation: 50, efficiency: 85 },
  { condition: '小雨', generation: 30, efficiency: 80 },
  { condition: '大雨', generation: 10, efficiency: 70 },
];

// Equipment performance trends
const equipmentPerformanceTrends = [
  { month: '1月', inverter: 95, panels: 92, cables: 90, monitoring: 98 },
  { month: '2月', inverter: 94, panels: 91, cables: 89, monitoring: 98 },
  { month: '3月', inverter: 94, panels: 92, cables: 88, monitoring: 98 },
  { month: '4月', inverter: 93, panels: 91, cables: 87, monitoring: 98 },
  { month: '5月', inverter: 93, panels: 90, cables: 85, monitoring: 98 },
  { month: '6月', inverter: 92, panels: 89, cables: 82, monitoring: 98 },
];

// Financial summary
const financialSummary = {
  totalInvestment: 85000000,
  annualRevenue: 25000000,
  annualCosts: 8000000,
  roi: 20.6,
  paybackPeriod: 4.2,
  netProfit: 17000000,
};

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
};

const quickActions: QuickAction[] = [
  {
    id: 'site-selection',
    title: '智能选址',
    description: '基于地形和光照分析',
    icon: Target,
    color: 'bg-cyan-400/20 text-cyan-400 border-cyan-400/50'
  },
  {
    id: 'panel-layout',
    title: '面板布局',
    description: '优化面板排列和朝向',
    icon: BarChart3,
    color: 'bg-emerald-400/20 text-emerald-400 border-emerald-400/50'
  },
  {
    id: 'cable-routing',
    title: '电缆路由',
    description: '共沟优化和成本计算',
    icon: Zap,
    color: 'bg-amber-400/20 text-amber-400 border-amber-400/50'
  },
  {
    id: 'power-analysis',
    title: '电力分析',
    description: '非线性损耗计算',
    icon: Activity,
    color: 'bg-purple-400/20 text-purple-400 border-purple-400/50'
  },
];

// AI Algorithm Innovation Section
const algorithmFeatures = [
  {
    title: '多目标优化',
    description: 'NSGA-II算法实现多目标同时优化，平衡成本、效率和可靠性',
    icon: Target
  },
  {
    title: '混合优化算法',
    description: '结合遗传算法和粒子群优化的优点，提高搜索效率',
    icon: Activity
  },
  {
    title: '智能决策支持',
    description: '基于历史数据和机器学习的智能决策系统',
    icon: Settings
  },
  {
    title: '实时优化',
    description: '根据实时数据动态调整优化策略，适应环境变化',
    icon: TrendingUp
  }
];

interface MetricCardProps {
  title: string;
  value: string;
  unit?: string;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  delay: number;
}

const MetricCard = React.memo(function MetricCard({ title, value, unit, change, icon: Icon, delay }: MetricCardProps) {
  const { theme } = useAppStore();
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = useMemo(() => {
    const regex = new RegExp('[^0-9.]', 'g');
    return parseFloat(value.replace(regex, ''));
  }, [value]);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const duration = 1500;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;
    
    timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setDisplayValue(numericValue);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [numericValue]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`p-6 ${theme === 'dark' ? 'tech-card' : 'bg-white rounded-xl border border-gray-200 shadow-sm'}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              {value.includes('¥') ? '¥' : ''}
              {displayValue.toFixed(value.includes('.') ? 2 : 0)}
              {unit && <span className="text-lg ml-1">{unit}</span>}
            </span>
          </div>
          <div className={`flex items-center gap-1 mt-2 text-sm ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            <TrendingUp className={`w-4 h-4 ${change < 0 ? 'rotate-180' : ''}`} />
            <span>{Math.abs(change)}%</span>
            <span className={`ml-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>较上月</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-cyan-400" />
        </div>
      </div>
    </motion.div>
  );
});

const Dashboard: React.FC = React.memo(() => {
  const { theme } = useAppStore();
  const [selectedInstance, setSelectedInstance] = useState('r1');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [powerData, setPowerData] = useState([
    { time: '00:00', generated: 0, consumed: 15, grid: 15 },
    { time: '04:00', generated: 0, consumed: 12, grid: 12 },
    { time: '08:00', generated: 45, consumed: 35, grid: 0, exported: 10 },
    { time: '12:00', generated: 85, consumed: 55, grid: 0, exported: 30 },
    { time: '16:00', generated: 65, consumed: 48, grid: 0, exported: 17 },
    { time: '20:00', generated: 15, consumed: 42, grid: 27, exported: 0 },
    { time: '23:59', generated: 0, consumed: 25, grid: 25, exported: 0 },
  ]);

  // 实时更新发电数据
  useEffect(() => {
    const updatePowerData = () => {
      const now = new Date();
      const currentHour = now.getHours();

      // 生成基于时间的真实数据
      const newPowerData = powerData.map((item, index) => {
        const hour = parseInt(item.time.split(':')[0]);

        // 基于小时的发电量曲线（白天高，夜晚低）
        let baseGenerated = 0;
        if (hour >= 6 && hour <= 18) {
          // 正弦曲线模拟太阳辐射
          const solarNoon = 12;
          const deviation = Math.abs(hour - solarNoon);
          baseGenerated = Math.max(0, 85 * Math.cos((deviation / 6) * (Math.PI / 2)));
        }

        // 添加一些随机波动
        const generated = Math.max(0, baseGenerated + (Math.random() - 0.5) * 10);

        // 消耗量（白天高，夜晚低）
        const consumed = hour >= 6 && hour <= 22
          ? 35 + Math.random() * 20
          : 12 + Math.random() * 8;

        // 计算电网交互
        const netPower = generated - consumed;
        let gridInput = 0;
        let gridOutput = 0;
        let exported = 0;

        if (netPower > 0) {
          gridOutput = netPower;
          exported = netPower * 0.7;
        } else {
          gridInput = Math.abs(netPower);
        }

        return {
          ...item,
          generated: Math.round(generated),
          consumed: Math.round(consumed),
          grid: Math.round(gridInput),
          exported: Math.round(exported),
        };
      });

      setPowerData(newPowerData);
    };

    // 初始化数据
    updatePowerData();

    // 每5秒更新一次
    const interval = setInterval(updatePowerData, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const data = await dashboardService.fetchDashboardMetrics(selectedInstance);
        clearTimeout(timeoutId);
        
        if (data) {
          setDashboardData(data);
        }
      } catch (error) {
        console.error('获取仪表盘数据失败:', error);
      }
    };
    
    loadDashboardData();
  }, [selectedInstance]);

  const kpis = dashboardData?.kpi_summary ? [
    { name: '年发电量', value: `${(dashboardData.kpi_summary.annual_energy / 1000).toFixed(1)}万kWh`, unit: '', change: 8.3, trend: 'up' as const, icon: 'Zap' },
    { name: '系统效率', value: `${dashboardData.kpi_summary.system_efficiency.toFixed(1)}%`, unit: '', change: 2.1, trend: 'up' as const, icon: 'Activity' },
    { name: '土地利用率', value: `${dashboardData.kpi_summary.coverage_rate.toFixed(1)}%`, unit: '', change: 5.2, trend: 'up' as const, icon: 'Target' },
    { name: '故障次数', value: '5', unit: '次', change: -3, trend: 'down' as const, icon: 'AlertTriangle' },
    { name: '碳减排量', value: `${(dashboardData.environmental_metrics.annual_carbon_reduction / 10000).toFixed(1)}万吨`, unit: '', change: 10.5, trend: 'up' as const, icon: 'Leaf' },
    { name: '等效植树', value: `${dashboardData.environmental_metrics.equivalent_trees.toFixed(0)}万棵`, unit: '', change: 8.8, trend: 'up' as const, icon: 'TreePine' },
  ] : [
    { name: '年发电量', value: '3.2亿kWh', unit: '', change: 8.3, trend: 'up' as const, icon: 'Zap' },
    { name: '系统效率', value: '92.5%', unit: '', change: 2.1, trend: 'up' as const, icon: 'Activity' },
    { name: '土地利用率', value: '68.5%', unit: '', change: 5.2, trend: 'up' as const, icon: 'Target' },
    { name: '故障次数', value: '5', unit: '次', change: -3, trend: 'down' as const, icon: 'AlertTriangle' },
    { name: '碳减排量', value: '1.8万吨', unit: '', change: 10.5, trend: 'up' as const, icon: 'Leaf' },
    { name: '等效植树', value: '48万棵', unit: '', change: 8.8, trend: 'up' as const, icon: 'TreePine' },
  ];
  
  return (
    <div className="p-6 space-y-6">
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mr-3" />
          <span className="text-gray-400 text-lg">加载仪表盘数据...</span>
        </div>
      )}
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative h-64 rounded-2xl overflow-hidden gradient-border mountain-pv-bg"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/90 via-blue-900/90 to-purple-900/90" />
        <div className="absolute inset-0 flex items-center p-8">
          <div className="flex-1">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-white mb-4 glow-text"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              山地光伏智能设计系统
            </motion.h1>
            <motion.p 
              className="text-gray-300 max-w-2xl mb-6 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              基于人工智能与运筹优化技术，实现山地光伏电站全流程智能化设计，
              提升发电效率，降低建设成本，助力双碳目标实现。
            </motion.p>
            <motion.div 
              className="flex gap-4 flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <span className="px-4 py-2 rounded-full bg-cyan-400/20 text-cyan-400 text-sm font-medium">
                AI驱动
              </span>
              <span className="px-4 py-2 rounded-full bg-emerald-400/20 text-emerald-400 text-sm font-medium">
                运筹优化
              </span>
              <span className="px-4 py-2 rounded-full bg-amber-400/20 text-amber-400 text-sm font-medium">
                双碳战略
              </span>
              <span className="px-4 py-2 rounded-full bg-purple-400/20 text-purple-400 text-sm font-medium">
                智能决策
              </span>
            </motion.div>
          </div>
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.8, type: "spring" }}
          >
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center animate-float shadow-lg shadow-cyan-500/30">
              <Zap className="w-20 h-20 text-white" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {quickActions.map((action, index) => (
          <QuickActionItem
            key={action.id}
            action={action}
            index={index}
            onActionClick={(id) => {
              const sectionMap: Record<string, string> = {
                'site-selection': 'siteSelection',
                'panel-layout': 'panels',
                'cable-routing': 'cables',
                'power-simulation': 'powerSimulation'
              };
              const section = sectionMap[id] || id;
              window.location.href = `/${id}`;
            }}
          />
        ))}
      </motion.div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {kpis.map((kpi, index) => (
          <KpiCard
            key={kpi.name}
            kpi={kpi}
            index={index}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Power Generation Chart */}
        <PowerGenerationChart data={powerData} />

        {/* Cost Breakdown */}
        <CostBreakdownChart data={costBreakdown} />
      </div>

      {/* Monthly Power Generation */}
      <MonthlyPowerChart data={monthlyPowerData} />

      {/* System Health & Cost Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.7, type: "spring" }}
          className={`p-6 ${theme === 'dark' ? 'tech-card hover-lift' : 'bg-white rounded-xl border border-gray-200 shadow-sm hover-lift'}`}
        >
          <h3 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>系统健康状态</h3>
          <div className="space-y-5">
            {systemHealthData.map((component, index) => (
              <SystemHealthItem
                key={component.component}
                component={component}
                index={index}
              />
            ))}
          </div>
        </motion.div>

        {/* Cost Trend */}
        <CostTrendChart data={costTrendData} />
      </div>

      {/* AI Insights & Equipment Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.9, type: "spring" }}
          className={`p-6 ${theme === 'dark' ? 'tech-card hover-lift' : 'bg-white rounded-xl border border-gray-200 shadow-sm hover-lift'}`}
        >
          <h3 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
            <Lightbulb className="w-5 h-5 text-cyan-400" />
            AI 智能洞察
          </h3>
          <div className="space-y-4">
            {aiInsights.map((insight, index) => (
              <AiInsightItem
                key={insight.id}
                insight={insight}
                index={index}
              />
            ))}
          </div>
        </motion.div>

        {/* Equipment Status */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.0, type: "spring" }}
          className={`p-6 ${theme === 'dark' ? 'tech-card hover-lift' : 'bg-white rounded-xl border border-gray-200 shadow-sm hover-lift'}`}
        >
          <h3 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
            <Server className="w-5 h-5 text-cyan-400" />
            设备状态监控
          </h3>
          <div className="space-y-4">
            {equipmentStatusData.map((equipment, index) => (
              <EquipmentStatusItem
                key={equipment.id}
                equipment={equipment}
                index={index}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Maintenance Schedule & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.1, type: "spring" }}
          className={`p-6 ${theme === 'dark' ? 'tech-card hover-lift' : 'bg-white rounded-xl border border-gray-200 shadow-sm hover-lift'}`}
        >
          <h3 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
            <ClipboardList className="w-5 h-5 text-cyan-400" />
            维护计划
          </h3>
          <div className="space-y-4">
            {maintenanceSchedule.map((task, index) => (
              <MaintenanceTaskItem
                key={task.id}
                task={task}
                index={index}
              />
            ))}
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.2, type: "spring" }}
          className={`p-6 ${theme === 'dark' ? 'tech-card hover-lift' : 'bg-white rounded-xl border border-gray-200 shadow-sm hover-lift'}`}
        >
          <h3 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
            <Clock className="w-5 h-5 text-cyan-400" />
            最近活动
          </h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                index={index}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Weather Forecast & AI Algorithm Features */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Forecast */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8, type: "spring" }}
          className={`p-6 ${theme === 'dark' ? 'tech-card hover-lift' : 'bg-white rounded-xl border border-gray-200 shadow-sm hover-lift'}`}
        >
          <h3 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>天气预报</h3>
          <div className="space-y-4">
            {weatherForecast.map((day, index) => (
              <WeatherForecastItem
                key={day.day}
                day={day}
                index={index}
              />
            ))}
          </div>
        </motion.div>

        {/* AI Algorithm Features */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.9, type: "spring" }}
          className={`p-6 lg:col-span-2 ${theme === 'dark' ? 'tech-card hover-lift' : 'bg-white rounded-xl border border-gray-200 shadow-sm hover-lift'}`}
        >
          <h3 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>AI算法创新</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {algorithmFeatures.map((feature, index) => (
              <AlgorithmFeatureItem
                key={feature.title}
                feature={feature}
                index={index}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Alerts & Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 1.1, type: "spring" }}
        className={`p-6 ${theme === 'dark' ? 'tech-card hover-lift' : 'bg-white rounded-xl border border-gray-200 shadow-sm hover-lift'}`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>系统消息</h3>
          <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
            查看全部
          </button>
        </div>
        <div className="space-y-4">
          {alerts.map((alert, index) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              index={index}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
});

export default Dashboard;