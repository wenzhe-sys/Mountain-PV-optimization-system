import React, { useState } from 'react';
import { 
  Globe, 
  Bell, 
  Save, 
  Check, 
  ChevronRight,
  PanelTop,
  Server,
  Database,
  Shield,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import useAppStore from '../store/useAppStore';

interface SettingSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

const SettingSection: React.FC<SettingSectionProps> = ({ title, icon: Icon, children }) => {
  const { theme } = useAppStore();
  
  return (
    <div className={`mb-6 ${theme === 'dark' ? 'tech-card' : 'bg-white rounded-xl border border-gray-200 shadow-sm'}`}>
      <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'} flex items-center gap-3`}>
        <div className={`w-8 h-8 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-cyan-400/10'} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-400'}`} />
        </div>
        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{title}</h3>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

interface SettingItemProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onSave?: () => void;
  showSave?: boolean;
  saved?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({ 
  title, 
  description, 
  children, 
  onSave, 
  showSave = false, 
  saved = false 
}) => {
  const { theme } = useAppStore();
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    if (onSave) {
      setIsSaving(true);
      await onSave();
      setIsSaving(false);
    }
  };
  
  return (
    <div className={`mb-4 ${theme === 'dark' ? 'border-b border-white/5 pb-4' : 'border-b border-gray-100 pb-4'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div>
          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{title}</h4>
          {description && (
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {children}
          {showSave && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${isSaving ? 
                (theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500') : 
                (theme === 'dark' ? 'bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30' : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200')
              }`}
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Settings: React.FC = () => {
  const { theme, setTheme } = useAppStore();
  const [language, setLanguage] = useState('zh-CN');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false
  });
  const [autoSave, setAutoSave] = useState(true);
  const [dataRefresh, setDataRefresh] = useState(30); // 30 seconds
  const [saved, setSaved] = useState(false);
  
  // 用户偏好设置
  const [userPreferences, setUserPreferences] = useState({
    // 面板布局偏好
    panelLayout: 'grid', // grid, list, compact
    defaultView: '3d', // 2d, 3d
    autoExpandPanels: true,
    
    // 数据可视化偏好
    defaultChartType: 'line', // line, bar, pie, area
    showDataLabels: true,
    animationEnabled: true,
    
    // 算法参数偏好
    optimizationAlgorithm: 'genetic', // genetic, pso, simulated annealing
    maxIterations: 1000,
    populationSize: 50,
    
    // 工作流程偏好
    defaultPage: 'site-selection',
    autoSaveInterval: 60, // 秒
    showTooltips: true
  });
  
  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  const handleSaveSettings = () => {
    // 模拟保存设置
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };
  
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
  };
  
  const handleNotificationChange = (type: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };
  
  const handlePreferenceChange = <K extends keyof typeof userPreferences>(
    key: K, 
    value: typeof userPreferences[K]
  ) => {
    setUserPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-6"
      >
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>系统设置</h1>
        <button
          onClick={handleSaveSettings}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${theme === 'dark' ? 
            'bg-cyan-400/20 text-cyan-400 hover:bg-cyan-400/30' : 
            'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
          }`}
        >
          <Save className="w-4 h-4" />
          <span>保存所有设置</span>
        </button>
      </motion.div>
      
      {/* 外观设置 */}
      <SettingSection title="外观设置" icon={PanelTop}>
        <SettingItem 
          title="主题模式"
          description="选择亮色或暗色主题"
          showSave={saved}
        >
          <button
            onClick={handleThemeToggle}
            className={`w-12 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-gray-700' : 'bg-cyan-400'}`}
          >
            <motion.div
              initial={false}
              animate={{ x: theme === 'dark' ? 0 : 24 }}
              transition={{ duration: 0.3 }}
              className={`w-4 h-4 bg-white rounded-full absolute top-1 ${theme === 'dark' ? 'left-1' : 'right-1'}`}
            />
          </button>
          <span className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {theme === 'dark' ? '暗色' : '亮色'}
          </span>
        </SettingItem>
      </SettingSection>
      
      {/* 语言设置 */}
      <SettingSection title="语言设置" icon={Globe}>
        <SettingItem 
          title="界面语言"
          description="选择系统界面语言"
          onSave={handleSaveSettings}
          showSave
          saved={saved}
        >
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className={`px-3 py-1.5 rounded-lg text-sm ${theme === 'dark' ? 
              'bg-white/5 border border-white/10 text-white' : 
              'bg-white border border-gray-200 text-gray-800'
            }`}
          >
            <option value="zh-CN">简体中文</option>
            <option value="en-US">English</option>
          </select>
        </SettingItem>
      </SettingSection>
      
      {/* 通知设置 */}
      <SettingSection title="通知设置" icon={Bell}>
        <SettingItem 
          title="邮件通知"
          description="接收系统邮件通知"
          onSave={handleSaveSettings}
          showSave
          saved={saved}
        >
          <button
            onClick={() => handleNotificationChange('email')}
            className={`w-12 h-6 rounded-full relative transition-colors ${notifications.email ? 
              (theme === 'dark' ? 'bg-cyan-400' : 'bg-cyan-400') : 
              (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300')
            }`}
          >
            <motion.div
              initial={false}
              animate={{ x: notifications.email ? 24 : 0 }}
              transition={{ duration: 0.3 }}
              className={`w-4 h-4 bg-white rounded-full absolute top-1 ${notifications.email ? 'right-1' : 'left-1'}`}
            />
          </button>
        </SettingItem>
        
        <SettingItem 
          title="推送通知"
          description="接收系统推送通知"
          onSave={handleSaveSettings}
          showSave
          saved={saved}
        >
          <button
            onClick={() => handleNotificationChange('push')}
            className={`w-12 h-6 rounded-full relative transition-colors ${notifications.push ? 
              (theme === 'dark' ? 'bg-cyan-400' : 'bg-cyan-400') : 
              (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300')
            }`}
          >
            <motion.div
              initial={false}
              animate={{ x: notifications.push ? 24 : 0 }}
              transition={{ duration: 0.3 }}
              className={`w-4 h-4 bg-white rounded-full absolute top-1 ${notifications.push ? 'right-1' : 'left-1'}`}
            />
          </button>
        </SettingItem>
        
        <SettingItem 
          title="短信通知"
          description="接收系统短信通知"
          onSave={handleSaveSettings}
          showSave
          saved={saved}
        >
          <button
            onClick={() => handleNotificationChange('sms')}
            className={`w-12 h-6 rounded-full relative transition-colors ${notifications.sms ? 
              (theme === 'dark' ? 'bg-cyan-400' : 'bg-cyan-400') : 
              (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300')
            }`}
          >
            <motion.div
              initial={false}
              animate={{ x: notifications.sms ? 24 : 0 }}
              transition={{ duration: 0.3 }}
              className={`w-4 h-4 bg-white rounded-full absolute top-1 ${notifications.sms ? 'right-1' : 'left-1'}`}
            />
          </button>
        </SettingItem>
      </SettingSection>
      
      {/* 系统设置 */}
      <SettingSection title="系统设置" icon={Server}>
        <SettingItem 
          title="自动保存"
          description="自动保存系统配置"
          onSave={handleSaveSettings}
          showSave
          saved={saved}
        >
          <button
            onClick={() => setAutoSave(!autoSave)}
            className={`w-12 h-6 rounded-full relative transition-colors ${autoSave ? 
              (theme === 'dark' ? 'bg-cyan-400' : 'bg-cyan-400') : 
              (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300')
            }`}
          >
            <motion.div
              initial={false}
              animate={{ x: autoSave ? 24 : 0 }}
              transition={{ duration: 0.3 }}
              className={`w-4 h-4 bg-white rounded-full absolute top-1 ${autoSave ? 'right-1' : 'left-1'}`}
            />
          </button>
        </SettingItem>
        
        <SettingItem 
          title="数据刷新间隔"
          description="系统数据自动刷新间隔"
          onSave={handleSaveSettings}
          showSave
          saved={saved}
        >
          <select
            value={dataRefresh}
            onChange={(e) => setDataRefresh(Number(e.target.value))}
            className={`px-3 py-1.5 rounded-lg text-sm ${theme === 'dark' ? 
              'bg-white/5 border border-white/10 text-white' : 
              'bg-white border border-gray-200 text-gray-800'
            }`}
          >
            <option value={10}>10秒</option>
            <option value={30}>30秒</option>
            <option value={60}>1分钟</option>
            <option value={300}>5分钟</option>
          </select>
        </SettingItem>
      </SettingSection>
      
      {/* 数据管理 */}
      <SettingSection title="数据管理" icon={Database}>
        <SettingItem 
          title="导出配置"
          description="导出当前系统配置"
        >
          <button
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${theme === 'dark' ? 
              'bg-white/5 text-gray-400 hover:bg-white/10' : 
              'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            导出
          </button>
        </SettingItem>
        
        <SettingItem 
          title="导入配置"
          description="从文件导入系统配置"
        >
          <button
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${theme === 'dark' ? 
              'bg-white/5 text-gray-400 hover:bg-white/10' : 
              'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            导入
          </button>
        </SettingItem>
      </SettingSection>
      
      {/* 安全设置 */}
      <SettingSection title="安全设置" icon={Shield}>
        <SettingItem 
          title="修改密码"
          description="更新您的账户密码"
        >
          <button
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${theme === 'dark' ? 
              'bg-white/5 text-gray-400 hover:bg-white/10' : 
              'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            修改
          </button>
        </SettingItem>
        
        <SettingItem 
          title="API密钥管理"
          description="管理您的API访问密钥"
        >
          <button
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${theme === 'dark' ? 
              'bg-white/5 text-gray-400 hover:bg-white/10' : 
              'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            管理
          </button>
        </SettingItem>
      </SettingSection>
      
      {/* 用户偏好设置 */}
      <SettingSection title="用户偏好设置" icon={PanelTop}>
        {/* 面板布局偏好 */}
        <div className={`mb-6 ${theme === 'dark' ? 'border-b border-white/5 pb-4' : 'border-b border-gray-100 pb-4'}`}>
          <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>面板布局偏好</h4>
          
          <SettingItem 
            title="默认布局" 
            description="选择面板的默认布局方式"
            onSave={handleSaveSettings}
            showSave
            saved={saved}
          >
            <select
              value={userPreferences.panelLayout}
              onChange={(e) => handlePreferenceChange('panelLayout', e.target.value)}
              className={`px-3 py-1.5 rounded-lg text-sm ${theme === 'dark' ? 
                'bg-white/5 border border-white/10 text-white' : 
                'bg-white border border-gray-200 text-gray-800'
              }`}
            >
              <option value="grid">网格布局</option>
              <option value="list">列表布局</option>
              <option value="compact">紧凑布局</option>
            </select>
          </SettingItem>
          
          <SettingItem 
            title="默认视图" 
            description="选择默认的地形可视化视图"
            onSave={handleSaveSettings}
            showSave
            saved={saved}
          >
            <select
              value={userPreferences.defaultView}
              onChange={(e) => handlePreferenceChange('defaultView', e.target.value)}
              className={`px-3 py-1.5 rounded-lg text-sm ${theme === 'dark' ? 
                'bg-white/5 border border-white/10 text-white' : 
                'bg-white border border-gray-200 text-gray-800'
              }`}
            >
              <option value="2d">2D视图</option>
              <option value="3d">3D视图</option>
            </select>
          </SettingItem>
          
          <SettingItem 
            title="自动展开面板" 
            description="自动展开新面板"
            onSave={handleSaveSettings}
            showSave
            saved={saved}
          >
            <button
              onClick={() => handlePreferenceChange('autoExpandPanels', !userPreferences.autoExpandPanels)}
              className={`w-12 h-6 rounded-full relative transition-colors ${userPreferences.autoExpandPanels ? 
                (theme === 'dark' ? 'bg-cyan-400' : 'bg-cyan-400') : 
                (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300')
              }`}
            >
              <motion.div
                initial={false}
                animate={{ x: userPreferences.autoExpandPanels ? 24 : 0 }}
                transition={{ duration: 0.3 }}
                className={`w-4 h-4 bg-white rounded-full absolute top-1 ${userPreferences.autoExpandPanels ? 'right-1' : 'left-1'}`}
              />
            </button>
          </SettingItem>
        </div>
        
        {/* 数据可视化偏好 */}
        <div className={`mb-6 ${theme === 'dark' ? 'border-b border-white/5 pb-4' : 'border-b border-gray-100 pb-4'}`}>
          <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>数据可视化偏好</h4>
          
          <SettingItem 
            title="默认图表类型" 
            description="选择默认的图表展示类型"
            onSave={handleSaveSettings}
            showSave
            saved={saved}
          >
            <select
              value={userPreferences.defaultChartType}
              onChange={(e) => handlePreferenceChange('defaultChartType', e.target.value)}
              className={`px-3 py-1.5 rounded-lg text-sm ${theme === 'dark' ? 
                'bg-white/5 border border-white/10 text-white' : 
                'bg-white border border-gray-200 text-gray-800'
              }`}
            >
              <option value="line">折线图</option>
              <option value="bar">柱状图</option>
              <option value="pie">饼图</option>
              <option value="area">面积图</option>
            </select>
          </SettingItem>
          
          <SettingItem 
            title="显示数据标签" 
            description="在图表中显示数据标签"
            onSave={handleSaveSettings}
            showSave
            saved={saved}
          >
            <button
              onClick={() => handlePreferenceChange('showDataLabels', !userPreferences.showDataLabels)}
              className={`w-12 h-6 rounded-full relative transition-colors ${userPreferences.showDataLabels ? 
                (theme === 'dark' ? 'bg-cyan-400' : 'bg-cyan-400') : 
                (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300')
              }`}
            >
              <motion.div
                initial={false}
                animate={{ x: userPreferences.showDataLabels ? 24 : 0 }}
                transition={{ duration: 0.3 }}
                className={`w-4 h-4 bg-white rounded-full absolute top-1 ${userPreferences.showDataLabels ? 'right-1' : 'left-1'}`}
              />
            </button>
          </SettingItem>
          
          <SettingItem 
            title="启用动画效果" 
            description="在数据可视化中启用动画效果"
            onSave={handleSaveSettings}
            showSave
            saved={saved}
          >
            <button
              onClick={() => handlePreferenceChange('animationEnabled', !userPreferences.animationEnabled)}
              className={`w-12 h-6 rounded-full relative transition-colors ${userPreferences.animationEnabled ? 
                (theme === 'dark' ? 'bg-cyan-400' : 'bg-cyan-400') : 
                (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300')
              }`}
            >
              <motion.div
                initial={false}
                animate={{ x: userPreferences.animationEnabled ? 24 : 0 }}
                transition={{ duration: 0.3 }}
                className={`w-4 h-4 bg-white rounded-full absolute top-1 ${userPreferences.animationEnabled ? 'right-1' : 'left-1'}`}
              />
            </button>
          </SettingItem>
        </div>
        
        {/* 算法参数偏好 */}
        <div className={`mb-6 ${theme === 'dark' ? 'border-b border-white/5 pb-4' : 'border-b border-gray-100 pb-4'}`}>
          <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>算法参数偏好</h4>
          
          <SettingItem 
            title="优化算法" 
            description="选择默认的优化算法"
            onSave={handleSaveSettings}
            showSave
            saved={saved}
          >
            <select
              value={userPreferences.optimizationAlgorithm}
              onChange={(e) => handlePreferenceChange('optimizationAlgorithm', e.target.value)}
              className={`px-3 py-1.5 rounded-lg text-sm ${theme === 'dark' ? 
                'bg-white/5 border border-white/10 text-white' : 
                'bg-white border border-gray-200 text-gray-800'
              }`}
            >
              <option value="genetic">遗传算法</option>
              <option value="pso">粒子群优化</option>
              <option value="simulated annealing">模拟退火</option>
            </select>
          </SettingItem>
          
          <SettingItem 
            title="最大迭代次数" 
            description="优化算法的最大迭代次数"
            onSave={handleSaveSettings}
            showSave
            saved={saved}
          >
            <input
              type="number"
              min="100"
              max="5000"
              step="100"
              value={userPreferences.maxIterations}
              onChange={(e) => handlePreferenceChange('maxIterations', Number(e.target.value))}
              className={`px-3 py-1.5 rounded-lg text-sm w-24 ${theme === 'dark' ? 
                'bg-white/5 border border-white/10 text-white' : 
                'bg-white border border-gray-200 text-gray-800'
              }`}
            />
          </SettingItem>
          
          <SettingItem 
            title="种群大小" 
            description="遗传算法的种群大小"
            onSave={handleSaveSettings}
            showSave
            saved={saved}
          >
            <input
              type="number"
              min="10"
              max="200"
              step="10"
              value={userPreferences.populationSize}
              onChange={(e) => handlePreferenceChange('populationSize', Number(e.target.value))}
              className={`px-3 py-1.5 rounded-lg text-sm w-24 ${theme === 'dark' ? 
                'bg-white/5 border border-white/10 text-white' : 
                'bg-white border border-gray-200 text-gray-800'
              }`}
            />
          </SettingItem>
        </div>
        
        {/* 工作流程偏好 */}
        <div>
          <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>工作流程偏好</h4>
          
          <SettingItem 
            title="默认页面" 
            description="系统启动时的默认页面"
            onSave={handleSaveSettings}
            showSave
            saved={saved}
          >
            <select
              value={userPreferences.defaultPage}
              onChange={(e) => handlePreferenceChange('defaultPage', e.target.value)}
              className={`px-3 py-1.5 rounded-lg text-sm ${theme === 'dark' ? 
                'bg-white/5 border border-white/10 text-white' : 
                'bg-white border border-gray-200 text-gray-800'
              }`}
            >
              <option value="site-selection">智能选址</option>
              <option value="terrain-view">地形可视化</option>
              <option value="panel-layout">面板布局</option>
              <option value="cable-routing">电缆路由</option>
              <option value="power-system">电力系统</option>
              <option value="cost-analysis">成本分析</option>
            </select>
          </SettingItem>
          
          <SettingItem 
            title="自动保存间隔" 
            description="自动保存项目的时间间隔（秒）"
            onSave={handleSaveSettings}
            showSave
            saved={saved}
          >
            <input
              type="number"
              min="10"
              max="300"
              step="10"
              value={userPreferences.autoSaveInterval}
              onChange={(e) => handlePreferenceChange('autoSaveInterval', Number(e.target.value))}
              className={`px-3 py-1.5 rounded-lg text-sm w-24 ${theme === 'dark' ? 
                'bg-white/5 border border-white/10 text-white' : 
                'bg-white border border-gray-200 text-gray-800'
              }`}
            />
          </SettingItem>
          
          <SettingItem 
            title="显示工具提示" 
            description="在界面元素上显示工具提示"
            onSave={handleSaveSettings}
            showSave
            saved={saved}
          >
            <button
              onClick={() => handlePreferenceChange('showTooltips', !userPreferences.showTooltips)}
              className={`w-12 h-6 rounded-full relative transition-colors ${userPreferences.showTooltips ? 
                (theme === 'dark' ? 'bg-cyan-400' : 'bg-cyan-400') : 
                (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300')
              }`}
            >
              <motion.div
                initial={false}
                animate={{ x: userPreferences.showTooltips ? 24 : 0 }}
                transition={{ duration: 0.3 }}
                className={`w-4 h-4 bg-white rounded-full absolute top-1 ${userPreferences.showTooltips ? 'right-1' : 'left-1'}`}
              />
            </button>
          </SettingItem>
        </div>
      </SettingSection>
      
      {/* 关于系统 */}
      <SettingSection title="关于系统" icon={ChevronRight}>
        <div className={`space-y-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          <p className="text-sm">版本: v2.0.1</p>
          <p className="text-sm">更新日期: 2026-04-03</p>
          <p className="text-sm">开发者: 山地光伏智能设计团队</p>
          <p className="text-sm mt-4">© 2026 山地光伏智能设计系统. 保留所有权利.</p>
        </div>
      </SettingSection>
    </div>
  );
};

export default Settings;