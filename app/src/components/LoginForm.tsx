import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, AlertCircle, Zap, Shield } from 'lucide-react';
import authService from '../services/authService';

interface LoginFormProps {
  onLogin: (user: { id: string; email: string; role: 'admin' | 'user'; name: string }) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockExpiry, setLockExpiry] = useState<number | null>(null);
  
  // 检查登录锁定状态
  useEffect(() => {
    const checkLock = () => {
      if (isLocked && lockExpiry) {
        if (Date.now() > lockExpiry) {
          setIsLocked(false);
          setLockExpiry(null);
          setLoginAttempts(0);
        }
      }
    };
    
    const interval = setInterval(checkLock, 1000);
    return () => clearInterval(interval);
  }, [isLocked, lockExpiry]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 检查登录锁定
    if (isLocked) {
      const remainingTime = Math.ceil((lockExpiry! - Date.now()) / 1000);
      setError(`账户已被锁定，请${remainingTime}秒后再尝试`);
      return;
    }
    
    // 简单的表单验证
    if (!email || !password) {
      setError('请输入邮箱和密码');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await authService.login(email, password);
      
      // 存储令牌和用户信息
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      onLogin(result.user);
      setLoginAttempts(0);
    } catch (err) {
      setError((err as Error).message);
      
      // 增加登录尝试次数
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      // 超过3次尝试锁定账户
      if (newAttempts >= 3) {
        setIsLocked(true);
        setLockExpiry(Date.now() + 60000); // 锁定1分钟
        setError('登录失败次数过多，账户已被锁定1分钟');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundImage: `url('https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=A%20beautiful%20aerial%20view%20of%20solar%20panels%20installed%20on%20mountain%20slopes%2C%20with%20beautiful%20landscape%2C%20green%20hills%2C%20clear%20blue%20sky%2C%20professional%20photography%20style&image_size=landscape_16_9')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* 背景叠加层 */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-[#0a0f1a]/70 to-black/90 backdrop-blur-sm grid-pattern"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md p-8 rounded-2xl relative z-10"
      >
        <div className="bg-[#0f172a]/80 backdrop-blur-lg p-8 rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/10">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center animate-pulse-glow"
            >
              <Zap className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-white mb-2"
            >
              智能山地光伏电站设计平台
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-300"
            >
              专业、智能、高效的光伏电站设计解决方案
            </motion.p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-red-400/10 border border-red-400/30"
              >
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              </motion.div>
            )}
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">邮箱</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
                  placeholder="请输入邮箱"
                  required
                />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
                  placeholder="请输入密码"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-600 bg-transparent text-cyan-400 focus:ring-cyan-400"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                  记住我
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                  忘记密码?
                </a>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-500 hover:to-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>登录中...</span>
                  </div>
                ) : (
                  '登录'
                )}
              </button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="text-center text-sm text-gray-300 mt-8 p-4 rounded-lg bg-white/5 border border-white/10"
            >
              <p className="mb-3 font-medium text-white">测试账号信息</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-left">
                  <p className="text-gray-400">邮箱:</p>
                  <p className="text-cyan-400 font-medium">admin@example.com</p>
                </div>
                <div className="text-left">
                  <p className="text-gray-400">密码:</p>
                  <p className="text-cyan-400 font-medium">password123</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="text-center text-xs text-gray-400 mt-4 p-3 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <p>安全提示: 连续3次登录失败将锁定账户1分钟</p>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoginForm;