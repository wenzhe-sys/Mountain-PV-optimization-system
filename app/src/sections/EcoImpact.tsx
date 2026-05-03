import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf,
  TreePine,
  Droplets,
  Wind,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Mountain,
  Fish,
  Clock,
  FileText,
  X,
  Shield,
  Sprout,
  BarChart3,
  Layers,
  Settings2,
  Copy,
  Download,
  Award,
  Eye,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import useAppStore from '../store/useAppStore';
import instanceService from '../services/instanceService';

// ==================== Static Data ====================

const carbonReductionData = [
  { year: 1, reduction: 28000 },
  { year: 5, reduction: 145000 },
  { year: 10, reduction: 298000 },
  { year: 15, reduction: 458000 },
  { year: 20, reduction: 625000 },
  { year: 25, reduction: 800000 },
];

const vegetationData = [
  { category: '乔木', before: 45, after: 42, unit: '公顷' },
  { category: '灌木', before: 68, after: 65, unit: '公顷' },
  { category: '草地', before: 520, after: 485, unit: '公顷' },
  { category: '裸地', before: 120, after: 85, unit: '公顷' },
];

const ecoMeasures = [
  {
    title: '植被保护',
    description: '避开生态敏感区，保留原有乔木和灌木，面板下方种植耐阴植物',
    impact: 'positive' as const,
    details: '保留原生植被 85% 以上',
  },
  {
    title: '水土保持',
    description: '采用生态护坡技术，设置排水沟和沉沙池，减少水土流失',
    impact: 'positive' as const,
    details: '水土流失减少 60%',
  },
  {
    title: '生物多样性',
    description: '设置生态通道，保护野生动物迁徙路线，维持生态系统连通性',
    impact: 'neutral' as const,
    details: '生态廊道保留率 90%',
  },
  {
    title: '土地利用',
    description: '充分利用荒山荒地，减少对耕地的占用，提高土地利用效率',
    impact: 'positive' as const,
    details: '未占用基本农田',
  },
  {
    title: '光污染控制',
    description: '合理设置面板倾角，减少光反射对周边环境的影响',
    impact: 'positive' as const,
    details: '光反射率 < 5%',
  },
  {
    title: '噪音控制',
    description: '选用低噪音逆变器，合理布局减少噪音对周边居民的影响',
    impact: 'positive' as const,
    details: '噪音 < 45dB',
  },
];

const carbonComparison = [
  { source: '本项目', amount: 32000, color: '#00d4ff' },
  { source: '同等火电', amount: 85000, color: '#ef4444' },
  { source: '同等天然气', amount: 45000, color: '#f59e0b' },
];

// Elevation-band vegetation data
const elevationVegetationData = [
  { band: '500-1000m', 阔叶林: 35, 针叶林: 10, 灌丛: 30, 草甸: 25 },
  { band: '1000-1500m', 阔叶林: 20, 针叶林: 30, 灌丛: 25, 草甸: 25 },
  { band: '1500-2000m', 阔叶林: 5, 针叶林: 40, 灌丛: 20, 草甸: 35 },
  { band: '2000-2500m', 阔叶林: 0, 针叶林: 15, 灌丛: 25, 草甸: 60 },
];

// Policy compliance items
const policyItems: { name: string; status: 'passed' | 'ongoing' | 'warning'; note: string }[] = [
  { name: '环境影响评价', status: 'passed', note: '已通过环评审批，批准文号 ENV-2024-0312' },
  { name: '水土保持方案', status: 'passed', note: '方案经水利部门审批通过，已备案' },
  { name: '生物多样性保护', status: 'passed', note: '保护规划通过专家评审' },
  { name: '林地使用审批', status: 'ongoing', note: '林地使用许可正在办理中，预计30日内完成' },
  { name: '地质灾害评估', status: 'passed', note: '评估报告已通过，场地稳定性良好' },
  { name: '噪声排放标准', status: 'passed', note: '达到 GB 3096 标准2类区限值' },
];

// Restoration plan phases
const restorationPhases = [
  {
    phase: '施工前',
    color: 'bg-blue-400',
    borderColor: 'border-blue-400/30',
    bgColor: 'bg-blue-400/10',
    measures: ['原生植被调查与样本采集', '表土剥离保存', '珍稀物种移栽保护', '临时苗圃建设'],
  },
  {
    phase: '施工中',
    color: 'bg-amber-400',
    borderColor: 'border-amber-400/30',
    bgColor: 'bg-amber-400/10',
    measures: ['扬尘抑制与噪音控制', '分区分段施工', '临时排水与防护', '施工废弃物集中处理'],
  },
  {
    phase: '施工后',
    color: 'bg-emerald-400',
    borderColor: 'border-emerald-400/30',
    bgColor: 'bg-emerald-400/10',
    measures: ['表土回填与地形恢复', '原生植被回植', '人工草籽播撒', '水土保持工程验收'],
  },
  {
    phase: '运营期',
    color: 'bg-cyan-400',
    borderColor: 'border-cyan-400/30',
    bgColor: 'bg-cyan-400/10',
    measures: ['植被恢复跟踪监测', '生态廊道维护', '水土流失定期检查', '生物多样性年度评估'],
  },
];

// Vegetation recovery rate data
const recoveryRateData = [
  { period: '施工完成', rate: 30 },
  { period: '第1年', rate: 50 },
  { period: '第2年', rate: 68 },
  { period: '第3年', rate: 78 },
  { period: '第5年', rate: 88 },
  { period: '第10年', rate: 95 },
];

// Scenario comparison configurations
const scenarioConfigs = [
  {
    name: '低密度布局',
    coverage: 25,
    ecoImpact: '低',
    ecoImpactColor: 'text-emerald-400',
    ecoScore: 92,
    power: 180,
    powerLabel: '180 MW',
    cost: 8.5,
    description: '以最小生态扰动为首要目标，适用于生态敏感区',
    tagColor: 'bg-emerald-400/20 text-emerald-400 border-emerald-400/30',
  },
  {
    name: '中密度布局',
    coverage: 40,
    ecoImpact: '中',
    ecoImpactColor: 'text-amber-400',
    ecoScore: 78,
    power: 320,
    powerLabel: '320 MW',
    cost: 7.2,
    description: '平衡生态保护与发电效益，推荐方案',
    tagColor: 'bg-amber-400/20 text-amber-400 border-amber-400/30',
  },
  {
    name: '高密度布局',
    coverage: 60,
    ecoImpact: '高',
    ecoImpactColor: 'text-red-400',
    ecoScore: 58,
    power: 480,
    powerLabel: '480 MW',
    cost: 6.0,
    description: '追求最大发电量，需额外生态修复投入',
    tagColor: 'bg-red-400/20 text-red-400 border-red-400/30',
  },
];

const scenarioBarData = [
  { metric: '生态评分', 低密度: 92, 中密度: 78, 高密度: 58 },
  { metric: '装机容量', 低密度: 180, 中密度: 320, 高密度: 480 },
  { metric: '覆盖率%', 低密度: 25, 中密度: 40, 高密度: 60 },
];

// Radar data for scenario comparison across 5 dimensions
const scenarioRadarData = [
  { dimension: '覆盖率', 低密度: 25, 中密度: 55, 高密度: 75 },
  { dimension: '生态评分', 低密度: 92, 中密度: 78, 高密度: 58 },
  { dimension: '发电能力', 低密度: 38, 中密度: 67, 高密度: 100 },
  { dimension: '成本效益', 低密度: 60, 中密度: 85, 高密度: 72 },
  { dimension: '恢复速率', 低密度: 95, 中密度: 75, 高密度: 45 },
];

// Long-term ecological monitoring milestones
const monitoringMilestones = [
  { year: 1, label: '第1年', vegetation: 50, biodiversity: 40, soilHealth: 55, waterQuality: 60, note: '初步植被恢复，开始首轮生态普查' },
  { year: 3, label: '第3年', vegetation: 68, biodiversity: 55, soilHealth: 70, waterQuality: 72, note: '灌木层基本恢复，物种多样性回升' },
  { year: 5, label: '第5年', vegetation: 82, biodiversity: 68, soilHealth: 80, waterQuality: 82, note: '乔木层开始恢复，生态廊道功能验证' },
  { year: 10, label: '第10年', vegetation: 92, biodiversity: 82, soilHealth: 90, waterQuality: 90, note: '植被群落趋于稳定，野生动物种群恢复' },
  { year: 15, label: '第15年', vegetation: 96, biodiversity: 90, soilHealth: 94, waterQuality: 94, note: '生态系统基本恢复至原始水平' },
  { year: 25, label: '第25年', vegetation: 98, biodiversity: 95, soilHealth: 97, waterQuality: 97, note: '全面达标，生态系统自我维持' },
];

// Default baseline parameters for comparison card
const DEFAULT_PV_COVERAGE = 40;
const DEFAULT_CONSTRUCTION_METHOD: ConstructionMethod = '生态施工';

// Chart animation duration (ms)
const CHART_ANIMATION_DURATION = 800;

// ==================== Construction Method Config ====================

type ConstructionMethod = '传统施工' | '生态施工' | '微创施工';

interface MethodImpact {
  vegetationRetention: number;
  soilDisturbance: number;
  carbonOffset: number;
  costMultiplier: number;
  recoveryYears: number;
}

const methodImpacts: Record<ConstructionMethod, MethodImpact> = {
  '传统施工': { vegetationRetention: 70, soilDisturbance: 40, carbonOffset: 0.85, costMultiplier: 1.0, recoveryYears: 8 },
  '生态施工': { vegetationRetention: 85, soilDisturbance: 20, carbonOffset: 1.0, costMultiplier: 1.15, recoveryYears: 5 },
  '微创施工': { vegetationRetention: 95, soilDisturbance: 8, carbonOffset: 1.1, costMultiplier: 1.35, recoveryYears: 3 },
};

// ==================== Helper: Tooltip Style ====================

const tooltipStyle = {
  contentStyle: {
    background: 'rgba(10, 15, 26, 0.95)',
    border: '1px solid rgba(0, 212, 255, 0.3)',
    borderRadius: '8px',
    color: '#ffffff',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
    padding: '12px',
    fontSize: '14px',
  },
};

// ==================== Component ====================

export default function EcoImpact() {
  const { currentInstanceId } = useAppStore();
  const totalReduction = carbonReductionData[carbonReductionData.length - 1].reduction;

  // Interactive parameter state
  const [pvCoverage, setPvCoverage] = useState(40);
  const [constructionMethod, setConstructionMethod] = useState<ConstructionMethod>('生态施工');
  const [showReport, setShowReport] = useState(false);

  // 基于算例规模动态缩放（n_nodes 默认 200 ≈ 100MW 标准电站）
  const [instanceScale, setInstanceScale] = useState<{ name?: string; nNodes?: number; factor: number }>({ factor: 1 });

  useEffect(() => {
    if (!currentInstanceId) {
      setInstanceScale({ factor: 1 });
      return;
    }
    let cancelled = false;
    instanceService.get(currentInstanceId)
      .then((data: any) => {
        if (cancelled || !data) return;
        const nNodes = data.n_nodes ?? data.processed_data?.n_nodes;
        const factor = nNodes && nNodes > 0 ? Math.max(0.3, Math.min(3, nNodes / 200)) : 1;
        setInstanceScale({ name: data.name, nNodes, factor });
      })
      .catch(() => {
        if (!cancelled) setInstanceScale({ factor: 1 });
      });
    return () => { cancelled = true; };
  }, [currentInstanceId]);

  // Derived calculations based on interactive parameters + instance scale
  const currentImpact = useMemo(() => {
    const method = methodImpacts[constructionMethod];
    const coverageFactor = pvCoverage / 40; // normalised around default 40%
    const scale = instanceScale.factor;

    const adjustedVegetation = vegetationData.map((v) => ({
      ...v,
      after: Math.round(v.before * (1 - (1 - v.after / v.before) * coverageFactor * (1 / (method.vegetationRetention / 85)))),
    }));

    const adjustedCarbon = carbonReductionData.map((d) => ({
      ...d,
      reduction: Math.round(d.reduction * coverageFactor * method.carbonOffset * scale),
    }));

    const retentionRate = Math.round(method.vegetationRetention - (pvCoverage - 40) * 0.3);
    const soilConservation = Math.round(94 - method.soilDisturbance * 0.1 * coverageFactor);

    return {
      adjustedVegetation,
      adjustedCarbon,
      retentionRate: Math.max(50, Math.min(99, retentionRate)),
      soilConservation: Math.max(60, Math.min(99, soilConservation)),
      annualCarbon: Math.round(32000 * coverageFactor * method.carbonOffset * scale),
      totalCarbon25y: Math.round(800000 * coverageFactor * method.carbonOffset * scale),
      recoveryYears: method.recoveryYears,
    };
  }, [pvCoverage, constructionMethod, instanceScale.factor]);

  // Baseline (default) impact for comparison card
  const baselineImpact = useMemo(() => {
    const method = methodImpacts[DEFAULT_CONSTRUCTION_METHOD];
    const coverageFactor = DEFAULT_PV_COVERAGE / 40;
    const scale = instanceScale.factor;
    const retentionRate = Math.round(method.vegetationRetention - (DEFAULT_PV_COVERAGE - 40) * 0.3);
    const soilConservation = Math.round(94 - method.soilDisturbance * 0.1 * coverageFactor);
    return {
      retentionRate: Math.max(50, Math.min(99, retentionRate)),
      soilConservation: Math.max(60, Math.min(99, soilConservation)),
      annualCarbon: Math.round(32000 * coverageFactor * method.carbonOffset * scale),
      totalCarbon25y: Math.round(800000 * coverageFactor * method.carbonOffset * scale),
      recoveryYears: method.recoveryYears,
      costMultiplier: method.costMultiplier,
    };
  }, [instanceScale.factor]);

  // Delta values for comparison card
  const deltas = useMemo(() => {
    const dRetention = currentImpact.retentionRate - baselineImpact.retentionRate;
    const dCarbon = currentImpact.annualCarbon - baselineImpact.annualCarbon;
    const dRecovery = currentImpact.recoveryYears - baselineImpact.recoveryYears;
    const dCost = methodImpacts[constructionMethod].costMultiplier - baselineImpact.costMultiplier;
    return { dRetention, dCarbon, dRecovery, dCost };
  }, [currentImpact, baselineImpact, constructionMethod]);

  // Whether current params differ from defaults
  const isModified = pvCoverage !== DEFAULT_PV_COVERAGE || constructionMethod !== DEFAULT_CONSTRUCTION_METHOD;

  // Report data builder
  const buildReportData = useCallback(() => ({
    reportId: 'ECO-RPT-2024-001',
    generatedAt: new Date().toISOString(),
    parameters: { pvCoverage, constructionMethod },
    impact: {
      retentionRate: currentImpact.retentionRate,
      soilConservation: currentImpact.soilConservation,
      annualCarbonReduction: currentImpact.annualCarbon,
      totalCarbon25y: currentImpact.totalCarbon25y,
      recoveryYears: currentImpact.recoveryYears,
    },
    policyCompliance: policyItems.map((p) => ({ name: p.name, status: p.status, note: p.note })),
    scenarios: scenarioConfigs.map((s) => ({ name: s.name, coverage: s.coverage, ecoScore: s.ecoScore, power: s.power, cost: s.cost })),
  }), [pvCoverage, constructionMethod, currentImpact]);

  // Copy report text to clipboard
  const handleCopyReport = useCallback(async () => {
    const data = buildReportData();
    const text = [
      `生态影响评估报告 - ${data.reportId}`,
      `生成日期: ${data.generatedAt}`,
      `\n参数: 光伏覆盖率 ${data.parameters.pvCoverage}%, 施工方式 ${data.parameters.constructionMethod}`,
      `\n生态影响:`,
      `  植被保留率: ${data.impact.retentionRate}%`,
      `  水土保持率: ${data.impact.soilConservation}%`,
      `  25年碳减排: ${(data.impact.totalCarbon25y / 10000).toFixed(0)} 万吨`,
      `  植被恢复周期: ${data.impact.recoveryYears} 年`,
      `\n政策合规:`,
      ...data.policyCompliance.map((p) => `  ${p.name}: ${p.status === 'passed' ? '已通过' : '进行中'}`),
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // fallback silently
    }
  }, [buildReportData]);

  // Export report as JSON file
  const handleExportJSON = useCallback(() => {
    const data = buildReportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eco-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [buildReportData]);

  const [copySuccess, setCopySuccess] = useState(false);

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-auto">
      {/* ========== Hero Image ========== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-48 rounded-2xl overflow-hidden flex-shrink-0"
      >
        <img
          src="/images/eco-solar.jpg"
          alt="Eco Solar"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 flex items-center p-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">生态影响评估</h1>
            <p className="text-gray-300 max-w-xl">
              山地光伏电站建设与生态环境和谐共存，通过科学规划和生态保护措施，
              实现清洁能源发展与环境保护的双赢。
            </p>
          </div>
        </div>
      </motion.div>

      {/* 数据来源说明 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/25 backdrop-blur-sm"
      >
        <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
        <p className="text-emerald-200/70 text-xs">
          生态影响评估基于行业标准参数模型和统计数据，非特定电站实测数据。
          碳减排量按照国家发改委公布的电网基准排放因子计算，植被保留率、水土保持数据参考同类工程经验值。
          您可通过下方控件调整光伏覆盖率和施工方式，模拟不同方案的生态影响。
          {instanceScale.nNodes && (
            <span className="text-emerald-300"> 当前关联算例 {instanceScale.name || currentInstanceId}（{instanceScale.nNodes} 节点，规模因子 ×{instanceScale.factor.toFixed(2)}）。</span>
          )}
        </p>
      </motion.div>

      {/* ========== Key Metrics ========== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="tech-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-400/10 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">25年碳减排</p>
            <p className="text-2xl font-bold text-white">{(currentImpact.totalCarbon25y / 10000).toFixed(0)}万吨</p>
          </div>
        </div>

        <div className="tech-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center">
            <TreePine className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">植被保留率</p>
            <p className="text-2xl font-bold text-white">{currentImpact.retentionRate}%</p>
          </div>
        </div>

        <div className="tech-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-400/10 flex items-center justify-center">
            <Droplets className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">水土保持率</p>
            <p className="text-2xl font-bold text-white">{currentImpact.soilConservation}%</p>
          </div>
        </div>

        <div className="tech-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center">
            <Wind className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">替代标煤</p>
            <p className="text-2xl font-bold text-white">32万吨/年</p>
          </div>
        </div>
      </motion.div>

      {/* ========== Interactive Analysis Controls ========== */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="tech-card p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Settings2 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">交互式参数分析</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PV Coverage Slider */}
          <div>
            <label className="text-gray-300 text-sm block mb-2">
              光伏覆盖率: <span className="text-cyan-400 font-semibold">{pvCoverage}%</span>
            </label>
            <input
              type="range"
              min={10}
              max={80}
              step={1}
              value={pvCoverage}
              onChange={(e) => setPvCoverage(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10%</span>
              <span>40%（默认）</span>
              <span>80%</span>
            </div>
          </div>

          {/* Construction Method Selector */}
          <div>
            <label className="text-gray-300 text-sm block mb-2">施工方式</label>
            <div className="flex gap-2">
              {(['传统施工', '生态施工', '微创施工'] as ConstructionMethod[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setConstructionMethod(m)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                    constructionMethod === m
                      ? 'bg-cyan-400/20 border-cyan-400/50 text-cyan-400'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Impact Difference Display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">植被保留率</p>
            <p className="text-lg font-bold text-emerald-400">{currentImpact.retentionRate}%</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">年碳减排</p>
            <p className="text-lg font-bold text-cyan-400">{(currentImpact.annualCarbon / 10000).toFixed(1)}万吨</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">植被恢复周期</p>
            <p className="text-lg font-bold text-amber-400">{currentImpact.recoveryYears}年</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">成本系数</p>
            <p className="text-lg font-bold text-purple-400">x{methodImpacts[constructionMethod].costMultiplier.toFixed(2)}</p>
          </div>
        </div>

        {/* Before/After Comparison Card */}
        <AnimatePresence>
          {isModified && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 bg-gradient-to-r from-cyan-400/5 to-purple-400/5 border border-cyan-400/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-medium text-cyan-400">当前参数 vs 默认参数</span>
                  <span className="text-xs text-gray-500 ml-auto">默认: 40%覆盖 + 生态施工</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-400 mb-1">植被保留率</p>
                    <p className={`text-sm font-bold ${deltas.dRetention >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {deltas.dRetention >= 0 ? '+' : ''}{deltas.dRetention}%
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-400 mb-1">年碳减排</p>
                    <p className={`text-sm font-bold ${deltas.dCarbon >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {deltas.dCarbon >= 0 ? '+' : ''}{(deltas.dCarbon / 10000).toFixed(1)}万吨
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-400 mb-1">恢复周期</p>
                    <p className={`text-sm font-bold ${deltas.dRecovery <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {deltas.dRecovery > 0 ? '+' : ''}{deltas.dRecovery}年
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-400 mb-1">成本系数差</p>
                    <p className={`text-sm font-bold ${deltas.dCost <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {deltas.dCost >= 0 ? '+' : ''}{deltas.dCost.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ========== Main Content Grid ========== */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Carbon Reduction Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="tech-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">累计碳减排量</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentImpact.adjustedCarbon}>
                <defs>
                  <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="year" stroke="#6b7280" fontSize={12} label={{ value: '年份', position: 'insideBottom', offset: -5 }} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number) => [`${(value / 10000).toFixed(1)}万吨`, '碳减排量']}
                />
                <Area type="monotone" dataKey="reduction" stroke="#10b981" fill="url(#colorCarbon)" name="碳减排量" animationDuration={CHART_ANIMATION_DURATION} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 bg-emerald-400/10 rounded-lg p-4 border border-emerald-400/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">环保效益</span>
            </div>
            <p className="text-gray-300 text-sm">
              项目运行25年累计减排二氧化碳{' '}
              <span className="text-emerald-400 font-semibold">{(currentImpact.totalCarbon25y / 10000).toFixed(0)}万吨</span>，
              相当于种植{' '}
              <span className="text-emerald-400 font-semibold">
                {Math.round((currentImpact.totalCarbon25y / 800000) * 4400)}万棵
              </span>{' '}
              树木的环保效益。
            </p>
          </div>
        </motion.div>

        {/* Vegetation Impact */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="tech-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">植被覆盖变化</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentImpact.adjustedVegetation}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="category" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="before" fill="#6b7280" name="建设前" radius={[4, 4, 0, 0]} animationDuration={CHART_ANIMATION_DURATION} />
                <Bar dataKey="after" fill="#10b981" name="建设后" radius={[4, 4, 0, 0]} animationDuration={CHART_ANIMATION_DURATION} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-gray-500" /> 建设前
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-400" /> 建设后
            </span>
          </div>
        </motion.div>

        {/* Eco Measures */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="tech-card p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-white mb-4">生态保护措施</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ecoMeasures.map((measure, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  measure.impact === 'positive'
                    ? 'bg-emerald-400/10 border-emerald-400/30'
                    : 'bg-amber-400/10 border-amber-400/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {measure.impact === 'positive' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                  )}
                  <span className={`font-medium ${measure.impact === 'positive' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {measure.title}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-2">{measure.description}</p>
                <p className={`text-xs ${measure.impact === 'positive' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {measure.details}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Carbon Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="tech-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">年碳排放对比</h3>
          <div className="space-y-4">
            {carbonComparison.map((item) => (
              <div key={item.source} className="flex items-center gap-4">
                <span className="w-24 text-white text-sm">{item.source}</span>
                <div className="flex-1 h-8 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${(item.amount / 85000) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
                <span className="w-24 text-right text-white font-semibold">{(item.amount / 10000).toFixed(1)}万吨</span>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-emerald-400/10 rounded-lg p-4 border border-emerald-400/30">
            <p className="text-gray-300 text-sm">
              相比同等规模火电站，本项目每年可减少碳排放{' '}
              <span className="text-emerald-400 font-semibold">5.3万吨</span>，
              减排比例达到 <span className="text-emerald-400 font-semibold">62.4%</span>。
            </p>
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="tech-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">生态评估结论</h3>
          <div className="space-y-4">
            {[
              { title: '生态影响可控', desc: '项目选址避开生态敏感区，对当地生态系统影响在可接受范围内' },
              { title: '保护措施完善', desc: '制定了完善的水土保持和植被恢复方案，确保生态修复效果' },
              { title: '碳减排贡献显著', desc: '项目全生命周期碳减排效益显著，符合国家双碳战略目标' },
              { title: '可持续发展', desc: '项目运营期间可持续发挥生态效益，实现经济与环保双赢' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
                <div>
                  <p className="text-white font-medium">{item.title}</p>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ========== Mountain Ecology Analysis ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Mountain className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">山地生态特色分析</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Elevation Vegetation Distribution */}
          <div className="tech-card p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">海拔带植被分布</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={elevationVegetationData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis type="number" stroke="#6b7280" fontSize={12} unit="%" />
                  <YAxis dataKey="band" type="category" stroke="#6b7280" fontSize={12} width={90} />
                  <Tooltip {...tooltipStyle} formatter={(value: number) => [`${value}%`]} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
                  <Bar dataKey="阔叶林" stackId="veg" fill="#10b981" animationDuration={CHART_ANIMATION_DURATION} />
                  <Bar dataKey="针叶林" stackId="veg" fill="#059669" animationDuration={CHART_ANIMATION_DURATION} />
                  <Bar dataKey="灌丛" stackId="veg" fill="#f59e0b" animationDuration={CHART_ANIMATION_DURATION} />
                  <Bar dataKey="草甸" stackId="veg" fill="#06b6d4" animationDuration={CHART_ANIMATION_DURATION} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column: Watershed + Wildlife */}
          <div className="space-y-6">
            {/* Mountain Water System Impact */}
            <div className="tech-card p-5 bg-blue-400/5 border border-blue-400/20">
              <div className="flex items-center gap-2 mb-3">
                <Droplets className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-semibold text-white">山地水系影响</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>设置生态截水沟，保护上游水源涵养区</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>施工区域距离主要溪流 &ge; 50m 缓冲带</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>雨水收集系统：年均收集量 12,000m&sup3;</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>流域水质监测站 3 处，持续跟踪水质变化</span>
                </li>
              </ul>
            </div>

            {/* Wildlife Migration Corridors */}
            <div className="tech-card p-5 bg-amber-400/5 border border-amber-400/20">
              <div className="flex items-center gap-2 mb-3">
                <Fish className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-semibold text-white">野生动物迁徙通道</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-400">保留通道</p>
                  <p className="text-lg font-bold text-amber-400">5 条</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-400">通道宽度</p>
                  <p className="text-lg font-bold text-amber-400">&ge;30m</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-400">廊道保留率</p>
                  <p className="text-lg font-bold text-amber-400">90%</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-400">监测物种</p>
                  <p className="text-lg font-bold text-amber-400">23 种</p>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                已识别并保留主要野生动物迁徙路线，通过红外相机持续监测。
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ========== Policy Compliance Analysis ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="tech-card p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">政策合规分析</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {policyItems.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border ${
                item.status === 'passed'
                  ? 'bg-emerald-400/10 border-emerald-400/30'
                  : item.status === 'ongoing'
                  ? 'bg-amber-400/10 border-amber-400/30'
                  : 'bg-red-400/10 border-red-400/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {item.status === 'passed' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {item.status === 'ongoing' && <Clock className="w-5 h-5 text-amber-400" />}
                {item.status === 'warning' && <AlertCircle className="w-5 h-5 text-red-400" />}
                <span
                  className={`font-medium ${
                    item.status === 'passed'
                      ? 'text-emerald-400'
                      : item.status === 'ongoing'
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}
                >
                  {item.name}
                </span>
                <span
                  className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                    item.status === 'passed'
                      ? 'bg-emerald-400/20 text-emerald-400'
                      : item.status === 'ongoing'
                      ? 'bg-amber-400/20 text-amber-400'
                      : 'bg-red-400/20 text-red-400'
                  }`}
                >
                  {item.status === 'passed' ? '已通过' : item.status === 'ongoing' ? '进行中' : '待处理'}
                </span>
              </div>
              <p className="text-gray-400 text-xs">{item.note}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ========== Ecological Restoration Plan ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Sprout className="w-6 h-6 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">生态修复方案</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Restoration Timeline */}
          <div className="tech-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">修复阶段时间线</h3>
            <div className="space-y-4">
              {restorationPhases.map((phase, idx) => (
                <div key={idx} className={`p-4 rounded-lg border ${phase.bgColor} ${phase.borderColor}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-full ${phase.color} text-black flex items-center justify-center text-sm font-bold`}>
                      {idx + 1}
                    </div>
                    <span className="text-white font-medium">{phase.phase}</span>
                  </div>
                  <ul className="ml-11 space-y-1">
                    {phase.measures.map((m, mIdx) => (
                      <li key={mIdx} className="text-gray-300 text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0" />
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Vegetation Recovery Rate Chart */}
          <div className="tech-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">预期植被恢复率</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={recoveryRateData}>
                  <defs>
                    <linearGradient id="colorRecovery" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="period" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} unit="%" domain={[0, 100]} />
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(value: number) => [`${value}%`, '植被恢复率']}
                  />
                  <Area type="monotone" dataKey="rate" stroke="#10b981" fill="url(#colorRecovery)" strokeWidth={2} animationDuration={CHART_ANIMATION_DURATION} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 bg-emerald-400/10 rounded-lg p-4 border border-emerald-400/30">
              <p className="text-gray-300 text-sm">
                采用「{constructionMethod}」方案，预计施工区域植被将在{' '}
                <span className="text-emerald-400 font-semibold">{currentImpact.recoveryYears}年</span>{' '}
                内恢复至施工前 <span className="text-emerald-400 font-semibold">90%</span> 以上水平。
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ========== Long-term Ecological Monitoring Timeline ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.78 }}
        className="tech-card p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">长期生态监测时间线</h3>
          <span className="text-xs text-gray-500 ml-auto">监测周期: 25年</span>
        </div>

        {/* Horizontal Timeline */}
        <div className="relative">
          {/* Timeline axis */}
          <div className="hidden md:block absolute top-6 left-8 right-8 h-0.5 bg-gradient-to-r from-cyan-400/60 via-emerald-400/60 to-emerald-400/60" />

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-2">
            {monitoringMilestones.map((milestone, idx) => {
              const progress = milestone.vegetation;
              const dotColor =
                progress < 60 ? 'bg-amber-400 shadow-amber-400/40' :
                progress < 85 ? 'bg-cyan-400 shadow-cyan-400/40' :
                'bg-emerald-400 shadow-emerald-400/40';
              return (
                <div key={idx} className="flex flex-col items-center text-center">
                  {/* Dot on timeline */}
                  <div className={`w-3.5 h-3.5 rounded-full ${dotColor} shadow-lg relative z-10 mb-3 ring-2 ring-black`} />

                  {/* Year Label */}
                  <span className="text-sm font-bold text-white mb-1">{milestone.label}</span>

                  {/* Metrics mini-grid */}
                  <div className="w-full space-y-1.5 mb-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">植被</span>
                      <span className="text-emerald-400 font-medium">{milestone.vegetation}%</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full transition-all duration-700" style={{ width: `${milestone.vegetation}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">生物</span>
                      <span className="text-cyan-400 font-medium">{milestone.biodiversity}%</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-full transition-all duration-700" style={{ width: `${milestone.biodiversity}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">土壤</span>
                      <span className="text-blue-400 font-medium">{milestone.soilHealth}%</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full transition-all duration-700" style={{ width: `${milestone.soilHealth}%` }} />
                    </div>
                  </div>

                  {/* Note */}
                  <p className="text-[10px] text-gray-500 leading-tight">{milestone.note}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-white/5 text-xs text-gray-400 justify-center">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> 植被恢复率
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> 生物多样性
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400" /> 土壤健康
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 ring-1 ring-amber-400/30" /> 恢复中
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-emerald-400/30" /> 已达标
          </span>
        </div>
      </motion.div>

      {/* ========== Scenario Comparison ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">方案对比分析</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {scenarioConfigs.map((scenario, idx) => (
            <div
              key={idx}
              className={`tech-card p-5 relative overflow-hidden transition-all duration-300 ${
                idx === 1 ? 'ring-2 ring-cyan-400/40 shadow-[0_0_24px_rgba(0,212,255,0.15)]' : ''
              }`}
            >
              {idx === 1 && (
                <>
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-400" />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-cyan-400/20 text-cyan-400 text-xs px-3 py-1 rounded-full border border-cyan-400/30">
                    <Award className="w-3.5 h-3.5" />
                    <span className="font-semibold">最优推荐</span>
                  </div>
                </>
              )}
              <h4 className="text-white font-semibold text-base mb-1">{scenario.name}</h4>
              <p className="text-gray-400 text-xs mb-3">{scenario.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">覆盖率</span>
                  <span className="text-white font-medium">{scenario.coverage}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">生态影响</span>
                  <span className={`font-medium ${scenario.ecoImpactColor}`}>{scenario.ecoImpact}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">生态评分</span>
                  <span className="text-white font-medium">{scenario.ecoScore}/100</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">装机容量</span>
                  <span className="text-white font-medium">{scenario.powerLabel}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">度电成本</span>
                  <span className="text-white font-medium">{scenario.cost} 分/kWh</span>
                </div>
              </div>
              {/* Mini coverage bar */}
              <div className="mt-3">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${scenario.coverage}%`,
                      backgroundColor: idx === 0 ? '#10b981' : idx === 1 ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scenario Comparison Bar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="tech-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">方案指标对比</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scenarioBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="metric" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="低密度" fill="#10b981" radius={[4, 4, 0, 0]} animationDuration={CHART_ANIMATION_DURATION} />
                  <Bar dataKey="中密度" fill="#f59e0b" radius={[4, 4, 0, 0]} animationDuration={CHART_ANIMATION_DURATION} />
                  <Bar dataKey="高密度" fill="#ef4444" radius={[4, 4, 0, 0]} animationDuration={CHART_ANIMATION_DURATION} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Scenario Radar Chart */}
          <div className="tech-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">五维雷达对比</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={80} data={scenarioRadarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.2)" />
                  <PolarAngleAxis dataKey="dimension" stroke="#6b7280" fontSize={11} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#6b7280" fontSize={10} />
                  <Radar name="低密度" dataKey="低密度" stroke="#10b981" fill="#10b981" fillOpacity={0.2} animationDuration={CHART_ANIMATION_DURATION} />
                  <Radar name="中密度" dataKey="中密度" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} animationDuration={CHART_ANIMATION_DURATION} />
                  <Radar name="高密度" dataKey="高密度" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} animationDuration={CHART_ANIMATION_DURATION} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Tooltip {...tooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ========== Report Generation ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85 }}
        className="flex justify-center pb-6"
      >
        <button
          onClick={() => setShowReport(true)}
          className="flex items-center gap-2 px-8 py-3 bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-400 font-semibold rounded-xl border border-cyan-400/30 transition-all hover:scale-105"
        >
          <FileText className="w-5 h-5" />
          生成生态影响报告
        </button>
      </motion.div>

      {/* ========== Report Modal ========== */}
      <AnimatePresence>
        {showReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowReport(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0f1a] border border-cyan-400/30 rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-auto p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-xl font-bold text-white">生态影响评估报告</h2>
                </div>
                <button onClick={() => setShowReport(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Report Content */}
              <div className="space-y-5 text-sm text-gray-300">
                <div className="bg-cyan-400/10 border border-cyan-400/20 rounded-lg p-4">
                  <p className="text-cyan-400 font-semibold mb-1">报告编号: ECO-RPT-2024-001</p>
                  <p>生成日期: 2024年12月 | 评估单位: 山地光伏生态研究院</p>
                </div>

                <section>
                  <h3 className="text-white font-semibold text-base mb-2">一、项目概况</h3>
                  <p>
                    本项目位于山地区域，海拔范围 500-2500m，总规划面积约 850 公顷。
                    采用「{constructionMethod}」方案，光伏覆盖率 {pvCoverage}%，
                    预计装机容量 {Math.round(480 * (pvCoverage / 60))} MW。
                  </p>
                </section>

                <section>
                  <h3 className="text-white font-semibold text-base mb-2">二、生态影响摘要</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-gray-400 text-xs">植被保留率</p>
                      <p className="text-emerald-400 font-bold text-lg">{currentImpact.retentionRate}%</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-gray-400 text-xs">水土保持率</p>
                      <p className="text-blue-400 font-bold text-lg">{currentImpact.soilConservation}%</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-gray-400 text-xs">25年累计碳减排</p>
                      <p className="text-cyan-400 font-bold text-lg">{(currentImpact.totalCarbon25y / 10000).toFixed(0)} 万吨</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-gray-400 text-xs">植被恢复周期</p>
                      <p className="text-amber-400 font-bold text-lg">{currentImpact.recoveryYears} 年</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-white font-semibold text-base mb-2">三、政策合规情况</h3>
                  <ul className="space-y-1">
                    {policyItems.map((p, i) => (
                      <li key={i} className="flex items-center gap-2">
                        {p.status === 'passed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-400" />
                        )}
                        <span>{p.name}：{p.status === 'passed' ? '已通过' : '进行中'}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="text-white font-semibold text-base mb-2">四、生态修复方案</h3>
                  <p>
                    项目计划分四个阶段实施生态修复（施工前、施工中、施工后、运营期），
                    包括表土保存、原生植被移栽、人工植被恢复等措施。预计施工区域植被
                    将在 {currentImpact.recoveryYears} 年内恢复至施工前 90% 以上水平。
                  </p>
                </section>

                <section>
                  <h3 className="text-white font-semibold text-base mb-2">五、评估结论</h3>
                  <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-lg p-4">
                    <p>
                      综合评估认为，本项目在采取充分生态保护措施的前提下，对山地生态环境的影响
                      在可接受范围内。项目全生命周期碳减排效益显著（25年累计{' '}
                      {(currentImpact.totalCarbon25y / 10000).toFixed(0)} 万吨CO2），
                      符合国家双碳战略目标和生态文明建设要求。建议按计划推进实施，并持续加强生态监测。
                    </p>
                  </div>
                </section>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3 justify-end">
                <button
                  onClick={handleCopyReport}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg border font-medium text-sm transition-all ${
                    copySuccess
                      ? 'bg-emerald-400/20 border-emerald-400/30 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {copySuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      复制到剪贴板
                    </>
                  )}
                </button>
                <button
                  onClick={handleExportJSON}
                  className="flex items-center gap-2 px-5 py-2 bg-white/5 hover:bg-white/10 text-gray-300 font-medium text-sm rounded-lg border border-white/10 transition-all"
                >
                  <Download className="w-4 h-4" />
                  导出JSON
                </button>
                <button
                  onClick={() => setShowReport(false)}
                  className="px-6 py-2 bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-400 font-medium rounded-lg border border-cyan-400/30 transition-all"
                >
                  关闭报告
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
