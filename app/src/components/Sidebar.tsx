import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Mountain,
  Grid3X3,
  Zap,
  Cable,
  BarChart3,
  Leaf,
  Settings,
  Cpu,
  Activity,
  X,
  LogOut,
  Target,
  DollarSign,
  Database,
  Info,
  ChevronDown,
  ChevronRight,
  FileText,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '../store/useAppStore';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onToggleSidebar?: () => void;
  onLogout?: () => void;
}

const navGroups = [
  {
    id: 'system',
    label: '系统管理',
    items: [
      { id: 'introduction', label: '系统介绍', icon: Info },
      { id: 'dashboard', label: '系统概览', icon: LayoutDashboard },
      { id: 'instances', label: '算例管理', icon: Database }
    ]
  },
  {
    id: 'design',
    label: '设计流程',
    items: [
      { id: 'siteSelection', label: '智能选址', icon: Target },
      { id: 'terrain', label: '山地地形', icon: Mountain },
      { id: 'panels', label: '面板布局', icon: Grid3X3 },
      { id: 'equipment', label: '电气设备', icon: Zap },
      { id: 'cables', label: '电缆路由', icon: Cable }
    ]
  },
  {
    id: 'analysis',
    label: '分析评估',
    items: [
      { id: 'power', label: '电力分析', icon: Activity },
      { id: 'powerSimulation', label: '电力系统仿真', icon: Shield },
      { id: 'cost', label: '成本分析', icon: BarChart3 },
      { id: 'costPrediction', label: '成本预测', icon: DollarSign },
      { id: 'eco', label: '生态影响', icon: Leaf }
    ]
  },
  {
    id: 'operations',
    label: '运维监控',
    items: [
      { id: 'monitoring', label: '运维监控', icon: Cpu },
      { id: 'algorithm', label: '算法分析', icon: Activity }
    ]
  },
  {
    id: 'tools',
    label: '工具与演示',
    items: [
      { id: 'optimization', label: '优化演示', icon: BarChart3 }
    ]
  }
];

const Sidebar: React.FC<SidebarProps> = React.memo(({ activeSection, onSectionChange, onToggleSidebar, onLogout }) => {
  const navigate = useNavigate();
  const { theme } = useAppStore();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    system: true,
    design: true,
    analysis: true,
    operations: true,
    tools: true
  });

  const pathMap: Record<string, string> = {
    'dashboard': '/dashboard',
    'instances': '/instances',
    'introduction': '/introduction',
    'siteSelection': '/site-selection',
    'terrain': '/terrain',
    'panels': '/panels',
    'equipment': '/equipment',
    'cables': '/cables',
    'power': '/power',
    'powerSimulation': '/power-simulation',
    'cost': '/cost',
    'costPrediction': '/cost-prediction',
    'eco': '/eco',
    'monitoring': '/monitoring',
    'algorithm': '/algorithm',
    'optimization': '/optimization',
    'settings': '/settings'
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const getNavItemStyle = (isActive: boolean) => {
    const bgColor = isActive
      ? theme === 'dark' ? 'rgba(34, 211, 238, 0.1)' : 'rgba(34, 211, 238, 0.08)'
      : 'transparent';
    return {
      backgroundColor: bgColor,
      borderLeft: isActive ? '2px solid #22d3ee' : '2px solid transparent',
      paddingLeft: isActive ? '22px' : '24px'
    };
  };

  const getNavItemHoverStyle = () => {
    return {
      backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(34, 211, 238, 0.05)',
      borderLeft: '2px solid rgba(34, 211, 238, 0.5)'
    };
  };

  return (
    <aside className={`w-64 h-screen flex flex-col lg:static fixed inset-y-0 left-0 z-20 ${theme === 'dark' ? 'bg-[#0f172a] border-r border-cyan-500/20' : 'bg-white border-r border-gray-200'}`}>
      {/* Logo */}
      <div className={`p-6 flex items-center justify-between ${theme === 'dark' ? 'border-b border-cyan-500/20' : 'border-b border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Zap className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>山地光伏</h1>
            <p className="text-xs text-cyan-400">智能设计系统</p>
          </div>
        </div>
        {/* Mobile close button */}
        <motion.button
          className={`lg:hidden p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}
          onClick={onToggleSidebar}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navGroups.map((group, groupIndex) => (
          <div key={group.id} className="mb-2">
            {/* Group header */}
            <motion.button
              className={`w-full flex items-center justify-between px-6 py-2 text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}
              onClick={() => toggleGroup(group.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>{group.label}</span>
              {expandedGroups[group.id] ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </motion.button>

            {/* Group items */}
            <AnimatePresence>
              {expandedGroups[group.id] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {group.items.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    const itemStyle = getNavItemStyle(isActive);
                    const hoverStyle = getNavItemHoverStyle();

                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => {
                          onSectionChange(item.id);
                          const path = pathMap[item.id] || `/${item.id}`;
                          navigate(path);
                          if (window.innerWidth < 1024 && onToggleSidebar) {
                            onToggleSidebar();
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-6 py-3 text-sm transition-all duration-300 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                        style={itemStyle}
                        whileHover={hoverStyle}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (groupIndex * 0.2) + (index * 0.1) }}
                      >
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: (groupIndex * 0.2) + (index * 0.1) + 0.2 }}
                          whileHover={{ rotate: 10 }}
                        >
                          <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                        </motion.div>
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: (groupIndex * 0.2) + (index * 0.1) + 0.3 }}
                        >
                          {item.label}
                        </motion.span>
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, y: [0, -2, 0] }}
                            transition={{
                              type: 'spring',
                              stiffness: 300,
                              damping: 20,
                              repeat: Infinity,
                              repeatType: 'reverse',
                              repeatDelay: 2
                            }}
                            className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400"
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={`p-4 space-y-2 ${theme === 'dark' ? 'border-t border-cyan-500/20' : 'border-t border-gray-200'}`}>
        <motion.div
          className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
          onClick={() => {
            onSectionChange('settings');
            navigate('/settings');
            if (window.innerWidth < 1024 && onToggleSidebar) {
              onToggleSidebar();
            }
          }}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <Settings className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>系统设置</span>
        </motion.div>
        <motion.div
          className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${theme === 'dark' ? 'hover:bg-red-400/10' : 'hover:bg-red-50'}`}
          onClick={onLogout}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className={`w-5 h-5 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} />
          <span className={`text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>登出系统</span>
        </motion.div>
      </div>
    </aside>
  );
});

export default Sidebar;
