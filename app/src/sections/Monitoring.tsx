import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Zap,
  Thermometer,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Bell,
  Cloud,
  Calendar,
  Clock,
  DollarSign,
  Search,
  User,
  Shield,
  FileText,
  MapPin,
  Snowflake,
  Wind,
  CloudRain,
  Mountain,
  HardHat,
  Wrench,
  BookOpen,
  BarChart3,
  Sun,
  CloudSun,
  CloudDrizzle,
  Info,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import useAppStore from '../store/useAppStore';

// Mock real-time data
const generateRealtimeData = () => {
  const data = [];
  for (let i = 0; i < 24; i++) {
    data.push({
      time: `${i}:00`,
      power: Math.sin((i - 6) * Math.PI / 12) * 80 + 80 + Math.random() * 10,
      efficiency: 85 + Math.random() * 10,
    });
  }
  return data;
};

// Device status data (moved to component-level generation)

const alerts = [
  { id: 1, level: 'warning', device: 'INV-04', message: '逆变器温度过高 (58°C)', time: '10:23', status: 'unresolved' },
  { id: 2, level: 'info', device: 'SYSTEM', message: '日发电量突破 120MWh', time: '09:45', status: 'resolved' },
  { id: 3, level: 'error', device: 'TR-02', message: '箱变通讯中断', time: '08:30', status: 'resolved' },
  { id: 4, level: 'warning', device: 'INV-06', message: '负载率超过 95%', time: '07:15', status: 'resolved' },
];

const weatherData = {
  temperature: 28,
  humidity: 65,
  windSpeed: 3.5,
  solarRadiation: 850,
  cloudCover: 15,
};

// Enhanced maintenance schedule generation algorithm with predictive maintenance
const generateMaintenanceSchedule = (equipment: any, failurePredictions: any[]) => {
  interface MaintenanceTask {
    id: number;
    device: string;
    deviceName?: string;
    deviceType?: string;
    type: string;
    date: string;
    status: 'scheduled' | 'completed';
    duration: string;
    cost: number;
    priority: string;
    reason?: string;
    recommendedAction?: string;
    failureScore?: number;
  }
  
  const schedule: MaintenanceTask[] = [];
  let id = 1;
  
  // 维护类型配置
  const maintenanceConfig = {
    inverter: {
      regular: { type: '定期维护', interval: 90, duration: '4小时', cost: 1200 },
      preventive: { type: '预防性维护', interval: 180, duration: '6小时', cost: 1800 },
      annual: { type: '年度维护', interval: 365, duration: '8小时', cost: 2400 }
    },
    transformer: {
      regular: { type: '定期维护', interval: 180, duration: '6小时', cost: 1800 },
      preventive: { type: '预防性维护', interval: 365, duration: '12小时', cost: 3600 },
      annual: { type: '年度维护', interval: 730, duration: '16小时', cost: 4800 }
    },
    combiner_box: {
      regular: { type: '定期维护', interval: 180, duration: '3小时', cost: 900 },
      preventive: { type: '预防性维护', interval: 365, duration: '5小时', cost: 1500 }
    },
    distribution_cabinet: {
      regular: { type: '定期维护', interval: 180, duration: '5小时', cost: 1500 },
      preventive: { type: '预防性维护', interval: 365, duration: '8小时', cost: 2400 },
      annual: { type: '年度维护', interval: 730, duration: '12小时', cost: 3600 }
    }
  };
  
  // 基于故障预测生成维护任务
  failurePredictions.forEach((prediction) => {
    let maintenanceType = '定期维护';
    let duration = '4小时';
    let cost = 1200;
    let priority = 'normal';
    
    // 根据风险等级确定维护类型和优先级
    switch (prediction.risk) {
      case '高':
        maintenanceType = '故障维修';
        duration = '8小时';
        cost = 2400;
        priority = 'urgent';
        break;
      case '中高':
        maintenanceType = '紧急预防性维护';
        duration = '6小时';
        cost = 1800;
        priority = 'high';
        break;
      case '中':
        maintenanceType = '预防性维护';
        duration = '5小时';
        cost = 1500;
        priority = 'medium';
        break;
      case '中低':
        maintenanceType = '加强监测';
        duration = '3小时';
        cost = 900;
        priority = 'low';
        break;
      default:
        maintenanceType = '定期维护';
        duration = '4小时';
        cost = 1200;
        priority = 'normal';
    }
    
    // 根据风险等级生成维护日期
    const today = new Date();
    let daysToAdd = 30; // 默认低风险
    
    switch (prediction.risk) {
      case '高':
        daysToAdd = 3; // 高风险紧急处理
        break;
      case '中高':
        daysToAdd = 7; // 中高风险尽快处理
        break;
      case '中':
        daysToAdd = 14; // 中风险计划处理
        break;
      case '中低':
        daysToAdd = 21; // 中低风险近期处理
        break;
    }
    
    const maintenanceDate = new Date(today);
    maintenanceDate.setDate(today.getDate() + daysToAdd);
    const formattedDate = maintenanceDate.toISOString().split('T')[0];
    
    schedule.push({
      id,
      device: prediction.device,
      deviceName: prediction.deviceName,
      deviceType: prediction.deviceType,
      type: maintenanceType,
      date: formattedDate,
      status: 'scheduled' as const,
      duration,
      cost,
      priority,
      reason: prediction.reason,
      recommendedAction: prediction.recommendedAction,
      failureScore: prediction.failureScore
    });
    
    id++;
  });
  
  // 为所有设备添加常规维护任务
  // 逆变器维护
  equipment.inverters.forEach((inv: any) => {
    const config = maintenanceConfig.inverter;
    const today = new Date();
    
    // 添加定期维护
    for (let i = 1; i <= 4; i++) {
      const maintenanceDate = new Date(today);
      maintenanceDate.setDate(today.getDate() + config.regular.interval * i);
      const formattedDate = maintenanceDate.toISOString().split('T')[0];
      
      // 检查是否已有相同设备和日期的维护任务
      const existingTask = schedule.find(task => 
        task.device === inv.id && task.date === formattedDate
      );
      
      if (!existingTask) {
        schedule.push({
          id,
          device: inv.id,
          deviceName: inv.name,
          deviceType: 'inverter',
          type: config.regular.type,
          date: formattedDate,
          status: 'scheduled' as const,
          duration: config.regular.duration,
          cost: config.regular.cost,
          priority: 'normal',
          reason: '常规维护',
          recommendedAction: '检查逆变器运行状态，清理灰尘，测试各项参数'
        });
        
        id++;
      }
    }
    
    // 添加预防性维护
    for (let i = 1; i <= 2; i++) {
      const maintenanceDate = new Date(today);
      maintenanceDate.setDate(today.getDate() + config.preventive.interval * i);
      const formattedDate = maintenanceDate.toISOString().split('T')[0];
      
      const existingTask = schedule.find(task => 
        task.device === inv.id && task.date === formattedDate
      );
      
      if (!existingTask) {
        schedule.push({
          id,
          device: inv.id,
          deviceName: inv.name,
          deviceType: 'inverter',
          type: config.preventive.type,
          date: formattedDate,
          status: 'scheduled' as const,
          duration: config.preventive.duration,
          cost: config.preventive.cost,
          priority: 'medium',
          reason: '预防性维护',
          recommendedAction: '详细检查逆变器内部组件，测试绝缘性能，更新固件'
        });
        
        id++;
      }
    }
    
    // 添加年度维护
    const annualDate = new Date(today);
    annualDate.setDate(today.getDate() + config.annual.interval);
    const annualFormattedDate = annualDate.toISOString().split('T')[0];
    
    const existingAnnualTask = schedule.find(task => 
      task.device === inv.id && task.date === annualFormattedDate
    );
    
    if (!existingAnnualTask) {
      schedule.push({
        id,
        device: inv.id,
        deviceName: inv.name,
        deviceType: 'inverter',
        type: config.annual.type,
        date: annualFormattedDate,
        status: 'scheduled' as const,
        duration: config.annual.duration,
        cost: config.annual.cost,
        priority: 'medium',
        reason: '年度维护',
        recommendedAction: '全面检修逆变器，更换易损件，进行负载测试'
      });
      
      id++;
    }
  });
  
  // 变压器维护
  equipment.transformers.forEach((tr: any) => {
    const config = maintenanceConfig.transformer;
    const today = new Date();
    
    // 添加定期维护
    for (let i = 1; i <= 2; i++) {
      const maintenanceDate = new Date(today);
      maintenanceDate.setDate(today.getDate() + config.regular.interval * i);
      const formattedDate = maintenanceDate.toISOString().split('T')[0];
      
      const existingTask = schedule.find(task => 
        task.device === tr.id && task.date === formattedDate
      );
      
      if (!existingTask) {
        schedule.push({
          id,
          device: tr.id,
          deviceName: tr.name,
          deviceType: 'transformer',
          type: config.regular.type,
          date: formattedDate,
          status: 'scheduled' as const,
          duration: config.regular.duration,
          cost: config.regular.cost,
          priority: 'normal',
          reason: '定期维护',
          recommendedAction: '检查变压器运行状态，测试油色谱，检查冷却系统'
        });
        
        id++;
      }
    }
    
    // 添加预防性维护
    const preventiveDate = new Date(today);
    preventiveDate.setDate(today.getDate() + config.preventive.interval);
    const preventiveFormattedDate = preventiveDate.toISOString().split('T')[0];
    
    const existingPreventiveTask = schedule.find(task => 
      task.device === tr.id && task.date === preventiveFormattedDate
    );
    
    if (!existingPreventiveTask) {
      schedule.push({
        id,
        device: tr.id,
        deviceName: tr.name,
        deviceType: 'transformer',
        type: config.preventive.type,
        date: preventiveFormattedDate,
        status: 'scheduled' as const,
        duration: config.preventive.duration,
        cost: config.preventive.cost,
        priority: 'medium',
        reason: '预防性维护',
        recommendedAction: '详细检查变压器绝缘性能，更换老化部件，测试保护装置'
      });
      
      id++;
    }
  });
  
  // 汇流箱维护
  equipment.combinerBoxes.forEach((cb: any) => {
    const config = maintenanceConfig.combiner_box;
    const today = new Date();
    
    // 添加定期维护
    for (let i = 1; i <= 2; i++) {
      const maintenanceDate = new Date(today);
      maintenanceDate.setDate(today.getDate() + config.regular.interval * i);
      const formattedDate = maintenanceDate.toISOString().split('T')[0];
      
      const existingTask = schedule.find(task => 
        task.device === cb.id && task.date === formattedDate
      );
      
      if (!existingTask) {
        schedule.push({
          id,
          device: cb.id,
          deviceName: cb.name,
          deviceType: 'combiner_box',
          type: config.regular.type,
          date: formattedDate,
          status: 'scheduled' as const,
          duration: config.regular.duration,
          cost: config.regular.cost,
          priority: 'normal',
          reason: '定期维护',
          recommendedAction: '检查汇流箱运行状态，测试熔断器，清理灰尘'
        });
        
        id++;
      }
    }
  });
  
  // 配电柜维护
  equipment.distributionCabinets.forEach((dc: any) => {
    const config = maintenanceConfig.distribution_cabinet;
    const today = new Date();
    
    // 添加定期维护
    for (let i = 1; i <= 2; i++) {
      const maintenanceDate = new Date(today);
      maintenanceDate.setDate(today.getDate() + config.regular.interval * i);
      const formattedDate = maintenanceDate.toISOString().split('T')[0];
      
      const existingTask = schedule.find(task => 
        task.device === dc.id && task.date === formattedDate
      );
      
      if (!existingTask) {
        schedule.push({
          id,
          device: dc.id,
          deviceName: dc.name,
          deviceType: 'distribution_cabinet',
          type: config.regular.type,
          date: formattedDate,
          status: 'scheduled' as const,
          duration: config.regular.duration,
          cost: config.regular.cost,
          priority: 'normal',
          reason: '定期维护',
          recommendedAction: '检查配电柜运行状态，测试断路器，清理灰尘'
        });
        
        id++;
      }
    }
  });
  
  // 按日期和优先级排序
  schedule.sort((a, b) => {
    const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateComparison !== 0) return dateComparison;
    
    // 按优先级排序
    const priorityOrder: Record<string, number> = { 'urgent': 0, 'high': 1, 'medium': 2, 'normal': 3, 'low': 4 };
    return (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
  });
  
  return schedule;
};

// Equipment maintenance cycle data
const maintenanceCycles = [
  { deviceType: '逆变器', cycle: '6个月', inspection: '每月', expectedLife: '10年' },
  { deviceType: '箱式变压器', cycle: '12个月', inspection: '每季度', expectedLife: '20年' },
  { deviceType: '汇流箱', cycle: '12个月', inspection: '每半年', expectedLife: '15年' },
  { deviceType: '配电柜', cycle: '12个月', inspection: '每季度', expectedLife: '20年' },
];

// Enhanced failure prediction algorithm with machine learning-inspired approach
const generateFailurePrediction = (equipment: any) => {
  // Define types
  interface HealthData {
    trend: string;
    lastMaintenance: string;
  }
  
  const predictions: any[] = [];
  
  // 设备运行时间（月）- 基于设备型号和安装时间的模拟
  const equipmentAge = {
    inverters: 36, // 3年
    transformers: 60, // 5年
    distributionCabinets: 48, // 4年
    combinerBoxes: 42 // 3.5年
  };
  
  // 实时环境因素
  const environmentalFactors = {
    temperature: 28, // 环境温度
    humidity: 65, // 湿度
    dustLevel: 3, // 灰尘等级 (1-5)
    vibrationLevel: 2, // 振动等级 (1-5)
    rainfall: 0, // 降雨量 (mm)
    solarRadiation: 850, // 太阳辐射 (W/m²)
    windSpeed: 3.5 // 风速 (m/s)
  };
  
  // 历史故障数据
  const historicalFailures: Record<string, number> = {
    'INV-04': 2, // 逆变器4有2次历史故障
    'TR-02': 1, // 变压器2有1次历史故障
    'DC-01': 0, // 配电柜1无历史故障
    'CB-01': 1 // 汇流箱1有1次历史故障
  };
  
  // 设备健康状态历史数据（模拟）
  const historicalHealthData: Record<string, HealthData> = {
    'INV-01': { trend: 'stable', lastMaintenance: '2024-01-15' },
    'INV-02': { trend: 'stable', lastMaintenance: '2024-02-20' },
    'INV-03': { trend: 'stable', lastMaintenance: '2024-03-10' },
    'INV-04': { trend: 'declining', lastMaintenance: '2024-04-05' },
    'INV-05': { trend: 'stable', lastMaintenance: '2024-01-20' },
    'INV-06': { trend: 'stable', lastMaintenance: '2024-02-25' },
    'INV-07': { trend: 'stable', lastMaintenance: '2024-03-15' },
    'INV-08': { trend: 'stable', lastMaintenance: '2024-04-10' },
    'TR-01': { trend: 'stable', lastMaintenance: '2023-12-01' },
    'TR-02': { trend: 'declining', lastMaintenance: '2023-11-15' },
    'TR-03': { trend: 'stable', lastMaintenance: '2023-12-10' },
    'DC-01': { trend: 'stable', lastMaintenance: '2023-11-01' },
    'DC-02': { trend: 'stable', lastMaintenance: '2023-12-05' }
  };
  
  // 计算两个日期之间的天数
  const daysBetween = (date1: string, date2: string) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  };
  
  // 逆变器故障预测
  equipment.inverters.forEach((inv: any) => {
    let risk = '低';
    let remainingLife = '24个月';
    let reason = '正常损耗';
    let recommendedAction = '常规维护';
    let failureType = 'none';
    
    // 综合故障预测得分
    let failureScore = 0;
    
    // 温度分析
    if (inv.temperature > 55) {
      failureScore += 5;
      failureType = 'overheating';
    } else if (inv.temperature > 50) {
      failureScore += 4;
      failureType = 'high_temperature';
    } else if (inv.temperature > 45) {
      failureScore += 2;
    } else if (inv.temperature > 40) {
      failureScore += 1;
    }
    
    // 负载率分析
    if (inv.loadRate > 98) {
      failureScore += 4;
      failureType = 'overload';
    } else if (inv.loadRate > 95) {
      failureScore += 3;
    } else if (inv.loadRate > 85) {
      failureScore += 1;
    }
    
    // 效率分析
    if (inv.efficiency < 85) {
      failureScore += 5;
      failureType = 'efficiency_drop';
    } else if (inv.efficiency < 90) {
      failureScore += 3;
    } else if (inv.efficiency < 95) {
      failureScore += 1;
    }
    
    // 运行时间分析
    if (equipmentAge.inverters > 48) {
      failureScore += 3;
    } else if (equipmentAge.inverters > 36) {
      failureScore += 2;
    } else if (equipmentAge.inverters > 24) {
      failureScore += 1;
    }
    
    // 环境因素分析
    if (environmentalFactors.temperature > 35) {
      failureScore += 2;
    } else if (environmentalFactors.temperature > 30) {
      failureScore += 1;
    }
    if (environmentalFactors.humidity > 80) {
      failureScore += 2;
    } else if (environmentalFactors.humidity > 70) {
      failureScore += 1;
    }
    if (environmentalFactors.dustLevel > 4) {
      failureScore += 3;
    } else if (environmentalFactors.dustLevel > 3) {
      failureScore += 1;
    }
    if (environmentalFactors.vibrationLevel > 3) {
      failureScore += 2;
    }
    
    // 历史故障分析
    if (historicalFailures[inv.id] && historicalFailures[inv.id] > 2) {
      failureScore += 4;
    } else if (historicalFailures[inv.id] && historicalFailures[inv.id] > 1) {
      failureScore += 2;
    } else if (historicalFailures[inv.id] && historicalFailures[inv.id] > 0) {
      failureScore += 1;
    }
    
    // 健康趋势分析
    if (historicalHealthData[inv.id] && historicalHealthData[inv.id].trend === 'declining') {
      failureScore += 3;
    }
    
    // 维护间隔分析
    if (historicalHealthData[inv.id]) {
      const daysSinceMaintenance = daysBetween(historicalHealthData[inv.id].lastMaintenance, new Date().toISOString().split('T')[0]);
      if (daysSinceMaintenance > 180) {
        failureScore += 2;
      } else if (daysSinceMaintenance > 90) {
        failureScore += 1;
      }
    }
    
    // 基于得分确定风险等级
    if (failureScore >= 12) {
      risk = '高';
      remainingLife = '1-3个月';
      reason = '多因素综合风险';
      recommendedAction = '立即检修';
    } else if (failureScore >= 8) {
      risk = '中高';
      remainingLife = '3-6个月';
      reason = '多因素风险';
      recommendedAction = '计划检修';
    } else if (failureScore >= 5) {
      risk = '中';
      remainingLife = '6-12个月';
      reason = '多因素风险';
      recommendedAction = '计划检修';
    } else if (failureScore >= 3) {
      risk = '中低';
      remainingLife = '12-18个月';
      reason = '单一因素风险';
      recommendedAction = '加强监测';
    }
    
    // 具体故障类型分析
    if (failureType === 'overheating') {
      reason = '温度异常过高';
      recommendedAction = '检查散热系统，清理灰尘，检查风扇';
    } else if (failureType === 'high_temperature') {
      reason = '温度偏高';
      recommendedAction = '检查散热系统，清理灰尘';
    } else if (failureType === 'overload') {
      reason = '负载率过高';
      recommendedAction = '调整负载分配，检查输入功率';
    } else if (failureType === 'efficiency_drop') {
      reason = '效率显著下降';
      recommendedAction = '检查逆变器内部组件，可能需要更换';
    }
    
    // 基于设备型号的特定建议
    if (inv.model.includes('Sungrow')) {
      if (inv.temperature > 50) {
        recommendedAction += '（注意：Sungrow逆变器对温度较敏感）';
      }
    } else if (inv.model.includes('Huawei')) {
      if (inv.efficiency < 92) {
        recommendedAction += '（建议检查华为逆变器的MPPT算法设置）';
      }
    }
    
    predictions.push({
      device: inv.id,
      deviceName: inv.name,
      deviceType: 'inverter',
      risk,
      remainingLife,
      reason,
      recommendedAction,
      failureType: failureType !== 'none' ? failureType : 'normal',
      failureScore,
      lastMaintenance: historicalHealthData[inv.id]?.lastMaintenance || '未知',
      healthTrend: historicalHealthData[inv.id]?.trend || 'stable'
    });
  });
  
  // 变压器故障预测
  equipment.transformers.forEach((tr: any) => {
    let risk = '低';
    let remainingLife = '24个月';
    let reason = '正常损耗';
    let recommendedAction = '常规维护';
    const failureType = 'none';
    
    // 综合故障预测得分
    let failureScore = 0;
    
    // 运行时间分析
    if (equipmentAge.transformers > 72) {
      failureScore += 4;
    } else if (equipmentAge.transformers > 60) {
      failureScore += 3;
    } else if (equipmentAge.transformers > 48) {
      failureScore += 1;
    }
    
    // 环境因素分析
    if (environmentalFactors.temperature > 35) {
      failureScore += 2;
    } else if (environmentalFactors.temperature > 30) {
      failureScore += 1;
    }
    if (environmentalFactors.humidity > 80) {
      failureScore += 3;
    } else if (environmentalFactors.humidity > 70) {
      failureScore += 2;
    }
    if (environmentalFactors.rainfall > 50) {
      failureScore += 2;
    }
    
    // 历史故障分析
    if (historicalFailures[tr.id] && historicalFailures[tr.id] > 1) {
      failureScore += 3;
    } else if (historicalFailures[tr.id] && historicalFailures[tr.id] > 0) {
      failureScore += 2;
    }
    
    // 健康趋势分析
    if (historicalHealthData[tr.id] && historicalHealthData[tr.id].trend === 'declining') {
      failureScore += 3;
    }
    
    // 维护间隔分析
    if (historicalHealthData[tr.id]) {
      const daysSinceMaintenance = daysBetween(historicalHealthData[tr.id].lastMaintenance, new Date().toISOString().split('T')[0]);
      if (daysSinceMaintenance > 365) {
        failureScore += 3;
      } else if (daysSinceMaintenance > 180) {
        failureScore += 1;
      }
    }
    
    // 基于得分确定风险等级
    if (failureScore >= 10) {
      risk = '高';
      remainingLife = '6-12个月';
      reason = '绝缘老化风险高';
      recommendedAction = '计划更换';
    } else if (failureScore >= 7) {
      risk = '中高';
      remainingLife = '12-18个月';
      reason = '绝缘老化风险';
      recommendedAction = '计划检修';
    } else if (failureScore >= 5) {
      risk = '中';
      remainingLife = '18-24个月';
      reason = '绝缘老化';
      recommendedAction = '加强监测';
    } else if (failureScore >= 3) {
      risk = '中低';
      remainingLife = '24-36个月';
      reason = '轻微老化';
      recommendedAction = '常规维护';
    }
    
    // 基于变压器类型的特定建议
    if (tr.type === '3200kVA') {
      if (failureScore >= 7) {
        recommendedAction += '（注意：大容量变压器更换成本较高，建议提前规划）';
      }
    }
    
    predictions.push({
      device: tr.id,
      deviceName: tr.name,
      deviceType: 'transformer',
      risk,
      remainingLife,
      reason,
      recommendedAction,
      failureType: failureType !== 'none' ? failureType : 'normal',
      failureScore,
      lastMaintenance: historicalHealthData[tr.id]?.lastMaintenance || '未知',
      healthTrend: historicalHealthData[tr.id]?.trend || 'stable'
    });
  });
  
  // 配电柜故障预测
  equipment.distributionCabinets.forEach((dc: any) => {
    let risk = '低';
    let remainingLife = '24个月';
    let reason = '正常损耗';
    let recommendedAction = '常规维护';
    const failureType = 'none';
    
    // 综合故障预测得分
    let failureScore = 0;
    
    // 运行时间分析
    if (equipmentAge.distributionCabinets > 60) {
      failureScore += 3;
    } else if (equipmentAge.distributionCabinets > 48) {
      failureScore += 2;
    }
    
    // 环境因素分析
    if (environmentalFactors.humidity > 80) {
      failureScore += 2;
    } else if (environmentalFactors.humidity > 70) {
      failureScore += 1;
    }
    if (environmentalFactors.dustLevel > 4) {
      failureScore += 2;
    } else if (environmentalFactors.dustLevel > 3) {
      failureScore += 1;
    }
    
    // 历史故障分析
    if (historicalFailures[dc.id] && historicalFailures[dc.id] > 0) {
      failureScore += 2;
    }
    
    // 健康趋势分析
    if (historicalHealthData[dc.id] && historicalHealthData[dc.id].trend === 'declining') {
      failureScore += 2;
    }
    
    // 维护间隔分析
    if (historicalHealthData[dc.id]) {
      const daysSinceMaintenance = daysBetween(historicalHealthData[dc.id].lastMaintenance, new Date().toISOString().split('T')[0]);
      if (daysSinceMaintenance > 365) {
        failureScore += 2;
      } else if (daysSinceMaintenance > 180) {
        failureScore += 1;
      }
    }
    
    // 基于得分确定风险等级
    if (failureScore >= 8) {
      risk = '中';
      remainingLife = '12-18个月';
      reason = '组件老化风险';
      recommendedAction = '计划检修';
    } else if (failureScore >= 5) {
      risk = '中低';
      remainingLife = '18-24个月';
      reason = '组件老化';
      recommendedAction = '加强监测';
    } else if (failureScore >= 3) {
      risk = '低';
      remainingLife = '24-36个月';
      reason = '轻微老化';
      recommendedAction = '常规维护';
    }
    
    predictions.push({
      device: dc.id,
      deviceName: dc.name,
      deviceType: 'distribution_cabinet',
      risk,
      remainingLife,
      reason,
      recommendedAction,
      failureType: failureType !== 'none' ? failureType : 'normal',
      failureScore,
      lastMaintenance: historicalHealthData[dc.id]?.lastMaintenance || '未知',
      healthTrend: historicalHealthData[dc.id]?.trend || 'stable'
    });
  });
  
  // 汇流箱故障预测
  equipment.combinerBoxes.forEach((cb: any) => {
    let risk = '低';
    let remainingLife = '24个月';
    let reason = '正常损耗';
    let recommendedAction = '常规维护';
    const failureType = 'none';
    
    // 综合故障预测得分
    let failureScore = 0;
    
    // 运行时间分析
    if (equipmentAge.combinerBoxes > 48) {
      failureScore += 2;
    } else if (equipmentAge.combinerBoxes > 36) {
      failureScore += 1;
    }
    
    // 环境因素分析
    if (environmentalFactors.humidity > 80) {
      failureScore += 2;
    } else if (environmentalFactors.humidity > 70) {
      failureScore += 1;
    }
    if (environmentalFactors.dustLevel > 4) {
      failureScore += 2;
    } else if (environmentalFactors.dustLevel > 3) {
      failureScore += 1;
    }
    
    // 历史故障分析
    if (historicalFailures[cb.id] && historicalFailures[cb.id] > 0) {
      failureScore += 2;
    }
    
    // 基于得分确定风险等级
    if (failureScore >= 6) {
      risk = '中';
      remainingLife = '12-18个月';
      reason = '组件老化风险';
      recommendedAction = '计划检修';
    } else if (failureScore >= 3) {
      risk = '中低';
      remainingLife = '18-24个月';
      reason = '组件老化';
      recommendedAction = '加强监测';
    }
    
    predictions.push({
      device: cb.id,
      deviceName: cb.name,
      deviceType: 'combiner_box',
      risk,
      remainingLife,
      reason,
      recommendedAction,
      failureType: failureType !== 'none' ? failureType : 'normal',
      failureScore,
      lastMaintenance: '2024-03-01', // 模拟数据
      healthTrend: 'stable'
    });
  });
  
  // 按风险等级排序
  const riskOrder: Record<string, number> = { '高': 5, '中高': 4, '中': 3, '中低': 2, '低': 1 };
  predictions.sort((a, b) => {
    return (riskOrder[a.risk] || 0) - (riskOrder[b.risk] || 0);
  });

  return predictions;
};

// Maintenance cost data
const maintenanceCost = {
  monthly: 8500,
  quarterly: 25000,
  annual: 100000,
  breakdown: 15000,
  preventive: 60000,
};

// ============================================================
// New data for enhanced monitoring sections
// ============================================================

// 7-day weather forecast mock data
const weeklyForecast = [
  { day: '周一', icon: 'sun', tempHigh: 30, tempLow: 18, rain: 0, wind: 2.1, condition: '晴' },
  { day: '周二', icon: 'cloud-sun', tempHigh: 28, tempLow: 17, rain: 0, wind: 3.0, condition: '多云' },
  { day: '周三', icon: 'cloud-sun', tempHigh: 27, tempLow: 16, rain: 10, wind: 2.5, condition: '多云' },
  { day: '周四', icon: 'cloud-rain', tempHigh: 22, tempLow: 14, rain: 45, wind: 5.2, condition: '中雨' },
  { day: '周五', icon: 'cloud-rain', tempHigh: 20, tempLow: 13, rain: 60, wind: 6.8, condition: '大雨' },
  { day: '周六', icon: 'cloud-sun', tempHigh: 25, tempLow: 15, rain: 5, wind: 3.1, condition: '多云转晴' },
  { day: '周日', icon: 'sun', tempHigh: 29, tempLow: 17, rain: 0, wind: 1.8, condition: '晴' },
];

// Remote diagnostics - device parameter mock
interface DeviceDiagnostic {
  id: string;
  name: string;
  type: string;
  voltage: number;
  current: number;
  temperature: number;
  efficiency: number;
  normalRanges: { voltage: [number, number]; current: [number, number]; temperature: [number, number]; efficiency: [number, number] };
  history: { time: string; voltage: number; current: number; temperature: number; efficiency: number }[];
}
const diagnosticDevices: DeviceDiagnostic[] = [
  {
    id: 'INV-01', name: '逆变器 #1', type: 'inverter',
    voltage: 540, current: 185, temperature: 42, efficiency: 96.5,
    normalRanges: { voltage: [480, 600], current: [100, 200], temperature: [20, 55], efficiency: [90, 100] },
    history: Array.from({ length: 12 }, (_, i) => ({
      time: `${i * 2}:00`, voltage: 530 + Math.random() * 20, current: 175 + Math.random() * 20,
      temperature: 38 + Math.random() * 8, efficiency: 94 + Math.random() * 4,
    })),
  },
  {
    id: 'INV-04', name: '逆变器 #4', type: 'inverter',
    voltage: 510, current: 210, temperature: 58, efficiency: 88.2,
    normalRanges: { voltage: [480, 600], current: [100, 200], temperature: [20, 55], efficiency: [90, 100] },
    history: Array.from({ length: 12 }, (_, i) => ({
      time: `${i * 2}:00`, voltage: 500 + Math.random() * 20, current: 195 + Math.random() * 30,
      temperature: 50 + Math.random() * 12, efficiency: 85 + Math.random() * 6,
    })),
  },
  {
    id: 'TR-02', name: '箱变 #2', type: 'transformer',
    voltage: 10200, current: 45, temperature: 52, efficiency: 98.1,
    normalRanges: { voltage: [9800, 10500], current: [20, 60], temperature: [20, 65], efficiency: [95, 100] },
    history: Array.from({ length: 12 }, (_, i) => ({
      time: `${i * 2}:00`, voltage: 10100 + Math.random() * 200, current: 40 + Math.random() * 10,
      temperature: 48 + Math.random() * 8, efficiency: 97 + Math.random() * 2,
    })),
  },
];

// Personnel data
interface PersonnelRecord {
  id: number;
  name: string;
  role: string;
  status: '在岗' | '休息' | '外出';
  certExpiry: string;
  phone: string;
}
const personnelData: PersonnelRecord[] = [
  { id: 1, name: '张伟', role: '电气工程师', status: '在岗', certExpiry: '2026-08-15', phone: '138****1234' },
  { id: 2, name: '李强', role: '运维技术员', status: '在岗', certExpiry: '2026-03-20', phone: '139****5678' },
  { id: 3, name: '王磊', role: '安全巡检员', status: '外出', certExpiry: '2027-01-10', phone: '136****9012' },
  { id: 4, name: '赵静', role: '数据分析师', status: '在岗', certExpiry: '2026-11-05', phone: '137****3456' },
  { id: 5, name: '刘洋', role: '设备检修员', status: '休息', certExpiry: '2026-06-30', phone: '135****7890' },
];

const safetyChecklist = [
  { item: '安全帽', checked: true },
  { item: '安全带/防坠器', checked: true },
  { item: '对讲机/通讯设备', checked: true },
  { item: '急救包', checked: false },
  { item: '绝缘手套', checked: true },
  { item: '防滑登山鞋', checked: true },
];

// Knowledge base
interface KnowledgeEntry {
  id: number;
  fault: string;
  symptoms: string;
  solution: string;
  estimatedTime: string;
  tags: string[];
}
const knowledgeBase: KnowledgeEntry[] = [
  { id: 1, fault: '逆变器过温保护', symptoms: '设备自动降额或停机，温度报警', solution: '1. 检查散热风扇运转 2. 清理进风口灰尘 3. 检查环境温度是否超标 4. 如持续过温需更换散热模块', estimatedTime: '2-4小时', tags: ['逆变器', '温度', '散热'] },
  { id: 2, fault: '组串电流偏低', symptoms: '单串电流明显低于其他组串，发电量下降', solution: '1. 检查组件表面是否有遮挡或积灰 2. 检查接线端子是否松动 3. 测量组件开路电压 4. 使用热成像仪检测热斑', estimatedTime: '1-3小时', tags: ['组件', '电流', '发电量'] },
  { id: 3, fault: '箱变通讯中断', symptoms: '监控系统无法获取箱变数据，通讯指示灯异常', solution: '1. 检查通讯线缆连接 2. 重启通讯模块 3. 检查RS485/以太网接口 4. 更新通讯协议配置', estimatedTime: '1-2小时', tags: ['箱变', '通讯', '监控'] },
  { id: 4, fault: '漏电保护跳闸', symptoms: '配电柜漏电保护器频繁跳闸', solution: '1. 检查绝缘电阻 2. 排查电缆是否破损 3. 检查接地系统 4. 逐路分断排查漏电支路', estimatedTime: '2-5小时', tags: ['配电柜', '漏电', '安全'] },
  { id: 5, fault: '汇流箱熔丝熔断', symptoms: '单路汇流箱电流为零，其余正常', solution: '1. 测量组串绝缘阻抗 2. 排查短路故障点 3. 更换匹配规格熔丝 4. 检查防反二极管', estimatedTime: '1-2小时', tags: ['汇流箱', '熔丝', '短路'] },
  { id: 6, fault: 'MPPT追踪异常', symptoms: '逆变器输出功率波动大，未达到最大功率点', solution: '1. 检查组串配置是否匹配 2. 重启MPPT算法 3. 检查输入电压范围 4. 更新逆变器固件', estimatedTime: '1-3小时', tags: ['逆变器', 'MPPT', '功率'] },
  { id: 7, fault: '组件PID效应', symptoms: '组件功率持续衰减，尤其在高温高湿环境', solution: '1. 测量组件绝缘性能 2. 安装PID修复装置 3. 优化接地方案 4. 严重时更换受损组件', estimatedTime: '4-8小时', tags: ['组件', 'PID', '衰减'] },
  { id: 8, fault: '山地支架松动', symptoms: '组件倾斜角度异常，大风后支架螺栓松动', solution: '1. 全面检查螺栓扭矩 2. 补充防松垫片 3. 检查基础是否沉降 4. 加固薄弱连接点', estimatedTime: '3-6小时', tags: ['支架', '山地', '安全'] },
];

// KPI data with industry benchmarks
const kpiData = {
  mttr: { value: 4.2, unit: 'h', label: 'MTTR (平均修复时间)', max: 12, color: '#f59e0b', benchmark: 6.0, benchmarkLabel: '行业基准' },
  mtbf: { value: 2160, unit: 'h', label: 'MTBF (平均故障间隔)', max: 3000, color: '#10b981', benchmark: 1800, benchmarkLabel: '行业基准' },
  availability: { value: 99.2, unit: '%', label: '设备可用率', max: 100, color: '#06b6d4', benchmark: 97.5, benchmarkLabel: '行业基准' },
  responseTime: { value: 1.5, unit: 'h', label: '维护响应时间', max: 6, color: '#8b5cf6', benchmark: 2.0, benchmarkLabel: '行业基准' },
};

export default function Monitoring() {
  const { equipment } = useAppStore();
  
  const [realtimeData] = useState(generateRealtimeData());
  const [currentPower, setCurrentPower] = useState(512);
  const [currentEfficiency, setCurrentEfficiency] = useState(93.5);
  const [showMaintenanceSchedule, setShowMaintenanceSchedule] = useState(false);
  const [showFailurePrediction, setShowFailurePrediction] = useState(false);
  const [showMaintenanceCost, setShowMaintenanceCost] = useState(false);

  // New state for enhanced sections
  const [selectedDiagDevice, setSelectedDiagDevice] = useState<string>(diagnosticDevices[0].id);
  const [selectedParam, setSelectedParam] = useState<'voltage' | 'current' | 'temperature' | 'efficiency'>('voltage');
  const [kbSearchQuery, setKbSearchQuery] = useState('');
  const [kbActiveTags, setKbActiveTags] = useState<string[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [kpiAnimated, setKpiAnimated] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPower(prev => prev + (Math.random() - 0.5) * 10);
      setCurrentEfficiency(prev => Math.max(85, Math.min(98, prev + (Math.random() - 0.5) * 2)));
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Trigger KPI animation once on mount
  useEffect(() => {
    const timer = setTimeout(() => setKpiAnimated(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Mountain environment risk calculations (derived from weatherData reactively)
  const mountainRisks = useMemo(() => {
    const temp = weatherData.temperature;
    const wind = weatherData.windSpeed;
    const humidity = weatherData.humidity;
    const solar = weatherData.solarRadiation;
    const cloud = weatherData.cloudCover;

    // Mountain landslide risk: humidity >80% with high cloud cover (rain likely) is dangerous;
    // mountain slopes become unstable above 75% humidity especially with low solar (overcast/rainy)
    const landslideScore = (humidity > 80 ? 3 : humidity > 70 ? 2 : humidity > 60 ? 1 : 0)
      + (cloud > 70 ? 2 : cloud > 50 ? 1 : 0)
      + (wind > 8 ? 1 : 0);
    const landslideRisk = landslideScore >= 4 ? '高' : landslideScore >= 2 ? '中' : '低';

    // Rain warning: high humidity + high cloud cover + low solar radiation indicates rain
    const rainScore = (humidity > 85 ? 3 : humidity > 75 ? 2 : humidity > 65 ? 1 : 0)
      + (cloud > 80 ? 2 : cloud > 60 ? 1 : 0)
      + (solar < 200 ? 2 : solar < 400 ? 1 : 0);
    const rainWarning = rainScore >= 5 ? '严重' : rainScore >= 3 ? '警告' : rainScore >= 1 ? '注意' : '无';

    // Mountain low-temp warning: mountain temps can be 5-8C below valley readings
    // Adjusted for mountain altitude offset
    const effectiveTemp = temp - 5; // mountain altitude correction
    const lowTempWarning = effectiveTemp < -5 ? '严重' : effectiveTemp < 0 ? '警告' : effectiveTemp < 5 ? '注意' : '正常';

    // Road access depends on rain/wind and temperature (ice risk when temp < 3C)
    const roadScore = (humidity > 85 ? 2 : humidity > 75 ? 1 : 0)
      + (wind > 10 ? 2 : wind > 7 ? 1 : 0)
      + (temp < 3 ? 2 : temp < 8 ? 1 : 0)
      + (cloud > 80 ? 1 : 0);
    const roadAccess = roadScore >= 4 ? '中断' : roadScore >= 2 ? '受限' : '通畅';

    // Snow coverage estimate based on effective temp and humidity
    const snowCoverage = effectiveTemp < -3 && humidity > 60 ? 45
      : effectiveTemp < 0 && humidity > 50 ? 25
      : effectiveTemp < 2 ? 10 : 0;

    // Mountain wind warning: exposed ridgelines amplify wind; gusts can be 1.5x measured speed
    const effectiveWind = wind * 1.3; // mountain ridge amplification factor
    const windWarning = effectiveWind > 13 ? '严重' : effectiveWind > 9 ? '警告' : effectiveWind > 6 ? '注意' : '正常';

    return { landslideRisk, rainWarning, lowTempWarning, roadAccess, snowCoverage, windWarning };
  }, [weatherData.temperature, weatherData.windSpeed, weatherData.humidity, weatherData.solarRadiation, weatherData.cloudCover]);

  // Compute per-device health score: 100 - sum(abs(actual - midpoint) / (max - min) * 25) for each param
  const deviceHealthScores = useMemo(() => {
    const scores: Record<string, number> = {};
    diagnosticDevices.forEach(d => {
      let penalty = 0;
      (['voltage', 'current', 'temperature', 'efficiency'] as const).forEach(param => {
        const value = d[param];
        const [min, max] = d.normalRanges[param];
        const midpoint = (min + max) / 2;
        const range = max - min;
        if (range > 0) {
          penalty += (Math.abs(value - midpoint) / range) * 25;
        }
      });
      scores[d.id] = Math.max(0, Math.round(100 - penalty));
    });
    return scores;
  }, []);

  // Selected diagnostic device data
  const selectedDevice = useMemo(() => {
    return diagnosticDevices.find(d => d.id === selectedDiagDevice) || diagnosticDevices[0];
  }, [selectedDiagDevice]);

  // All unique knowledge base tags
  const allKbTags = useMemo(() => {
    const tagSet = new Set<string>();
    knowledgeBase.forEach(entry => entry.tags.forEach(t => tagSet.add(t)));
    return Array.from(tagSet);
  }, []);

  // Knowledge base search + tag filtering
  const filteredKnowledge = useMemo(() => {
    let results = knowledgeBase;
    // Filter by active tags (AND logic: entry must have ALL selected tags)
    if (kbActiveTags.length > 0) {
      results = results.filter(entry =>
        kbActiveTags.every(tag => entry.tags.includes(tag))
      );
    }
    // Filter by text search
    if (kbSearchQuery.trim()) {
      const q = kbSearchQuery.toLowerCase();
      results = results.filter(entry =>
        entry.fault.toLowerCase().includes(q) ||
        entry.symptoms.toLowerCase().includes(q) ||
        entry.solution.toLowerCase().includes(q) ||
        entry.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return results;
  }, [kbSearchQuery, kbActiveTags]);

  // AI maintenance window recommendations
  const maintenanceWindows = useMemo(() => {
    return weeklyForecast.map((day, idx) => {
      const isGood = day.rain < 10 && day.wind < 4 && day.tempHigh < 35 && day.tempHigh > 5;
      return { ...day, idx, recommended: isGood };
    });
  }, []);
  
  // 生成设备状态数据
  const deviceStatus = equipment.inverters.map(inv => ({
    id: inv.id,
    name: inv.name,
    type: 'inverter' as const,
    status: inv.status,
    power: inv.capacity * inv.loadRate / 100,
    efficiency: inv.efficiency,
    temperature: inv.temperature,
    lastUpdate: '刚刚'
  }));
  
  // 生成故障预测数据
  const predictedFailures = generateFailurePrediction(equipment);
  
  // 生成维护计划数据
  const generatedSchedule = generateMaintenanceSchedule(equipment, predictedFailures);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-emerald-400';
      case 'warning': return 'text-amber-400';
      case 'offline': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };
  
  const getStatusBg = (status: string) => {
    switch (status) {
      case 'online': return 'bg-emerald-400';
      case 'warning': return 'bg-amber-400';
      case 'offline': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };
  
  const onlineCount = deviceStatus.filter(d => d.status === 'online').length;
  const warningCount = deviceStatus.filter(d => d.status === 'warning').length;
  const offlineCount = deviceStatus.filter(d => d.status === 'offline').length;
  
  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-auto">
      {/* 概念演示标注 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-400/30 backdrop-blur-sm"
      >
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-300 text-sm font-medium">概念演示模块</p>
          <p className="text-blue-200/70 text-xs mt-1">
            运维监控模块为概念演示，数据为示意。当前系统处于设计阶段，尚未接入真实电站数据。
            实际部署时将对接SCADA系统实现实时监控，接入OPC UA协议获取设备实时状态。
          </p>
        </div>
      </motion.div>

      {/* Header Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="tech-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center">
            <Zap className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">实时功率</p>
            <p className="text-2xl font-bold text-white">{currentPower.toFixed(1)} MW</p>
          </div>
        </div>
        
        <div className="tech-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-400/10 flex items-center justify-center">
            <Activity className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">发电效率</p>
            <p className="text-2xl font-bold text-white">{currentEfficiency.toFixed(1)}%</p>
          </div>
        </div>
        
        <div className="tech-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center">
            <Thermometer className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">环境温度</p>
            <p className="text-2xl font-bold text-white">{weatherData.temperature}°C</p>
          </div>
        </div>
        
        <div className="tech-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-400/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">今日发电</p>
            <p className="text-2xl font-bold text-white">1,247 MWh</p>
          </div>
        </div>
      </motion.div>
      
      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Power Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="tech-card p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">实时发电功率</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-sm">实时更新</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={realtimeData}>
                <defs>
                  <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(10, 15, 26, 0.95)', 
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                    padding: '12px',
                    fontSize: '14px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="power" 
                  stroke="#00d4ff" 
                  fill="url(#colorPower)" 
                  name="发电功率 (MW)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        
        {/* Maintenance Schedule */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="tech-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">运维计划</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowMaintenanceSchedule(!showMaintenanceSchedule)}
                className="px-3 py-1 rounded-lg bg-cyan-400/20 text-cyan-400 text-xs hover:bg-cyan-400/30 transition-colors flex items-center gap-1"
              >
                <Calendar className="w-3 h-3" />
                <span>计划</span>
              </button>
              <button
                onClick={() => setShowFailurePrediction(!showFailurePrediction)}
                className="px-3 py-1 rounded-lg bg-amber-400/20 text-amber-400 text-xs hover:bg-amber-400/30 transition-colors flex items-center gap-1"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>预测</span>
              </button>
              <button
                onClick={() => setShowMaintenanceCost(!showMaintenanceCost)}
                className="px-3 py-1 rounded-lg bg-emerald-400/20 text-emerald-400 text-xs hover:bg-emerald-400/30 transition-colors flex items-center gap-1"
              >
                <DollarSign className="w-3 h-3" />
                <span>成本</span>
              </button>
            </div>
          </div>
          
          {/* Maintenance Schedule Panel */}
          {showMaintenanceSchedule && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 mb-4"
            >
              <h4 className="text-cyan-400 text-sm font-medium mb-2">维护计划</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {generatedSchedule.slice(0, 5).map((item) => (
                  <div key={item.id} className="p-2 bg-white/5 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white text-sm font-medium">{item.device}</p>
                        <p className="text-gray-400 text-xs">{item.type} · {item.date}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${item.status === 'scheduled' ? 'bg-blue-400/20 text-blue-400' : 'bg-emerald-400/20 text-emerald-400'}`}>
                        {item.status === 'scheduled' ? '计划中' : '已完成'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-xs">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.duration}
                      </span>
                      <span className="text-cyan-400">¥{item.cost}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <h4 className="text-cyan-400 text-sm font-medium mb-2">维护周期</h4>
              <div className="space-y-2">
                {maintenanceCycles.map((cycle, index) => (
                  <div key={index} className="p-2 bg-white/5 rounded-lg">
                    <p className="text-white text-sm font-medium">{cycle.deviceType}</p>
                    <div className="grid grid-cols-3 gap-2 mt-1 text-xs">
                      <div className="bg-white/5 rounded p-1 text-center">
                        <p className="text-gray-400">维护周期</p>
                        <p className="text-cyan-400">{cycle.cycle}</p>
                      </div>
                      <div className="bg-white/5 rounded p-1 text-center">
                        <p className="text-gray-400">检查周期</p>
                        <p className="text-cyan-400">{cycle.inspection}</p>
                      </div>
                      <div className="bg-white/5 rounded p-1 text-center">
                        <p className="text-gray-400">预期寿命</p>
                        <p className="text-cyan-400">{cycle.expectedLife}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Failure Prediction Panel */}
          {showFailurePrediction && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 mb-4"
            >
              <h4 className="text-amber-400 text-sm font-medium mb-2">故障预测</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {predictedFailures.map((item, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${item.risk === '高' ? 'bg-red-400/10 border-red-400/30' : item.risk === '中' ? 'bg-amber-400/10 border-amber-400/30' : 'bg-emerald-400/10 border-emerald-400/30'}`}>
                    <div className="flex justify-between items-start">
                      <p className="text-white text-sm font-medium">{item.device}</p>
                      <span className={`text-xs px-2 py-1 rounded ${item.risk === '高' ? 'bg-red-400/20 text-red-400' : item.risk === '中' ? 'bg-amber-400/20 text-amber-400' : 'bg-emerald-400/20 text-emerald-400'}`}>
                        {item.risk}风险
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">剩余寿命:</span>
                        <span className="text-white">{item.remainingLife}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">原因:</span>
                        <span className="text-white">{item.reason}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">建议操作:</span>
                        <span className="text-white">{item.recommendedAction}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Maintenance Cost Panel */}
          {showMaintenanceCost && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 mb-4"
            >
              <h4 className="text-emerald-400 text-sm font-medium mb-2">运维成本</h4>
              <div className="space-y-2">
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded p-2">
                      <p className="text-gray-400 text-xs">月度维护</p>
                      <p className="text-emerald-400 font-semibold">¥{maintenanceCost.monthly.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 rounded p-2">
                      <p className="text-gray-400 text-xs">季度维护</p>
                      <p className="text-emerald-400 font-semibold">¥{maintenanceCost.quarterly.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 rounded p-2">
                      <p className="text-gray-400 text-xs">年度维护</p>
                      <p className="text-emerald-400 font-semibold">¥{maintenanceCost.annual.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 rounded p-2">
                      <p className="text-gray-400 text-xs">故障维修</p>
                      <p className="text-emerald-400 font-semibold">¥{maintenanceCost.breakdown.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-emerald-400/10 rounded-lg border border-emerald-400/30">
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm font-medium">预防性维护成本</span>
                      <span className="text-emerald-400 font-bold">¥{maintenanceCost.preventive.toLocaleString()}</span>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">每年可节省故障维修成本约 30%</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Default view when no panel is selected */}
          {!showMaintenanceSchedule && !showFailurePrediction && !showMaintenanceCost && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>点击上方按钮查看运维方案</p>
            </div>
          )}
        </motion.div>
        
        {/* Device Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="tech-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">设备状态</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-emerald-400/10 rounded-lg p-3 text-center border border-emerald-400/30">
              <p className="text-2xl font-bold text-emerald-400">{onlineCount}</p>
              <p className="text-gray-400 text-xs">正常运行</p>
            </div>
            <div className="bg-amber-400/10 rounded-lg p-3 text-center border border-amber-400/30">
              <p className="text-2xl font-bold text-amber-400">{warningCount}</p>
              <p className="text-gray-400 text-xs">警告</p>
            </div>
            <div className="bg-red-400/10 rounded-lg p-3 text-center border border-red-400/30">
              <p className="text-2xl font-bold text-red-400">{offlineCount}</p>
              <p className="text-gray-400 text-xs">离线</p>
            </div>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {deviceStatus.map((device) => (
              <div 
                key={device.id}
                className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getStatusBg(device.status)}`} />
                  <span className="text-white text-sm">{device.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-cyan-400">{device.power}kW</span>
                  <span className={getStatusColor(device.status)}>
                    {device.status === 'online' ? '正常' : device.status === 'warning' ? '警告' : '离线'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Efficiency Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="tech-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">发电效率趋势</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={realtimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="#6b7280" fontSize={10} />
                <YAxis domain={[80, 100]} stroke="#6b7280" fontSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(10, 15, 26, 0.95)', 
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                    padding: '12px',
                    fontSize: '14px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        
        {/* Alerts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="tech-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">告警信息</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-400/10 text-blue-300 border border-blue-400/20">示意数据</span>
            </div>
            <Bell className="w-5 h-5 text-amber-400" />
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className={`p-3 rounded-lg border ${
                  alert.level === 'error' 
                    ? 'bg-red-400/10 border-red-400/30' 
                    : alert.level === 'warning'
                    ? 'bg-amber-400/10 border-amber-400/30'
                    : 'bg-cyan-400/10 border-cyan-400/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    {alert.level === 'error' && <XCircle className="w-4 h-4 text-red-400 mt-0.5" />}
                    {alert.level === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" />}
                    {alert.level === 'info' && <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5" />}
                    <div>
                      <p className="text-white text-sm">{alert.message}</p>
                      <p className="text-gray-500 text-xs">{alert.device} · {alert.time}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    alert.status === 'resolved' 
                      ? 'bg-emerald-400/20 text-emerald-400' 
                      : 'bg-amber-400/20 text-amber-400'
                  }`}>
                    {alert.status === 'resolved' ? '已解决' : '未处理'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Weather Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="tech-card p-6 lg:col-span-3"
        >
          <h3 className="text-lg font-semibold text-white mb-4">环境监测</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <Thermometer className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="text-gray-400 text-xs">温度</p>
              <p className="text-white font-semibold">{weatherData.temperature}°C</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <Droplets className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-gray-400 text-xs">湿度</p>
              <p className="text-white font-semibold">{weatherData.humidity}%</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <Activity className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <p className="text-gray-400 text-xs">风速</p>
              <p className="text-white font-semibold">{weatherData.windSpeed} m/s</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-gray-400 text-xs">太阳辐射</p>
              <p className="text-white font-semibold">{weatherData.solarRadiation} W/m²</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <Cloud className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400 text-xs">云量</p>
              <p className="text-white font-semibold">{weatherData.cloudCover}%</p>
            </div>
          </div>
        </motion.div>

        {/* ============================================================ */}
        {/* Section 1: Mountain Environment Monitoring - 山地环境监测 */}
        {/* ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="tech-card p-6 lg:col-span-3"
        >
          <div className="flex items-center gap-2 mb-4">
            <Mountain className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">山地环境监测</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Landslide Risk */}
            <div className={`rounded-lg p-4 text-center border ${
              mountainRisks.landslideRisk === '高' ? 'bg-red-400/10 border-red-400/30' :
              mountainRisks.landslideRisk === '中' ? 'bg-amber-400/10 border-amber-400/30' :
              'bg-emerald-400/10 border-emerald-400/30'
            }`}>
              <MapPin className={`w-6 h-6 mx-auto mb-2 ${
                mountainRisks.landslideRisk === '高' ? 'text-red-400' :
                mountainRisks.landslideRisk === '中' ? 'text-amber-400' : 'text-emerald-400'
              }`} />
              <p className="text-gray-400 text-xs">滑坡风险</p>
              <p className={`font-semibold ${
                mountainRisks.landslideRisk === '高' ? 'text-red-400' :
                mountainRisks.landslideRisk === '中' ? 'text-amber-400' : 'text-emerald-400'
              }`}>{mountainRisks.landslideRisk}</p>
            </div>

            {/* Heavy Rain Warning */}
            <div className={`rounded-lg p-4 text-center border ${
              mountainRisks.rainWarning === '严重' ? 'bg-red-400/10 border-red-400/30' :
              mountainRisks.rainWarning === '警告' ? 'bg-amber-400/10 border-amber-400/30' :
              mountainRisks.rainWarning === '注意' ? 'bg-yellow-400/10 border-yellow-400/30' :
              'bg-emerald-400/10 border-emerald-400/30'
            }`}>
              <CloudRain className={`w-6 h-6 mx-auto mb-2 ${
                mountainRisks.rainWarning === '严重' ? 'text-red-400' :
                mountainRisks.rainWarning === '警告' ? 'text-amber-400' :
                mountainRisks.rainWarning === '注意' ? 'text-yellow-400' : 'text-emerald-400'
              }`} />
              <p className="text-gray-400 text-xs">暴雨预警</p>
              <p className={`font-semibold ${
                mountainRisks.rainWarning === '严重' ? 'text-red-400' :
                mountainRisks.rainWarning === '警告' ? 'text-amber-400' :
                mountainRisks.rainWarning === '注意' ? 'text-yellow-400' : 'text-emerald-400'
              }`}>{mountainRisks.rainWarning}</p>
            </div>

            {/* Low Temperature Warning */}
            <div className={`rounded-lg p-4 text-center border ${
              mountainRisks.lowTempWarning === '严重' ? 'bg-blue-500/10 border-blue-500/30' :
              mountainRisks.lowTempWarning === '警告' ? 'bg-blue-400/10 border-blue-400/30' :
              mountainRisks.lowTempWarning === '注意' ? 'bg-cyan-400/10 border-cyan-400/30' :
              'bg-emerald-400/10 border-emerald-400/30'
            }`}>
              <Thermometer className={`w-6 h-6 mx-auto mb-2 ${
                mountainRisks.lowTempWarning === '严重' ? 'text-blue-500' :
                mountainRisks.lowTempWarning === '警告' ? 'text-blue-400' :
                mountainRisks.lowTempWarning === '注意' ? 'text-cyan-400' : 'text-emerald-400'
              }`} />
              <p className="text-gray-400 text-xs">低温预警</p>
              <p className={`font-semibold ${
                mountainRisks.lowTempWarning === '严重' ? 'text-blue-500' :
                mountainRisks.lowTempWarning === '警告' ? 'text-blue-400' :
                mountainRisks.lowTempWarning === '注意' ? 'text-cyan-400' : 'text-emerald-400'
              }`}>{mountainRisks.lowTempWarning}</p>
            </div>

            {/* Road Accessibility */}
            <div className={`rounded-lg p-4 text-center border ${
              mountainRisks.roadAccess === '中断' ? 'bg-red-400/10 border-red-400/30' :
              mountainRisks.roadAccess === '受限' ? 'bg-amber-400/10 border-amber-400/30' :
              'bg-emerald-400/10 border-emerald-400/30'
            }`}>
              <MapPin className={`w-6 h-6 mx-auto mb-2 ${
                mountainRisks.roadAccess === '中断' ? 'text-red-400' :
                mountainRisks.roadAccess === '受限' ? 'text-amber-400' : 'text-emerald-400'
              }`} />
              <p className="text-gray-400 text-xs">道路通达性</p>
              <p className={`font-semibold ${
                mountainRisks.roadAccess === '中断' ? 'text-red-400' :
                mountainRisks.roadAccess === '受限' ? 'text-amber-400' : 'text-emerald-400'
              }`}>{mountainRisks.roadAccess}</p>
            </div>

            {/* Snow Coverage */}
            <div className={`rounded-lg p-4 text-center border ${
              mountainRisks.snowCoverage > 20 ? 'bg-blue-400/10 border-blue-400/30' :
              mountainRisks.snowCoverage > 0 ? 'bg-cyan-400/10 border-cyan-400/30' :
              'bg-emerald-400/10 border-emerald-400/30'
            }`}>
              <Snowflake className={`w-6 h-6 mx-auto mb-2 ${
                mountainRisks.snowCoverage > 20 ? 'text-blue-400' :
                mountainRisks.snowCoverage > 0 ? 'text-cyan-400' : 'text-emerald-400'
              }`} />
              <p className="text-gray-400 text-xs">积雪覆盖</p>
              <p className={`font-semibold ${
                mountainRisks.snowCoverage > 20 ? 'text-blue-400' :
                mountainRisks.snowCoverage > 0 ? 'text-cyan-400' : 'text-emerald-400'
              }`}>{mountainRisks.snowCoverage}%</p>
            </div>

            {/* Strong Wind Warning */}
            <div className={`rounded-lg p-4 text-center border ${
              mountainRisks.windWarning === '严重' ? 'bg-red-400/10 border-red-400/30' :
              mountainRisks.windWarning === '警告' ? 'bg-amber-400/10 border-amber-400/30' :
              mountainRisks.windWarning === '注意' ? 'bg-yellow-400/10 border-yellow-400/30' :
              'bg-emerald-400/10 border-emerald-400/30'
            }`}>
              <Wind className={`w-6 h-6 mx-auto mb-2 ${
                mountainRisks.windWarning === '严重' ? 'text-red-400' :
                mountainRisks.windWarning === '警告' ? 'text-amber-400' :
                mountainRisks.windWarning === '注意' ? 'text-yellow-400' : 'text-emerald-400'
              }`} />
              <p className="text-gray-400 text-xs">大风预警</p>
              <p className={`font-semibold ${
                mountainRisks.windWarning === '严重' ? 'text-red-400' :
                mountainRisks.windWarning === '警告' ? 'text-amber-400' :
                mountainRisks.windWarning === '注意' ? 'text-yellow-400' : 'text-emerald-400'
              }`}>{mountainRisks.windWarning}</p>
            </div>
          </div>
        </motion.div>

        {/* ============================================================ */}
        {/* Section 2: AI Maintenance Scheduling - AI智能维护调度 */}
        {/* ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="tech-card p-6 lg:col-span-3"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">AI智能维护调度</h3>
          </div>

          <div className="mb-4 p-3 bg-cyan-400/10 border border-cyan-400/30 rounded-lg">
            <p className="text-cyan-400 text-sm font-medium mb-1">AI 推荐说明</p>
            <p className="text-gray-300 text-xs leading-relaxed">
              系统根据未来7天气象预报，综合评估降雨量、风速、温度等因素，自动筛选最佳维护窗口。
              绿色标记的日期天气条件良好（低降雨、低风速、适宜温度），适合户外检修和山地作业。
            </p>
          </div>

          <div className="grid grid-cols-7 gap-3">
            {maintenanceWindows.map((day) => (
              <div
                key={day.idx}
                className={`rounded-lg p-3 text-center border transition-all ${
                  day.recommended
                    ? 'bg-emerald-400/10 border-emerald-400/40 ring-1 ring-emerald-400/20'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <p className={`text-sm font-semibold mb-1 ${day.recommended ? 'text-emerald-400' : 'text-white'}`}>
                  {day.day}
                </p>
                <div className="flex justify-center mb-1">
                  {day.icon === 'sun' && <Sun className="w-5 h-5 text-yellow-400" />}
                  {day.icon === 'cloud-sun' && <CloudSun className="w-5 h-5 text-gray-300" />}
                  {day.icon === 'cloud-rain' && <CloudDrizzle className="w-5 h-5 text-blue-400" />}
                </div>
                <p className="text-gray-400 text-xs">{day.condition}</p>
                <p className="text-white text-xs mt-1">{day.tempHigh}° / {day.tempLow}°</p>
                <p className="text-gray-500 text-xs">{day.wind}m/s</p>
                {day.recommended && (
                  <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-400">
                    推荐
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ============================================================ */}
        {/* Section 3: Remote Diagnostics - 远程诊断工具 */}
        {/* ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="tech-card p-6 lg:col-span-3"
        >
          <div className="flex items-center gap-2 mb-4">
            <Wrench className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">远程诊断工具</h3>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            {/* Device selector with health badges */}
            <div className="flex gap-2 flex-wrap">
              {diagnosticDevices.map(d => {
                const health = deviceHealthScores[d.id] ?? 100;
                const healthColor = health >= 90 ? '#10b981' : health >= 70 ? '#f59e0b' : '#ef4444';
                const healthBg = health >= 90 ? 'bg-emerald-400/20 text-emerald-400' : health >= 70 ? 'bg-amber-400/20 text-amber-400' : 'bg-red-400/20 text-red-400';
                const isSelected = selectedDiagDevice === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDiagDevice(d.id)}
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors border ${
                      isSelected
                        ? 'bg-cyan-400/20 text-cyan-400 border-cyan-400/40'
                        : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {/* Health ring indicator */}
                    <div className="relative w-8 h-8 flex-shrink-0">
                      <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="14" fill="none" stroke={healthColor} strokeWidth="3"
                          strokeDasharray={`${health * 0.88} 88`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold" style={{ color: healthColor }}>
                        {health}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-medium">{d.name}</p>
                      <p className={`text-[10px] ${healthBg} px-1 rounded inline-block mt-0.5`}>
                        {health >= 90 ? '健康' : health >= 70 ? '注意' : '异常'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Parameter selector */}
            <div className="flex gap-1">
              {(['voltage', 'current', 'temperature', 'efficiency'] as const).map(param => (
                <button
                  key={param}
                  onClick={() => setSelectedParam(param)}
                  className={`px-3 py-2 rounded-lg text-xs transition-colors ${
                    selectedParam === param
                      ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/40'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {param === 'voltage' ? '电压' : param === 'current' ? '电流' : param === 'temperature' ? '温度' : '效率'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Parameter Cards */}
            <div className="grid grid-cols-2 gap-3">
              {(['voltage', 'current', 'temperature', 'efficiency'] as const).map(param => {
                const value = selectedDevice[param];
                const range = selectedDevice.normalRanges[param];
                const isAnomaly = value < range[0] || value > range[1];
                const unit = param === 'voltage' ? 'V' : param === 'current' ? 'A' : param === 'temperature' ? '°C' : '%';
                const label = param === 'voltage' ? '电压' : param === 'current' ? '电流' : param === 'temperature' ? '温度' : '效率';

                return (
                  <div
                    key={param}
                    className={`rounded-lg p-3 border ${
                      isAnomaly ? 'bg-red-400/10 border-red-400/30' : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <p className="text-gray-400 text-xs mb-1">{label}</p>
                    <p className={`text-xl font-bold ${isAnomaly ? 'text-red-400' : 'text-white'}`}>
                      {typeof value === 'number' ? value.toFixed(1) : value}{unit}
                    </p>
                    <p className="text-gray-500 text-[10px] mt-1">
                      正常范围: {range[0]}-{range[1]}{unit}
                    </p>
                    {isAnomaly && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                        <span className="text-red-400 text-[10px]">异常</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Historical Trend Mini Chart */}
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-gray-400 text-xs mb-2">
                {selectedParam === 'voltage' ? '电压' : selectedParam === 'current' ? '电流' : selectedParam === 'temperature' ? '温度' : '效率'}趋势
              </p>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={selectedDevice.history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" stroke="#6b7280" fontSize={9} />
                    <YAxis stroke="#6b7280" fontSize={9} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(10, 15, 26, 0.95)',
                        border: '1px solid rgba(0, 212, 255, 0.3)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                        padding: '12px',
                        fontSize: '14px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey={selectedParam}
                      stroke={
                        selectedParam === 'voltage' ? '#06b6d4' :
                        selectedParam === 'current' ? '#f59e0b' :
                        selectedParam === 'temperature' ? '#ef4444' : '#10b981'
                      }
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ============================================================ */}
        {/* Section 4: Personnel Safety Management - 人员安全管理 */}
        {/* ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="tech-card p-6 lg:col-span-2"
        >
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">人员安全管理</h3>
            {/* Certification expiry warning badge (30 days) */}
            {(() => {
              const expiringCount = personnelData.filter(p => {
                const days = Math.floor((new Date(p.certExpiry).getTime() - Date.now()) / 86400000);
                return days <= 30 && days >= 0;
              }).length;
              return expiringCount > 0 ? (
                <span className="relative flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-red-400/20 text-red-400 text-xs border border-red-400/30">
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-400 animate-ping" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-400" />
                  <AlertTriangle className="w-3 h-3" />
                  {expiringCount}人认证即将到期
                </span>
              ) : null;
            })()}
          </div>

          {/* Mountain Work Risk Level */}
          <div className="mb-4 p-3 bg-amber-400/10 border border-amber-400/30 rounded-lg flex items-center gap-3">
            <Shield className="w-6 h-6 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-amber-400 text-sm font-medium">山地作业风险等级: 中等</p>
              <p className="text-gray-400 text-xs">当前天气条件适中，需注意山路湿滑，确保安全装备齐全</p>
            </div>
          </div>

          {/* Personnel Table */}
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 px-2 text-gray-400 font-medium text-xs">姓名</th>
                  <th className="text-left py-2 px-2 text-gray-400 font-medium text-xs">岗位</th>
                  <th className="text-left py-2 px-2 text-gray-400 font-medium text-xs">状态</th>
                  <th className="text-left py-2 px-2 text-gray-400 font-medium text-xs">安全认证到期</th>
                </tr>
              </thead>
              <tbody>
                {personnelData.map((p) => {
                  const certDate = new Date(p.certExpiry);
                  const now = new Date();
                  const daysUntilExpiry = Math.floor((certDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  const certCritical = daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
                  const certExpiring = daysUntilExpiry < 90;

                  return (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-2 px-2 text-white">{p.name}</td>
                      <td className="py-2 px-2 text-gray-300">{p.role}</td>
                      <td className="py-2 px-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                          p.status === '在岗' ? 'bg-emerald-400/20 text-emerald-400' :
                          p.status === '外出' ? 'bg-amber-400/20 text-amber-400' :
                          'bg-gray-400/20 text-gray-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            p.status === '在岗' ? 'bg-emerald-400' :
                            p.status === '外出' ? 'bg-amber-400' : 'bg-gray-400'
                          }`} />
                          {p.status}
                        </span>
                      </td>
                      <td className={`py-2 px-2 text-xs ${certCritical ? 'text-red-400 font-semibold' : certExpiring ? 'text-amber-400' : 'text-gray-300'}`}>
                        <span className="inline-flex items-center gap-1">
                          {certCritical && (
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400" />
                            </span>
                          )}
                          {p.certExpiry}
                          {certCritical && <span className="ml-1 text-red-400">({daysUntilExpiry}天后到期)</span>}
                          {!certCritical && certExpiring && <span className="ml-1">(即将到期)</span>}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Training completion rate progress bar */}
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-xs">安全培训完成率</span>
              <span className="text-cyan-400 text-sm font-semibold">
                {(() => {
                  // Mock: count personnel with valid (non-expiring) certifications as "trained"
                  const trainedCount = personnelData.filter(p => {
                    const days = Math.floor((new Date(p.certExpiry).getTime() - Date.now()) / 86400000);
                    return days > 30;
                  }).length;
                  return Math.round(trainedCount / personnelData.length * 100);
                })()}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.round(personnelData.filter(p => {
                  const days = Math.floor((new Date(p.certExpiry).getTime() - Date.now()) / 86400000);
                  return days > 30;
                }).length / personnelData.length * 100)}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
              />
            </div>
            <p className="text-gray-500 text-[10px] mt-1">
              {personnelData.filter(p => {
                const days = Math.floor((new Date(p.certExpiry).getTime() - Date.now()) / 86400000);
                return days > 30;
              }).length}/{personnelData.length} 人完成有效期内安全培训
            </p>
          </div>
        </motion.div>

        {/* Safety Equipment Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="tech-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <HardHat className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">安全装备清单</h3>
          </div>
          <div className="space-y-2">
            {safetyChecklist.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                {item.checked ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                )}
                <span className={`text-sm ${item.checked ? 'text-white' : 'text-red-400'}`}>{item.item}</span>
                <span className={`ml-auto text-xs ${item.checked ? 'text-emerald-400' : 'text-red-400'}`}>
                  {item.checked ? '已配备' : '缺失'}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 p-2 bg-white/5 rounded-lg text-center">
            <p className="text-gray-400 text-xs">装备完备率</p>
            <p className="text-2xl font-bold text-cyan-400">
              {Math.round(safetyChecklist.filter(i => i.checked).length / safetyChecklist.length * 100)}%
            </p>
          </div>
        </motion.div>

        {/* ============================================================ */}
        {/* Section 5: Maintenance Knowledge Base - 运维知识库 */}
        {/* ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="tech-card p-6 lg:col-span-3"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">运维知识库</h3>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={kbSearchQuery}
                onChange={(e) => setKbSearchQuery(e.target.value)}
                placeholder="搜索故障类型、症状..."
                className="bg-white/10 border border-white/20 rounded-lg pl-9 pr-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 w-64"
              />
            </div>
          </div>

          {/* Tag filter pills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {allKbTags.map(tag => {
              const isActive = kbActiveTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => {
                    setKbActiveTags(prev =>
                      isActive ? prev.filter(t => t !== tag) : [...prev, tag]
                    );
                  }}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    isActive
                      ? 'bg-cyan-400/20 text-cyan-400 border-cyan-400/40'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-gray-300'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
            {kbActiveTags.length > 0 && (
              <button
                onClick={() => setKbActiveTags([])}
                className="text-xs px-2.5 py-1 rounded-full bg-red-400/10 text-red-400 border border-red-400/30 hover:bg-red-400/20 transition-colors"
              >
                清除筛选
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredKnowledge.map((entry) => (
              <div key={entry.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-cyan-400/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-white font-medium text-sm">{entry.fault}</h4>
                  <span className="text-xs px-2 py-0.5 rounded bg-cyan-400/20 text-cyan-400 whitespace-nowrap ml-2">
                    预计 {entry.estimatedTime}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-gray-400">症状: </span>
                    <span className="text-gray-300">{entry.symptoms}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">解决方案: </span>
                    <span className="text-gray-300">{entry.solution}</span>
                  </div>
                </div>
                <div className="flex gap-1.5 mt-2">
                  {entry.tags.map((tag, ti) => (
                    <button
                      key={ti}
                      onClick={() => {
                        if (!kbActiveTags.includes(tag)) {
                          setKbActiveTags(prev => [...prev, tag]);
                        }
                      }}
                      className={`text-[10px] px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                        kbActiveTags.includes(tag)
                          ? 'bg-cyan-400/20 text-cyan-400'
                          : 'bg-white/10 text-gray-400 hover:bg-white/20'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {filteredKnowledge.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">未找到匹配的知识条目</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* ============================================================ */}
        {/* Section 6: Efficiency KPIs - 运维效率评估 */}
        {/* ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="tech-card p-6 lg:col-span-2"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">运维效率评估</h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-400/10 text-blue-300 border border-blue-400/20">示意数据</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {Object.entries(kpiData).map(([key, kpi]) => {
              const percentage = (kpi.value / kpi.max) * 100;
              // For MTTR and response time, lower is better, so invert the "goodness"
              const isInverted = key === 'mttr' || key === 'responseTime';
              const displayPercent = isInverted ? 100 - percentage : percentage;

              // Benchmark comparison: for inverted metrics, being below benchmark is good
              const isBetter = isInverted
                ? kpi.value < kpi.benchmark
                : kpi.value > kpi.benchmark;
              const diff = isInverted
                ? kpi.benchmark - kpi.value
                : kpi.value - kpi.benchmark;
              const diffPercent = Math.abs(diff / kpi.benchmark * 100).toFixed(1);

              return (
                <div key={key} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-gray-400 text-xs mb-2">{kpi.label}</p>
                  <div className="flex items-end gap-2 mb-2">
                    <p className="text-2xl font-bold text-white">
                      {kpi.value}{kpi.unit}
                    </p>
                    {/* Benchmark comparison indicator */}
                    <div className={`flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded ${
                      isBetter ? 'bg-emerald-400/15 text-emerald-400' : 'bg-red-400/15 text-red-400'
                    }`}>
                      <svg
                        className={`w-3 h-3 ${isBetter ? '' : 'rotate-180'}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      </svg>
                      <span>{diffPercent}%</span>
                    </div>
                  </div>
                  {/* Benchmark reference line */}
                  <div className="flex items-center gap-2 mb-2 text-[10px]">
                    <span className="text-gray-500">{kpi.benchmarkLabel}:</span>
                    <span className="text-gray-400 font-medium">{kpi.benchmark}{kpi.unit}</span>
                    <span className={`${isBetter ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isBetter ? '优于基准' : '低于基准'}
                    </span>
                  </div>
                  {/* Animated progress bar */}
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: kpiAnimated ? `${Math.min(displayPercent, 100)}%` : '0%' }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: kpi.color }}
                    />
                  </div>
                  <p className="text-gray-500 text-[10px] mt-1 text-right">
                    {isInverted ? '越低越好' : '越高越好'}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ============================================================ */}
        {/* Section 7: Report Generation - 生成运维报告 */}
        {/* ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="tech-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">运维报告</h3>
          </div>

          <button
            onClick={() => setShowReport(!showReport)}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium text-sm hover:from-cyan-400 hover:to-blue-400 transition-all flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            {showReport ? '收起报告' : '生成运维报告'}
          </button>

          <AnimatePresence>
            {showReport && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-3 overflow-hidden"
              >
                <div className="p-4 bg-white/5 rounded-lg border border-cyan-400/30">
                  <h4 className="text-cyan-400 text-sm font-medium mb-3">运维状态摘要报告</h4>
                  <p className="text-gray-400 text-xs mb-3">
                    生成时间: {new Date().toLocaleString('zh-CN')}
                  </p>

                  {/* Section: Device Overview */}
                  <h5 className="text-white text-xs font-semibold mt-3 mb-2 border-b border-white/10 pb-1">一、设备运行概况</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">设备总数</span>
                      <span className="text-white">{deviceStatus.length} 台</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">在线设备</span>
                      <span className="text-emerald-400">{onlineCount} 台 ({(onlineCount / deviceStatus.length * 100).toFixed(1)}%)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">告警设备</span>
                      <span className="text-amber-400">{warningCount} 台</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">离线设备</span>
                      <span className="text-red-400">{offlineCount} 台</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">实时功率</span>
                      <span className="text-white">{currentPower.toFixed(1)} MW</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">发电效率</span>
                      <span className="text-white">{currentEfficiency.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Section: Mountain Environment Risks */}
                  <h5 className="text-white text-xs font-semibold mt-4 mb-2 border-b border-white/10 pb-1">二、山地环境风险</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">滑坡风险</span>
                      <span className={mountainRisks.landslideRisk === '高' ? 'text-red-400' : mountainRisks.landslideRisk === '中' ? 'text-amber-400' : 'text-emerald-400'}>{mountainRisks.landslideRisk}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">暴雨预警</span>
                      <span className={mountainRisks.rainWarning === '严重' || mountainRisks.rainWarning === '警告' ? 'text-amber-400' : 'text-emerald-400'}>{mountainRisks.rainWarning}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">低温预警</span>
                      <span className="text-white">{mountainRisks.lowTempWarning}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">道路通达性</span>
                      <span className={mountainRisks.roadAccess === '中断' ? 'text-red-400' : mountainRisks.roadAccess === '受限' ? 'text-amber-400' : 'text-emerald-400'}>{mountainRisks.roadAccess}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">积雪覆盖</span>
                      <span className="text-white">{mountainRisks.snowCoverage}%</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">大风预警</span>
                      <span className="text-white">{mountainRisks.windWarning}</span>
                    </div>
                  </div>

                  {/* Section: AI Maintenance Windows */}
                  <h5 className="text-white text-xs font-semibold mt-4 mb-2 border-b border-white/10 pb-1">三、AI推荐维护窗口</h5>
                  <div className="space-y-1 text-xs">
                    {maintenanceWindows.filter(w => w.recommended).length > 0 ? (
                      maintenanceWindows.filter(w => w.recommended).map(w => (
                        <div key={w.idx} className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-emerald-400">{w.day} - {w.condition}</span>
                          <span className="text-gray-300">{w.tempHigh}°/{w.tempLow}° 风速{w.wind}m/s</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 py-1">本周无推荐维护窗口</p>
                    )}
                  </div>

                  {/* Section: Remote Diagnostics */}
                  <h5 className="text-white text-xs font-semibold mt-4 mb-2 border-b border-white/10 pb-1">四、远程诊断状态</h5>
                  <div className="space-y-1 text-xs">
                    {diagnosticDevices.map(d => {
                      const health = deviceHealthScores[d.id] ?? 100;
                      const statusLabel = health >= 90 ? '健康' : health >= 70 ? '需关注' : '异常';
                      const statusColor = health >= 90 ? 'text-emerald-400' : health >= 70 ? 'text-amber-400' : 'text-red-400';
                      return (
                        <div key={d.id} className="flex justify-between py-1 border-b border-white/5">
                          <span className="text-gray-400">{d.name} ({d.id})</span>
                          <span className={statusColor}>健康度 {health}分 - {statusLabel}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Section: KPI Summary */}
                  <h5 className="text-white text-xs font-semibold mt-4 mb-2 border-b border-white/10 pb-1">五、运维效率KPI</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">设备可用率</span>
                      <span className="text-cyan-400">{kpiData.availability.value}%</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">MTTR (平均修复时间)</span>
                      <span className="text-white">{kpiData.mttr.value}h</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">MTBF (平均故障间隔)</span>
                      <span className="text-white">{kpiData.mtbf.value}h</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">维护响应时间</span>
                      <span className="text-white">{kpiData.responseTime.value}h</span>
                    </div>
                  </div>

                  {/* Section: Personnel */}
                  <h5 className="text-white text-xs font-semibold mt-4 mb-2 border-b border-white/10 pb-1">六、人员管理</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">在岗人员</span>
                      <span className="text-white">{personnelData.filter(p => p.status === '在岗').length} / {personnelData.length} 人</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">外出人员</span>
                      <span className="text-amber-400">{personnelData.filter(p => p.status === '外出').length} 人</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">认证即将到期 (30天内)</span>
                      <span className={personnelData.filter(p => {
                        const days = Math.floor((new Date(p.certExpiry).getTime() - Date.now()) / 86400000);
                        return days <= 30;
                      }).length > 0 ? 'text-red-400' : 'text-emerald-400'}>
                        {personnelData.filter(p => {
                          const days = Math.floor((new Date(p.certExpiry).getTime() - Date.now()) / 86400000);
                          return days <= 30;
                        }).length} 人
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-gray-400">安全装备完备率</span>
                      <span className="text-cyan-400">{Math.round(safetyChecklist.filter(i => i.checked).length / safetyChecklist.length * 100)}%</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-400">山地作业风险等级</span>
                      <span className="text-amber-400">中等</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}


