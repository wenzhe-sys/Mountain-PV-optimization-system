import React, { useState } from 'react';
import { Bell, User, Search, Sun, Menu, LogOut, FileText, Moon, Settings, HelpCircle, Globe, X, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DataManager from './DataManager';
import useAppStore from '../store/useAppStore';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  title: string;
  onToggleSidebar?: () => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

const HelpModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { theme } = useAppStore();
  const { t } = useTranslation();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`max-w-2xl w-full rounded-xl ${theme === 'dark' ? 'bg-[#0f172a] border border-cyan-500/30' : 'bg-white border border-gray-200'} p-6 max-h-[80vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>帮助中心</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}
          >
            <X className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>系统简介</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              山地光伏智能设计系统是一个基于人工智能的光伏电站设计优化平台，提供从选址、布局规划到成本分析的全流程解决方案。
            </p>
          </div>
          
          <div>
            <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>主要功能</h3>
            <ul className={`text-sm space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>• <strong>智能选址</strong>：基于地形、气候等因素的选址分析</li>
              <li>• <strong>光伏面板布局</strong>：使用DQN算法优化面板分区布局</li>
              <li>• <strong>电气设备选址</strong>：优化变压器和逆变器位置</li>
              <li>• <strong>电缆路由规划</strong>：最小化电缆长度和成本</li>
              <li>• <strong>成本分析</strong>：全面的成本效益分析</li>
              <li>• <strong>算法性能分析</strong>：评估和比较算法效果</li>
            </ul>
          </div>
          
          <div>
            <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>使用指南</h3>
            <div className={`text-sm space-y-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              <div>
                <p className="font-medium mb-1">1. 开始优化</p>
                <p>在"优化演示"页面选择算例，点击"开始优化"按钮进行优化计算。</p>
              </div>
              <div>
                <p className="font-medium mb-1">2. 查看结果</p>
                <p>优化完成后，可在各功能模块查看详细结果和可视化图表。</p>
              </div>
              <div>
                <p className="font-medium mb-1">3. 数据管理</p>
                <p>使用数据管理功能导入导出算例数据，管理优化结果。</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>快捷键</h3>
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-gray-400">Ctrl + S</span>
                <span>保存设置</span>
                <span className="text-gray-400">Ctrl + D</span>
                <span>切换主题</span>
                <span className="text-gray-400">Ctrl + H</span>
                <span>显示帮助</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}>联系支持</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              如有问题，请联系技术支持团队：support@mountain-pv.com
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Header: React.FC<HeaderProps> = React.memo(({ title, onToggleSidebar, isAuthenticated, onLogout }) => {
  const [notifications] = useState(3);
  const [showDataManager, setShowDataManager] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, setTheme, setActiveSection } = useAppStore();
  const { t, i18n } = useTranslation();

  const notificationsList = [
    { id: 1, title: '优化任务完成', message: '算例A的优化任务已完成', time: '5分钟前', read: false },
    { id: 2, title: '系统更新', message: '新版本v2.0.1已发布', time: '1小时前', read: false },
    { id: 3, title: '数据导入成功', message: '算例数据已成功导入', time: '2小时前', read: true },
  ];
  
  return (
    <header className={`h-16 flex items-center justify-between px-6 transition-all duration-300 ${theme === 'dark' ? 'bg-[#0f172a] border-b border-cyan-500/30' : 'bg-white border-b border-gray-200'} shadow-sm`}>
      {/* Left: Menu button & Title */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <motion.button 
          className={`lg:hidden p-2 rounded-lg transition-all ${theme === 'dark' ? 'hover:bg-white/10 bg-white/5' : 'hover:bg-gray-100 bg-gray-50'}`}
          onClick={onToggleSidebar}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Menu className={`w-5 h-5 ${theme === 'dark' ? 'text-cyan-400' : 'text-gray-700'}`} />
        </motion.button>
        
        <motion.h2 
          className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {title}
        </motion.h2>
        <motion.span 
          className={theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          /
        </motion.span>
        <motion.span 
          className="text-sm text-cyan-400 font-semibold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          v2.0.1
        </motion.span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search */}
        <motion.div className="relative">
          <motion.button
            className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-white/10 bg-white/5' : 'hover:bg-gray-100 bg-gray-50'}`}
            onClick={() => setShowSearch(!showSearch)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Search className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} />
          </motion.button>
          <AnimatePresence>
            {showSearch && (
              <motion.div
                className="absolute top-12 right-0 z-[100]"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className={`relative rounded-lg shadow-lg w-80 sm:w-96 ${theme === 'dark' ? 'bg-[#0f172a] border border-cyan-500/30' : 'bg-white border border-gray-200'}`}>
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder="搜索设备、路由、维护计划..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg text-sm focus:outline-none ${theme === 'dark' ? 'bg-[#0f172a] text-white placeholder-gray-500' : 'bg-white text-gray-800 placeholder-gray-400'}`}
                    autoFocus
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Theme Toggle */}
        <motion.button
          className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-white/10 bg-white/5' : 'hover:bg-gray-100 bg-gray-50'}`}
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-blue-500" />
          )}
        </motion.button>

        {/* Language Toggle */}
        <div className="relative">
          <motion.button
            className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-white/10 bg-white/5' : 'hover:bg-gray-100 bg-gray-50'}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
          >
            <Globe className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} />
          </motion.button>
          
          <AnimatePresence>
            {showLanguageMenu && (
              <motion.div
                className={`absolute top-10 right-0 rounded-lg shadow-xl z-[100] w-36 ${theme === 'dark' ? 'bg-[#0f172a] border border-cyan-500/30' : 'bg-white border border-gray-200'}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="py-2">
                  <button 
                    className={`w-full text-left px-4 py-2 transition-colors text-sm ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100'} ${i18n.language === 'zh-CN' ? 'text-cyan-400' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                    onClick={() => {
                      i18n.changeLanguage('zh-CN');
                      localStorage.setItem('language', 'zh-CN');
                      setShowLanguageMenu(false);
                    }}
                  >
                    中文
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-2 transition-colors text-sm ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100'} ${i18n.language === 'en-US' ? 'text-cyan-400' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                    onClick={() => {
                      i18n.changeLanguage('en-US');
                      localStorage.setItem('language', 'en-US');
                      setShowLanguageMenu(false);
                    }}
                  >
                    English
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Data Manager */}
        <motion.button
          className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-white/10 bg-white/5' : 'hover:bg-gray-100 bg-gray-50'}`}
          onClick={() => setShowDataManager(true)}
          title="数据管理"
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <FileText className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} />
        </motion.button>

        {/* Help */}
        <motion.button
          className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-white/10 bg-white/5' : 'hover:bg-gray-100 bg-gray-50'}`}
          title="帮助"
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowHelpModal(true)}
        >
          <HelpCircle className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} />
        </motion.button>

        {/* Settings */}
        <motion.button
          className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-white/10 bg-white/5' : 'hover:bg-gray-100 bg-gray-50'}`}
          title="设置"
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveSection('settings')}
        >
          <Settings className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} />
        </motion.button>

        {/* Notifications */}
        <div className="relative">
          <motion.button
            className={`relative p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-white/10 bg-white/5' : 'hover:bg-gray-100 bg-gray-50'}`}
            onClick={() => setShowNotifications(!showNotifications)}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} />
            {notifications > 0 && (
              <motion.span
                className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                {notifications}
              </motion.span>
            )}
          </motion.button>
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                className={`absolute top-12 right-0 rounded-lg shadow-xl z-[100] w-80 sm:w-96 ${theme === 'dark' ? 'bg-[#0f172a] border border-cyan-500/30' : 'bg-white border border-gray-200'}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                  <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>通知</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notificationsList.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b ${theme === 'dark' ? 'border-white/5 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'} ${!notification.read ? 'bg-cyan-500/5' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        {!notification.read && <span className="w-2 h-2 bg-cyan-400 rounded-full mt-1.5 flex-shrink-0"></span>}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{notification.title}</p>
                          <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{notification.message}</p>
                          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={`p-3 text-center border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                  <button className={`text-sm text-cyan-400 hover:text-cyan-300 transition-colors`}>
                    查看全部通知
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User */}
        {isAuthenticated && (
          <motion.div 
            className={`flex items-center gap-2 sm:gap-3 pl-4 ${theme === 'dark' ? 'border-l border-white/10' : 'border-l border-gray-200'}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <div className="text-right hidden sm:block">
              <motion.p 
                className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                管理员
              </motion.p>
              <motion.p 
                className={theme === 'dark' ? 'text-xs text-gray-400' : 'text-xs text-gray-500'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                admin@example.com
              </motion.p>
            </div>
            <motion.div 
              className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center cursor-pointer"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <User className="w-5 h-5 text-white" />
            </motion.div>
            <motion.button
              onClick={onLogout}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}
              title="登出"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className={`w-5 h-5 transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-red-400' : 'text-gray-600 hover:text-red-500'}`} />
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* User Menu */}
      <AnimatePresence>
        {showUserMenu && (
          <motion.div
            className={`absolute top-16 right-6 rounded-lg shadow-xl z-[100] w-56 ${theme === 'dark' ? 'bg-[#0f172a] border border-cyan-500/30' : 'bg-white border border-gray-200'}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`p-4 ${theme === 'dark' ? 'border-b border-white/10' : 'border-b border-gray-200'}`}>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>管理员</p>
              <p className={theme === 'dark' ? 'text-xs text-gray-400' : 'text-xs text-gray-500'}>admin@example.com</p>
            </div>
            <div className="py-2">
              <button className={`w-full text-left px-4 py-2.5 transition-colors text-sm flex items-center gap-3 ${theme === 'dark' ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}>
                <User className="w-4 h-4" />
                个人资料
              </button>
              <button className={`w-full text-left px-4 py-2.5 transition-colors text-sm flex items-center gap-3 ${theme === 'dark' ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}>
                <Settings className="w-4 h-4" />
                账户设置
              </button>
              <button
                className={`w-full text-left px-4 py-2.5 transition-colors text-sm flex items-center gap-3 ${theme === 'dark' ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
                onClick={() => {
                  setActiveSection('settings');
                  setShowUserMenu(false);
                }}
              >
                <Shield className="w-4 h-4" />
                安全设置
              </button>
              <div className={`my-2 border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}></div>
              <button
                className={`w-full text-left px-4 py-2.5 transition-colors text-sm flex items-center gap-3 ${theme === 'dark' ? 'hover:bg-red-400/10 text-red-400' : 'hover:bg-red-50 text-red-500'}`}
                onClick={onLogout}
              >
                <LogOut className="w-4 h-4" />
                退出登录
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data Manager Modal */}
      {showDataManager && (
        <DataManager onClose={() => setShowDataManager(false)} />
      )}

      {/* Help Modal */}
      <AnimatePresence>
        {showHelpModal && (
          <HelpModal onClose={() => setShowHelpModal(false)} />
        )}
      </AnimatePresence>
    </header>
  );
});

export default Header;
