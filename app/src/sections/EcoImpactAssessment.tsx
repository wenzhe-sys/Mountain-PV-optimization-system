import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Leaf,
  BarChart3,
  PieChart,
  Activity,
  Shield,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  PauseCircle,
  RefreshCw,
  Globe,
  Droplets,
  Wind,
  Mountain,
  Headphones,
  Eye,
  Settings
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
import ecoImpactService from '../services/ecoImpactService';

// 生态系统类型选项
const ecosystemTypes = [
  { value: 'forest', label: '森林', color: '#10b981' },
  { value: 'grassland', label: '草地', color: '#84cc16' },
  { value: 'wetland', label: '湿地', color: '#3b82f6' },
  { value: 'desert', label: '沙漠', color: '#f59e0b' },
  { value: 'urban', label: '城市', color: '#6366f1' },
  { value: 'agricultural', label: '农业', color: '#ec4899' }
];

// 环境影响类型图标
const impactIcons = {
  biodiversity: <Globe className="w-5 h-5" />,
  soil: <Mountain className="w-5 h-5" />,
  water: <Droplets className="w-5 h-5" />,
  air: <Wind className="w-5 h-5" />,
  noise: <Headphones className="w-5 h-5" />,
  visual: <Eye className="w-5 h-5" />
};

// 影响等级颜色
const impactColors = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444'
};

export default function EcoImpactAssessment() {
  const [projectParams, setProjectParams] = useState({
    capacity: 1000, // 1000kW
    area: 50000, // 50000m²
    location: '中国北京',
    terrainType: 'hilly' as 'flat' | 'hilly' | 'mountainous',
    ecosystemType: [
      { type: 'grassland' as const, coverage: 60, sensitivity: 'medium' as const, protected: false },
      { type: 'forest' as const, coverage: 30, sensitivity: 'high' as const, protected: false },
      { type: 'agricultural' as const, coverage: 10, sensitivity: 'low' as const, protected: false }
    ],
    constructionPeriod: 6, // 6个月
    operationalLifetime: 25, // 25年
    panelType: 'standard' as 'standard' | 'bifacial' | 'thin-film',
    installationType: 'ground' as 'ground' | 'roof' | 'floating',
    vegetationRemoval: 5000, // 5000m²
    soilDisturbance: 8000, // 8000m²
    waterUsage: 2000, // 2000m³
    noiseLevel: 60 // 60dB
  });
  
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessmentProgress, setAssessmentProgress] = useState(0);
  const [assessmentResults, setAssessmentResults] = useState<any>(null);
  const [optimizationResults, setOptimizationResults] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState({
    input: true,
    results: false,
    carbon: false,
    mitigation: false,
    compliance: false,
    optimization: false
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
  
  // 更新生态系统类型
  const handleEcosystemChange = (index: number, key: string, value: any) => {
    setProjectParams(prev => {
      const updatedEcosystems = [...prev.ecosystemType];
      updatedEcosystems[index] = {
        ...updatedEcosystems[index],
        [key]: value
      };
      return {
        ...prev,
        ecosystemType: updatedEcosystems
      };
    });
  };
  
  // 添加生态系统类型
  const addEcosystem = () => {
    setProjectParams(prev => ({
      ...prev,
      ecosystemType: [...prev.ecosystemType, {
        type: 'grassland' as const,
        coverage: 0,
        sensitivity: 'medium' as const,
        protected: false
      }]
    }));
  };
  
  // 开始生态影响评估
  const handleStartAssessment = useCallback(() => {
    setIsAssessing(true);
    setAssessmentProgress(0);
    
    // 模拟评估过程
    const progressInterval = setInterval(() => {
      setAssessmentProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);
    
    // 执行生态影响评估
    setTimeout(() => {
      const results = ecoImpactService.assessEcoImpact(projectParams);
      setAssessmentResults(results);
      
      clearInterval(progressInterval);
      setIsAssessing(false);
      setAssessmentProgress(100);
      
      // 自动展开结果部分
      setExpandedSections(prev => ({
        ...prev,
        results: true
      }));
    }, 2000);
  }, [projectParams]);
  
  // 优化生态影响
  const handleOptimizeImpact = useCallback(() => {
    const results = ecoImpactService.optimizeEcoImpact(projectParams);
    setOptimizationResults(results);
    
    // 自动展开优化部分
    setExpandedSections(prev => ({
      ...prev,
      optimization: true
    }));
  }, [projectParams]);
  
  // 重置评估
  const handleResetAssessment = useCallback(() => {
    setIsAssessing(false);
    setAssessmentProgress(0);
    setAssessmentResults(null);
    setOptimizationResults(null);
  }, []);
  
  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-white">生态影响评估</h2>
          <p className="text-gray-400 mt-1">更全面的环境影响分析</p>
        </div>
        
        <div className="flex items-center gap-3">
          {!isAssessing && assessmentProgress < 100 ? (
            <button
              onClick={handleStartAssessment}
              className="px-4 py-2 rounded-lg bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition-colors flex items-center gap-2"
            >
              <PlayCircle className="w-5 h-5" />
              <span>开始评估</span>
            </button>
          ) : isAssessing ? (
            <button
              onClick={() => setIsAssessing(false)}
              className="px-4 py-2 rounded-lg bg-amber-400/20 text-amber-400 hover:bg-amber-400/30 transition-colors flex items-center gap-2"
            >
              <PauseCircle className="w-5 h-5" />
              <span>暂停评估</span>
            </button>
          ) : (
            <button
              onClick={handleResetAssessment}
              className="px-4 py-2 rounded-lg bg-red-400/20 text-red-400 hover:bg-red-400/30 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>重置评估</span>
            </button>
          )}
          
          {assessmentResults && (
            <button
              onClick={handleOptimizeImpact}
              className="px-4 py-2 rounded-lg bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30 transition-colors flex items-center gap-2"
            >
              <Shield className="w-5 h-5" />
              <span>优化影响</span>
            </button>
          )}
        </div>
      </motion.div>
      
      {/* Assessment Progress */}
      {assessmentProgress > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="tech-card p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">评估进度</span>
            <span className="text-sm text-cyan-400">{assessmentProgress}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${assessmentProgress}%` }}
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
            className="mt-6 space-y-6"
          >
            {/* 基本参数 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-lg p-4">
                <label className="block text-sm text-gray-400 mb-2">项目容量 (kW)</label>
                <input
                  type="number"
                  value={projectParams.capacity}
                  onChange={(e) => handleParamChange('capacity', parseFloat(e.target.value))}
                  className="w-full bg-transparent text-white border border-white/10 rounded-lg p-2"
                  min="100"
                  max="10000"
                />
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <label className="block text-sm text-gray-400 mb-2">占地面积 (m²)</label>
                <input
                  type="number"
                  value={projectParams.area}
                  onChange={(e) => handleParamChange('area', parseFloat(e.target.value))}
                  className="w-full bg-transparent text-white border border-white/10 rounded-lg p-2"
                  min="1000"
                  max="1000000"
                />
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <label className="block text-sm text-gray-400 mb-2">项目位置</label>
                <input
                  type="text"
                  value={projectParams.location}
                  onChange={(e) => handleParamChange('location', e.target.value)}
                  className="w-full bg-transparent text-white border border-white/10 rounded-lg p-2"
                />
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <label className="block text-sm text-gray-400 mb-2">地形类型</label>
                <select
                  value={projectParams.terrainType}
                  onChange={(e) => handleParamChange('terrainType', e.target.value as 'flat' | 'hilly' | 'mountainous')}
                  className="w-full bg-transparent text-white border border-white/10 rounded-lg p-2"
                >
                  <option value="flat">平地</option>
                  <option value="hilly">丘陵</option>
                  <option value="mountainous">山地</option>
                </select>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <label className="block text-sm text-gray-400 mb-2">建设周期 (月)</label>
                <input
                  type="number"
                  value={projectParams.constructionPeriod}
                  onChange={(e) => handleParamChange('constructionPeriod', parseInt(e.target.value))}
                  className="w-full bg-transparent text-white border border-white/10 rounded-lg p-2"
                  min="1"
                  max="24"
                />
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <label className="block text-sm text-gray-400 mb-2">运行寿命 (年)</label>
                <input
                  type="number"
                  value={projectParams.operationalLifetime}
                  onChange={(e) => handleParamChange('operationalLifetime', parseInt(e.target.value))}
                  className="w-full bg-transparent text-white border border-white/10 rounded-lg p-2"
                  min="10"
                  max="30"
                />
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <label className="block text-sm text-gray-400 mb-2">面板类型</label>
                <select
                  value={projectParams.panelType}
                  onChange={(e) => handleParamChange('panelType', e.target.value as 'standard' | 'bifacial' | 'thin-film')}
                  className="w-full bg-transparent text-white border border-white/10 rounded-lg p-2"
                >
                  <option value="standard">标准型</option>
                  <option value="bifacial">双面型</option>
                  <option value="thin-film">薄膜型</option>
                </select>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <label className="block text-sm text-gray-400 mb-2">安装类型</label>
                <select
                  value={projectParams.installationType}
                  onChange={(e) => handleParamChange('installationType', e.target.value as 'ground' | 'roof' | 'floating')}
                  className="w-full bg-transparent text-white border border-white/10 rounded-lg p-2"
                >
                  <option value="ground">地面</option>
                  <option value="roof">屋顶</option>
                  <option value="floating">水面</option>
                </select>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <label className="block text-sm text-gray-400 mb-2">植被移除面积 (m²)</label>
                <input
                  type="number"
                  value={projectParams.vegetationRemoval}
                  onChange={(e) => handleParamChange('vegetationRemoval', parseFloat(e.target.value))}
                  className="w-full bg-transparent text-white border border-white/10 rounded-lg p-2"
                  min="0"
                  max="50000"
                />
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <label className="block text-sm text-gray-400 mb-2">土壤扰动面积 (m²)</label>
                <input
                  type="number"
                  value={projectParams.soilDisturbance}
                  onChange={(e) => handleParamChange('soilDisturbance', parseFloat(e.target.value))}
                  className="w-full bg-transparent text-white border border-white/10 rounded-lg p-2"
                  min="0"
                  max="50000"
                />
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <label className="block text-sm text-gray-400 mb-2">用水量 (m³)</label>
                <input
                  type="number"
                  value={projectParams.waterUsage}
                  onChange={(e) => handleParamChange('waterUsage', parseFloat(e.target.value))}
                  className="w-full bg-transparent text-white border border-white/10 rounded-lg p-2"
                  min="0"
                  max="50000"
                />
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <label className="block text-sm text-gray-400 mb-2">噪音水平 (dB)</label>
                <input
                  type="number"
                  value={projectParams.noiseLevel}
                  onChange={(e) => handleParamChange('noiseLevel', parseFloat(e.target.value))}
                  className="w-full bg-transparent text-white border border-white/10 rounded-lg p-2"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            
            {/* 生态系统类型 */}
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white text-sm font-medium">生态系统类型</h4>
                <button
                  onClick={addEcosystem}
                  className="px-3 py-1 rounded-lg bg-cyan-400/20 text-cyan-400 text-sm hover:bg-cyan-400/30 transition-colors"
                >
                  添加生态系统
                </button>
              </div>
              
              <div className="space-y-4">
                {projectParams.ecosystemType.map((ecosystem, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 bg-white/5 rounded-lg">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">类型</label>
                      <select
                        value={ecosystem.type}
                        onChange={(e) => handleEcosystemChange(index, 'type', e.target.value)}
                        className="w-full bg-transparent text-white border border-white/10 rounded-lg p-2 text-sm"
                      >
                        {ecosystemTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">覆盖率 (%)</label>
                      <input
                        type="number"
                        value={ecosystem.coverage}
                        onChange={(e) => handleEcosystemChange(index, 'coverage', parseFloat(e.target.value))}
                        className="w-full bg-transparent text-white border border-white/10 rounded-lg p-2 text-sm"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">敏感性</label>
                      <select
                        value={ecosystem.sensitivity}
                        onChange={(e) => handleEcosystemChange(index, 'sensitivity', e.target.value)}
                        className="w-full bg-transparent text-white border border-white/10 rounded-lg p-2 text-sm"
                      >
                        <option value="low">低</option>
                        <option value="medium">中</option>
                        <option value="high">高</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">是否保护</label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={ecosystem.protected}
                          onChange={(e) => handleEcosystemChange(index, 'protected', e.target.checked)}
                          className="rounded border-gray-600 bg-transparent text-cyan-400 focus:ring-cyan-400"
                        />
                        <span className="ml-2 text-sm text-gray-400">是</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
      
      {/* Assessment Results */}
      {assessmentResults && (
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
              <h3 className="text-lg font-semibold text-white">生态影响评估结果</h3>
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
              {/* 总体影响 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">总体影响</p>
                  <p className={`text-2xl font-bold ${impactColors[assessmentResults.overallImpact as keyof typeof impactColors]}`}>
                    {assessmentResults.overallImpact === 'low' ? '低' : assessmentResults.overallImpact === 'medium' ? '中' : '高'}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">影响得分</p>
                  <p className="text-2xl font-bold text-white">{assessmentResults.impactScore.toFixed(1)}/100</p>
                </div>
              </div>
              
              {/* 环境影响详情 */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white text-sm font-medium mb-4">环境影响详情</h4>
                <div className="space-y-4">
                  {assessmentResults.impacts.map((impact: any, index: number) => (
                    <div key={index} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg ${impactColors[impact.impact as keyof typeof impactColors]}10 flex items-center justify-center`}>
                          {impactIcons[impact.type as keyof typeof impactIcons]}
                        </div>
                        <div>
                          <h5 className="text-white font-medium">
                            {impact.type === 'biodiversity' ? '生物多样性' :
                             impact.type === 'soil' ? '土壤' :
                             impact.type === 'water' ? '水资源' :
                             impact.type === 'air' ? '空气质量' :
                             impact.type === 'noise' ? '噪音' : '景观'}
                          </h5>
                          <p className={`text-sm ${impactColors[impact.impact as keyof typeof impactColors]}`}>
                            影响等级: {impact.impact === 'low' ? '低' : impact.impact === 'medium' ? '中' : '高'}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">{impact.description}</p>
                      <div>
                        <p className="text-gray-400 text-sm mb-2">减缓措施:</p>
                        <ul className="space-y-1">
                          {impact.mitigation.map((measure: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                              <span>{measure}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 生态系统影响 */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white text-sm font-medium mb-4">生态系统影响</h4>
                <div className="space-y-4">
                  {assessmentResults.ecosystemImpacts.map((ecoImpact: any, index: number) => (
                    <div key={index} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-white font-medium">
                          {ecosystemTypes.find(type => type.value === ecoImpact.ecosystem.type)?.label}
                          {ecoImpact.ecosystem.protected && (
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-red-400/20 text-red-400 text-xs">
                              受保护
                            </span>
                          )}
                        </h5>
                        <span className={`text-sm font-semibold ${impactColors[ecoImpact.impact as keyof typeof impactColors]}`}>
                          {ecoImpact.impact === 'low' ? '低影响' : ecoImpact.impact === 'medium' ? '中等影响' : '高影响'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-400">覆盖率:</span>
                          <span className="text-white ml-2">{ecoImpact.ecosystem.coverage}%</span>
                        </div>
                        <div>
                          <span className="text-gray-400">敏感性:</span>
                          <span className="text-white ml-2">
                            {ecoImpact.ecosystem.sensitivity === 'low' ? '低' : ecoImpact.ecosystem.sensitivity === 'medium' ? '中' : '高'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
      
      {/* Carbon Footprint */}
      {assessmentResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="tech-card p-6"
        >
          <div 
            className="flex items-center justify-between cursor-pointer" 
            onClick={() => toggleSection('carbon')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-400/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">碳足迹分析</h3>
            </div>
            {expandedSections.carbon ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
          
          {expandedSections.carbon && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">建设阶段碳排放</p>
                  <p className="text-2xl font-bold text-white">{assessmentResults.carbonFootprint.construction.toFixed(1)} tCO₂</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">运行阶段碳排放</p>
                  <p className="text-2xl font-bold text-white">{assessmentResults.carbonFootprint.operation.toFixed(1)} tCO₂/年</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">退役阶段碳排放</p>
                  <p className="text-2xl font-bold text-white">{assessmentResults.carbonFootprint.decommissioning.toFixed(1)} tCO₂</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">总碳排放</p>
                  <p className="text-2xl font-bold text-white">{assessmentResults.carbonFootprint.total.toFixed(1)} tCO₂</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">碳抵消量</p>
                  <p className="text-2xl font-bold text-emerald-400">{assessmentResults.carbonFootprint.offset.toFixed(1)} tCO₂</p>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-gray-400 text-sm">净碳排放</p>
                <p className={`text-2xl font-bold ${assessmentResults.carbonFootprint.net >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {assessmentResults.carbonFootprint.net.toFixed(1)} tCO₂
                </p>
                <p className="text-gray-300 text-sm mt-2">
                  {assessmentResults.carbonFootprint.net >= 0 
                    ? '项目产生净碳排放' 
                    : '项目实现碳减排'}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
      
      {/* Mitigation Measures */}
      {assessmentResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="tech-card p-6"
        >
          <div 
            className="flex items-center justify-between cursor-pointer" 
            onClick={() => toggleSection('mitigation')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg p-2 bg-amber-400/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">减缓措施</h3>
            </div>
            {expandedSections.mitigation ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
          
          {expandedSections.mitigation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 space-y-4"
            >
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white text-sm font-medium mb-4">推荐减缓措施</h4>
                <div className="space-y-3">
                  {assessmentResults.mitigationMeasures.map((measure: any, index: number) => (
                    <div key={index} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-white font-medium">{measure.measure}</h5>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${measure.effectiveness === 'high' ? 'bg-emerald-400/20 text-emerald-400' : measure.effectiveness === 'medium' ? 'bg-amber-400/20 text-amber-400' : 'bg-blue-400/20 text-blue-400'}`}>
                          {measure.effectiveness === 'high' ? '高效果' : measure.effectiveness === 'medium' ? '中等效果' : '低效果'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">成本:</span>
                        <span className="text-white">¥{measure.cost} 万元</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white text-sm font-medium mb-4">建议</h4>
                <ul className="space-y-2">
                  {assessmentResults.recommendations.map((recommendation: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
      
      {/* Compliance */}
      {assessmentResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="tech-card p-6"
        >
          <div 
            className="flex items-center justify-between cursor-pointer" 
            onClick={() => toggleSection('compliance')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg p-2 bg-purple-400/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">合规性分析</h3>
            </div>
            {expandedSections.compliance ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
          
          {expandedSections.compliance && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 space-y-4"
            >
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${assessmentResults.compliance.status === 'compliant' ? 'bg-emerald-400/10' : assessmentResults.compliance.status === 'partial' ? 'bg-amber-400/10' : 'bg-red-400/10'}`}>
                    <CheckCircle2 className={`w-5 h-5 ${assessmentResults.compliance.status === 'compliant' ? 'text-emerald-400' : assessmentResults.compliance.status === 'partial' ? 'text-amber-400' : 'text-red-400'}`} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">合规性状态</h4>
                    <p className={`text-sm ${assessmentResults.compliance.status === 'compliant' ? 'text-emerald-400' : assessmentResults.compliance.status === 'partial' ? 'text-amber-400' : 'text-red-400'}`}>
                      {assessmentResults.compliance.status === 'compliant' ? '完全合规' : assessmentResults.compliance.status === 'partial' ? '部分合规' : '不合规'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-white text-sm font-medium mb-2">相关法规</h5>
                    <ul className="space-y-1">
                      {assessmentResults.compliance.regulations.map((regulation: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>{regulation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-white text-sm font-medium mb-2">所需许可证</h5>
                    <ul className="space-y-1">
                      {assessmentResults.compliance.permits.map((permit: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>{permit}</span>
                        </li>
                      ))}
                    </ul>
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
          transition={{ delay: 0.5 }}
          className="tech-card p-6"
        >
          <div 
            className="flex items-center justify-between cursor-pointer" 
            onClick={() => toggleSection('optimization')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg p-2 bg-cyan-400/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">生态影响优化</h3>
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
                    <p className="text-gray-300 text-sm">影响减少 {optimizationResults.impactReduction.toFixed(2)}%</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">植被移除面积</span>
                    <div className="text-right">
                      <p className="text-white font-semibold">{optimizationResults.optimizedParams.vegetationRemoval.toFixed(0)} m²</p>
                      <p className="text-emerald-400 text-xs">
                        ↓ {(100 - (optimizationResults.optimizedParams.vegetationRemoval / projectParams.vegetationRemoval) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">土壤扰动面积</span>
                    <div className="text-right">
                      <p className="text-white font-semibold">{optimizationResults.optimizedParams.soilDisturbance.toFixed(0)} m²</p>
                      <p className="text-emerald-400 text-xs">
                        ↓ {(100 - (optimizationResults.optimizedParams.soilDisturbance / projectParams.soilDisturbance) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">用水量</span>
                    <div className="text-right">
                      <p className="text-white font-semibold">{optimizationResults.optimizedParams.waterUsage.toFixed(0)} m³</p>
                      <p className="text-emerald-400 text-xs">
                        ↓ {(100 - (optimizationResults.optimizedParams.waterUsage / projectParams.waterUsage) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">噪音水平</span>
                    <div className="text-right">
                      <p className="text-white font-semibold">{optimizationResults.optimizedParams.noiseLevel.toFixed(0)} dB</p>
                      <p className="text-emerald-400 text-xs">
                        ↓ {(projectParams.noiseLevel - optimizationResults.optimizedParams.noiseLevel).toFixed(1)} dB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
      
      {/* No Results State */}
      {!assessmentResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex items-center justify-center"
        >
          <div className="text-center">
            <Leaf className="w-16 h-16 text-cyan-400/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">开始生态影响评估</h3>
            <p className="text-gray-400 mb-6">设置项目参数并点击"开始评估"按钮进行环境影响分析</p>
            <button
              onClick={handleStartAssessment}
              className="px-6 py-3 rounded-lg bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30 transition-colors flex items-center gap-2 mx-auto"
            >
              <PlayCircle className="w-5 h-5" />
              <span>开始评估</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}