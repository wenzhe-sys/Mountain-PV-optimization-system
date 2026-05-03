import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  LineChart as LineChartIcon,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  BarChart2,
  PieChart as PieChartIcon,
  Clock,
  Lightbulb,
  Shield
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  Legend
} from 'recharts';

// 电力非线性损耗计算模型
const calculateNonlinearLoss = (params: {
  current: number;
  resistance: number;
  temperature: number;
  harmonicContent: number;
  cableLength: number;
  cableType: string;
}) => {
  const { current, resistance, temperature, harmonicContent, cableLength, cableType } = params;
  
  // 基础电阻损耗
  const baseLoss = current * current * resistance * cableLength;
  
  // 温度影响因子
  const temperatureFactor = 1 + 0.004 * (temperature - 25);
  
  // 谐波损耗因子（基于谐波含量）
  const harmonicFactor = 1 + 0.02 * harmonicContent * harmonicContent;
  
  // 电缆类型修正因子
  const cableTypeFactor = {
    'copper': 1.0,
    'aluminum': 1.6,
    'copper_alloy': 1.1
  }[cableType] || 1.0;
  
  // 非线性损耗计算
  const nonlinearLoss = baseLoss * temperatureFactor * harmonicFactor * cableTypeFactor;
  
  return {
    baseLoss,
    temperatureLoss: baseLoss * (temperatureFactor - 1),
    harmonicLoss: baseLoss * temperatureFactor * (harmonicFactor - 1),
    cableTypeLoss: baseLoss * temperatureFactor * harmonicFactor * (cableTypeFactor - 1),
    totalLoss: nonlinearLoss,
    efficiency: 100 - (nonlinearLoss / (current * 400 * Math.sqrt(3))) * 100 // 假设400V系统
  };
};

// 损耗优化算法
const optimizeLossReduction = (initialParams: any) => {
  // 模拟优化过程
  const iterations = 50;
  const populationSize = 20;
  
  // 生成初始种群
  let population = [];
  for (let i = 0; i < populationSize; i++) {
    population.push({
      resistance: initialParams.resistance * (0.8 + Math.random() * 0.4),
      cableType: ['copper', 'aluminum', 'copper_alloy'][Math.floor(Math.random() * 3)],
      harmonicContent: Math.max(0, Math.min(30, initialParams.harmonicContent * (0.5 + Math.random() * 1.0)))
    });
  }
  
  // 进化算法优化
  for (let iter = 0; iter < iterations; iter++) {
    // 计算适应度
    population = population.map((individual: any) => {
      const lossResult = calculateNonlinearLoss({
        ...initialParams,
        ...individual
      });
      return {
        ...individual,
        fitness: 1 / lossResult.totalLoss // 最小化损耗
      };
    });
    
    // 排序并选择最优个体
    population.sort((a: any, b: any) => b.fitness - a.fitness);
    
    // 选择前50%的个体进行交叉变异
    const selected: any[] = population.slice(0, populationSize / 2);
    const newPopulation: any[] = [...selected];
    
    // 交叉变异
    while (newPopulation.length < populationSize) {
      const parent1 = selected[Math.floor(Math.random() * selected.length)];
      const parent2 = selected[Math.floor(Math.random() * selected.length)];
      
      // 交叉
      const child = {
        resistance: (parent1.resistance + parent2.resistance) / 2,
        cableType: Math.random() > 0.5 ? parent1.cableType : parent2.cableType,
        harmonicContent: (parent1.harmonicContent + parent2.harmonicContent) / 2
      };
      
      // 变异
      if (Math.random() < 0.1) {
        child.resistance *= (0.9 + Math.random() * 0.2);
      }
      if (Math.random() < 0.1) {
        child.cableType = ['copper', 'aluminum', 'copper_alloy'][Math.floor(Math.random() * 3)];
      }
      if (Math.random() < 0.1) {
        child.harmonicContent = Math.max(0, Math.min(30, child.harmonicContent * (0.8 + Math.random() * 0.4)));
      }
      
      newPopulation.push(child);
    }
    
    population = newPopulation;
  }
  
  // 返回最优解
  const bestSolution = population[0];
  const optimizedLoss = calculateNonlinearLoss({
    ...initialParams,
    ...bestSolution
  });
  
  return {
    bestSolution,
    optimizedLoss,
    originalLoss: calculateNonlinearLoss(initialParams),
    improvement: ((calculateNonlinearLoss(initialParams).totalLoss - optimizedLoss.totalLoss) / calculateNonlinearLoss(initialParams).totalLoss) * 100
  };
};

// 全生命周期协同优化模型
const calculateLifecycleOptimization = (params: {
  initialInvestment: number;
  annualMaintenance: number;
  annualEnergyProduction: number;
  energyPrice: number;
  equipmentLifetime: number;
  discountRate: number;
  annualLossReduction: number;
}) => {
  const { initialInvestment, annualMaintenance, annualEnergyProduction, energyPrice, equipmentLifetime, discountRate, annualLossReduction } = params;
  
  let npv = -initialInvestment;
  let totalCost = initialInvestment;
  let totalRevenue = 0;
  
  for (let year = 1; year <= equipmentLifetime; year++) {
    // 年度收益 = 发电量 * 电价 + 损耗减少收益
    const annualRevenue = (annualEnergyProduction * energyPrice) + (annualLossReduction * energyPrice);
    const annualProfit = annualRevenue - annualMaintenance;
    
    // 计算净现值
    npv += annualProfit / Math.pow(1 + discountRate, year);
    totalCost += annualMaintenance;
    totalRevenue += annualRevenue;
  }
  
  const irr = calculateIRR(initialInvestment, totalRevenue - totalCost, equipmentLifetime);
  const paybackPeriod = calculatePaybackPeriod(initialInvestment, totalRevenue - totalCost, equipmentLifetime);
  
  return {
    npv,
    irr,
    paybackPeriod,
    totalCost,
    totalRevenue,
    totalProfit: totalRevenue - totalCost
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

// 模拟数据
const lossComparisonData = [
  { name: '传统计算', base: 100, temperature: 15, harmonic: 25, cable: 10, total: 150 },
  { name: '非线性计算', base: 100, temperature: 20, harmonic: 40, cable: 15, total: 175 },
  { name: '优化后', base: 80, temperature: 10, harmonic: 15, cable: 5, total: 110 }
];

const efficiencyTrendData = [
  { hour: '00:00', efficiency: 85, optimized: 88 },
  { hour: '04:00', efficiency: 86, optimized: 89 },
  { hour: '08:00', efficiency: 88, optimized: 91 },
  { hour: '12:00', efficiency: 90, optimized: 93 },
  { hour: '16:00', efficiency: 89, optimized: 92 },
  { hour: '20:00', efficiency: 87, optimized: 90 },
  { hour: '24:00', efficiency: 86, optimized: 89 }
];

const lifecycleData = [
  { year: 1, cost: 100000, revenue: 20000, cumulative: -80000 },
  { year: 2, cost: 10000, revenue: 30000, cumulative: -60000 },
  { year: 3, cost: 10000, revenue: 30000, cumulative: -40000 },
  { year: 4, cost: 10000, revenue: 30000, cumulative: -20000 },
  { year: 5, cost: 10000, revenue: 30000, cumulative: 0 },
  { year: 6, cost: 10000, revenue: 30000, cumulative: 20000 },
  { year: 7, cost: 10000, revenue: 30000, cumulative: 40000 },
  { year: 8, cost: 10000, revenue: 30000, cumulative: 60000 },
  { year: 9, cost: 10000, revenue: 30000, cumulative: 80000 },
  { year: 10, cost: 10000, revenue: 30000, cumulative: 100000 }
];

// 新增: 季节性负载数据
const seasonalLoadData = [
  { season: '春季', load: 85, generation: 90, loss: 15 },
  { season: '夏季', load: 120, generation: 130, loss: 20 },
  { season: '秋季', load: 90, generation: 95, loss: 16 },
  { season: '冬季', load: 110, generation: 80, loss: 18 }
];

// 新增: 故障分析数据
const faultAnalysisData = [
  { type: '电缆故障', count: 12, downtime: 48, cost: 150000 },
  { type: '逆变器故障', count: 8, downtime: 36, cost: 200000 },
  { type: '变压器故障', count: 3, downtime: 72, cost: 300000 },
  { type: '开关设备故障', count: 15, downtime: 24, cost: 80000 }
];

// 新增: 电能质量数据
const powerQualityData = [
  { parameter: '电压偏差', before: 5.2, after: 2.1, standard: 5.0 },
  { parameter: '频率偏差', before: 0.3, after: 0.1, standard: 0.5 },
  { parameter: '谐波畸变', before: 8.5, after: 3.2, standard: 5.0 },
  { parameter: '三相不平衡', before: 4.8, after: 1.5, standard: 2.0 },
  { parameter: '功率因数', before: 0.85, after: 0.95, standard: 0.90 }
];

export default function PowerAnalysis() {
  const [activeTab, setActiveTab] = useState<'loss' | 'optimization' | 'lifecycle' | 'seasonal' | 'fault' | 'quality'>('loss');
  const [expandedSections, setExpandedSections] = useState({
    lossDetails: true,
    optimizationDetails: true,
    lifecycleDetails: true,
    seasonalDetails: true,
    faultDetails: true,
    qualityDetails: true
  });
  
  // 初始参数
  const initialParams = {
    current: 500,
    resistance: 0.001,
    temperature: 35,
    harmonicContent: 15,
    cableLength: 1000,
    cableType: 'aluminum'
  };
  
  // 计算初始损耗
  const initialLoss = calculateNonlinearLoss(initialParams);
  
  // 优化结果
  const optimizationResult = optimizeLossReduction(initialParams);
  
  // 全生命周期优化参数
  const lifecycleParams = {
    initialInvestment: 100000,
    annualMaintenance: 10000,
    annualEnergyProduction: 100000,
    energyPrice: 0.5,
    equipmentLifetime: 10,
    discountRate: 0.08,
    annualLossReduction: optimizationResult.improvement * 1000
  };
  
  // 计算全生命周期优化
  const lifecycleResult = calculateLifecycleOptimization(lifecycleParams);
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-auto">
      {/* Header Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="tech-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center">
            <Zap className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">当前损耗</p>
            <p className="text-2xl font-bold text-white">{initialLoss.totalLoss.toFixed(2)} kW</p>
          </div>
        </div>
        
        <div className="tech-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-400/10 flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">优化后损耗</p>
            <p className="text-2xl font-bold text-emerald-400">{optimizationResult.optimizedLoss.totalLoss.toFixed(2)} kW</p>
          </div>
        </div>
        
        <div className="tech-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center">
            <Activity className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">损耗减少</p>
            <p className="text-2xl font-bold text-white">{optimizationResult.improvement.toFixed(2)}%</p>
          </div>
        </div>
        
        <div className="tech-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-400/10 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">系统效率</p>
            <p className="text-2xl font-bold text-white">{optimizationResult.optimizedLoss.efficiency.toFixed(2)}%</p>
          </div>
        </div>
      </motion.div>
      
      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        <button
          onClick={() => setActiveTab('loss')}
          className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'loss'
              ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/50'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            非线性损耗分析
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
            <TrendingDown className="w-4 h-4" />
            损耗优化
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
            <LineChartIcon className="w-4 h-4" />
            全生命周期优化
          </div>
        </button>
        <button
          onClick={() => setActiveTab('seasonal')}
          className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'seasonal'
              ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/50'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4" />
            季节性负载分析
          </div>
        </button>
        <button
          onClick={() => setActiveTab('fault')}
          className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'fault'
              ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/50'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            故障分析
          </div>
        </button>
        <button
          onClick={() => setActiveTab('quality')}
          className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'quality'
              ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/50'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            电能质量分析
          </div>
        </button>
      </motion.div>
      
      {/* Content based on active tab */}
      {activeTab === 'loss' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Loss Analysis Section */}
          <div className="tech-card p-6">
            <div 
              className="flex items-center justify-between cursor-pointer" 
              onClick={() => toggleSection('lossDetails')}
            >
              <h3 className="text-lg font-semibold text-white">非线性损耗分析</h3>
              {expandedSections.lossDetails ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
            
            {expandedSections.lossDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Loss Breakdown Chart */}
                  <div className="tech-card p-4">
                    <h4 className="text-sm font-medium text-cyan-400 mb-3">损耗构成分析</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={lossComparisonData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="name" stroke="#6b7280" />
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
                          <Bar dataKey="base" name="基础损耗" fill="#00d4ff" />
                          <Bar dataKey="temperature" name="温度损耗" fill="#f59e0b" />
                          <Bar dataKey="harmonic" name="谐波损耗" fill="#8b5cf6" />
                          <Bar dataKey="cable" name="电缆损耗" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Loss Details Table */}
                  <div className="tech-card p-4">
                    <h4 className="text-sm font-medium text-cyan-400 mb-3">损耗详细数据</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">基础电阻损耗</span>
                        <span className="text-cyan-400 font-semibold">{initialLoss.baseLoss.toFixed(2)} kW</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">温度附加损耗</span>
                        <span className="text-amber-400 font-semibold">{initialLoss.temperatureLoss.toFixed(2)} kW</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">谐波附加损耗</span>
                        <span className="text-purple-400 font-semibold">{initialLoss.harmonicLoss.toFixed(2)} kW</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">电缆类型损耗</span>
                        <span className="text-emerald-400 font-semibold">{initialLoss.cableTypeLoss.toFixed(2)} kW</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-cyan-400/10 rounded-lg border border-cyan-400/30 mt-4">
                        <span className="text-cyan-400 font-semibold">总非线性损耗</span>
                        <span className="text-cyan-400 font-bold text-lg">{initialLoss.totalLoss.toFixed(2)} kW</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-emerald-400/10 rounded-lg border border-emerald-400/30">
                        <span className="text-emerald-400 font-semibold">系统效率</span>
                        <span className="text-emerald-400 font-bold text-lg">{initialLoss.efficiency.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
      
      {activeTab === 'optimization' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Optimization Section */}
          <div className="tech-card p-6">
            <div 
              className="flex items-center justify-between cursor-pointer" 
              onClick={() => toggleSection('optimizationDetails')}
            >
              <h3 className="text-lg font-semibold text-white">损耗优化方案</h3>
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
                  {/* Optimization Results */}
                  <div className="tech-card p-4">
                    <h4 className="text-sm font-medium text-cyan-400 mb-3">优化结果</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">优化前损耗</span>
                        <span className="text-gray-400 font-semibold">{optimizationResult.originalLoss.totalLoss.toFixed(2)} kW</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">优化后损耗</span>
                        <span className="text-emerald-400 font-semibold">{optimizationResult.optimizedLoss.totalLoss.toFixed(2)} kW</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">损耗减少</span>
                        <span className="text-emerald-400 font-semibold">{optimizationResult.improvement.toFixed(2)}%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">优化后效率</span>
                        <span className="text-emerald-400 font-semibold">{optimizationResult.optimizedLoss.efficiency.toFixed(2)}%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-cyan-400/10 rounded-lg border border-cyan-400/30 mt-4">
                        <span className="text-cyan-400 font-semibold">年节省电量</span>
                        <span className="text-cyan-400 font-bold text-lg">{((optimizationResult.originalLoss.totalLoss - optimizationResult.optimizedLoss.totalLoss) * 8760 / 1000).toFixed(2)} MWh</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Optimization Parameters */}
                  <div className="tech-card p-4">
                    <h4 className="text-sm font-medium text-cyan-400 mb-3">优化参数</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">电缆电阻</span>
                        <span className="text-cyan-400 font-semibold">{optimizationResult.bestSolution.resistance.toFixed(6)} Ω/m</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">电缆类型</span>
                        <span className="text-cyan-400 font-semibold">
                          {optimizationResult.bestSolution.cableType === 'copper' ? '铜' : 
                           optimizationResult.bestSolution.cableType === 'aluminum' ? '铝' : '铜合金'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">谐波含量</span>
                        <span className="text-cyan-400 font-semibold">{optimizationResult.bestSolution.harmonicContent.toFixed(2)}%</span>
                      </div>
                      <div className="bg-emerald-400/10 rounded-lg p-4 border border-emerald-400/30 mt-4">
                        <h5 className="text-emerald-400 font-medium mb-2">优化建议</h5>
                        <ul className="text-gray-300 text-sm space-y-1">
                          <li>• 使用低电阻电缆材料</li>
                          <li>• 优化谐波治理设备</li>
                          <li>• 改善电缆散热条件</li>
                          <li>• 定期检查电缆连接点</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Efficiency Trend Chart */}
                <div className="tech-card p-4 mt-6">
                  <h4 className="text-sm font-medium text-cyan-400 mb-3">效率趋势对比</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={efficiencyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="hour" stroke="#6b7280" />
                        <YAxis domain={[80, 100]} stroke="#6b7280" />
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
                        <Line 
                          type="monotone" 
                          dataKey="efficiency" 
                          name="优化前效率" 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          dot={{ fill: '#f59e0b' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="optimized" 
                          name="优化后效率" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot={{ fill: '#10b981' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
      
      {activeTab === 'lifecycle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Lifecycle Optimization Section */}
          <div className="tech-card p-6">
            <div 
              className="flex items-center justify-between cursor-pointer" 
              onClick={() => toggleSection('lifecycleDetails')}
            >
              <h3 className="text-lg font-semibold text-white">全生命周期协同优化</h3>
              {expandedSections.lifecycleDetails ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
            
            {expandedSections.lifecycleDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Lifecycle Results */}
                  <div className="tech-card p-4">
                    <h4 className="text-sm font-medium text-cyan-400 mb-3">生命周期分析结果</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">初始投资</span>
                        <span className="text-gray-400 font-semibold">¥{lifecycleParams.initialInvestment.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">总运维成本</span>
                        <span className="text-gray-400 font-semibold">¥{lifecycleResult.totalCost.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">总收益</span>
                        <span className="text-emerald-400 font-semibold">¥{lifecycleResult.totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">总利润</span>
                        <span className="text-emerald-400 font-semibold">¥{lifecycleResult.totalProfit.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-cyan-400/10 rounded-lg border border-cyan-400/30 mt-4">
                        <span className="text-cyan-400 font-semibold">净现值 (NPV)</span>
                        <span className="text-cyan-400 font-bold text-lg">¥{lifecycleResult.npv.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-emerald-400/10 rounded-lg border border-emerald-400/30">
                        <span className="text-emerald-400 font-semibold">内部收益率 (IRR)</span>
                        <span className="text-emerald-400 font-bold text-lg">{lifecycleResult.irr.toFixed(2)}%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-amber-400/10 rounded-lg border border-amber-400/30">
                        <span className="text-amber-400 font-semibold">投资回收期</span>
                        <span className="text-amber-400 font-bold text-lg">{lifecycleResult.paybackPeriod.toFixed(2)} 年</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Lifecycle Cash Flow */}
                  <div className="tech-card p-4">
                    <h4 className="text-sm font-medium text-cyan-400 mb-3">累计现金流</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={lifecycleData}>
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
                          <Line 
                            type="monotone" 
                            dataKey="cumulative" 
                            name="累计现金流" 
                            stroke="#00d4ff" 
                            strokeWidth={2}
                            dot={{ fill: '#00d4ff' }}
                          />
                          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#ef4444" strokeDasharray="5 5" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 bg-emerald-400/10 rounded-lg p-4 border border-emerald-400/30">
                      <h5 className="text-emerald-400 font-medium mb-2">协同优化建议</h5>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• 设备选型与损耗优化相结合</li>
                        <li>• 定期维护与故障预测相结合</li>
                        <li>• 能量管理与负载调度优化</li>
                        <li>• 全生命周期成本与收益平衡</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
      
      {activeTab === 'seasonal' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Seasonal Load Analysis Section */}
          <div className="tech-card p-6">
            <div 
              className="flex items-center justify-between cursor-pointer" 
              onClick={() => toggleSection('seasonalDetails')}
            >
              <h3 className="text-lg font-semibold text-white">季节性负载分析</h3>
              {expandedSections.seasonalDetails ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
            
            {expandedSections.seasonalDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Seasonal Load Chart */}
                  <div className="tech-card p-4">
                    <h4 className="text-sm font-medium text-cyan-400 mb-3">季节性负载与发电对比</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={seasonalLoadData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="season" stroke="#6b7280" />
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
                          <Bar dataKey="load" name="负载" fill="#00d4ff" />
                          <Bar dataKey="generation" name="发电量" fill="#10b981" />
                          <Bar dataKey="loss" name="损耗" fill="#f59e0b" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Seasonal Analysis */}
                  <div className="tech-card p-4">
                    <h4 className="text-sm font-medium text-cyan-400 mb-3">季节性分析</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">夏季峰值负载</span>
                        <span className="text-cyan-400 font-semibold">120 kW</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">冬季峰值负载</span>
                        <span className="text-cyan-400 font-semibold">110 kW</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">春季发电 surplus</span>
                        <span className="text-emerald-400 font-semibold">5 kW</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">夏季发电 surplus</span>
                        <span className="text-emerald-400 font-semibold">10 kW</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">秋季发电 surplus</span>
                        <span className="text-emerald-400 font-semibold">5 kW</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-white">冬季发电 deficit</span>
                        <span className="text-amber-400 font-semibold">30 kW</span>
                      </div>
                      <div className="bg-emerald-400/10 rounded-lg p-4 border border-emerald-400/30 mt-4">
                        <h5 className="text-emerald-400 font-medium mb-2">季节性优化建议</h5>
                        <ul className="text-gray-300 text-sm space-y-1">
                          <li>• 夏季增加储能系统容量</li>
                          <li>• 冬季优化负载调度</li>
                          <li>• 春秋季节增加电力外销</li>
                          <li>• 根据季节调整维护计划</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
      
      {activeTab === 'fault' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Fault Analysis Section */}
          <div className="tech-card p-6">
            <div 
              className="flex items-center justify-between cursor-pointer" 
              onClick={() => toggleSection('faultDetails')}
            >
              <h3 className="text-lg font-semibold text-white">故障分析</h3>
              {expandedSections.faultDetails ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
            
            {expandedSections.faultDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Fault Analysis Chart */}
                  <div className="tech-card p-4">
                    <h4 className="text-sm font-medium text-cyan-400 mb-3">故障类型分析</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={faultAnalysisData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis type="number" stroke="#6b7280" />
                          <YAxis dataKey="type" type="category" stroke="#6b7280" width={100} />
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
                          <Bar dataKey="count" name="故障次数" fill="#ef4444" />
                          <Bar dataKey="downtime" name="停机时间(h)" fill="#f59e0b" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Fault Cost Analysis */}
                  <div className="tech-card p-4">
                    <h4 className="text-sm font-medium text-cyan-400 mb-3">故障成本分析</h4>
                    <div className="space-y-3">
                      {faultAnalysisData.map((fault, index) => (
                        <div key={index} className="p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{fault.type}</span>
                            <span className="text-emerald-400 font-semibold">¥{fault.cost.toLocaleString()}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-400">停机时间: {fault.downtime}h</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-400">故障次数: {fault.count}次</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="bg-emerald-400/10 rounded-lg p-4 border border-emerald-400/30 mt-4">
                        <h5 className="text-emerald-400 font-medium mb-2">故障预防建议</h5>
                        <ul className="text-gray-300 text-sm space-y-1">
                          <li>• 定期电缆检测与维护</li>
                          <li>• 逆变器状态监控与预警</li>
                          <li>• 变压器定期油色谱分析</li>
                          <li>• 开关设备定期校验</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
      
      {activeTab === 'quality' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Power Quality Analysis Section */}
          <div className="tech-card p-6">
            <div 
              className="flex items-center justify-between cursor-pointer" 
              onClick={() => toggleSection('qualityDetails')}
            >
              <h3 className="text-lg font-semibold text-white">电能质量分析</h3>
              {expandedSections.qualityDetails ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
            
            {expandedSections.qualityDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Power Quality Chart */}
                  <div className="tech-card p-4">
                    <h4 className="text-sm font-medium text-cyan-400 mb-3">电能质量参数对比</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={powerQualityData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="parameter" stroke="#6b7280" />
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
                          <Bar dataKey="before" name="优化前" fill="#f59e0b" />
                          <Bar dataKey="after" name="优化后" fill="#10b981" />
                          <Bar dataKey="standard" name="标准值" fill="#00d4ff" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  {/* Power Quality Analysis */}
                  <div className="tech-card p-4">
                    <h4 className="text-sm font-medium text-cyan-400 mb-3">电能质量分析</h4>
                    <div className="space-y-3">
                      {powerQualityData.map((param, index) => (
                        <div key={index} className="p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{param.parameter}</span>
                            <span className={`font-semibold ${param.after <= param.standard ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {param.after} {param.parameter === '功率因数' ? '' : '%'}
                            </span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2 mb-1">
                            <div 
                              className="bg-gradient-to-r from-amber-400 to-emerald-400 h-2 rounded-full" 
                              style={{ width: `${Math.min((param.after / param.standard) * 100, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>标准值: {param.standard} {param.parameter === '功率因数' ? '' : '%'}</span>
                            <span>优化前: {param.before} {param.parameter === '功率因数' ? '' : '%'}</span>
                          </div>
                        </div>
                      ))}
                      <div className="bg-emerald-400/10 rounded-lg p-4 border border-emerald-400/30 mt-4">
                        <h5 className="text-emerald-400 font-medium mb-2">电能质量优化建议</h5>
                        <ul className="text-gray-300 text-sm space-y-1">
                          <li>• 安装有源滤波器治理谐波</li>
                          <li>• 优化无功补偿系统</li>
                          <li>• 加强电压调节措施</li>
                          <li>• 定期进行电能质量监测</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
