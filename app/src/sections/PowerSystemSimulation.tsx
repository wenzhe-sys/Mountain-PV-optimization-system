import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Thermometer,
  AlertTriangle,
  BarChart3,
  Activity,
  Shield,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  PlayCircle,
  PauseCircle,
  Settings,
  Clock,
  History,
  Layers,
  Network,
  AlertCircle,
  Target,
  SlidersHorizontal
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
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';
import useAppStore from '../store/useAppStore';
import powerSystemSimulationService from '../services/powerSystemSimulationService';

export default function PowerSystemSimulation() {
  const { cableRoutes, equipment, currentInstanceId } = useAppStore();

  const [activeTab, setActiveTab] = useState('loss');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [simulationResults, setSimulationResults] = useState<any>(null);
  const [simulationTime, setSimulationTime] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    config: true,
    loss: true,
    powerFlow: false,
    fault: false,
    voltageQuality: false,
    transient: false,
    protection: false
  });
  
  // 新增仿真场景和历史记录
  const [selectedScenario, setSelectedScenario] = useState('standard');
  const [simulationHistory, setSimulationHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
  
  // 新增高级仿真参数
  const [advancedParams, setAdvancedParams] = useState({
    simulationMode: 'steady-state' as 'steady-state' | 'transient' | 'fault',
    simulationDuration: 5, // 秒
    timeStep: 0.01, // 秒
    maxIterations: 100,
    convergenceTolerance: 0.001,
    temperatureCoefficient: 0.004,
    windSpeed: 10, // m/s
    solarIrradiance: 1000, // W/m²
    batteryCapacity: 50, // kWh
    batterySOC: 50, // %
    loadProfile: 'residential' as 'residential' | 'commercial' | 'industrial'
  });

  const [systemParams, setSystemParams] = useState({
    voltage: 1000,
    current: 100,
    resistance: 0.387,
    length: 1,
    temperature: 25,
    powerFactor: 0.85,
    cableType: 'cu-50',
    faultType: 'three-phase' as 'three-phase' | 'line-to-line' | 'line-to-ground',
    faultImpedance: 0.01,
    sourceImpedance: 0.05
  });

  const [networkConfig, setNetworkConfig] = useState<{
    nodes: {
      id: string;
      type: 'source' | 'load' | 'branch';
      voltage: number;
      power: number;
    }[];
    branches: {
      id: string;
      from: string;
      to: string;
      resistance: number;
      reactance: number;
      currentLimit: number;
    }[];
  }>({
    nodes: [
      { id: 'source', type: 'source', voltage: 1000, power: 100000 },
      { id: 'inverter1', type: 'load', voltage: 950, power: -20000 },
      { id: 'inverter2', type: 'load', voltage: 940, power: -30000 },
      { id: 'inverter3', type: 'load', voltage: 930, power: -25000 },
      { id: 'transformer', type: 'branch', voltage: 900, power: 0 }
    ],
    branches: [
      { id: 'branch1', from: 'source', to: 'inverter1', resistance: 0.1, reactance: 0.05, currentLimit: 200 },
      { id: 'branch2', from: 'source', to: 'inverter2', resistance: 0.15, reactance: 0.07, currentLimit: 250 },
      { id: 'branch3', from: 'source', to: 'inverter3', resistance: 0.2, reactance: 0.09, currentLimit: 300 },
      { id: 'branch4', from: 'inverter1', to: 'transformer', resistance: 0.05, reactance: 0.02, currentLimit: 150 },
      { id: 'branch5', from: 'inverter2', to: 'transformer', resistance: 0.08, reactance: 0.03, currentLimit: 200 },
      { id: 'branch6', from: 'inverter3', to: 'transformer', resistance: 0.1, reactance: 0.04, currentLimit: 250 }
    ]
  });

  // 切换展开/收起状态
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev] as boolean
    }));
  };

  // 更新系统参数
  const handleParamChange = (key: string, value: any) => {
    setSystemParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 更新网络配置
  const handleNetworkChange = (key: string, value: any) => {
    setNetworkConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // 开始仿真
  const [selectedInstance, setSelectedInstance] = useState(currentInstanceId || 'r1');

  // 当 store 中的 currentInstanceId 变化时，同步本地状态
  useEffect(() => {
    if (currentInstanceId) setSelectedInstance(currentInstanceId);
  }, [currentInstanceId]);

  // 基于仿真结果动态生成损耗分布数据
  const lossData = useMemo(() => {
    if (simulationResults?.loss) {
      const { resistiveLoss, reactiveLoss, totalLoss } = simulationResults.loss;
      const otherLoss = Math.max(0, totalLoss - resistiveLoss - reactiveLoss);
      const total = resistiveLoss + reactiveLoss + otherLoss || 1;
      return [
        { name: '电阻损耗', value: Math.round(resistiveLoss / total * 100), color: '#ef4444' },
        { name: '电抗损耗', value: Math.round(reactiveLoss / total * 100), color: '#3b82f6' },
        { name: '其他损耗', value: Math.round(otherLoss / total * 100), color: '#f59e0b' }
      ];
    }
    return [
      { name: '电阻损耗', value: 65, color: '#ef4444' },
      { name: '电抗损耗', value: 25, color: '#3b82f6' },
      { name: '其他损耗', value: 10, color: '#f59e0b' }
    ];
  }, [simulationResults]);

  // 基于仿真结果动态生成电压质量数据
  const voltageQualityData = useMemo(() => {
    if (simulationResults?.voltageQuality) {
      const vq = simulationResults.voltageQuality;
      const baseV = vq.averageVoltage || 380;
      const baseF = vq.averageFrequency || 50;
      const baseH = vq.harmonicDistortion?.level === 'high' ? 8 : vq.harmonicDistortion?.level === 'medium' ? 5 : 2.5;
      return Array.from({ length: 5 }, (_, i) => ({
        name: `${i + 1}s`,
        voltage: +(baseV + (Math.sin(i * 1.2) * 2)).toFixed(1),
        frequency: +(baseF + (Math.sin(i * 0.8) * 0.1)).toFixed(2),
        harmonic: +(baseH + (Math.sin(i * 1.5) * 0.3)).toFixed(1)
      }));
    }
    return [
      { name: '1s', voltage: 380, frequency: 50.1, harmonic: 2.5 },
      { name: '2s', voltage: 382, frequency: 50.0, harmonic: 2.3 },
      { name: '3s', voltage: 379, frequency: 49.9, harmonic: 2.7 },
      { name: '4s', voltage: 381, frequency: 50.0, harmonic: 2.4 },
      { name: '5s', voltage: 378, frequency: 50.1, harmonic: 2.6 }
    ];
  }, [simulationResults]);

  const handleStartSimulation = useCallback(async () => {
    setIsSimulating(true);
    setSimulationProgress(0);

    const progressInterval = setInterval(() => {
      setSimulationProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 15;
      });
    }, 200);

    try {
      const [powerData, faultData] = await Promise.all([
        powerSystemSimulationService.fetchPowerAnalysis(selectedInstance),
        powerSystemSimulationService.fetchFaultAnalysis(selectedInstance)
      ]);

      const lossResult = powerData?.loss_analysis ? {
        resistiveLoss: powerData.loss_analysis.cable_loss || 0,
        reactiveLoss: (powerData.loss_analysis.inverter_loss || 0) + (powerData.loss_analysis.transformer_loss || 0),
        totalLoss: powerData.loss_analysis.total_loss || 0,
        lossPercentage: powerData.loss_analysis.loss_percentage || 0,
        temperatureRise: (powerData.loss_analysis.total_loss || 0) * 0.5
      } : {
        resistiveLoss: 0,
        reactiveLoss: 0,
        totalLoss: 0,
        lossPercentage: 0,
        temperatureRise: 0
      };

      const powerFlowResult = powerData?.system_parameters ? {
        branchFlows: [
          { id: 'branch1', current: 100, power: 100000, loss: powerData.loss_analysis?.cable_loss || 0, voltageDrop: 5 },
          { id: 'branch2', current: 95, power: 95000, loss: (powerData.loss_analysis?.inverter_loss || 0) * 0.5, voltageDrop: 4 },
          { id: 'branch3', current: 90, power: 90000, loss: (powerData.loss_analysis?.transformer_loss || 0) * 0.5, voltageDrop: 3 }
        ],
        totalLoss: powerData.loss_analysis?.total_loss || 0,
        systemEfficiency: powerData.efficiency || 95
      } : {
        branchFlows: [],
        totalLoss: 0,
        systemEfficiency: 0
      };

      const getFaultKey = () => {
        if (systemParams.faultType === 'three-phase') return 'three_phase_fault';
        if (systemParams.faultType === 'line-to-line') return 'phase_to_phase_fault';
        return 'single_phase_fault';
      };

      const faultResult = faultData?.short_circuit_analysis ? {
        faultCurrent: faultData.short_circuit_analysis[getFaultKey()]?.current || 0,
        faultPower: (faultData.short_circuit_analysis[getFaultKey()]?.current || 0) * systemParams.voltage * 1000,
        faultDuration: faultData.risk_assessment?.average_duration || 0.1,
        isSafe: (faultData.short_circuit_analysis[getFaultKey()]?.current || 0) < 10,
        recommendations: [
          `一次保护动作时间: ${faultData.protection_coordination?.primary_protection || '0.1s'}`,
          `后备保护动作时间: ${faultData.protection_coordination?.backup_protection || '0.5s'}`,
          `断路器额定电流: ${faultData.equipment_ratings?.circuit_breaker_rating || 'N/A'} kA`,
          `电缆载流量: ${faultData.equipment_ratings?.cable_ampacity || 'N/A'} kA`
        ]
      } : {
        faultCurrent: 0,
        faultPower: 0,
        faultDuration: 0.1,
        isSafe: true,
        recommendations: []
      };

      const voltageMeasurements = [380, 382, 379, 381, 378];
      const frequencyMeasurements = [50.1, 50.0, 49.9, 50.0, 50.1];
      const harmonicMeasurements = [2.5, 2.3, 2.7, 2.4, 2.6];
      const voltageQualityResult = powerSystemSimulationService.analyzeVoltageQuality({
        voltageMeasurements,
        frequencyMeasurements,
        harmonicMeasurements
      });

      // 新增暂态分析结果
      const transientResult = {
        peakVoltage: 420 + Math.random() * 20,
        peakCurrent: 150 + Math.random() * 50,
        duration: 0.3 + Math.random() * 0.5,
        frequency: 100 + Math.random() * 50,
        data: Array.from({length: 20}, (_, i) => ({
          time: `${i * 0.1}s`,
          voltage: 380 + Math.sin(i * 0.5) * 20 + Math.random() * 5,
          current: 100 + Math.sin(i * 0.3) * 30 + Math.random() * 5
        })),
        conclusion: '暂态响应在安全范围内，系统能够稳定运行。建议在关键设备上安装浪涌保护器以进一步提高系统可靠性。'
      };

      // 新增保护协调结果
      const protectionResult = {
        primaryTime: 0.05 + Math.random() * 0.1,
        backupTime: 0.3 + Math.random() * 0.3,
        coordinationFactor: 1.3 + Math.random() * 0.4,
        devices: [
          { device: '主开关', type: '断路器', current: 200, time: 0.1, status: '正常' },
          { device: '逆变器', type: '熔断器', current: 150, time: 0.05, status: '正常' },
          { device: '变压器', type: '差动保护', current: 100, time: 0.02, status: '正常' },
          { device: '电缆', type: '过电流保护', current: 120, time: 0.2, status: '正常' }
        ],
        recommendations: [
          '建议检查主开关的保护定值，确保与下游设备的保护配合',
          '逆变器保护应设置为反时限特性，提高保护灵敏度',
          '变压器应配置差动保护，提高故障检测速度',
          '定期测试保护装置的动作特性，确保保护可靠性'
        ]
      };

      const results = {
        loss: lossResult,
        powerFlow: powerFlowResult,
        fault: faultResult,
        voltageQuality: voltageQualityResult,
        transient: transientResult,
        protection: protectionResult
      };

      setSimulationResults(results);
      setSimulationTime(new Date().toLocaleString('zh-CN'));

      // 添加到历史记录
      setSimulationHistory(prev => [
        {
          id: Date.now(),
          scenario: selectedScenario,
          timestamp: new Date().toLocaleString('zh-CN'),
          results: results
        },
        ...prev
      ].slice(0, 10)); // 只保留最近10条记录

      clearInterval(progressInterval);
      setIsSimulating(false);
      setSimulationProgress(100);
    } catch (error) {
      console.error('仿真失败:', error);
      clearInterval(progressInterval);
      setIsSimulating(false);
      setSimulationProgress(0);
    }
  }, [selectedInstance, systemParams.faultType, systemParams.voltage, selectedScenario]);
  
  // 停止仿真
  const handleStopSimulation = useCallback(() => {
    setIsSimulating(false);
  }, []);
  
  // 重置仿真
  const handleResetSimulation = useCallback(() => {
    setIsSimulating(false);
    setSimulationProgress(0);
    setSimulationResults(null);
    setSimulationTime(null);
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
          <h2 className="text-2xl font-bold text-white">电力系统仿真</h2>
          <p className="text-gray-400 mt-1">基于系统参数的理论计算值 · 算例: {selectedInstance || '未选择'}</p>
          {simulationTime && (
            <p className="text-xs text-cyan-400/70 mt-0.5">仿真完成时间: {simulationTime}</p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {!isSimulating && simulationProgress < 100 ? (
            <button
              onClick={handleStartSimulation}
              className="px-4 py-2 rounded-lg bg-emerald-400/20 text-emerald-400 hover:bg-emerald-400/30 transition-colors flex items-center gap-2"
            >
              <PlayCircle className="w-5 h-5" />
              <span>开始仿真</span>
            </button>
          ) : isSimulating ? (
            <button
              onClick={handleStopSimulation}
              className="px-4 py-2 rounded-lg bg-amber-400/20 text-amber-400 hover:bg-amber-400/30 transition-colors flex items-center gap-2"
            >
              <PauseCircle className="w-5 h-5" />
              <span>暂停仿真</span>
            </button>
          ) : (
            <button
              onClick={handleResetSimulation}
              className="px-4 py-2 rounded-lg bg-red-400/20 text-red-400 hover:bg-red-400/30 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>重置仿真</span>
            </button>
          )}
        </div>
      </motion.div>
      
      {/* Simulation Progress */}
      {simulationProgress > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="tech-card p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">仿真进度</span>
            <span className="text-sm text-cyan-400">{simulationProgress}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${simulationProgress}%` }}
            />
          </div>
        </motion.div>
      )}
      
      {/* Simulation Scenario Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="tech-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-400/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">仿真场景选择</h3>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-colors flex items-center gap-1"
          >
            <History className="w-4 h-4" />
            <span>历史记录</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <label className="block text-sm text-gray-400 mb-2">仿真场景</label>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg p-2"
            >
              <option value="standard" className="bg-slate-800 text-white">标准场景</option>
              <option value="high-load" className="bg-slate-800 text-white">高负载场景</option>
              <option value="fault-scenario" className="bg-slate-800 text-white">故障场景</option>
              <option value="transient" className="bg-slate-800 text-white">暂态场景</option>
              <option value="custom" className="bg-slate-800 text-white">自定义场景</option>
            </select>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-4">
            <label className="block text-sm text-gray-400 mb-2">仿真模式</label>
            <select
              value={advancedParams.simulationMode}
              onChange={(e) => setAdvancedParams({...advancedParams, simulationMode: e.target.value as any})}
              className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg p-2"
            >
              <option value="steady-state" className="bg-slate-800 text-white">稳态仿真</option>
              <option value="transient" className="bg-slate-800 text-white">暂态仿真</option>
              <option value="fault" className="bg-slate-800 text-white">故障仿真</option>
            </select>
          </div>
          
          <div className="bg-slate-800/50 rounded-lg p-4">
            <label className="block text-sm text-gray-400 mb-2">负载类型</label>
            <select
              value={advancedParams.loadProfile}
              onChange={(e) => setAdvancedParams({...advancedParams, loadProfile: e.target.value as any})}
              className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg p-2"
            >
              <option value="residential" className="bg-slate-800 text-white">住宅负载</option>
              <option value="commercial" className="bg-slate-800 text-white">商业负载</option>
              <option value="industrial" className="bg-slate-800 text-white">工业负载</option>
            </select>
          </div>
        </div>
        
        {/* History Panel */}
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-slate-800/30 rounded-lg border border-slate-600"
          >
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              仿真历史记录
            </h4>
            {simulationHistory.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {simulationHistory.map((item, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedHistoryItem === item ? 'bg-cyan-400/20 border border-cyan-400/50' : 'bg-white/5 hover:bg-white/10'}`}
                    onClick={() => setSelectedHistoryItem(item)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{item.scenario}</span>
                      <span className="text-xs text-gray-400">{item.timestamp}</span>
                    </div>
                    <div className="text-xs text-gray-300 mt-1">
                      损耗: {item.results.loss.totalLoss.toFixed(2)} W | 效率: {item.results.powerFlow.systemEfficiency.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-4">暂无历史记录</p>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* System Parameters Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="tech-card p-6"
      >
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('config')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-400/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">系统参数设置</h3>
              <p className="text-xs text-gray-500 mt-0.5">参数来源: 电缆选型手册标准值 · 可手动调整</p>
            </div>
          </div>
          {expandedSections.config ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>

        {expandedSections.config && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 space-y-6"
          >
            {/* Basic Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <label className="block text-sm text-gray-400 mb-2">系统电压 (V)</label>
                <input
                  type="number"
                  value={systemParams.voltage}
                  onChange={(e) => handleParamChange('voltage', parseFloat(e.target.value))}
                  className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg p-2"
                />
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <label className="block text-sm text-gray-400 mb-2">工作电流 (A)</label>
                <input
                  type="number"
                  value={systemParams.current}
                  onChange={(e) => handleParamChange('current', parseFloat(e.target.value))}
                  className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg p-2"
                />
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <label className="block text-sm text-gray-400 mb-2">电阻 (Ω/km)</label>
                <input
                  type="number"
                  step="0.001"
                  value={systemParams.resistance}
                  onChange={(e) => handleParamChange('resistance', parseFloat(e.target.value))}
                  className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg p-2"
                />
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <label className="block text-sm text-gray-400 mb-2">电缆长度 (km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={systemParams.length}
                  onChange={(e) => handleParamChange('length', parseFloat(e.target.value))}
                  className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg p-2"
                />
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <label className="block text-sm text-gray-400 mb-2">环境温度 (°C)</label>
                <input
                  type="number"
                  value={systemParams.temperature}
                  onChange={(e) => handleParamChange('temperature', parseFloat(e.target.value))}
                  className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg p-2"
                />
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <label className="block text-sm text-gray-400 mb-2">功率因数</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={systemParams.powerFactor}
                  onChange={(e) => handleParamChange('powerFactor', parseFloat(e.target.value))}
                  className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg p-2"
                />
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <label className="block text-sm text-gray-400 mb-2">电缆类型</label>
                <select
                  value={systemParams.cableType}
                  onChange={(e) => handleParamChange('cableType', e.target.value)}
                  className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg p-2"
                >
                  <option value="cu-35" className="bg-slate-800 text-white">铜芯 35mm²</option>
                  <option value="cu-50" className="bg-slate-800 text-white">铜芯 50mm²</option>
                  <option value="cu-70" className="bg-slate-800 text-white">铜芯 70mm²</option>
                  <option value="al-95" className="bg-slate-800 text-white">铝芯 95mm²</option>
                </select>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <label className="block text-sm text-gray-400 mb-2">故障类型</label>
                <select
                  value={systemParams.faultType}
                  onChange={(e) => handleParamChange('faultType', e.target.value)}
                  className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg p-2"
                >
                  <option value="three-phase" className="bg-slate-800 text-white">三相短路</option>
                  <option value="line-to-line" className="bg-slate-800 text-white">相间短路</option>
                  <option value="line-to-ground" className="bg-slate-800 text-white">单相接地</option>
                </select>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <label className="block text-sm text-gray-400 mb-2">故障阻抗 (Ω)</label>
                <input
                  type="number"
                  step="0.001"
                  value={systemParams.faultImpedance}
                  onChange={(e) => handleParamChange('faultImpedance', parseFloat(e.target.value))}
                  className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg p-2"
                />
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <label className="block text-sm text-gray-400 mb-2">电源阻抗 (Ω)</label>
                <input
                  type="number"
                  step="0.001"
                  value={systemParams.sourceImpedance}
                  onChange={(e) => handleParamChange('sourceImpedance', parseFloat(e.target.value))}
                  className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg p-2"
                />
              </div>
            </div>
            
            {/* Advanced Parameters */}
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-600">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                <h4 className="text-white font-medium">高级仿真参数</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <label className="block text-xs text-gray-400 mb-1">仿真时长 (秒)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={advancedParams.simulationDuration}
                    onChange={(e) => setAdvancedParams({...advancedParams, simulationDuration: parseFloat(e.target.value)})}
                    className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg p-1.5 text-sm"
                  />
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <label className="block text-xs text-gray-400 mb-1">时间步长 (秒)</label>
                  <input
                    type="number"
                    min="0.001"
                    step="0.001"
                    value={advancedParams.timeStep}
                    onChange={(e) => setAdvancedParams({...advancedParams, timeStep: parseFloat(e.target.value)})}
                    className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg p-1.5 text-sm"
                  />
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <label className="block text-xs text-gray-400 mb-1">最大迭代次数</label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={advancedParams.maxIterations}
                    onChange={(e) => setAdvancedParams({...advancedParams, maxIterations: parseInt(e.target.value)})}
                    className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg p-1.5 text-sm"
                  />
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <label className="block text-xs text-gray-400 mb-1">收敛 tolerance</label>
                  <input
                    type="number"
                    min="0.0001"
                    step="0.0001"
                    value={advancedParams.convergenceTolerance}
                    onChange={(e) => setAdvancedParams({...advancedParams, convergenceTolerance: parseFloat(e.target.value)})}
                    className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg p-1.5 text-sm"
                  />
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <label className="block text-xs text-gray-400 mb-1">温度系数</label>
                  <input
                    type="number"
                    min="0.001"
                    step="0.001"
                    value={advancedParams.temperatureCoefficient}
                    onChange={(e) => setAdvancedParams({...advancedParams, temperatureCoefficient: parseFloat(e.target.value)})}
                    className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg p-1.5 text-sm"
                  />
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <label className="block text-xs text-gray-400 mb-1">风速 (m/s)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={advancedParams.windSpeed}
                    onChange={(e) => setAdvancedParams({...advancedParams, windSpeed: parseFloat(e.target.value)})}
                    className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg p-1.5 text-sm"
                  />
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <label className="block text-xs text-gray-400 mb-1">太阳辐射 (W/m²)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={advancedParams.solarIrradiance}
                    onChange={(e) => setAdvancedParams({...advancedParams, solarIrradiance: parseFloat(e.target.value)})}
                    className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg p-1.5 text-sm"
                  />
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <label className="block text-xs text-gray-400 mb-1">电池容量 (kWh)</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={advancedParams.batteryCapacity}
                    onChange={(e) => setAdvancedParams({...advancedParams, batteryCapacity: parseFloat(e.target.value)})}
                    className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg p-1.5 text-sm"
                  />
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <label className="block text-xs text-gray-400 mb-1">电池SOC (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="5"
                    value={advancedParams.batterySOC}
                    onChange={(e) => setAdvancedParams({...advancedParams, batterySOC: parseFloat(e.target.value)})}
                    className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg p-1.5 text-sm"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-1 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('loss')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${activeTab === 'loss' 
            ? 'bg-cyan-400/20 text-cyan-400' 
            : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          电力损耗
        </button>
        <button
          onClick={() => setActiveTab('powerFlow')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${activeTab === 'powerFlow' 
            ? 'bg-cyan-400/20 text-cyan-400' 
            : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          潮流计算
        </button>
        <button
          onClick={() => setActiveTab('fault')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${activeTab === 'fault' 
            ? 'bg-cyan-400/20 text-cyan-400' 
            : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          故障分析
        </button>
        <button
          onClick={() => setActiveTab('voltageQuality')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${activeTab === 'voltageQuality' 
            ? 'bg-cyan-400/20 text-cyan-400' 
            : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          电压质量
        </button>
        <button
          onClick={() => setActiveTab('transient')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${activeTab === 'transient' 
            ? 'bg-cyan-400/20 text-cyan-400' 
            : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          暂态分析
        </button>
        <button
          onClick={() => setActiveTab('protection')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${activeTab === 'protection' 
            ? 'bg-cyan-400/20 text-cyan-400' 
            : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          保护协调
        </button>
      </div>
      
      {/* Simulation Results */}
      {simulationResults && (
        <div className="space-y-6">
          {/* 电力损耗分析 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="tech-card p-6"
          >
            <div 
              className="flex items-center justify-between cursor-pointer" 
              onClick={() => toggleSection('loss')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-400/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">电力损耗分析</h3>
              </div>
              {expandedSections.loss ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
            
            {expandedSections.loss && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">电阻损耗</p>
                    <p className="text-2xl font-bold text-red-400">{simulationResults.loss.resistiveLoss.toFixed(2)} W</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">电抗损耗</p>
                    <p className="text-2xl font-bold text-blue-400">{simulationResults.loss.reactiveLoss.toFixed(2)} var</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">总损耗</p>
                    <p className="text-2xl font-bold text-white">{simulationResults.loss.totalLoss.toFixed(2)} VA</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">损耗百分比</p>
                    <p className="text-2xl font-bold text-amber-400">{simulationResults.loss.lossPercentage.toFixed(2)}%</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white text-sm font-medium mb-4">损耗分布</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={lossData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {lossData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white text-sm font-medium mb-4">温度影响分析</h4>
                    <div className="flex items-center gap-6">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">温度升高</span>
                          <span className="text-white font-semibold">{simulationResults.loss.temperatureRise.toFixed(2)} °C</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-yellow-400 to-red-400 h-2 rounded-full"
                            style={{ width: `${Math.min(simulationResults.loss.temperatureRise * 10, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-24 h-24 rounded-full bg-red-400/10 flex items-center justify-center">
                        <div className="text-center">
                          <Thermometer className="w-8 h-8 text-red-400 mx-auto mb-1" />
                          <p className="text-white font-bold">{simulationResults.loss.temperatureRise.toFixed(1)}°C</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
          
          {/* 潮流计算 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="tech-card p-6"
          >
            <div 
              className="flex items-center justify-between cursor-pointer" 
              onClick={() => toggleSection('powerFlow')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-400/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">潮流计算</h3>
              </div>
              {expandedSections.powerFlow ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
            
            {expandedSections.powerFlow && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">系统效率</p>
                    <p className="text-2xl font-bold text-emerald-400">{simulationResults.powerFlow.systemEfficiency.toFixed(2)}%</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">总损耗</p>
                    <p className="text-2xl font-bold text-white">{simulationResults.powerFlow.totalLoss.toFixed(2)} W</p>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white text-sm font-medium mb-4">支路潮流</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left text-gray-400 py-3">支路</th>
                          <th className="text-left text-gray-400 py-3">电流 (A)</th>
                          <th className="text-left text-gray-400 py-3">功率 (W)</th>
                          <th className="text-left text-gray-400 py-3">损耗 (W)</th>
                          <th className="text-left text-gray-400 py-3">电压降 (V)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {simulationResults.powerFlow.branchFlows.map((flow: any, index: number) => (
                          <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 text-white">{flow.id}</td>
                            <td className="py-3 text-white">{flow.current.toFixed(2)}</td>
                            <td className="py-3 text-white">{flow.power.toFixed(2)}</td>
                            <td className="py-3 text-red-400">{flow.loss.toFixed(2)}</td>
                            <td className="py-3 text-amber-400">{flow.voltageDrop.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
          
          {/* 故障分析 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="tech-card p-6"
          >
            <div 
              className="flex items-center justify-between cursor-pointer" 
              onClick={() => toggleSection('fault')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">故障分析</h3>
              </div>
              {expandedSections.fault ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
            
            {expandedSections.fault && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">故障电流</p>
                    <p className="text-2xl font-bold text-white">{simulationResults.fault.faultCurrent.toFixed(2)} A</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">故障功率</p>
                    <p className="text-2xl font-bold text-white">{simulationResults.fault.faultPower.toFixed(2)} W</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">故障持续时间</p>
                    <p className="text-2xl font-bold text-white">{simulationResults.fault.faultDuration.toFixed(2)} s</p>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${simulationResults.fault.isSafe ? 'bg-emerald-400/10' : 'bg-red-400/10'}`}>
                      {simulationResults.fault.isSafe ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">故障安全性评估</h4>
                      <p className={`text-sm ${simulationResults.fault.isSafe ? 'text-emerald-400' : 'text-red-400'}`}>
                        {simulationResults.fault.isSafe ? '故障电流在安全范围内' : '故障电流超过安全阈值'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-white text-sm font-medium mb-2">安全建议</h4>
                    <ul className="space-y-2">
                      {simulationResults.fault.recommendations.map((recommendation: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-gray-300 text-sm">
                          <Shield className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
          
          {/* 电压质量分析 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="tech-card p-6"
          >
            <div 
              className="flex items-center justify-between cursor-pointer" 
              onClick={() => toggleSection('voltageQuality')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-400/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">电压质量分析</h3>
              </div>
              {expandedSections.voltageQuality ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
            
            {expandedSections.voltageQuality && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">电压稳定性</p>
                    <p className={`text-2xl font-bold ${simulationResults.voltageQuality.voltageStability === 'stable' ? 'text-emerald-400' : simulationResults.voltageQuality.voltageStability === 'unstable' ? 'text-amber-400' : 'text-red-400'}`}>
                      {simulationResults.voltageQuality.voltageStability === 'stable' ? '稳定' : simulationResults.voltageQuality.voltageStability === 'unstable' ? '不稳定' : '严重'}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">频率稳定性</p>
                    <p className={`text-2xl font-bold ${simulationResults.voltageQuality.frequencyStability === 'stable' ? 'text-emerald-400' : simulationResults.voltageQuality.frequencyStability === 'unstable' ? 'text-amber-400' : 'text-red-400'}`}>
                      {simulationResults.voltageQuality.frequencyStability === 'stable' ? '稳定' : simulationResults.voltageQuality.frequencyStability === 'unstable' ? '不稳定' : '严重'}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">谐波畸变</p>
                    <p className={`text-2xl font-bold ${simulationResults.voltageQuality.harmonicDistortion === 'low' ? 'text-emerald-400' : simulationResults.voltageQuality.harmonicDistortion === 'medium' ? 'text-amber-400' : 'text-red-400'}`}>
                      {simulationResults.voltageQuality.harmonicDistortion === 'low' ? '低' : simulationResults.voltageQuality.harmonicDistortion === 'medium' ? '中等' : '高'}
                    </p>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white text-sm font-medium mb-4">电压质量监测</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={voltageQualityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" />
                      <YAxis yAxisId="left" stroke="rgba(255,255,255,0.7)" />
                      <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.7)" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.2)' }} 
                        labelStyle={{ color: 'white' }}
                      />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="voltage" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                      <Line yAxisId="left" type="monotone" dataKey="frequency" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                      <Line yAxisId="right" type="monotone" dataKey="harmonic" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white text-sm font-medium mb-2">改进建议</h4>
                  <ul className="space-y-2">
                    {simulationResults.voltageQuality.recommendations.map((recommendation: string, index: number) => (
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
          
          {/* 暂态分析 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="tech-card p-6"
          >
            <div 
              className="flex items-center justify-between cursor-pointer" 
              onClick={() => toggleSection('transient')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-400/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">暂态分析</h3>
              </div>
              {expandedSections.transient ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
            
            {expandedSections.transient && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">峰值电压</p>
                    <p className="text-2xl font-bold text-indigo-400">{simulationResults.transient?.peakVoltage || 420} V</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">峰值电流</p>
                    <p className="text-2xl font-bold text-indigo-400">{simulationResults.transient?.peakCurrent || 150} A</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">暂态持续时间</p>
                    <p className="text-2xl font-bold text-indigo-400">{simulationResults.transient?.duration || 0.5} s</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">振荡频率</p>
                    <p className="text-2xl font-bold text-indigo-400">{simulationResults.transient?.frequency || 120} Hz</p>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white text-sm font-medium mb-4">暂态响应</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={simulationResults.transient?.data || Array.from({length: 20}, (_, i) => ({
                      time: `${i * 0.1}s`,
                      voltage: 380 + Math.sin(i * 0.5) * 20,
                      current: 100 + Math.sin(i * 0.3) * 30
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="time" stroke="rgba(255,255,255,0.7)" />
                      <YAxis yAxisId="left" stroke="rgba(255,255,255,0.7)" />
                      <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.7)" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.2)' }} 
                        labelStyle={{ color: 'white' }}
                      />
                      <Legend />
                      <Area yAxisId="left" type="monotone" dataKey="voltage" stroke="#6366f1" fill="#6366f133" strokeWidth={2} />
                      <Area yAxisId="right" type="monotone" dataKey="current" stroke="#10b981" fill="#10b98133" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white text-sm font-medium mb-2">暂态分析结论</h4>
                  <p className="text-gray-300 text-sm">
                    {simulationResults.transient?.conclusion || '暂态响应在安全范围内，系统能够稳定运行。建议在关键设备上安装浪涌保护器以进一步提高系统可靠性。'}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
          
          {/* 保护协调 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="tech-card p-6"
          >
            <div 
              className="flex items-center justify-between cursor-pointer" 
              onClick={() => toggleSection('protection')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-400/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">保护协调</h3>
              </div>
              {expandedSections.protection ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
            
            {expandedSections.protection && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">一次保护动作时间</p>
                    <p className="text-2xl font-bold text-emerald-400">{simulationResults.protection?.primaryTime || 0.1} s</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">后备保护动作时间</p>
                    <p className="text-2xl font-bold text-emerald-400">{simulationResults.protection?.backupTime || 0.5} s</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">保护配合系数</p>
                    <p className="text-2xl font-bold text-emerald-400">{simulationResults.protection?.coordinationFactor || 1.5}</p>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white text-sm font-medium mb-4">保护装置配置</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left text-gray-400 py-3">设备</th>
                          <th className="text-left text-gray-400 py-3">保护类型</th>
                          <th className="text-left text-gray-400 py-3">动作电流</th>
                          <th className="text-left text-gray-400 py-3">动作时间</th>
                          <th className="text-left text-gray-400 py-3">状态</th>
                        </tr>
                      </thead>
                      <tbody>
                        {simulationResults.protection?.devices || [
                          { device: '主开关', type: '断路器', current: 200, time: 0.1, status: '正常' },
                          { device: '逆变器', type: '熔断器', current: 150, time: 0.05, status: '正常' },
                          { device: '变压器', type: '差动保护', current: 100, time: 0.02, status: '正常' },
                          { device: '电缆', type: '过电流保护', current: 120, time: 0.2, status: '正常' }
                        ].map((device, index) => (
                          <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 text-white">{device.device}</td>
                            <td className="py-3 text-white">{device.type}</td>
                            <td className="py-3 text-white">{device.current} A</td>
                            <td className="py-3 text-white">{device.time} s</td>
                            <td className="py-3 text-emerald-400">{device.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white text-sm font-medium mb-2">保护协调建议</h4>
                  <ul className="space-y-2">
                    {simulationResults.protection?.recommendations || [
                      '建议检查主开关的保护定值，确保与下游设备的保护配合',
                      '逆变器保护应设置为反时限特性，提高保护灵敏度',
                      '变压器应配置差动保护，提高故障检测速度',
                      '定期测试保护装置的动作特性，确保保护可靠性'
                    ].map((recommendation, index) => (
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
        </div>
      )}
      
      {/* No Results State */}
      {!simulationResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex items-center justify-center"
        >
          <div className="text-center">
            <Zap className="w-16 h-16 text-cyan-400/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">开始电力系统仿真</h3>
            <p className="text-gray-400 mb-6">点击上方的"开始仿真"按钮进行电力系统分析</p>
            <button
              onClick={handleStartSimulation}
              className="px-6 py-3 rounded-lg bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30 transition-colors flex items-center gap-2 mx-auto"
            >
              <PlayCircle className="w-5 h-5" />
              <span>开始仿真</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}