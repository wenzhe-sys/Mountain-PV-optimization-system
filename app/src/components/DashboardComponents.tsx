import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  TrendingUp,
  DollarSign,
  Target,
  AlertTriangle,
  Leaf,
  Activity,
  BarChart3,
  ChevronRight,
  Lightbulb,
  Server,
  ClipboardList,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Calendar,
  Info
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';
import useAppStore from '../store/useAppStore';

// 快速操作项组件
export const QuickActionItem = React.memo(({
  action,
  index,
  onActionClick
}: {
  action: {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  };
  index: number;
  onActionClick: (id: string) => void;
}) => {
  const { theme } = useAppStore();
  const Icon = action.icon;

  return (
    <motion.button
      key={action.id}
      onClick={() => onActionClick(action.id)}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.08, y: -8, rotate: 1, boxShadow: '0 20px 40px rgba(0, 212, 255, 0.15)' }}
      whileTap={{ scale: 0.98, y: 0, boxShadow: '0 10px 20px rgba(0, 212, 255, 0.1)' }}
      className={`p-6 border rounded-xl transition-all duration-300 ${theme === 'dark' ? 'tech-card hover:border-cyan-400/50' : 'bg-white shadow-sm hover:border-cyan-400/50'} ${action.color} hover:shadow-cyan-400/15`}
    >
      <div className="flex items-center gap-4">
        <motion.div 
          whileHover={{ rotate: 15, scale: 1.1, boxShadow: '0 10px 30px rgba(0, 212, 255, 0.3)' }}
          className={`w-14 h-14 rounded-2xl ${action.color.replace('text-', 'bg-').replace('border-', 'border-')} flex items-center justify-center shadow-lg transition-all duration-300`}
        >
          <Icon className="w-7 h-7" />
        </motion.div>
        <div className="flex-1">
          <motion.h3 
            className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
            whileHover={{ x: 5 }}
          >
            {action.title}
          </motion.h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{action.description}</p>
        </div>
        <motion.div
          whileHover={{ x: 5, scale: 1.2 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <ChevronRight className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
        </motion.div>
      </div>
    </motion.button>
  );
});

// KPI卡片组件
export const KpiCard = React.memo(({
  kpi,
  index
}: {
  kpi: {
    name: string;
    value: string;
    unit?: string;
    change: number;
    trend: 'up' | 'down';
    icon: string;
  };
  index: number;
}) => {
  const { theme } = useAppStore();
  const [displayValue, setDisplayValue] = useState(0);
  
  const Icon = kpi.icon === 'Zap' ? Zap : 
             kpi.icon === 'Activity' ? Activity : 
             kpi.icon === 'Target' ? Target : 
             kpi.icon === 'AlertTriangle' ? AlertTriangle : 
             kpi.icon === 'DollarSign' ? DollarSign : 
             kpi.icon === 'Leaf' ? Leaf : Zap;
  
  const numericValue = useMemo(() => {
    const regex = new RegExp('[^0-9.]', 'g');
    return parseFloat(kpi.value.replace(regex, ''));
  }, [kpi.value]);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const duration = 1500;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;
    
    timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setDisplayValue(numericValue);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [numericValue]);

  return (
    <motion.div
      key={kpi.name}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1, type: "spring" }}
      whileHover={{ y: -5, boxShadow: '0 15px 30px rgba(0, 212, 255, 0.15)' }}
      className="p-6 tech-card transition-all duration-300 hover:border-cyan-400/50"
    >
      <div className="flex items-start justify-between">
        <div>
          <motion.p 
            className="text-sm mb-1 text-gray-400"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {kpi.name}
          </motion.p>
          <div className="flex items-baseline gap-2">
            <motion.span 
              className="text-2xl font-bold text-white"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {kpi.value.includes('¥') ? '¥' : ''}
              {displayValue.toFixed(kpi.value.includes('.') ? 2 : 0)}
              {kpi.unit && <span className="text-lg ml-1">{kpi.unit}</span>}
            </motion.span>
          </div>
          <motion.div 
            className={`flex items-center gap-1 mt-2 text-sm ${kpi.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {kpi.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
            <span>{Math.abs(kpi.change)}%</span>
            <span className="text-gray-500 ml-1">较上月</span>
          </motion.div>
        </div>
        <motion.div 
          className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center shadow-lg shadow-cyan-400/10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          whileHover={{ rotate: 15, scale: 1.1, boxShadow: '0 10px 25px rgba(0, 212, 255, 0.3)' }}
        >
          <Icon className="w-6 h-6 text-cyan-400" />
        </motion.div>
      </div>
    </motion.div>
  );
});

// 发电数据图表组件
export const PowerGenerationChart = React.memo(({
  data
}: {
  data: Array<{
    time: string;
    generated: number;
    consumed: number;
    grid: number;
    exported?: number;
  }>;
}) => {
  const { theme } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.4, type: "spring" }}
      className={`p-6 lg:col-span-2 ${theme === 'dark' ? 'tech-card hover-lift' : 'bg-white rounded-xl border border-gray-200 shadow-sm hover-lift'}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>实时发电数据</h3>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/30" />
            发电量
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/30" />
            消耗量
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 shadow-lg shadow-amber-400/30" />
            电网输入
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-400 shadow-lg shadow-purple-400/30" />
            电网输出
          </span>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorGenerated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorConsumed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorGrid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExported" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
            <XAxis dataKey="time" stroke={theme === 'dark' ? '#6b7280' : '#9ca3af'} fontSize={12} />
            <YAxis stroke={theme === 'dark' ? '#6b7280' : '#9ca3af'} fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                background: theme === 'dark' ? 'rgba(10, 15, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)', 
                border: theme === 'dark' ? '1px solid rgba(0, 212, 255, 0.3)' : '1px solid rgba(0, 212, 255, 0.3)',
                borderRadius: '8px',
                color: theme === 'dark' ? '#ffffff' : '#000000',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="generated" 
              name="发电量" 
              stroke="#00d4ff" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorGenerated)" 
              animationDuration={2000}
            />
            <Area 
              type="monotone" 
              dataKey="consumed" 
              name="消耗量" 
              stroke="#10b981" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorConsumed)" 
              animationDuration={2000}
            />
            <Area 
              type="monotone" 
              dataKey="grid" 
              name="电网输入" 
              stroke="#f59e0b" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorGrid)" 
              animationDuration={2000}
            />
            <Area 
              type="monotone" 
              dataKey="exported" 
              name="电网输出" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorExported)" 
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
});

// 成本构成图表组件
export const CostBreakdownChart = React.memo(({
  data
}: {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}) => {
  const { theme } = useAppStore();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`px-4 py-3 rounded-xl shadow-2xl ${theme === 'dark' ? 'bg-[#0f172a] border border-cyan-400/30' : 'bg-white border border-gray-200'}`} style={{ zIndex: 9999 }}>
          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {payload[0].name}: {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.5, type: "spring" }}
      className={`p-6 ${theme === 'dark' ? 'tech-card hover-lift' : 'bg-white rounded-xl border border-gray-200 shadow-sm hover-lift'}`}
    >
      <h3 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>成本构成</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              animationDuration={2000}
              animationBegin={300}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 gap-3 mt-6">
        {data.map((item, index) => (
          <motion.div 
            key={item.name} 
            className="flex items-center gap-3 text-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index + 0.8 }}
          >
            <span 
              className="w-4 h-4 rounded-full shadow-lg" 
              style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}40` }}
            />
            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{item.name}</span>
            <span className={`ml-auto font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{item.value}%</span>
            <div className="flex-1 ml-4">
              <div className={`w-full rounded-full h-1.5 ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{ duration: 1, delay: 0.1 * index + 0.8 }}
                  className="h-1.5 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
});

// 月度发电趋势图表组件
export const MonthlyPowerChart = React.memo(({
  data
}: {
  data: Array<{
    month: string;
    generated: number;
    consumed: number;
    exported: number;
  }>;
}) => {
  const { theme } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.6, type: "spring" }}
      className={`p-6 ${theme === 'dark' ? 'tech-card hover-lift' : 'bg-white rounded-xl border border-gray-200 shadow-sm hover-lift'}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>月度发电量趋势</h3>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/30" />
            发电量
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/30" />
            消耗量
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-400 shadow-lg shadow-purple-400/30" />
            输出量
          </span>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
            <XAxis dataKey="month" stroke={theme === 'dark' ? '#6b7280' : '#9ca3af'} fontSize={12} />
            <YAxis stroke={theme === 'dark' ? '#6b7280' : '#9ca3af'} fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                background: theme === 'dark' ? 'rgba(10, 15, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)', 
                border: theme === 'dark' ? '1px solid rgba(0, 212, 255, 0.3)' : '1px solid rgba(0, 212, 255, 0.3)',
                borderRadius: '8px',
                color: theme === 'dark' ? '#ffffff' : '#000000',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
              }}
            />
            <Bar dataKey="generated" name="发电量" fill="#00d4ff" radius={[4, 4, 0, 0]} animationDuration={2000} />
            <Bar dataKey="consumed" name="消耗量" fill="#10b981" radius={[4, 4, 0, 0]} animationDuration={2000} />
            <Bar dataKey="exported" name="输出量" fill="#8b5cf6" radius={[4, 4, 0, 0]} animationDuration={2000} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
});

// 系统健康状态项组件
export const SystemHealthItem = React.memo(({
  component,
  index
}: {
  component: {
    component: string;
    status: 'healthy' | 'warning';
    value: number;
  };
  index: number;
}) => {
  const { theme } = useAppStore();

  return (
    <motion.div 
      key={component.component} 
      className="space-y-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 * index + 0.8 }}
    >
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{component.component}</span>
        <span className={`text-sm font-medium ${component.status === 'healthy' ? 'text-emerald-400' : 'text-amber-400'}`}>
          {component.status === 'healthy' ? '健康' : '警告'}
        </span>
      </div>
      <div className={`w-full rounded-full h-3 ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${component.value}%` }}
          transition={{ duration: 1, delay: 0.1 * index + 0.8 }}
          className={`h-3 rounded-full ${component.status === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400'}`}
        />
      </div>
    </motion.div>
  );
});

// 成本趋势图表组件
export const CostTrendChart = React.memo(({
  data
}: {
  data: Array<{
    month: string;
    cost: number;
    budget: number;
  }>;
}) => {
  const { theme } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.8, type: "spring" }}
      className={`p-6 ${theme === 'dark' ? 'tech-card hover-lift' : 'bg-white rounded-xl border border-gray-200 shadow-sm hover-lift'}`}
    >
      <h3 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>成本趋势分析</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
            <XAxis dataKey="month" stroke={theme === 'dark' ? '#6b7280' : '#9ca3af'} fontSize={12} />
            <YAxis stroke={theme === 'dark' ? '#6b7280' : '#9ca3af'} fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                background: theme === 'dark' ? 'rgba(10, 15, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)', 
                border: theme === 'dark' ? '1px solid rgba(0, 212, 255, 0.3)' : '1px solid rgba(0, 212, 255, 0.3)',
                borderRadius: '8px',
                color: theme === 'dark' ? '#ffffff' : '#000000',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
              }}
            />
            <Line type="monotone" dataKey="cost" name="实际成本" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="budget" name="预算" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
});

// AI洞察项组件
export const AiInsightItem = React.memo(({
  insight,
  index
}: {
  insight: {
    id: number;
    title: string;
    message: string;
    confidence: number;
    type: 'info' | 'warning' | 'success';
  };
  index: number;
}) => {
  const { theme } = useAppStore();

  return (
    <motion.div 
      key={insight.id} 
      className={`p-4 rounded-lg border ${insight.type === 'warning' ? 'bg-amber-400/10 border-amber-400/30' : insight.type === 'success' ? 'bg-emerald-400/10 border-emerald-400/30' : 'bg-cyan-400/10 border-cyan-400/30'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 * index + 1.0 }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg ${insight.type === 'warning' ? 'bg-amber-400/20' : insight.type === 'success' ? 'bg-emerald-400/20' : 'bg-cyan-400/20'} flex items-center justify-center flex-shrink-0`}>
          {insight.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-400" /> : 
           insight.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : 
           <Info className="w-5 h-5 text-cyan-400" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{insight.title}</h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
              置信度: {insight.confidence}%
            </span>
          </div>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{insight.message}</p>
        </div>
      </div>
    </motion.div>
  );
});

// 设备状态项组件
export const EquipmentStatusItem = React.memo(({
  equipment,
  index
}: {
  equipment: {
    id: number;
    type: string;
    status: 'online' | 'warning';
    temperature: number;
    power: number;
    efficiency: number;
  };
  index: number;
}) => {
  const { theme } = useAppStore();

  return (
    <motion.div 
      key={equipment.id} 
      className="p-4 rounded-lg border border-white/10 bg-white/5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 * index + 1.1 }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{equipment.type} #{equipment.id}</h4>
          <div className={`text-xs px-2 py-0.5 rounded-full ${equipment.status === 'online' ? 'bg-emerald-400/20 text-emerald-400' : 'bg-amber-400/20 text-amber-400'}`}>
            {equipment.status === 'online' ? '在线' : '警告'}
          </div>
        </div>
        <div className="text-right">
          <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{equipment.power} W</p>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>功率输出</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>温度</p>
          <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{equipment.temperature}°C</p>
        </div>
        <div>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>效率</p>
          <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{equipment.efficiency}%</p>
        </div>
        <div>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>状态</p>
          <p className={`${equipment.status === 'online' ? 'text-emerald-400' : 'text-amber-400'}`}>
            {equipment.status === 'online' ? '正常' : '异常'}
          </p>
        </div>
      </div>
    </motion.div>
  );
});

// 维护计划项组件
export const MaintenanceTaskItem = React.memo(({
  task,
  index
}: {
  task: {
    id: number;
    task: string;
    date: string;
    priority: 'high' | 'medium' | 'low';
    status: 'scheduled' | 'completed';
  };
  index: number;
}) => {
  const { theme } = useAppStore();

  return (
    <motion.div 
      key={task.id} 
      className="p-4 rounded-lg border border-white/10 bg-white/5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 * index + 1.2 }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{task.task}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{task.date}</span>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${task.priority === 'high' ? 'bg-red-400/20 text-red-400' : task.priority === 'medium' ? 'bg-amber-400/20 text-amber-400' : 'bg-emerald-400/20 text-emerald-400'}`}>
          {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}优先级
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${task.status === 'scheduled' ? 'bg-blue-400' : 'bg-emerald-400'}`} />
        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {task.status === 'scheduled' ? '已计划' : '已完成'}
        </span>
      </div>
    </motion.div>
  );
});

// 最近活动项组件
export const ActivityItem = React.memo(({
  activity,
  index
}: {
  activity: {
    id: number;
    action: string;
    user: string;
    time: string;
    status: 'success' | 'warning';
  };
  index: number;
}) => {
  const { theme } = useAppStore();

  return (
    <motion.div 
      key={activity.id} 
      className="flex items-start gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 * index + 1.3 }}
    >
      <div className={`w-10 h-10 rounded-lg ${activity.status === 'success' ? 'bg-emerald-400/20' : 'bg-amber-400/20'} flex items-center justify-center flex-shrink-0`}>
        {activity.status === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-amber-400" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{activity.action}</h4>
          <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{activity.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{activity.user}</span>
        </div>
      </div>
    </motion.div>
  );
});

// 天气预报项组件
export const WeatherForecastItem = React.memo(({
  day,
  index
}: {
  day: {
    day: string;
    temperature: number;
    solar: number;
    icon: string;
    humidity: number;
    wind: number;
  };
  index: number;
}) => {
  const { theme } = useAppStore();

  return (
    <motion.div
      key={day.day}
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.1 * index + 0.9, type: "spring" }}
      whileHover={{ scale: 1.03, x: 5 }}
      className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}`}
    >
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{ rotate: 15, scale: 1.2 }}
          className="text-3xl"
        >
          {day.icon}
        </motion.div>
        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{day.day}</span>
      </div>
      <div className="text-right">
        <p className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{day.temperature}°C</p>
        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{day.solar} W/m²</p>
      </div>
    </motion.div>
  );
});

// AI算法特性项组件
export const AlgorithmFeatureItem = React.memo(({
  feature,
  index
}: {
  feature: {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  };
  index: number;
}) => {
  const { theme } = useAppStore();
  const Icon = feature.icon;

  return (
    <motion.div
      key={feature.title}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 * index + 1.0, type: "spring" }}
      whileHover={{ scale: 1.05, y: -5, rotate: 1 }}
      className={`p-6 rounded-xl border transition-all duration-300 ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:border-cyan-400/50' : 'bg-gray-50 border-gray-200 hover:border-cyan-400/50'}`}
    >
      <div className="flex items-start gap-4">
        <motion.div 
          whileHover={{ rotate: 15, scale: 1.1 }}
          className="w-12 h-12 rounded-2xl bg-cyan-400/20 flex items-center justify-center shadow-lg"
        >
          <Icon className="w-6 h-6 text-cyan-400" />
        </motion.div>
        <div className="flex-1">
          <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{feature.title}</h4>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{feature.description}</p>
        </div>
      </div>
    </motion.div>
  );
});

// 系统消息项组件
export const AlertItem = React.memo(({
  alert,
  index
}: {
  alert: {
    id: number;
    type: 'warning' | 'info' | 'success';
    message: string;
    time: string;
    severity: 'high' | 'medium' | 'low';
  };
  index: number;
}) => {
  const { theme } = useAppStore();

  return (
    <motion.div 
      key={alert.id} 
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.1 * index + 1.2, type: "spring" }}
      whileHover={{ x: 10, scale: 1.02 }}
      className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}`}
    >
      <div className={`w-10 h-10 rounded-lg ${alert.type === 'warning' ? 'bg-amber-400/20' : alert.type === 'success' ? 'bg-emerald-400/20' : 'bg-cyan-400/20'} flex items-center justify-center flex-shrink-0`}>
        {alert.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-400" /> : 
         alert.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : 
         <Info className="w-5 h-5 text-cyan-400" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{alert.message}</h4>
          <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{alert.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${alert.severity === 'high' ? 'bg-red-400/20 text-red-400' : alert.severity === 'medium' ? 'bg-amber-400/20 text-amber-400' : 'bg-emerald-400/20 text-emerald-400'}`}>
            {alert.severity === 'high' ? '高' : alert.severity === 'medium' ? '中' : '低'}严重度
          </span>
        </div>
      </div>
    </motion.div>
  );
});
