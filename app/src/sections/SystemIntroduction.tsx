import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  TrendingDown,
  Zap,
  FileText,
  ArrowRight,
  CheckCircle,
  Sun,
  Mountain,
  Network,
  DollarSign,
  Clock,
  BarChart3,
  Building2,
  Globe,
  Cog,
  Database,
  LineChart,
  Shield,
  Lightbulb,
  Gauge,
  Calculator,
  Users,
  Award,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Presentation,
  FileSpreadsheet,
  Download
} from 'lucide-react';

const SystemIntroduction = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>('problems');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen mountain-pv-intro-bg p-4 space-y-3 w-full relative overflow-hidden">
      {/* ===== Hero Section ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 relative z-10 pt-8"
      >
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-4xl md:text-5xl font-semibold text-white"
        >
          山地光伏智能设计系统
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-base text-gray-400 max-w-3xl mx-auto leading-relaxed"
        >
          专注山地光伏设计领域，运用智能算法与数据驱动决策，为企业提供专业的设计方案优化工具
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3 text-sm text-gray-400"
        >
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            智能算法驱动
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-500" />
            数据驱动决策
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-500" />
            降低建设成本
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            专业报告输出
          </span>
        </motion.div>
      </motion.div>

      {/* 光伏设计企业面临的核心挑战 */}
      <section className="py-2 px-3 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl overflow-hidden"
          >
            <div
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-700/20 transition-all duration-300"
              onClick={() => toggleSection('problems')}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-white">光伏设计企业面临的核心挑战</h2>
                  <p className="text-slate-400 text-sm mt-0.5">为什么需要一个智能设计系统？</p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: expandedSection === 'problems' ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {expandedSection === 'problems' ? (
                  <ChevronDown className="w-6 h-6 text-slate-400" />
                ) : (
                  <ChevronRight className="w-6 h-6 text-slate-400" />
                )}
              </motion.div>
            </div>

            <AnimatePresence>
              {expandedSection === 'problems' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-xl p-5 border border-red-500/20 backdrop-blur-sm hover:border-red-500/40 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-red-400" />
                        </div>
                        <h3 className="font-semibold text-white">设计周期长</h3>
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed">山地地形复杂，传统方法需要反复现场勘测和人工计算，一个项目设计周期长达2-3个月</p>
                      <p className="text-xs text-red-400 mt-3 font-medium">痛点：时间成本高，人力投入大</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -5 }}
                      className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-xl p-5 border border-amber-500/20 backdrop-blur-sm hover:border-amber-500/40 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-amber-400" />
                        </div>
                        <h3 className="font-semibold text-white">成本控制难</h3>
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed">设备选型、电缆路由、施工方案都需要精细计算，稍有不慎就会造成成本超支</p>
                      <p className="text-xs text-amber-400 mt-3 font-medium">痛点：预算不可控，利润被压缩</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -5 }}
                      className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl p-5 border border-purple-500/20 backdrop-blur-sm hover:border-purple-500/40 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <Gauge className="w-5 h-5 text-purple-400" />
                        </div>
                        <h3 className="font-semibold text-white">效率优化难</h3>
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed">山坡朝向、阴影遮挡、面板间距等因素众多，人工难以找到最优方案</p>
                      <p className="text-xs text-purple-400 mt-3 font-medium">痛点：发电效率低，投资回报差</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -5 }}
                      className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-5 border border-blue-500/20 backdrop-blur-sm hover:border-blue-500/40 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-400" />
                        </div>
                        <h3 className="font-semibold text-white">报告撰写繁</h3>
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed">可行性报告、技术方案、投资分析需要大量时间整理数据和编写文档</p>
                      <p className="text-xs text-blue-400 mt-3 font-medium">痛点：文档工作量大，质量难保证</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -5 }}
                      className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 rounded-xl p-5 border border-cyan-500/20 backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                          <Shield className="w-5 h-5 text-cyan-400" />
                        </div>
                        <h3 className="font-semibold text-white">风险评估难</h3>
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed">地质条件、极端天气、设备故障等风险难以量化评估</p>
                      <p className="text-xs text-cyan-400 mt-3 font-medium">痛点：项目风险不可预测</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -5 }}
                      className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-xl p-5 border border-emerald-500/20 backdrop-blur-sm hover:border-emerald-500/40 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                          <Lightbulb className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h3 className="font-semibold text-white">方案对比少</h3>
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed">没有量化工具，很难在多个设计方案中做出最优选择</p>
                      <p className="text-xs text-emerald-400 mt-3 font-medium">痛点：决策缺乏数据支撑</p>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* 我们的解决方案 */}
      <section className="py-2 px-3 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6"
          >
            <div
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-700/20 transition-all duration-300"
              onClick={() => toggleSection('solution')}
            >
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-14 h-14 bg-gradient-to-br from-emerald-500/30 to-emerald-600/30 rounded-xl flex items-center justify-center border border-emerald-500/30 glow-emerald"
                >
                  <Sparkles className="w-7 h-7 text-emerald-400" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-white">我们的解决方案</h2>
                  <p className="text-gray-400 text-sm mt-1">系统如何帮助企业解决这些问题？</p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: expandedSection === 'solution' ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {expandedSection === 'solution' ? (
                  <ChevronDown className="w-6 h-6 text-slate-400" />
                ) : (
                  <ChevronRight className="w-6 h-6 text-slate-400" />
                )}
              </motion.div>
            </div>

            <AnimatePresence>
              {expandedSection === 'solution' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 space-y-6">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-emerald-500/20 rounded-2xl p-6 border border-white/10 backdrop-blur-sm"
                    >
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-cyan-400" />
                        核心价值主张
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        将复杂的山地光伏设计问题转化为<strong className="text-cyan-400">标准化算例</strong>，
                        通过<strong className="text-emerald-400">先进算法</strong>快速生成最优设计方案，
                        以<strong className="text-amber-400">可视化方式</strong>呈现设计效果，
                        最终<strong className="text-purple-400">辅助决策</strong>，<strong className="text-rose-400">降低成本</strong>。
                      </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-xl p-5 border border-emerald-500/20 backdrop-blur-sm hover:border-emerald-500/40 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <TrendingDown className="w-5 h-5 text-emerald-400" />
                          </div>
                          <h4 className="font-semibold text-white">设计成本降低</h4>
                        </div>
                        <ul className="space-y-2 text-sm text-gray-400">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                            <span>算法自动优化，无需反复人工计算</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                            <span>设计周期从3个月缩短到1周</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                            <span>减少现场勘测次数，节省人力成本</span>
                          </li>
                        </ul>
                      </motion.div>

                      <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 rounded-xl p-5 border border-cyan-500/20 backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                            <LineChart className="w-5 h-5 text-cyan-400" />
                          </div>
                          <h4 className="font-semibold text-white">建设成本降低</h4>
                        </div>
                        <ul className="space-y-2 text-sm text-gray-400">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5" />
                            <span>智能电缆路由，减少电缆用量15-20%</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5" />
                            <span>优化设备选型，避免过度配置</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5" />
                            <span>减少施工难度，优化运输方案</span>
                          </li>
                        </ul>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* 专业报告示例 */}
      <section className="py-2 px-3 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl overflow-hidden"
          >
            <div
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-700/20 transition-all duration-300"
              onClick={() => toggleSection('report')}
            >
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-14 h-14 bg-gradient-to-br from-purple-500/30 to-purple-600/30 rounded-xl flex items-center justify-center border border-purple-500/30 glow-purple"
                >
                  <Presentation className="w-7 h-7 text-purple-400" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-white">专业报告示例</h2>
                  <p className="text-gray-400 text-sm mt-1">AI辅助生成的专业报告包含哪些内容？</p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: expandedSection === 'report' ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {expandedSection === 'report' ? (
                  <ChevronDown className="w-6 h-6 text-slate-400" />
                ) : (
                  <ChevronRight className="w-6 h-6 text-slate-400" />
                )}
              </motion.div>
            </div>

            <AnimatePresence>
              {expandedSection === 'report' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl p-5 border border-purple-500/20 backdrop-blur-sm hover:border-purple-500/40 transition-all duration-300"
                    >
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-purple-400" />
                        专业报告结构
                      </h3>
                      <div className="space-y-3">
                        <motion.div whileHover={{ x: 5 }} className="flex items-center gap-3 p-3 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-lg border border-cyan-500/20">
                          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 text-white text-sm flex items-center justify-center font-bold shadow-lg">1</span>
                          <div>
                            <p className="text-white font-medium">项目概述</p>
                            <p className="text-xs text-slate-400">项目背景、建设规模、地理位置</p>
                          </div>
                        </motion.div>
                        <motion.div whileHover={{ x: 5 }} className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-500/10 to-transparent rounded-lg border border-emerald-500/20">
                          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-sm flex items-center justify-center font-bold shadow-lg">2</span>
                          <div>
                            <p className="text-white font-medium">地形与环境分析</p>
                            <p className="text-xs text-slate-400">3D地形模型、坡度分析、阴影分析</p>
                          </div>
                        </motion.div>
                        <motion.div whileHover={{ x: 5 }} className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-500/10 to-transparent rounded-lg border border-amber-500/20">
                          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white text-sm flex items-center justify-center font-bold shadow-lg">3</span>
                          <div>
                            <p className="text-white font-medium">模块一：面板布局优化</p>
                            <p className="text-xs text-slate-400">分区规划、面板选型、倾角优化</p>
                          </div>
                        </motion.div>
                        <motion.div whileHover={{ x: 5 }} className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-500/10 to-transparent rounded-lg border border-blue-500/20">
                          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm flex items-center justify-center font-bold shadow-lg">4</span>
                          <div>
                            <p className="text-white font-medium">模块二：电缆路由与设备选型</p>
                            <p className="text-xs text-slate-400">电缆路径优化、设备选型、共沟设计</p>
                          </div>
                        </motion.div>
                        <motion.div whileHover={{ x: 5 }} className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-500/10 to-transparent rounded-lg border border-purple-500/20">
                          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white text-sm flex items-center justify-center font-bold shadow-lg">5</span>
                          <div>
                            <p className="text-white font-medium">模块三：多目标优化</p>
                            <p className="text-xs text-slate-400">成本效益分析、发电量预测</p>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -5 }}
                      className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 rounded-xl p-5 border border-cyan-500/20 backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-300"
                    >
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Download className="w-5 h-5 text-cyan-400" />
                        支持导出的报告格式
                      </h3>
                      <div className="space-y-3">
                        <motion.div whileHover={{ x: 5 }} className="px-4 py-4 bg-gradient-to-r from-red-500/10 to-transparent rounded-lg border border-red-500/20 flex items-center gap-3">
                          <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-red-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">PDF报告</p>
                            <p className="text-xs text-slate-400">完整版演示文稿</p>
                          </div>
                        </motion.div>
                        <motion.div whileHover={{ x: 5 }} className="px-4 py-4 bg-gradient-to-r from-blue-500/10 to-transparent rounded-lg border border-blue-500/20 flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <FileSpreadsheet className="w-6 h-6 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">Excel数据</p>
                            <p className="text-xs text-slate-400">详细数据表格</p>
                          </div>
                        </motion.div>
                        <motion.div whileHover={{ x: 5 }} className="px-4 py-4 bg-gradient-to-r from-emerald-500/10 to-transparent rounded-lg border border-emerald-500/20 flex items-center gap-3">
                          <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <Download className="w-6 h-6 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">JSON数据</p>
                            <p className="text-xs text-slate-400">系统对接格式</p>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* 快速入口 */}
      <section id="features" className="py-2 px-3 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-14 h-14 bg-gradient-to-br from-amber-500/30 to-amber-600/30 rounded-xl flex items-center justify-center border border-amber-500/30 glow-cyan"
              >
                <Zap className="w-7 h-7 text-amber-400" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-white">快速入口</h2>
                <p className="text-slate-400 text-sm mt-1">直接进入各功能模块</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Target, title: '智能选址', desc: '地形分析与最佳位置选择', color: 'amber' },
                { icon: Sun, title: '面板布局', desc: '光伏面板分区与布局优化', color: 'blue' },
                { icon: Building2, title: '设备选型', desc: '逆变器与变压器配置', color: 'purple' },
                { icon: Network, title: '电缆路由', desc: '最优路径规划与共沟设计', color: 'emerald' },
                { icon: Mountain, title: '山地地形', desc: '3D地形可视化与分析', color: 'cyan' },
                { icon: Zap, title: '电力分析', desc: '损耗计算与效率优化', color: 'rose' },
                { icon: DollarSign, title: '成本分析', desc: '投资预算与收益评估', color: 'indigo' },
                { icon: FileText, title: '生成报告', desc: '一键导出专业文档', color: 'lime' }
              ].map((item, index) => (
                <Link
                  key={index}
                  to="/login"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 rounded-xl p-5 border border-slate-700/50 hover:border-amber-500/50 transition-all cursor-pointer group backdrop-blur-sm"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-${item.color}-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <item.icon className={`w-6 h-6 text-${item.color}-400`} />
                    </div>
                    <h3 className="font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-300">{item.desc}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 目标用户 */}
      <section className="py-2 px-3">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-white/10 p-6"
          >
            <div 
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-700/30 transition-colors"
              onClick={() => toggleSection('users')}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Users className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">目标用户</h2>
                  <p className="text-slate-400 text-sm mt-1">哪些企业和机构在使用我们的系统？</p>
                </div>
              </div>
              {expandedSection === 'users' ? (
                <ChevronDown className="w-6 h-6 text-slate-400" />
              ) : (
                <ChevronRight className="w-6 h-6 text-slate-400" />
              )}
            </div>

            <AnimatePresence>
              {expandedSection === 'users' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                      <div className="flex items-center gap-3 mb-3">
                        <Building2 className="w-6 h-6 text-cyan-400" />
                        <h3 className="text-lg font-bold text-white">光伏电站设计企业</h3>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">
                        需要快速生成专业设计方案，提高设计效率和质量
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">提高效率</span>
                        <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">降低成本</span>
                      </div>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                      <div className="flex items-center gap-3 mb-3">
                        <Calculator className="w-6 h-6 text-purple-400" />
                        <h3 className="text-lg font-bold text-white">工程咨询机构</h3>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">
                        为客户提供专业的可行性分析和投资评估服务
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">量化分析</span>
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">专业报告</span>
                      </div>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                      <div className="flex items-center gap-3 mb-3">
                        <Globe className="w-6 h-6 text-amber-400" />
                        <h3 className="text-lg font-bold text-white">投资开发企业</h3>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">
                        评估项目可行性和投资回报，辅助投资决策
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">风险评估</span>
                        <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">ROI分析</span>
                      </div>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                      <div className="flex items-center gap-3 mb-3">
                        <Award className="w-6 h-6 text-emerald-400" />
                        <h3 className="text-lg font-bold text-white">研究机构</h3>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">
                        进行算法研究和性能评估，验证设计优化效果
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">算法研究</span>
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">性能评估</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* 如何使用系统 */}
      <section className="py-2 px-3">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden"
          >
            <div 
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-700/30 transition-colors"
              onClick={() => toggleSection('flow')}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center">
                  <Network className="w-7 h-7 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">如何使用系统</h2>
                  <p className="text-slate-400 text-sm mt-1">简单四步，完成智能设计方案</p>
                </div>
              </div>
              {expandedSection === 'flow' ? (
                <ChevronDown className="w-6 h-6 text-slate-400" />
              ) : (
                <ChevronRight className="w-6 h-6 text-slate-400" />
              )}
            </div>

            <AnimatePresence>
              {expandedSection === 'flow' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="relative">
                      <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-cyan-500 text-white font-bold flex items-center justify-center z-10">1</div>
                      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 h-full">
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4">
                          <Database className="w-6 h-6 text-cyan-400" />
                        </div>
                        <h3 className="text-white font-bold mb-2">导入工程数据</h3>
                        <p className="text-sm text-slate-400">上传地形数据或选择标准算例模板</p>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center z-10">2</div>
                      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 h-full">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                          <Cog className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="text-white font-bold mb-2">配置优化目标</h3>
                        <p className="text-sm text-slate-400">设置成本、效率、可靠性等优化权重</p>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center z-10">3</div>
                      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 h-full">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">
                          <Zap className="w-6 h-6 text-amber-400" />
                        </div>
                        <h3 className="text-white font-bold mb-2">AI算法优化</h3>
                        <p className="text-sm text-slate-400">系统自动运行多目标优化算法</p>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center z-10">4</div>
                      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 h-full">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                          <FileText className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-white font-bold mb-2">生成报告</h3>
                        <p className="text-sm text-slate-400">查看可视化结果，导出专业报告</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* 试点项目 */}
      <section className="py-2 px-3">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl p-6 border border-cyan-500/30">
              <h3 className="text-lg font-bold text-white mb-3">试点验证项目</h3>
              <p className="text-slate-300 mb-4">中国电建集团甘肃省临夏州东乡县200兆瓦山地光伏项目</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">项目规模</p>
                  <p className="text-xl font-bold text-cyan-400">200MW</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">建设地点</p>
                  <p className="text-xl font-bold text-emerald-400">甘肃临夏</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl p-4 border border-amber-500/30 text-center">
                <p className="text-2xl font-bold text-amber-400 mb-1">15-20%</p>
                <p className="text-sm text-slate-400">成本节约</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30 text-center">
                <p className="text-2xl font-bold text-purple-400 mb-1">8-12%</p>
                <p className="text-sm text-slate-400">效率提升</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-8 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-emerald-600/80 to-emerald-800/80 rounded-2xl p-10 border border-emerald-600/30"
          >
            <h2 className="text-2xl md:text-3xl font-medium text-white mb-4">
              准备好提升您的光伏设计能力了吗？
            </h2>
            <p className="text-gray-300 mb-8 max-w-md mx-auto">
              导入您的第一个项目，体验智能算法带来的效率提升和成本优化
            </p>
            <Link
              to="/login"
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg hover:shadow-xl transition-colors inline-flex items-center gap-2"
            >
              立即体验
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-300 py-6 px-4 border-t border-slate-700">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Sun className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold">山地光伏设计系统</span>
              </div>
              <p className="text-sm text-slate-400">
                专注山地光伏设计领域，提供专业的设计方案优化工具
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">功能模块</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/site-selection" className="hover:text-amber-400 cursor-pointer transition-colors">智能选址</Link></li>
                <li><Link to="/optimization" className="hover:text-amber-400 cursor-pointer transition-colors">面板布局</Link></li>
                <li><Link to="/equipment" className="hover:text-amber-400 cursor-pointer transition-colors">设备选型</Link></li>
                <li><Link to="/cable-routing" className="hover:text-amber-400 cursor-pointer transition-colors">电缆路由</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">支持</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/login" className="hover:text-amber-400 cursor-pointer transition-colors">使用文档</Link></li>
                <li><Link to="/login" className="hover:text-amber-400 cursor-pointer transition-colors">常见问题</Link></li>
                <li><Link to="/login" className="hover:text-amber-400 cursor-pointer transition-colors">技术联系</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">联系我们</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <span>湖北省武汉市</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8 text-center text-sm text-slate-500">
            <p>&copy; 2026 山地光伏智能设计系统. 版权所有.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SystemIntroduction;
