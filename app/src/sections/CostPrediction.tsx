import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  MapPin,
  Settings,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  PauseCircle,
  RefreshCw,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import costPredictionService from '../services/costPredictionService';

// 成本类别数据
const costCategoryData = [
  { name: '光伏面板', value: 40, color: '#3b82f6' },
  { name: '逆变器', value: 15, color: '#10b981' },
  { name: '电池', value: 10, color: '#f59e0b' },
  { name: '安装', value: 20, color: '#8b5cf6' },
  { name: '材料', value: 10, color: '#ec4899' },
  { name: '许可', value: 5, color: '#6366f1' }
];

export default function CostPrediction() {
  const [projectParams, setProjectParams] = useState({
    capacity: 1000, // 1000kW
    panelType: 'standard',
    inverterType: 'central',
    batteryCapacity: 200, // 200kWh
    terrainDifficulty: 'medium' as 'low' | 'medium' | 'high',
    installationType: 'ground' as 'ground' | 'roof' | 'floating',
    location: '中国北京',
    startDate: new Date().toISOString().split('T')[0],
    expectedLifetime: 25
  });
  
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionProgress, setPredictionProgress] = useState(0);
  const [predictionResults, setPredictionResults] = useState<any>(null);
  const [optimizationResults, setOptimizationResults] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState({
    input: true,
    results: false,
    optimization: false,
    sensitivity: false,
    trends: false
  });
  
  // 切换展开/收起状态
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev] as boolean
    }));
  };
  
  // 更新项目参数
  const handleParamChange = (key: string, value: any) => {
    setProjectParams(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // 开始成本预测
  const handleStartPrediction = useCallback(() => {
    setIsPredicting(true);
    setPredictionProgress(0);
    
    // 模拟预测过程
    const progressInterval = setInterval(() => {
      setPredictionProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);
    
    // 执行成本预测
    setTimeout(() => {
      const results = costPredictionService.predictCost(projectParams);
      setPredictionResults(results);
      
      clearInterval(progressInterval);
      setIsPredicting(false);
      setPredictionProgress(100);
      
      // 自动展开结果部分
      setExpandedSections(prev => ({
        ...prev,
        results: true
      }));
    }, 2000);
  }, [projectParams]);
  
  // 优化成本
  const handleOptimizeCost = useCallback(() => {
    const results = costPredictionService.optimizeCost(projectParams);
    setOptimizationResults(results);
    
    // 自动展开优化部分
    setExpandedSections(prev => ({
      ...prev,
      optimization: true
    }));
  }, [projectParams]);
  
  // 重置预测
  const handleResetPrediction = useCallback(() => {
    setIsPredicting(false);
    setPredictionProgress(0);
    setPredictionResults(null);
    setOptimizationResults(null);
  }, []);
  
  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-auto bg-slate-900 rounded-xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-white">成本预测模型</h2>
          <p className="text-gray-400 mt-1">基于市场数据的动态成本分析</p>
        </div>
        
        <div className="flex items-center gap-3">
          {!isPredicting && predictionProgress < 100 ? (
            <button
              onClick={handleStartPrediction}
              className="px-4 py-2 rounded-lg bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition-colors flex items-center gap-2"
            >
              <PlayCircle className="w-5 h-5" />
              <span>开始预测</span>
            </button>
          ) : isPredicting ? (
            <button
              onClick={() => setIsPredicting(false)}
              className="px-4 py-2 rounded-lg bg-amber-400/20 text-amber-400 hover:bg-amber-400/30 transition-colors flex items-center gap-2"
            >
              <PauseCircle className="w-5 h-5" />
              <span>暂停预测</span>
            </button>
          ) : (
            <button
              onClick={handleResetPrediction}
              className="px-4 py-2 rounded-lg bg-red-400/20 text-red-400 hover:bg-red-400/30 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>重置预测</span>
            </button>
          )}
          
          {predictionResults && (
            <button
              onClick={handleOptimizeCost}
              className="px-4 py-2 rounded-lg bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30 transition-colors flex items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              <span>优化成本</span>
            </button>
          )}
        </div>
      </motion.div>
      
      {/* Prediction Progress */}
      {predictionProgress > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="tech-card p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">预测进度</span>
            <span className="text-sm text-cyan-400">{predictionProgress}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${predictionProgress}%` }}
            />
          </div>
        </motion.div>
      )}
      
      {/* Input Parameters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="tech-card p-6"
      >
        <div 
          className="flex items-center justify-between cursor-pointer" 
          onClick={() => toggleSection('input')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-400/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">项目参数设置</h3>
          </div>
          {expandedSections.input ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
        
        {expandedSections.input && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* 项目容量 */}
            <div className="bg-white/5 rounded-lg p-4">
              <label className="block text-sm text-gray-400 mb-2">项目容量 (kW)</label>
              <input
                type="number"
                value={projectParams.capacity}
                onChange={(e) => handleParamChange('capacity', parseFloat(e.target.value))}
                className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg p-2"
                min="100"
                max="10000"
              />
            </div>
            
            {/* 面板类型 */}
            <div className="bg-white/5 rounded-lg p-4">
              <label className="block text-sm text-gray-400 mb-2">面板类型</label>
              <select
                value={projectParams.panelType}
                onChange={(e) => handleParamChange('panelType', e.target.value)}
                className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg p-2"
              >
                <option value="standard" className="bg-slate-800 text-white">标准型</option>
                <option value="high-efficiency" className="bg-slate-800 text-white">高效型</option>
                <option value="bifacial" className="bg-slate-800 text-white">双面型</option>
              </select>
            </div>
            
            {/* 逆变器类型 */}
            <div className="bg-white/5 rounded-lg p-4">
              <label className="block text-sm text-gray-400 mb-2">逆变器类型</label>
              <select
                value={projectParams.inverterType}
                onChange={(e) => handleParamChange('inverterType', e.target.value)}
                className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg p-2"
              >
                <option value="central" className="bg-slate-800 text-white">集中式</option>
                <option value="string" className="bg-slate-800 text-white">组串式</option>
                <option value="micro" className="bg-slate-800 text-white">微型</option>
              </select>
            </div>
            
            {/* 电池容量 */}
            <div className="bg-white/5 rounded-lg p-4">
              <label className="block text-sm text-gray-400 mb-2">电池容量 (kWh)</label>
              <input
                type="number"
                value={projectParams.batteryCapacity}
                onChange={(e) => handleParamChange('batteryCapacity', parseFloat(e.target.value))}
                className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg p-2"
                min="0"
                max="1000"
              />
            </div>
            
            {/* 地形难度 */}
            <div className="bg-white/5 rounded-lg p-4">
              <label className="block text-sm text-gray-400 mb-2">地形难度</label>
              <select
                value={projectParams.terrainDifficulty}
                onChange={(e) => handleParamChange('terrainDifficulty', e.target.value as 'low' | 'medium' | 'high')}
                className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg p-2"
              >
                <option value="low" className="bg-slate-800 text-white">低</option>
                <option value="medium" className="bg-slate-800 text-white">中</option>
                <option value="high" className="bg-slate-800 text-white">高</option>
              </select>
            </div>
            
            {/* 安装类型 */}
            <div className="bg-white/5 rounded-lg p-4">
              <label className="block text-sm text-gray-400 mb-2">安装类型</label>
              <select
                value={projectParams.installationType}
                onChange={(e) => handleParamChange('installationType', e.target.value as 'ground' | 'roof' | 'floating')}
                className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg p-2"
              >
                <option value="ground" className="bg-slate-800 text-white">地面</option>
                <option value="roof" className="bg-slate-800 text-white">屋顶</option>
                <option value="floating" className="bg-slate-800 text-white">水面</option>
              </select>
            </div>
            
            {/* 项目位置 */}
            <div className="bg-white/5 rounded-lg p-4">
              <label className="block text-sm text-gray-400 mb-2">项目位置</label>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={projectParams.location}
                  onChange={(e) => handleParamChange('location', e.target.value)}
                  className="flex-1 bg-slate-800 text-white border border-slate-600 rounded-lg p-2"
                />
              </div>
            </div>
            
            {/* 开始日期 */}
            <div className="bg-white/5 rounded-lg p-4">
              <label className="block text-sm text-gray-400 mb-2">开始日期</label>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={projectParams.startDate}
                  onChange={(e) => handleParamChange('startDate', e.target.value)}
                  className="flex-1 bg-slate-800 text-white border border-slate-600 rounded-lg p-2"
                />
              </div>
            </div>
            
            {/* 预期生命周期 */}
            <div className="bg-white/5 rounded-lg p-4">
              <label className="block text-sm text-gray-400 mb-2">预期生命周期 (年)</label>
              <input
                type="number"
                value={projectParams.expectedLifetime}
                onChange={(e) => handleParamChange('expectedLifetime', parseInt(e.target.value))}
                className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg p-2"
                min="10"
                max="30"
              />
            </div>
          </motion.div>
        )}
      </motion.div>
      
      {/* Prediction Results */}
      {predictionResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="tech-card p-6"
        >
          <div 
            className="flex items-center justify-between cursor-pointer" 
            onClick={() => toggleSection('results')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-400/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">成本预测结果</h3>
            </div>
            {expandedSections.results ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
          
          {expandedSections.results && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 space-y-6"
            >
              {/* 关键指标 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">初始投资</p>
                  <p className="text-2xl font-bold text-white">¥{predictionResults.initialCost.total.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">生命周期成本</p>
                  <p className="text-2xl font-bold text-white">¥{predictionResults.lifecycleCost.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">度电成本</p>
                  <p className="text-2xl font-bold text-cyan-400">¥{predictionResults.levelizedCostOfEnergy.toFixed(3)}/kWh</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">投资回报率</p>
                  <p className="text-2xl font-bold text-emerald-400">{predictionResults.roi.toFixed(2)}%</p>
                </div>
              </div>
              
              {/* 成本分布 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white text-sm font-medium mb-4">初始成本分布</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={[
                          { name: '光伏面板', value: predictionResults.initialCost.panels, color: '#3b82f6' },
                          { name: '逆变器', value: predictionResults.initialCost.inverter, color: '#10b981' },
                          { name: '电池', value: predictionResults.initialCost.battery, color: '#f59e0b' },
                          { name: '安装', value: predictionResults.initialCost.installation, color: '#8b5cf6' },
                          { name: '材料', value: predictionResults.initialCost.materials, color: '#ec4899' },
                          { name: '许可', value: predictionResults.initialCost.permits, color: '#6366f1' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: '光伏面板', value: predictionResults.initialCost.panels, color: '#3b82f6' },
                          { name: '逆变器', value: predictionResults.initialCost.inverter, color: '#10b981' },
                          { name: '电池', value: predictionResults.initialCost.battery, color: '#f59e0b' },
                          { name: '安装', value: predictionResults.initialCost.installation, color: '#8b5cf6' },
                          { name: '材料', value: predictionResults.initialCost.materials, color: '#ec4899' },
                          { name: '许可', value: predictionResults.initialCost.permits, color: '#6366f1' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white text-sm font-medium mb-4">运营成本</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { name: '维护', value: predictionResults.operationalCost.maintenance, color: '#3b82f6' },
                      { name: '监控', value: predictionResults.operationalCost.monitoring, color: '#10b981' },
                      { name: '保险', value: predictionResults.operationalCost.insurance, color: '#f59e0b' }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                      <YAxis stroke="rgba(255,255,255,0.7)" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.2)' }} 
                        labelStyle={{ color: 'white' }}
                      />
                      <Bar dataKey="value" fill="#3b82f6">
                        {[
                          { name: '维护', value: predictionResults.operationalCost.maintenance, color: '#3b82f6' },
                          { name: '监控', value: predictionResults.operationalCost.monitoring, color: '#10b981' },
                          { name: '保险', value: predictionResults.operationalCost.insurance, color: '#f59e0b' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* 投资回报分析 */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white text-sm font-medium mb-4">投资回报分析</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">回收期</span>
                      <span className="text-white font-semibold">{predictionResults.paybackPeriod.toFixed(1)} 年</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-amber-400 to-emerald-400 h-2 rounded-full"
                        style={{ width: `${Math.min(predictionResults.paybackPeriod / 10 * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">投资回报率</span>
                      <span className="text-emerald-400 font-semibold">{predictionResults.roi.toFixed(2)}%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-2 rounded-full"
                        style={{ width: `${Math.min(predictionResults.roi / 100 * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
      
      {/* Optimization Results */}
      {optimizationResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="tech-card p-6"
        >
          <div 
            className="flex items-center justify-between cursor-pointer" 
            onClick={() => toggleSection('optimization')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg p-2 bg-amber-400/10 flex items-center justify-center">
                <Settings className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">成本优化建议</h3>
            </div>
            {expandedSections.optimization ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
          
          {expandedSections.optimization && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 space-y-4"
            >
              <div className="bg-emerald-400/10 rounded-lg p-4 border border-emerald-400/30">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <div>
                    <h4 className="text-emerald-400 font-medium">优化成功</h4>
                    <p className="text-gray-300 text-sm">成本降低 {optimizationResults.costReduction.toFixed(2)}%</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">面板类型</span>
                    <span className="text-white font-semibold">{optimizationResults.optimizedParams.panelType === 'high-efficiency' ? '高效型' : optimizationResults.optimizedParams.panelType === 'bifacial' ? '双面型' : '标准型'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">逆变器类型</span>
                    <span className="text-white font-semibold">{optimizationResults.optimizedParams.inverterType === 'string' ? '组串式' : optimizationResults.optimizedParams.inverterType === 'micro' ? '微型' : '集中式'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">电池容量</span>
                    <span className="text-white font-semibold">{optimizationResults.optimizedParams.batteryCapacity} kWh</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
      
      {/* Sensitivity Analysis */}
      {predictionResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="tech-card p-6"
        >
          <div 
            className="flex items-center justify-between cursor-pointer" 
            onClick={() => toggleSection('sensitivity')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-400/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">敏感性分析</h3>
            </div>
            {expandedSections.sensitivity ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
          
          {expandedSections.sensitivity && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6"
            >
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white text-sm font-medium mb-4">成本影响因素分析</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: '面板价格', value: predictionResults.sensitivityAnalysis.panelPrice, color: '#3b82f6' },
                    { name: '逆变器价格', value: predictionResults.sensitivityAnalysis.inverterPrice, color: '#10b981' },
                    { name: '人工成本', value: predictionResults.sensitivityAnalysis.laborCost, color: '#f59e0b' },
                    { name: '通货膨胀率', value: predictionResults.sensitivityAnalysis.inflationRate, color: '#8b5cf6' }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                    <YAxis stroke="rgba(255,255,255,0.7)" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.2)' }} 
                      labelStyle={{ color: 'white' }}
                      formatter={(value) => [`${typeof value === 'number' ? value.toFixed(2) : value}%`, '成本变化']}
                    />
                    <Bar dataKey="value" fill="#3b82f6">
                      {[
                        { name: '面板价格', value: predictionResults.sensitivityAnalysis.panelPrice, color: '#3b82f6' },
                        { name: '逆变器价格', value: predictionResults.sensitivityAnalysis.inverterPrice, color: '#10b981' },
                        { name: '人工成本', value: predictionResults.sensitivityAnalysis.laborCost, color: '#f59e0b' },
                        { name: '通货膨胀率', value: predictionResults.sensitivityAnalysis.inflationRate, color: '#8b5cf6' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
      
      {/* Market Trends */}
      {predictionResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="tech-card p-6"
        >
          <div 
            className="flex items-center justify-between cursor-pointer" 
            onClick={() => toggleSection('trends')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-400/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">市场趋势分析</h3>
            </div>
            {expandedSections.trends ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
          
          {expandedSections.trends && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6"
            >
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white text-sm font-medium mb-4">价格趋势预测</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={predictionResults.marketTrends.panelPriceTrend.map((price: number, index: number) => ({
                    year: 2024 + Math.floor(index / 12),
                    panel: price,
                    inverter: predictionResults.marketTrends.inverterPriceTrend[index],
                    battery: predictionResults.marketTrends.batteryPriceTrend[index] / 200 // 缩放电池价格以便于显示
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="year" stroke="rgba(255,255,255,0.7)" />
                    <YAxis stroke="rgba(255,255,255,0.7)" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.2)' }} 
                      labelStyle={{ color: 'white' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="panel" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} name="面板价格 (元/W)" />
                    <Line type="monotone" dataKey="inverter" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} name="逆变器价格 (元/W)" />
                    <Line type="monotone" dataKey="battery" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} name="电池价格 (元/kWh, 缩放)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
      
      {/* No Results State */}
      {!predictionResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex items-center justify-center"
        >
          <div className="text-center">
            <DollarSign className="w-16 h-16 text-cyan-400/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">开始成本预测</h3>
            <p className="text-gray-400 mb-6">设置项目参数并点击"开始预测"按钮进行成本分析</p>
            <button
              onClick={handleStartPrediction}
              className="px-6 py-3 rounded-lg bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30 transition-colors flex items-center gap-2 mx-auto"
            >
              <PlayCircle className="w-5 h-5" />
              <span>开始预测</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}