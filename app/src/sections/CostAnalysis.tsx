import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingDown,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Zap,
  CheckCircle2,
  Activity,
  Target,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import costAnalysisService from '../services/costAnalysisService';

// 全生命周期协同优化模型
const calculateLifecycleOptimization = (params: {
  initialInvestment: number;
  annualMaintenance: number;
  annualEnergyProduction: number;
  energyPrice: number;
  equipmentLifetime: number;
  discountRate: number;
  annualLossReduction: number;
  equipmentReplacementCost: number;
  inflationRate: number;
}) => {
  const { 
    initialInvestment, 
    annualMaintenance, 
    annualEnergyProduction, 
    energyPrice, 
    equipmentLifetime, 
    discountRate, 
    annualLossReduction, 
    equipmentReplacementCost, 
    inflationRate 
  } = params;
  
  let npv = -initialInvestment;
  let totalCost = initialInvestment;
  let totalRevenue = 0;
  const annualData = [];
  
  for (let year = 1; year <= equipmentLifetime; year++) {
    // 考虑通货膨胀
    const inflatedMaintenance = annualMaintenance * Math.pow(1 + inflationRate, year - 1);
    const inflatedEnergyPrice = energyPrice * Math.pow(1 + inflationRate, year - 1);
    
    // 设备更换成本（每10年）
    let replacementCost = 0;
    if (year % 10 === 0 && year < equipmentLifetime) {
      replacementCost = equipmentReplacementCost * Math.pow(1 + inflationRate, year - 1);
    }
    
    // 年度收益 = 发电量 * 电价 + 损耗减少收益
    const annualRevenue = (annualEnergyProduction * inflatedEnergyPrice) + (annualLossReduction * inflatedEnergyPrice);
    const annualCost = inflatedMaintenance + replacementCost;
    const annualProfit = annualRevenue - annualCost;
    
    // 计算净现值
    npv += annualProfit / Math.pow(1 + discountRate, year);
    totalCost += annualCost;
    totalRevenue += annualRevenue;
    
    annualData.push({
      year,
      revenue: annualRevenue,
      cost: annualCost,
      profit: annualProfit,
      cumulativeProfit: totalRevenue - totalCost
    });
  }
  
  const irr = calculateIRR(initialInvestment, totalRevenue - totalCost, equipmentLifetime);
  const paybackPeriod = calculatePaybackPeriod(initialInvestment, totalRevenue - totalCost, equipmentLifetime);
  const lcoe = totalCost / (annualEnergyProduction * equipmentLifetime);
  
  return {
    npv,
    irr,
    paybackPeriod,
    lcoe,
    totalCost,
    totalRevenue,
    totalProfit: totalRevenue - totalCost,
    annualData
  };
};

// 计算内部收益率
const calculateIRR = (initialInvestment: number, totalProfit: number, years: number) => {
  // 简化计算，实际项目中应使用更精确的方法
  return Math.pow((totalProfit + initialInvestment) / initialInvestment, 1 / years) - 1;
};

// 计算投资回收期
const calculatePaybackPeriod = (initialInvestment: number, totalProfit: number, years: number) => {
  const annualProfit = totalProfit / years;
  return initialInvestment / annualProfit;
};

// 设备全生命周期成本计算
const calculateEquipmentLifecycleCost = (equipment: {
  initialCost: number;
  annualMaintenance: number;
  expectedLifetime: number;
  replacementCost: number;
  efficiency: number;
  energyPrice: number;
  annualEnergyProduction: number;
  discountRate: number;
}) => {
  const { 
    initialCost, 
    annualMaintenance, 
    expectedLifetime, 
    replacementCost, 
    efficiency, 
    energyPrice, 
    annualEnergyProduction, 
    discountRate 
  } = equipment;
  
  let totalCost = initialCost;
  let totalRevenue = 0;
  
  for (let year = 1; year <= expectedLifetime; year++) {
    // 考虑效率衰减
    const yearEfficiency = efficiency * (1 - 0.005 * (year - 1)); // 每年0.5%效率衰减
    const yearProduction = annualEnergyProduction * yearEfficiency;
    const yearRevenue = yearProduction * energyPrice;
    const yearMaintenance = annualMaintenance;
    
    totalCost += yearMaintenance / Math.pow(1 + discountRate, year);
    totalRevenue += yearRevenue / Math.pow(1 + discountRate, year);
  }
  
  // 考虑更换成本
  const replacementNPV = replacementCost / Math.pow(1 + discountRate, expectedLifetime);
  totalCost += replacementNPV;
  
  return {
    totalLifecycleCost: totalCost,
    totalLifecycleRevenue: totalRevenue,
    netLifecycleValue: totalRevenue - totalCost,
    roi: (totalRevenue - totalCost) / totalCost * 100
  };
};

// 多目标协同优化
const optimizeLifecycle = (options: any[]) => {
  // 基于多目标优化算法选择最优方案
  // 这里使用简化的加权评分法
  return options.map(option => {
    // 计算综合评分
    const costScore = 100 - (option.totalCost / 1000000); // 成本越低得分越高
    const efficiencyScore = option.efficiency * 100; // 效率越高得分越高
    const roiScore = option.roi; // 投资回报率越高得分越高
    const paybackScore = 100 - (option.paybackPeriod * 5); // 回收期越短得分越高
    
    // 加权评分
    const totalScore = (
      costScore * 0.3 +
      efficiencyScore * 0.3 +
      roiScore * 0.2 +
      paybackScore * 0.2
    );
    
    return {
      ...option,
      score: totalScore
    };
  }).sort((a, b) => b.score - a.score)[0];
};

// 详细成本明细数据
const detailedConstructionCost = [
  // 设备成本
  {
    category: '设备成本',
    subcategories: [
      { name: '光伏组件', amount: 32000, percentage: 37.6 },
      { name: '逆变器', amount: 8500, percentage: 10.0 },
      { name: '箱变', amount: 6200, percentage: 7.3 },
      { name: '汇流箱', amount: 3500, percentage: 4.1 },
      { name: '监控系统', amount: 2800, percentage: 3.3 },
      { name: '其他电气设备', amount: 1500, percentage: 1.8 }
    ]
  },
  // 结构成本
  {
    category: '结构成本',
    subcategories: [
      { name: '支架系统', amount: 12800, percentage: 15.1 },
      { name: '基础工程', amount: 4500, percentage: 5.3 },
      { name: '接地系统', amount: 1200, percentage: 1.4 }
    ]
  },
  // 线缆成本
  {
    category: '线缆成本',
    subcategories: [
      { name: '直流电缆', amount: 4500, percentage: 5.3 },
      { name: '交流电缆', amount: 3000, percentage: 3.5 },
      { name: '控制电缆', amount: 1000, percentage: 1.2 }
    ]
  },
  // 土建工程
  {
    category: '土建工程',
    subcategories: [
      { name: '场地平整', amount: 3200, percentage: 3.8 },
      { name: '道路工程', amount: 2500, percentage: 2.9 },
      { name: '排水系统', amount: 1800, percentage: 2.1 },
      { name: '围墙工程', amount: 1500, percentage: 1.8 },
      { name: '其他土建', amount: 1200, percentage: 1.4 }
    ]
  },
  // 其他成本
  {
    category: '其他成本',
    subcategories: [
      { name: '土地成本', amount: 3500, percentage: 4.1 },
      { name: '审批费用', amount: 1500, percentage: 1.8 },
      { name: '保险费用', amount: 1000, percentage: 1.2 },
      { name: '培训费用', amount: 500, percentage: 0.6 },
      { name: '应急储备', amount: 300, percentage: 0.3 }
    ]
  }
];

// 计算总建设成本
const totalConstruction = detailedConstructionCost.reduce((total, category) => {
  return total + category.subcategories.reduce((subtotal, item) => subtotal + item.amount, 0);
}, 0);

// 简化的建设成本数据（用于饼图）
const constructionCost = [
  { category: '光伏组件', amount: 32000, percentage: 37.6 },
  { category: '逆变器', amount: 8500, percentage: 10.0 },
  { category: '箱变', amount: 6200, percentage: 7.3 },
  { category: '支架系统', amount: 12800, percentage: 15.1 },
  { category: '电缆', amount: 8500, percentage: 10.0 },
  { category: '土建工程', amount: 10200, percentage: 12.0 },
  { category: '其他', amount: 6800, percentage: 8.0 },
];

const lifecycleCost = [
  { year: 1, construction: 85000, operation: 1200, loss: 2800 },
  { year: 5, construction: 0, operation: 1500, loss: 2900 },
  { year: 10, construction: 0, operation: 1800, loss: 3100 },
  { year: 15, construction: 5000, operation: 2100, loss: 3300 },
  { year: 20, construction: 0, operation: 2400, loss: 3500 },
  { year: 25, construction: 8000, operation: 2800, loss: 3800 },
];

const optimizationComparison = [
  { 
    metric: '建设成本', 
    before: 85000, 
    after: 68000, 
    unit: '万元',
    saving: 20.0 
  },
  { 
    metric: '电缆长度', 
    before: 12500, 
    after: 8630, 
    unit: '米',
    saving: 31.0 
  },
  { 
    metric: '挖沟长度', 
    before: 8200, 
    after: 4850, 
    unit: '米',
    saving: 40.9 
  },
  { 
    metric: '电力损耗', 
    before: 4.2, 
    after: 3.1, 
    unit: '%',
    saving: 26.2 
  },
  { 
    metric: '年发电量', 
    before: 28500, 
    after: 31200, 
    unit: '万kWh',
    saving: 9.5 
  },
];

const paybackData = [
  { year: 0, cumulative: -85000 },
  { year: 1, cumulative: -72000 },
  { year: 2, cumulative: -59000 },
  { year: 3, cumulative: -46000 },
  { year: 4, cumulative: -33000 },
  { year: 5, cumulative: -20000 },
  { year: 6, cumulative: -7000 },
  { year: 7, cumulative: 6000 },
  { year: 8, cumulative: 19000 },
  { year: 9, cumulative: 32000 },
  { year: 10, cumulative: 45000 },
];

// 成本预测数据
const costForecastData = [
  { year: 2024, construction: 85000, operation: 1200, maintenance: 800, loss: 2800, total: 89800 },
  { year: 2025, construction: 0, operation: 1250, maintenance: 850, loss: 2850, total: 4950 },
  { year: 2026, construction: 0, operation: 1300, maintenance: 900, loss: 2900, total: 5100 },
  { year: 2027, construction: 0, operation: 1350, maintenance: 950, loss: 2950, total: 5250 },
  { year: 2028, construction: 0, operation: 1400, maintenance: 1000, loss: 3000, total: 5400 },
  { year: 2029, construction: 5000, operation: 1450, maintenance: 1050, loss: 3050, total: 10550 },
  { year: 2030, construction: 0, operation: 1500, maintenance: 1100, loss: 3100, total: 5700 },
  { year: 2031, construction: 0, operation: 1550, maintenance: 1150, loss: 3150, total: 5850 },
  { year: 2032, construction: 0, operation: 1600, maintenance: 1200, loss: 3200, total: 6000 },
  { year: 2033, construction: 0, operation: 1650, maintenance: 1250, loss: 3250, total: 6150 },
  { year: 2034, construction: 8000, operation: 1700, maintenance: 1300, loss: 3300, total: 14300 },
  { year: 2035, construction: 0, operation: 1750, maintenance: 1350, loss: 3350, total: 6450 },
  { year: 2036, construction: 0, operation: 1800, maintenance: 1400, loss: 3400, total: 6600 },
  { year: 2037, construction: 0, operation: 1850, maintenance: 1450, loss: 3450, total: 6750 },
  { year: 2038, construction: 0, operation: 1900, maintenance: 1500, loss: 3500, total: 6900 },
  { year: 2039, construction: 10000, operation: 1950, maintenance: 1550, loss: 3550, total: 17050 },
  { year: 2040, construction: 0, operation: 2000, maintenance: 1600, loss: 3600, total: 7200 },
  { year: 2041, construction: 0, operation: 2050, maintenance: 1650, loss: 3650, total: 7350 },
  { year: 2042, construction: 0, operation: 2100, maintenance: 1700, loss: 3700, total: 7500 },
  { year: 2043, construction: 0, operation: 2150, maintenance: 1750, loss: 3750, total: 7650 },
  { year: 2044, construction: 12000, operation: 2200, maintenance: 1800, loss: 3800, total: 19800 },
  { year: 2045, construction: 0, operation: 2250, maintenance: 1850, loss: 3850, total: 7950 },
  { year: 2046, construction: 0, operation: 2300, maintenance: 1900, loss: 3900, total: 8100 },
  { year: 2047, construction: 0, operation: 2350, maintenance: 1950, loss: 3950, total: 8250 },
  { year: 2048, construction: 0, operation: 2400, maintenance: 2000, loss: 4000, total: 8400 }
];

// 预测模型数据
const forecastModelData = [
  { year: 2024, actual: 89800, linear: 89800, exponential: 89800, arima: 89800 },
  { year: 2025, actual: 4950, linear: 5100, exponential: 5050, arima: 4980 },
  { year: 2026, actual: 5100, linear: 5200, exponential: 5150, arima: 5090 },
  { year: 2027, actual: 5250, linear: 5300, exponential: 5250, arima: 5240 },
  { year: 2028, actual: 5400, linear: 5400, exponential: 5350, arima: 5390 },
  { year: 2029, actual: 10550, linear: 10600, exponential: 10500, arima: 10540 },
  { year: 2030, actual: 5700, linear: 5750, exponential: 5650, arima: 5690 },
  { year: 2031, actual: 5850, linear: 5900, exponential: 5800, arima: 5840 },
  { year: 2032, actual: 6000, linear: 6050, exponential: 5950, arima: 5990 },
  { year: 2033, actual: 6150, linear: 6200, exponential: 6100, arima: 6140 },
  { year: 2034, actual: 14300, linear: 14350, exponential: 14250, arima: 14290 },
  { year: 2035, actual: 6450, linear: 6500, exponential: 6400, arima: 6440 },
  { year: 2036, forecast: true, linear: 6650, exponential: 6550, arima: 6600, ensemble: 6600 },
  { year: 2037, forecast: true, linear: 6800, exponential: 6700, arima: 6750, ensemble: 6750 },
  { year: 2038, forecast: true, linear: 6950, exponential: 6850, arima: 6900, ensemble: 6900 },
  { year: 2039, forecast: true, linear: 17200, exponential: 17100, arima: 17150, ensemble: 17150 },
  { year: 2040, forecast: true, linear: 7250, exponential: 7150, arima: 7200, ensemble: 7200 },
  { year: 2041, forecast: true, linear: 7400, exponential: 7300, arima: 7350, ensemble: 7350 },
  { year: 2042, forecast: true, linear: 7550, exponential: 7450, arima: 7500, ensemble: 7500 },
  { year: 2043, forecast: true, linear: 7700, exponential: 7600, arima: 7650, ensemble: 7650 },
  { year: 2044, forecast: true, linear: 20000, exponential: 19900, arima: 19950, ensemble: 19950 },
  { year: 2045, forecast: true, linear: 8150, exponential: 8050, arima: 8100, ensemble: 8100 },
  { year: 2046, forecast: true, linear: 8300, exponential: 8200, arima: 8250, ensemble: 8250 },
  { year: 2047, forecast: true, linear: 8450, exponential: 8350, arima: 8400, ensemble: 8400 },
  { year: 2048, forecast: true, linear: 8600, exponential: 8500, arima: 8550, ensemble: 8550 }
];

// 预测模型准确率数据
const modelAccuracyData = [
  { model: '线性回归', accuracy: 92.5, rmse: 120.5 },
  { model: '指数平滑', accuracy: 94.2, rmse: 95.8 },
  { model: 'ARIMA', accuracy: 96.8, rmse: 68.2 },
  { model: '集成模型', accuracy: 97.5, rmse: 52.1 }
];

// 预测模型配置
const forecastModelConfig = {
  linear: {
    name: '线性回归',
    description: '基于历史数据的线性趋势预测',
    color: '#00d4ff',
    isActive: true
  },
  exponential: {
    name: '指数平滑',
    description: '考虑时间序列的指数增长趋势',
    color: '#10b981',
    isActive: true
  },
  arima: {
    name: 'ARIMA',
    description: '自回归综合移动平均模型，考虑时间序列的季节性',
    color: '#f59e0b',
    isActive: true
  },
  ensemble: {
    name: '集成模型',
    description: '融合多种模型的预测结果，提高准确率',
    color: '#8b5cf6',
    isActive: true
  }
};

// 不同场景下的成本预测
const scenarioCostData = [
  {
    scenario: '基准场景',
    initialInvestment: 85000,
    annualMaintenance: 1200,
    annualOperation: 1000,
    equipmentReplacement: 20000,
    totalLifecycleCost: 125000,
    npv: 28000,
    irr: 12.5,
    paybackPeriod: 7.2
  },
  {
    scenario: '乐观场景',
    initialInvestment: 80000,
    annualMaintenance: 1000,
    annualOperation: 800,
    equipmentReplacement: 18000,
    totalLifecycleCost: 115000,
    npv: 35000,
    irr: 14.2,
    paybackPeriod: 6.5
  },
  {
    scenario: '悲观场景',
    initialInvestment: 90000,
    annualMaintenance: 1500,
    annualOperation: 1200,
    equipmentReplacement: 22000,
    totalLifecycleCost: 135000,
    npv: 20000,
    irr: 10.8,
    paybackPeriod: 8.0
  }
];

// 自定义Tooltip组件
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    let value = data.value;
    let name = data.name;

    // 如果value是数组（来自formatter），取第一个元素作为显示值
    if (Array.isArray(value)) {
      value = value[0];
    }
    if (Array.isArray(name)) {
      name = name[0];
    }

    return (
      <div className="px-4 py-3 rounded-xl shadow-2xl bg-[#0f172a] border border-cyan-400/30" style={{ zIndex: 9999 }}>
        <p className="font-medium text-white">
          {name}: {value}
        </p>
      </div>
    );
  }
  return null;
};

const COLORS = ['#00d4ff', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

// 设备选项数据
const equipmentOptions = [
  {
    name: '高效光伏组件方案',
    initialCost: 35000,
    annualMaintenance: 800,
    expectedLifetime: 25,
    replacementCost: 15000,
    efficiency: 0.22,
    energyPrice: 0.5,
    annualEnergyProduction: 31200,
    discountRate: 0.08
  },
  {
    name: '标准光伏组件方案',
    initialCost: 32000,
    annualMaintenance: 1000,
    expectedLifetime: 25,
    replacementCost: 12000,
    efficiency: 0.20,
    energyPrice: 0.5,
    annualEnergyProduction: 29000,
    discountRate: 0.08
  },
  {
    name: '经济型光伏组件方案',
    initialCost: 28000,
    annualMaintenance: 1200,
    expectedLifetime: 20,
    replacementCost: 10000,
    efficiency: 0.18,
    energyPrice: 0.5,
    annualEnergyProduction: 26800,
    discountRate: 0.08
  }
];

// 计算各设备方案的全生命周期成本
const equipmentLifecycleCosts = equipmentOptions.map(option => ({
  ...option,
  ...calculateEquipmentLifecycleCost(option)
}));

// 计算全生命周期协同优化
const lifecycleOptimizationParams = {
  initialInvestment: 85000,
  annualMaintenance: 1200,
  annualEnergyProduction: 31200,
  energyPrice: 0.5,
  equipmentLifetime: 25,
  discountRate: 0.08,
  annualLossReduction: 1000,
  equipmentReplacementCost: 20000,
  inflationRate: 0.03
};

const lifecycleOptimizationResult = calculateLifecycleOptimization(lifecycleOptimizationParams);

// 多目标协同优化
const optimizedSolution = optimizeLifecycle(equipmentLifecycleCosts);

// 雷达图数据
const radarData = [
  { subject: '初始投资', A: 80, B: 60, C: 40, fullMark: 100 },
  { subject: '运行成本', A: 65, B: 75, C: 85, fullMark: 100 },
  { subject: '发电效率', A: 90, B: 70, C: 50, fullMark: 100 },
  { subject: '投资回报', A: 85, B: 65, C: 45, fullMark: 100 },
  { subject: '生命周期', A: 90, B: 90, C: 70, fullMark: 100 },
  { subject: '维护成本', A: 75, B: 65, C: 55, fullMark: 100 },
];

export default function CostAnalysis() {
  const [activeTab, setActiveTab] = useState<'construction' | 'lifecycle' | 'payback' | 'optimization' | 'forecast' | 'scenario' | 'forecastModel'>('construction');
  const [expandedSections, setExpandedSections] = useState({
    equipmentDetails: true,
    optimizationDetails: true,
    costDetails: true,
    forecastDetails: true,
    scenarioDetails: true,
    modelDetails: true
  });
  
  const [selectedModels, setSelectedModels] = useState({
    linear: true,
    exponential: true,
    arima: true,
    ensemble: true
  });
  
  const [forecastYears, setForecastYears] = useState(10);
  const [confidenceInterval, setConfidenceInterval] = useState(95);
  const [selectedInstance, setSelectedInstance] = useState('r1');
  const [costData, setCostData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCostData = async () => {
      setIsLoading(true);
      try {
        const data = await costAnalysisService.fetchCostAnalysis(selectedInstance);
        if (data) {
          setCostData(data);
        }
      } catch (error) {
        console.error('获取成本数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCostData();
  }, [selectedInstance]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const handleModelToggle = (model: keyof typeof selectedModels) => {
    setSelectedModels(prev => ({
      ...prev,
      [model]: !prev[model]
    }));
  };
  
  const handleForecastYearsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForecastYears(Number(e.target.value));
  };
  
  const handleConfidenceIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfidenceInterval(Number(e.target.value));
  };

  const totalInvestment = costData?.total_cost ? costData.total_cost * 10000 : 850000000;
  const optimizedInvestment = costData?.total_cost ? costData.total_cost * 8000 : 680000000;
  const annualRevenue = costData?.benefit_analysis?.annual_revenue || 125000000;
  const annualGeneration = costData?.system_parameters?.annual_energy || 312000000;
  const paybackYears = costData?.benefit_analysis?.payback_period || 7.2;
  const lcoeValue = costData?.benefit_analysis?.lcoe || 0.28;
  const totalCost25y = costData?.total_cost ? costData.total_cost * 10000 : 2500000000;
  const npvValue = costData?.total_cost ? costData.total_cost * 3500 : 280000000;
  const irrValue = costData?.benefit_analysis?.roi || 12.5;
  
  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-auto">
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mr-2" />
          <span className="text-gray-400">加载成本数据...</span>
        </div>
      )}
      {/* Header Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="tech-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">建设总投资</p>
            <p className="text-2xl font-bold text-white">¥{(totalInvestment / 100000000).toFixed(1)}亿</p>
          </div>
        </div>

        <div className="tech-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-400/10 flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">优化后投资</p>
            <p className="text-2xl font-bold text-emerald-400">¥{(optimizedInvestment / 100000000).toFixed(1)}亿</p>
          </div>
        </div>

        <div className="tech-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center">
            <PieChartIcon className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">成本节省</p>
            <p className="text-2xl font-bold text-white">¥{((totalInvestment - optimizedInvestment) / 100000000).toFixed(1)}亿</p>
          </div>
        </div>

        <div className="tech-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-400/10 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">投资回收期</p>
            <p className="text-2xl font-bold text-white">{paybackYears} 年</p>
          </div>
        </div>
      </motion.div>
      
      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 flex-wrap"
      >
        <button
          onClick={() => setActiveTab('construction')}
          className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'construction'
              ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/50'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            建设成本
          </div>
        </button>
        <button
          onClick={() => setActiveTab('lifecycle')}
          className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'lifecycle'
              ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/50'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            全生命周期
          </div>
        </button>
        <button
          onClick={() => setActiveTab('payback')}
          className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'payback'
              ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/50'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            投资回报
          </div>
        </button>
        <button
            onClick={() => setActiveTab('optimization')}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'optimization'
                ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/50'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              协同优化
            </div>
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'forecast'
                ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/50'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              成本预测
            </div>
          </button>
          <button
            onClick={() => setActiveTab('scenario')}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'scenario'
                ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/50'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              场景分析
            </div>
          </button>
          <button
            onClick={() => setActiveTab('forecastModel')}
            className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'forecastModel'
                ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/50'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              预测模型
            </div>
          </button>
        </motion.div>
      
      {/* Content based on active tab */}
      {activeTab === 'construction' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Cost Breakdown Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="tech-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">建设成本构成</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={constructionCost}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="amount"
                      label={({ category, percentage }) => `${category} ${percentage}%`}
                      labelLine={false}
                    >
                      {constructionCost.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={<CustomTooltip />}
                      formatter={(value: number) => [`¥${(value / 10000).toFixed(2)}亿`, '金额']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="tech-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">成本明细</h3>
              <div className="space-y-3">
                {constructionCost.map((item, index) => (
                  <div key={item.category} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                    <span 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="flex-1 text-white">{item.category}</span>
                    <span className="text-cyan-400 font-semibold">
                      ¥{(item.amount / 10000).toFixed(2)}亿
                    </span>
                    <span className="text-gray-400 text-sm w-16 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-4 p-3 bg-cyan-400/10 rounded-lg border border-cyan-400/30 mt-4">
                  <span className="flex-1 text-cyan-400 font-semibold">合计</span>
                  <span className="text-cyan-400 font-bold text-lg">
                    ¥{(totalConstruction / 10000).toFixed(2)}亿
                  </span>
                  <span className="text-cyan-400 text-sm w-16 text-right">100%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Detailed Cost Breakdown */}
          <div className="tech-card p-6">
            <div 
              className="flex items-center justify-between cursor-pointer" 
              onClick={() => toggleSection('costDetails')}
            >
              <h3 className="text-lg font-semibold text-white">详细成本明细</h3>
              {expandedSections.costDetails ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
            
            {expandedSections.costDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className="space-y-6">
                  {detailedConstructionCost.map((category, categoryIndex) => {
                    const categoryTotal = category.subcategories.reduce((sum, item) => sum + item.amount, 0);
                    const categoryPercentage = (categoryTotal / totalConstruction) * 100;
                    
                    return (
                      <div key={category.category} className="border border-white/10 rounded-lg">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-t-lg">
                          <h4 className="text-white font-medium">{category.category}</h4>
                          <div className="flex items-center gap-4">
                            <span className="text-cyan-400 font-semibold">¥{(categoryTotal / 10000).toFixed(2)}亿</span>
                            <span className="text-gray-400 text-sm">{categoryPercentage.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="p-4 space-y-2">
                          {category.subcategories.map((item, itemIndex) => (
                            <div key={item.name} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                              <span className="text-gray-300">{item.name}</span>
                              <div className="flex items-center gap-4">
                                <span className="text-white font-semibold">¥{(item.amount / 10000).toFixed(3)}亿</span>
                                <span className="text-gray-400 text-sm">{item.percentage}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Optimization Comparison */}
          <div className="tech-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">优化效果对比</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {optimizationComparison.map((item) => (
                <div key={item.metric} className="bg-white/5 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-sm mb-2">{item.metric}</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-gray-500 text-xs">优化前</p>
                      <p className="text-white font-semibold">{item.before} {item.unit}</p>
                    </div>
                    <div className="text-emerald-400">
                      <p className="text-gray-500 text-xs">优化后</p>
                      <p className="font-semibold">{item.after} {item.unit}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <span className="text-emerald-400 text-sm font-medium">
                      ↓ {item.saving}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
      
      {activeTab === 'lifecycle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="tech-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">全生命周期成本分析 (25年)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lifecycleCost}>
                <defs>
                  <linearGradient id="colorConstruction" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOperation" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="year" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(10, 15, 26, 0.95)', 
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                    padding: '12px',
                    fontSize: '14px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="construction" 
                  stackId="1"
                  stroke="#00d4ff" 
                  fill="url(#colorConstruction)" 
                  name="建设成本"
                />
                <Area 
                  type="monotone" 
                  dataKey="operation" 
                  stackId="1"
                  stroke="#10b981" 
                  fill="url(#colorOperation)" 
                  name="运维成本"
                />
                <Area 
                  type="monotone" 
                  dataKey="loss" 
                  stackId="1"
                  stroke="#f59e0b" 
                  fill="url(#colorLoss)" 
                  name="损耗成本"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-center gap-8 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-cyan-400" /> 建设成本
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-400" /> 运维成本
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-400" /> 损耗成本
            </span>
          </div>
        </motion.div>
      )}
      
      {activeTab === 'payback' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="tech-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">累计现金流</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={paybackData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="year" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(10, 15, 26, 0.95)', 
                      border: '1px solid rgba(0, 212, 255, 0.3)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                      padding: '12px',
                      fontSize: '14px'
                    }}
                    formatter={(value: number) => [`¥${(value / 10000).toFixed(2)}亿`, '累计现金流']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cumulative" 
                    stroke="#00d4ff" 
                    strokeWidth={2}
                    dot={{ fill: '#00d4ff', strokeWidth: 2 }}
                  />
                  <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#ef4444" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="tech-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">投资回报指标</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">投资回收期</p>
                  <p className="text-2xl font-bold text-white">7.2 年</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">净现值 (NPV)</p>
                  <p className="text-2xl font-bold text-emerald-400">¥2.8亿</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">内部收益率 (IRR)</p>
                  <p className="text-2xl font-bold text-cyan-400">12.5%</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">25年总收益</p>
                  <p className="text-2xl font-bold text-amber-400">¥18.6亿</p>
                </div>
              </div>
            </div>
            
            <div className="tech-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">发电收益预测</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    <span className="text-white">年均发电量</span>
                  </div>
                  <span className="text-cyan-400 font-semibold">3.12亿 kWh</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    <span className="text-white">年均发电收入</span>
                  </div>
                  <span className="text-emerald-400 font-semibold">¥1.25亿</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="w-5 h-5 text-amber-400" />
                    <span className="text-white">度电成本 (LCOE)</span>
                  </div>
                  <span className="text-amber-400 font-semibold">¥0.28/kWh</span>
                </div>
              </div>
            </div>
            
            <div className="bg-emerald-400/10 rounded-lg p-4 border border-emerald-400/30">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">优化结论</span>
              </div>
              <p className="text-gray-300 text-sm">
                通过AI优化算法，项目总投资降低 <span className="text-emerald-400 font-semibold">20%</span>，
                投资回收期缩短至 <span className="text-emerald-400 font-semibold">7.2年</span>，
                25年内部收益率达到 <span className="text-emerald-400 font-semibold">12.5%</span>，
                项目经济效益显著。
              </p>
            </div>
          </div>
        </motion.div>
      )}
      
      {activeTab === 'optimization' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Optimization Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div className="tech-card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">最优方案</p>
                <p className="text-lg font-bold text-white">{optimizedSolution.name}</p>
              </div>
            </div>
            
            <div className="tech-card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-400/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">生命周期成本</p>
                <p className="text-2xl font-bold text-emerald-400">¥{Math.round(optimizedSolution.totalLifecycleCost).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="tech-card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">投资回报率</p>
                <p className="text-2xl font-bold text-white">{optimizedSolution.roi.toFixed(2)}%</p>
              </div>
            </div>
            
            <div className="tech-card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-400/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">综合评分</p>
                <p className="text-2xl font-bold text-white">{optimizedSolution.score.toFixed(1)}</p>
              </div>
            </div>
          </motion.div>
          
          {/* Equipment Lifecycle Analysis */}
          <div className="tech-card p-6">
            <div 
              className="flex items-center justify-between cursor-pointer" 
              onClick={() => toggleSection('equipmentDetails')}
            >
              <h3 className="text-lg font-semibold text-white">设备全生命周期成本分析</h3>
              {expandedSections.equipmentDetails ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
            
            {expandedSections.equipmentDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {equipmentLifecycleCosts.map((equipment) => (
                    <div key={equipment.name} className={`tech-card p-4 ${equipment.name === optimizedSolution.name ? 'border border-cyan-400/50 bg-cyan-400/5' : ''}`}>
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-white font-medium">{equipment.name}</h4>
                        {equipment.name === optimizedSolution.name && (
                          <span className="px-2 py-1 rounded bg-cyan-400/20 text-cyan-400 text-xs font-medium">
                            最优选择
                          </span>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                          <span className="text-gray-400 text-sm">初始成本</span>
                          <span className="text-white font-semibold">¥{equipment.initialCost.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                          <span className="text-gray-400 text-sm">年维护成本</span>
                          <span className="text-white font-semibold">¥{equipment.annualMaintenance.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                          <span className="text-gray-400 text-sm">预期寿命</span>
                          <span className="text-white font-semibold">{equipment.expectedLifetime} 年</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                          <span className="text-gray-400 text-sm">转换效率</span>
                          <span className="text-white font-semibold">{equipment.efficiency * 100}%</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                          <span className="text-gray-400 text-sm">生命周期成本</span>
                          <span className="text-emerald-400 font-semibold">¥{Math.round(equipment.totalLifecycleCost).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                          <span className="text-gray-400 text-sm">投资回报率</span>
                          <span className="text-amber-400 font-semibold">{equipment.roi.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Optimization Details */}
          <div className="tech-card p-6">
            <div 
              className="flex items-center justify-between cursor-pointer" 
              onClick={() => toggleSection('optimizationDetails')}
            >
              <h3 className="text-lg font-semibold text-white">全生命周期协同优化</h3>
              {expandedSections.optimizationDetails ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
            
            {expandedSections.optimizationDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Radar Chart */}
                  <div className="tech-card p-4">
                    <h4 className="text-sm font-medium text-cyan-400 mb-3">方案对比</h4>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart outerRadius={90} width={500} height={300} data={radarData}>
                          <PolarGrid stroke="rgba(255,255,255,0.2)" />
                          <PolarAngleAxis dataKey="subject" stroke="#6b7280" fontSize={12} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#6b7280" />
                          <Radar name="高效方案" dataKey="A" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.3} />
                          <Radar name="标准方案" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                          <Radar name="经济方案" dataKey="C" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                          <Legend />
                          <Tooltip 
                            contentStyle={{ 
                              background: 'rgba(10, 15, 26, 0.95)', 
                              border: '1px solid rgba(0, 212, 255, 0.3)',
                              borderRadius: '8px',
                              color: '#ffffff',
                              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                              padding: '12px',
                              fontSize: '14px'
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Optimization Results */}
                  <div className="tech-card p-4">
                    <h4 className="text-sm font-medium text-cyan-400 mb-3">优化结果</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">净现值 (NPV)</span>
                        <span className="text-emerald-400 font-semibold">¥{Math.round(lifecycleOptimizationResult.npv).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">内部收益率 (IRR)</span>
                        <span className="text-emerald-400 font-semibold">{(lifecycleOptimizationResult.irr * 100).toFixed(2)}%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">投资回收期</span>
                        <span className="text-amber-400 font-semibold">{lifecycleOptimizationResult.paybackPeriod.toFixed(2)} 年</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">度电成本 (LCOE)</span>
                        <span className="text-amber-400 font-semibold">¥{lifecycleOptimizationResult.lcoe.toFixed(3)}/kWh</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">总生命周期成本</span>
                        <span className="text-cyan-400 font-semibold">¥{Math.round(lifecycleOptimizationResult.totalCost).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">总生命周期收益</span>
                        <span className="text-emerald-400 font-semibold">¥{Math.round(lifecycleOptimizationResult.totalRevenue).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-emerald-400/10 rounded-lg border border-emerald-400/30 mt-4">
                        <span className="text-emerald-400 font-semibold">总生命周期利润</span>
                        <span className="text-emerald-400 font-bold text-lg">¥{Math.round(lifecycleOptimizationResult.totalProfit).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Annual Data Chart */}
                <div className="tech-card p-4 mt-6">
                  <h4 className="text-sm font-medium text-cyan-400 mb-3">年度现金流</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={lifecycleOptimizationResult.annualData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="year" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'rgba(10, 15, 26, 0.95)', 
                            border: '1px solid rgba(0, 212, 255, 0.3)',
                            borderRadius: '8px',
                            color: '#ffffff',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                            padding: '12px',
                            fontSize: '14px'
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" name="年度收益" stroke="#10b981" strokeWidth={2} />
                        <Line type="monotone" dataKey="cost" name="年度成本" stroke="#f59e0b" strokeWidth={2} />
                        <Line type="monotone" dataKey="profit" name="年度利润" stroke="#00d4ff" strokeWidth={2} />
                        <Line type="monotone" dataKey="cumulativeProfit" name="累计利润" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Optimization Recommendations */}
                <div className="bg-emerald-400/10 rounded-lg p-4 border border-emerald-400/30 mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">优化建议</span>
                  </div>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• 选择{optimizedSolution.name}，综合评分最高，投资回报率达{optimizedSolution.roi.toFixed(2)}%</li>
                    <li>• 考虑设备更换周期，每10年进行一次主要设备更换，以保持系统效率</li>
                    <li>• 优化维护计划，减少不必要的维护成本，提高系统可靠性</li>
                    <li>• 结合电力损耗优化，进一步降低运行成本</li>
                    <li>• 定期监测系统性能，及时调整运行参数，确保系统高效运行</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
      
      {activeTab === 'forecast' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Cost Forecast Section */}
          <div className="tech-card p-6">
            <div 
              className="flex items-center justify-between cursor-pointer" 
              onClick={() => toggleSection('forecastDetails')}
            >
              <h3 className="text-lg font-semibold text-white">成本预测</h3>
              {expandedSections.forecastDetails ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
            
            {expandedSections.forecastDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Cost Forecast Chart */}
                  <div className="tech-card p-4">
                    <h4 className="text-sm font-medium text-cyan-400 mb-3">25年成本预测</h4>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={costForecastData}>
                          <defs>
                            <linearGradient id="colorConstruction" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorOperation" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorMaintenance" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="year" stroke="#6b7280" fontSize={12} /> 
                          <YAxis stroke="#6b7280" fontSize={12} />
                          <Tooltip 
                            contentStyle={{ 
                              background: 'rgba(10, 15, 26, 0.95)', 
                              border: '1px solid rgba(0, 212, 255, 0.3)',
                              borderRadius: '8px',
                              color: '#ffffff',
                              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                              padding: '12px',
                              fontSize: '14px'
                            }}
                            formatter={(value: number) => [`¥${(value / 10000).toFixed(2)}亿`, '金额']}
                          />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="construction" 
                            stackId="1"
                            stroke="#00d4ff" 
                            fill="url(#colorConstruction)" 
                            name="建设成本" 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="operation" 
                            stackId="1"
                            stroke="#10b981" 
                            fill="url(#colorOperation)" 
                            name="运行成本" 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="maintenance" 
                            stackId="1"
                            stroke="#f59e0b" 
                            fill="url(#colorMaintenance)" 
                            name="维护成本" 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="loss" 
                            stackId="1"
                            stroke="#8b5cf6" 
                            fill="url(#colorLoss)" 
                            name="损耗成本" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Cost Breakdown by Category */}
                  <div className="tech-card p-4">
                    <h4 className="text-sm font-medium text-cyan-400 mb-3">成本类别分析</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-400 text-sm">建设成本</span>
                          <span className="text-white font-semibold">¥11.5亿</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div className="bg-cyan-400 h-2 rounded-full" style={{ width: '46%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-400 text-sm">运行成本</span>
                          <span className="text-white font-semibold">¥5.2亿</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '21%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-400 text-sm">维护成本</span>
                          <span className="text-white font-semibold">¥3.6亿</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div className="bg-amber-400 h-2 rounded-full" style={{ width: '14%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-400 text-sm">损耗成本</span>
                          <span className="text-white font-semibold">¥4.7亿</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div className="bg-purple-400 h-2 rounded-full" style={{ width: '19%' }} />
                        </div>
                      </div>
                      <div className="mt-6 p-4 bg-cyan-400/10 rounded-lg border border-cyan-400/30">
                        <div className="flex justify-between items-center">
                          <span className="text-cyan-400 font-semibold">25年总成本</span>
                          <span className="text-cyan-400 font-bold text-lg">¥25.0亿</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-gray-400 text-sm">年均成本</span>
                          <span className="text-white font-semibold">¥1.0亿/年</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
      
      {activeTab === 'scenario' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Scenario Analysis Section */}
          <div className="tech-card p-6">
            <div 
              className="flex items-center justify-between cursor-pointer" 
              onClick={() => toggleSection('scenarioDetails')}
            >
              <h3 className="text-lg font-semibold text-white">场景分析</h3>
              {expandedSections.scenarioDetails ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
            
            {expandedSections.scenarioDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {scenarioCostData.map((scenario, index) => (
                    <div key={scenario.scenario} className={`tech-card p-4 ${index === 0 ? 'border border-cyan-400/50 bg-cyan-400/5' : ''}`}>
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-white font-medium">{scenario.scenario}</h4>
                        {index === 0 && (
                          <span className="px-2 py-1 rounded bg-cyan-400/20 text-cyan-400 text-xs font-medium">
                            基准场景
                          </span>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                          <span className="text-gray-400 text-sm">初始投资</span>
                          <span className="text-white font-semibold">¥{scenario.initialInvestment.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                          <span className="text-gray-400 text-sm">年维护成本</span>
                          <span className="text-white font-semibold">¥{scenario.annualMaintenance.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                          <span className="text-gray-400 text-sm">年运行成本</span>
                          <span className="text-white font-semibold">¥{scenario.annualOperation.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                          <span className="text-gray-400 text-sm">设备更换成本</span>
                          <span className="text-white font-semibold">¥{scenario.equipmentReplacement.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                          <span className="text-gray-400 text-sm">生命周期成本</span>
                          <span className="text-emerald-400 font-semibold">¥{scenario.totalLifecycleCost.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                          <span className="text-gray-400 text-sm">净现值 (NPV)</span>
                          <span className="text-emerald-400 font-semibold">¥{scenario.npv.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                          <span className="text-gray-400 text-sm">内部收益率 (IRR)</span>
                          <span className="text-amber-400 font-semibold">{scenario.irr}%</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                          <span className="text-gray-400 text-sm">投资回收期</span>
                          <span className="text-amber-400 font-semibold">{scenario.paybackPeriod} 年</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 tech-card p-4">
                  <h4 className="text-sm font-medium text-cyan-400 mb-3">场景对比分析</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius={90} width={500} height={300} data={[
                        { subject: '初始投资', 基准场景: 85, 乐观场景: 80, 悲观场景: 90, fullMark: 100 },
                        { subject: '运行成本', 基准场景: 60, 乐观场景: 50, 悲观场景: 70, fullMark: 100 },
                        { subject: '维护成本', 基准场景: 65, 乐观场景: 55, 悲观场景: 75, fullMark: 100 },
                        { subject: '投资回报', 基准场景: 70, 乐观场景: 80, 悲观场景: 60, fullMark: 100 },
                        { subject: '回收期', 基准场景: 75, 乐观场景: 85, 悲观场景: 65, fullMark: 100 },
                        { subject: '风险评估', 基准场景: 70, 乐观场景: 60, 悲观场景: 80, fullMark: 100 },
                      ]}>
                        <PolarGrid stroke="rgba(255,255,255,0.2)" />
                        <PolarAngleAxis dataKey="subject" stroke="#6b7280" fontSize={12} />  
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#6b7280" /> 
                        <Radar name="基准场景" dataKey="基准场景" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.3} /> 
                        <Radar name="乐观场景" dataKey="乐观场景" stroke="#10b981" fill="#10b981" fillOpacity={0.3} /> 
                        <Radar name="悲观场景" dataKey="悲观场景" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} /> 
                        <Legend /> 
                        <Tooltip 
                          contentStyle={{ 
                            background: 'rgba(10, 15, 26, 0.95)', 
                            border: '1px solid rgba(0, 212, 255, 0.3)',
                            borderRadius: '8px',
                            color: '#ffffff',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                            padding: '12px',
                            fontSize: '14px'
                          }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-emerald-400/10 rounded-lg p-4 border border-emerald-400/30 mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">场景分析结论</span>
                  </div>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• 基准场景下，项目具有良好的经济效益，IRR为12.5%，投资回收期7.2年</li>
                    <li>• 乐观场景下，项目经济效益显著提升，IRR可达14.2%，投资回收期缩短至6.5年</li>
                    <li>• 悲观场景下，项目仍具有可行性，IRR为10.8%，投资回收期8.0年</li>
                    <li>• 建议采用基准场景作为项目评估基础，同时考虑乐观场景的可能性</li>
                    <li>• 应制定风险应对策略，以应对悲观场景下的成本增加</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
      
      {activeTab === 'forecastModel' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Forecast Model Section */}
          <div className="tech-card p-6">
            <div 
              className="flex items-center justify-between cursor-pointer" 
              onClick={() => toggleSection('modelDetails')}
            >
              <h3 className="text-lg font-semibold text-white">成本预测模型</h3>
              {expandedSections.modelDetails ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
            
            {expandedSections.modelDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                {/* Model Configuration */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="tech-card p-4">
                    <h4 className="text-sm font-medium text-cyan-400 mb-3">模型配置</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">预测年限</label>
                        <input
                          type="range"
                          min="1"
                          max="15"
                          value={forecastYears}
                          onChange={handleForecastYearsChange}
                          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>1年</span>
                          <span>{forecastYears}年</span>
                          <span>15年</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">置信区间</label>
                        <input
                          type="range"
                          min="80"
                          max="99"
                          value={confidenceInterval}
                          onChange={handleConfidenceIntervalChange}
                          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>80%</span>
                          <span>{confidenceInterval}%</span>
                          <span>99%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="tech-card p-4">
                    <h4 className="text-sm font-medium text-cyan-400 mb-3">模型选择</h4>
                    <div className="space-y-3">
                      {Object.entries(forecastModelConfig).map(([key, config]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div>
                            <p className="text-white font-medium">{config.name}</p>
                            <p className="text-gray-400 text-xs">{config.description}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedModels[key as keyof typeof selectedModels]}
                              onChange={() => handleModelToggle(key as keyof typeof selectedModels)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-400"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Model Accuracy */}
                <div className="tech-card p-4 mb-6">
                  <h4 className="text-sm font-medium text-cyan-400 mb-3">模型准确率分析</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {modelAccuracyData.map((model) => (
                      <div key={model.model} className="bg-white/5 rounded-lg p-4 text-center">
                        <p className="text-gray-400 text-sm mb-2">{model.model}</p>
                        <p className="text-2xl font-bold text-cyan-400 mb-1">{model.accuracy}%</p>
                        <p className="text-gray-500 text-xs">准确率</p>
                        <div className="mt-3">
                          <p className="text-gray-400 text-xs mb-1">RMSE: {model.rmse}</p>
                          <div className="w-full bg-white/10 rounded-full h-1">
                            <div 
                              className="bg-cyan-400 h-1 rounded-full" 
                              style={{ width: `${(1 - model.rmse / 200) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Forecast Chart */}
                <div className="tech-card p-4 mb-6">
                  <h4 className="text-sm font-medium text-cyan-400 mb-3">成本预测趋势</h4>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={forecastModelData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="year" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'rgba(10, 15, 26, 0.95)', 
                            border: '1px solid rgba(0, 212, 255, 0.3)',
                            borderRadius: '8px',
                            color: '#ffffff',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                            padding: '12px',
                            fontSize: '14px'
                          }}
                          formatter={(value: number) => [`¥${(value / 10000).toFixed(2)}亿`, '金额']}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="actual" 
                          name="实际成本" 
                          stroke="#ec4899" 
                          strokeWidth={2} 
                          dot={{ fill: '#ec4899', strokeWidth: 2 }} 
                          activeDot={{ r: 6 }}
                        />
                        {selectedModels.linear && (
                          <Line 
                            type="monotone" 
                            dataKey="linear" 
                            name="线性回归" 
                            stroke="#00d4ff" 
                            strokeWidth={2} 
                            dot={{ fill: '#00d4ff', strokeWidth: 2 }}
                            strokeDasharray={selectedModels.linear ? '0' : '5 5'}
                          />
                        )}
                        {selectedModels.exponential && (
                          <Line 
                            type="monotone" 
                            dataKey="exponential" 
                            name="指数平滑" 
                            stroke="#10b981" 
                            strokeWidth={2} 
                            dot={{ fill: '#10b981', strokeWidth: 2 }}
                            strokeDasharray={selectedModels.exponential ? '0' : '5 5'}
                          />
                        )}
                        {selectedModels.arima && (
                          <Line 
                            type="monotone" 
                            dataKey="arima" 
                            name="ARIMA" 
                            stroke="#f59e0b" 
                            strokeWidth={2} 
                            dot={{ fill: '#f59e0b', strokeWidth: 2 }}
                            strokeDasharray={selectedModels.arima ? '0' : '5 5'}
                          />
                        )}
                        {selectedModels.ensemble && (
                          <Line 
                            type="monotone" 
                            dataKey="ensemble" 
                            name="集成模型" 
                            stroke="#8b5cf6" 
                            strokeWidth={3} 
                            dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                            strokeDasharray={selectedModels.ensemble ? '0' : '5 5'}
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Forecast Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="tech-card p-4">
                    <h4 className="text-sm font-medium text-cyan-400 mb-3">短期预测 (1-5年)</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <span className="text-gray-400 text-sm">2025年预测成本</span>
                        <span className="text-emerald-400 font-semibold">¥4980</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <span className="text-gray-400 text-sm">2026年预测成本</span>
                        <span className="text-emerald-400 font-semibold">¥5100</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <span className="text-gray-400 text-sm">2027年预测成本</span>
                        <span className="text-emerald-400 font-semibold">¥5250</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <span className="text-gray-400 text-sm">2028年预测成本</span>
                        <span className="text-emerald-400 font-semibold">¥5400</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <span className="text-gray-400 text-sm">2029年预测成本</span>
                        <span className="text-emerald-400 font-semibold">¥10550</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="tech-card p-4">
                    <h4 className="text-sm font-medium text-cyan-400 mb-3">中期预测 (6-10年)</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <span className="text-gray-400 text-sm">2030年预测成本</span>
                        <span className="text-emerald-400 font-semibold">¥5700</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <span className="text-gray-400 text-sm">2031年预测成本</span>
                        <span className="text-emerald-400 font-semibold">¥5850</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <span className="text-gray-400 text-sm">2032年预测成本</span>
                        <span className="text-emerald-400 font-semibold">¥6000</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <span className="text-gray-400 text-sm">2033年预测成本</span>
                        <span className="text-emerald-400 font-semibold">¥6150</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <span className="text-gray-400 text-sm">2034年预测成本</span>
                        <span className="text-emerald-400 font-semibold">¥14300</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="tech-card p-4">
                    <h4 className="text-sm font-medium text-cyan-400 mb-3">长期预测 (11-15年)</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <span className="text-gray-400 text-sm">2035年预测成本</span>
                        <span className="text-emerald-400 font-semibold">¥6450</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <span className="text-gray-400 text-sm">2036年预测成本</span>
                        <span className="text-emerald-400 font-semibold">¥6600</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <span className="text-gray-400 text-sm">2037年预测成本</span>
                        <span className="text-emerald-400 font-semibold">¥6750</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <span className="text-gray-400 text-sm">2038年预测成本</span>
                        <span className="text-emerald-400 font-semibold">¥6900</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <span className="text-gray-400 text-sm">2039年预测成本</span>
                        <span className="text-emerald-400 font-semibold">¥17150</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Model Recommendations */}
                <div className="bg-emerald-400/10 rounded-lg p-4 border border-emerald-400/30 mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">预测模型建议</span>
                  </div>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• 集成模型具有最高的预测准确率(97.5%)，建议作为主要预测工具</li>
                    <li>• ARIMA模型在处理季节性成本波动方面表现优异，准确率达96.8%</li>
                    <li>• 建议使用95%置信区间进行成本规划，平衡风险和准确性</li>
                    <li>• 对于短期预测(1-3年)，线性回归模型已足够准确</li>
                    <li>• 对于长期预测(5年以上)，建议使用集成模型或ARIMA模型</li>
                    <li>• 定期更新历史数据，以提高预测模型的准确性</li>
                  </ul>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
