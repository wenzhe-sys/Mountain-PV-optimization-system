import { useEffect, Suspense } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import PerformanceMonitor from './components/PerformanceMonitor';
import ErrorBoundary from './components/ErrorBoundary';
import useAppStore from './store/useAppStore';
import authService from './services/authService';
import './i18n';

// 直接导入组件，避免懒加载缓存问题
import Dashboard from './sections/Dashboard';
import TerrainView from './sections/TerrainView';
import PanelLayout from './sections/PanelLayout';
import EquipmentView from './sections/EquipmentView';
import CableRouting from './sections/CableRouting';
import CostAnalysis from './sections/CostAnalysis';
import CostPrediction from './sections/CostPrediction';
import EcoImpact from './sections/EcoImpact';
import Monitoring from './sections/Monitoring';
import PowerAnalysis from './sections/PowerAnalysis';
import AlgorithmPerformance from './sections/AlgorithmPerformance';
import SiteSelection from './sections/SiteSelection';
import PowerSystemSimulation from './sections/PowerSystemSimulation';
import InstanceManager from './sections/InstanceManager';
import Settings from './sections/Settings';
import OptimizationDemo from './sections/OptimizationDemo2';
import SystemIntroduction from './sections/SystemIntroduction';

const sectionTitles: Record<string, string> = {
  instances: '算例管理',
  dashboard: '系统概览',
  introduction: '系统介绍',
  siteSelection: '智能选址系统',
  terrain: '山地地形可视化',
  panels: '光伏面板布局规划',
  equipment: '电气设备选址',
  cables: '电缆路由规划',
  power: '电力损耗分析与优化',
  powerSimulation: '电力系统仿真',
  cost: '成本效益分析',
  costPrediction: '成本预测模型',
  eco: '生态影响评估',
  monitoring: '运维监控中心',
  algorithm: '算法性能分析',
  optimization: '优化演示',
  settings: '系统设置',
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    isAuthenticated, 
    activeSection, 
    sidebarOpen, 
    theme,
    setIsAuthenticated, 
    setUser, 
    setActiveSection, 
    setSidebarOpen
  } = useAppStore();
  
  // 检查用户是否已登录 - 只在首次挂载时执行
  useEffect(() => {
    // 检查 localStorage 中是否有已保存的登录状态
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      // 如果已有登录状态，保留
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    } else {
      // 否则清除状态，显示系统介绍页面
      authService.logout();
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);
  
  // 处理URL路径变化
  useEffect(() => {
    const pathToSection: Record<string, string> = {
      '/': isAuthenticated ? 'dashboard' : 'introduction',
      '/login': 'introduction',
      '/dashboard': 'dashboard',
      '/introduction': 'introduction',
      '/site-selection': 'siteSelection',
      '/terrain': 'terrain',
      '/panels': 'panels',
      '/equipment': 'equipment',
      '/cables': 'cables',
      '/cable-routing': 'cables',
      '/power': 'power',
      '/power-analysis': 'power',
      '/power-simulation': 'powerSimulation',
      '/cost': 'cost',
      '/cost-analysis': 'cost',
      '/cost-prediction': 'costPrediction',
      '/eco': 'eco',
      '/monitoring': 'monitoring',
      '/algorithm': 'algorithm',
      '/optimization': 'optimization',
      '/settings': 'settings',
      '/instances': 'instances',
      '/report': 'cost'
    };
    
    const path = location.pathname;
    const targetSection = pathToSection[path];
    
    // 只有当目标section存在且与当前不同时才更新
    if (targetSection && targetSection !== activeSection) {
      setActiveSection(targetSection);
    }
  }, [location.pathname, activeSection, setActiveSection, isAuthenticated]);
  
  const handleLogin = (user: { id: string; email: string; role: 'admin' | 'user'; name: string }) => {
    setIsAuthenticated(true);
    setUser(user);
    // 登录成功后跳转到系统概览页面
    navigate('/dashboard');
  };
  
  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };
  
  const renderSection = () => {
    switch (activeSection) {
      case 'instances':
        return <InstanceManager />;
      case 'dashboard':
        return <Dashboard />;
      case 'introduction':
        return <SystemIntroduction />;
      case 'siteSelection':
        return <SiteSelection />;
      case 'terrain':
        return (
          <div className="h-[calc(100vh-64px)]">
            <TerrainView />
          </div>
        );
      case 'panels':
        return <PanelLayout />;
      case 'equipment':
        return <EquipmentView />;
      case 'cables':
        return <CableRouting />;
      case 'power':
        return <PowerAnalysis />;
      case 'powerSimulation':
        return <PowerSystemSimulation />;
      case 'cost':
        return <CostAnalysis />;
      case 'costPrediction':
        return <CostPrediction />;
      case 'eco':
        return <EcoImpact />;
      case 'monitoring':
        return <Monitoring />;
      case 'algorithm':
        return <AlgorithmPerformance />;
      case 'optimization':
        return <OptimizationDemo />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };
  
  if (!isAuthenticated) {
    // 未登录时，根据路径判断显示什么
    if (location.pathname === '/login') {
      return <LoginForm onLogin={handleLogin} />;
    }
    // 公开路径（系统介绍）
    if (location.pathname === '/' || location.pathname === '/introduction') {
      return <SystemIntroduction />;
    }
    // 其他受保护路径重定向到登录页
    return <Navigate to="/login" />;
  }
  
  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-[#0a0f1a] grid-pattern' : 'bg-[#f8fafc]'}`}>
      {/* Sidebar */}
      <div className={`fixed lg:relative inset-y-0 left-0 z-20 transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="mountain-pv-sidebar h-full">
          <Sidebar 
            activeSection={activeSection} 
            onSectionChange={setActiveSection} 
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onLogout={handleLogout}
          />
        </div>
      </div>
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'lg:ml-0' : 'lg:ml-0'}`}>
        <Header 
          title={sectionTitles[activeSection]} 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
        />
        
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="min-h-full"
            >
              <ErrorBoundary>
                {renderSection()}
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Performance Monitor */}
      <div className="hidden md:block">
        <PerformanceMonitor />
      </div>
    </div>
  );
}

export default App;
