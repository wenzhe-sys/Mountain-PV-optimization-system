// 电力系统仿真服务

import { apiClient } from './apiClient';

const fetchPowerAnalysis = async (instanceId: string = 'r1'): Promise<any> => {
  try {
    const response = await apiClient.post(`/api/power-analysis?instance_id=${instanceId}`);
    if (response && response.status === 'success' && response.data) {
      return response.data;
    }
    throw new Error('获取电力分析数据失败');
  } catch (error) {
    console.error('获取电力分析数据失败:', error);
    return null;
  }
};

const fetchFaultAnalysis = async (instanceId: string = 'r1'): Promise<any> => {
  try {
    const response = await apiClient.post(`/api/fault-analysis?instance_id=${instanceId}`);
    if (response && response.status === 'success' && response.data) {
      return response.data;
    }
    throw new Error('获取故障分析数据失败');
  } catch (error) {
    console.error('获取故障分析数据失败:', error);
    return null;
  }
};

// 电力系统损耗计算
const calculatePowerLoss = (params: {
  voltage: number;        // 电压 (V)
  current: number;        // 电流 (A)
  resistance: number;     // 电阻 (Ω/km)
  length: number;         // 长度 (km)
  temperature: number;    // 温度 (°C)
  powerFactor: number;    // 功率因数
  cableType: string;      // 电缆类型
}): {
  resistiveLoss: number;  // 电阻损耗 (W)
  reactiveLoss: number;   // 电抗损耗 (var)
  totalLoss: number;      // 总损耗 (VA)
  lossPercentage: number; // 损耗百分比
  temperatureRise: number; // 温度升高 (°C)
} => {
  const { voltage, current, resistance, length, temperature, powerFactor, cableType } = params;
  
  // 温度校正电阻
  const temperatureCoefficient = 0.00393; // 铜的温度系数
  const correctedResistance = resistance * (1 + temperatureCoefficient * (temperature - 20));
  
  // 计算电阻损耗 (I²R)
  const resistiveLoss = current * current * correctedResistance * length;
  
  // 计算电抗损耗 (基于电缆类型)
  const reactance = getCableReactance(cableType, length);
  const reactiveLoss = current * current * reactance;
  
  // 计算总损耗
  const totalLoss = Math.sqrt(resistiveLoss * resistiveLoss + reactiveLoss * reactiveLoss);
  
  // 计算输入功率
  const inputPower = voltage * current * powerFactor;
  
  // 计算损耗百分比
  const lossPercentage = (totalLoss / inputPower) * 100;
  
  // 计算温度升高
  const temperatureRise = calculateTemperatureRise(resistiveLoss, cableType);
  
  return {
    resistiveLoss,
    reactiveLoss,
    totalLoss,
    lossPercentage,
    temperatureRise
  };
};

// 获取电缆电抗
const getCableReactance = (cableType: string, length: number): number => {
  // 不同电缆类型的电抗值 (Ω/km)
  const reactanceValues: Record<string, number> = {
    'cu-35': 0.07,  // 铜芯 35mm²
    'cu-50': 0.065, // 铜芯 50mm²
    'cu-70': 0.06,  // 铜芯 70mm²
    'al-95': 0.055  // 铝芯 95mm²
  };
  
  return (reactanceValues[cableType] || 0.06) * length;
};

// 计算温度升高
const calculateTemperatureRise = (resistiveLoss: number, cableType: string): number => {
  // 不同电缆类型的热阻系数
  const thermalResistance: Record<string, number> = {
    'cu-35': 0.025,
    'cu-50': 0.02,
    'cu-70': 0.015,
    'al-95': 0.018
  };
  
  const thermalResistanceValue = thermalResistance[cableType] || 0.02;
  return resistiveLoss * thermalResistanceValue;
};

// 电力系统潮流计算
const calculatePowerFlow = (network: {
  nodes: {
    id: string;
    type: 'source' | 'load' | 'branch';
    voltage: number;
    power: number; // 对于负载为负，对于电源为正
  }[];
  branches: {
    id: string;
    from: string;
    to: string;
    resistance: number;
    reactance: number;
    currentLimit: number;
  }[];
}): {
  branchFlows: {
    id: string;
    current: number;
    power: number;
    loss: number;
    voltageDrop: number;
  }[];
  nodeVoltages: {
    id: string;
    voltage: number;
    voltageDrop: number;
  }[];
  totalLoss: number;
  systemEfficiency: number;
} => {
  const { nodes, branches } = network;
  
  // 初始化结果
  const branchFlows: any[] = [];
  const nodeVoltages: any[] = [];
  let totalLoss = 0;
  let totalPower = 0;
  
  // 简单的潮流计算 (基于直流潮流模型)
  branches.forEach(branch => {
    const fromNode = nodes.find(node => node.id === branch.from);
    const toNode = nodes.find(node => node.id === branch.to);
    
    if (fromNode && toNode) {
      // 计算电压差
      const voltageDifference = fromNode.voltage - toNode.voltage;
      
      // 计算阻抗
      const impedance = Math.sqrt(branch.resistance * branch.resistance + branch.reactance * branch.reactance);
      
      // 计算电流
      const current = voltageDifference / impedance;
      
      // 计算功率
      const power = voltageDifference * current;
      
      // 计算损耗
      const loss = current * current * branch.resistance;
      
      // 计算电压降
      const voltageDrop = current * branch.resistance;
      
      branchFlows.push({
        id: branch.id,
        current,
        power,
        loss,
        voltageDrop
      });
      
      totalLoss += loss;
    }
  });
  
  // 计算节点电压
  nodes.forEach(node => {
    // 找到连接到该节点的所有分支
    const connectedBranches = branches.filter(branch => 
      branch.from === node.id || branch.to === node.id
    );
    
    // 计算电压降
    let totalVoltageDrop = 0;
    connectedBranches.forEach(branch => {
      const flow = branchFlows.find(f => f.id === branch.id);
      if (flow) {
        totalVoltageDrop += flow.voltageDrop;
      }
    });
    
    nodeVoltages.push({
      id: node.id,
      voltage: node.voltage - totalVoltageDrop,
      voltageDrop: totalVoltageDrop
    });
    
    if (node.type === 'source') {
      totalPower += node.power;
    }
  });
  
  // 计算系统效率
  const systemEfficiency = ((totalPower - totalLoss) / totalPower) * 100;
  
  return {
    branchFlows,
    nodeVoltages,
    totalLoss,
    systemEfficiency
  };
};

// 故障分析
const analyzeFault = (params: {
  faultType: 'three-phase' | 'line-to-line' | 'line-to-ground';
  faultImpedance: number;
  systemVoltage: number;
  sourceImpedance: number;
  cableImpedance: number;
}): {
  faultCurrent: number;
  faultPower: number;
  faultDuration: number;
  isSafe: boolean;
  recommendations: string[];
} => {
  const { faultType, faultImpedance, systemVoltage, sourceImpedance, cableImpedance } = params;
  
  // 故障电流计算系数
  const faultCoefficients: Record<string, number> = {
    'three-phase': 1.0,
    'line-to-line': 0.866,
    'line-to-ground': 0.577
  };
  
  const coefficient = faultCoefficients[faultType];
  const totalImpedance = sourceImpedance + cableImpedance + faultImpedance;
  
  // 计算故障电流
  const faultCurrent = (systemVoltage * coefficient) / totalImpedance;
  
  // 计算故障功率
  const faultPower = systemVoltage * faultCurrent * coefficient;
  
  // 估计故障持续时间 (基于保护系统响应)
  const faultDuration = 0.1; // 假设0.1秒
  
  // 评估安全性
  const isSafe = faultCurrent < 10000; // 假设10kA为安全阈值
  
  // 生成建议
  const recommendations: string[] = [];
  if (!isSafe) {
    recommendations.push('故障电流超过安全阈值，需要检查保护系统');
    recommendations.push('考虑增加限流设备');
  }
  
  recommendations.push('定期检查电缆绝缘状态');
  recommendations.push('确保保护系统正确整定');
  
  return {
    faultCurrent,
    faultPower,
    faultDuration,
    isSafe,
    recommendations
  };
};

// 电压质量分析
const analyzeVoltageQuality = (params: {
  voltageMeasurements: number[];
  frequencyMeasurements: number[];
  harmonicMeasurements: number[];
}): {
  voltageStability: 'stable' | 'unstable' | 'critical';
  frequencyStability: 'stable' | 'unstable' | 'critical';
  harmonicDistortion: 'low' | 'medium' | 'high';
  recommendations: string[];
} => {
  const { voltageMeasurements, frequencyMeasurements, harmonicMeasurements } = params;
  
  // 计算电压偏差
  const voltageAverage = voltageMeasurements.reduce((sum, v) => sum + v, 0) / voltageMeasurements.length;
  const voltageDeviation = Math.abs(voltageAverage - 380) / 380 * 100; // 假设380V为额定电压
  
  // 计算频率偏差
  const frequencyAverage = frequencyMeasurements.reduce((sum, f) => sum + f, 0) / frequencyMeasurements.length;
  const frequencyDeviation = Math.abs(frequencyAverage - 50) / 50 * 100; // 假设50Hz为额定频率
  
  // 计算谐波畸变率
  const totalHarmonicDistortion = Math.sqrt(
    harmonicMeasurements.reduce((sum, h) => sum + h * h, 0)
  ) / voltageAverage * 100;
  
  // 评估电压稳定性
  let voltageStability: 'stable' | 'unstable' | 'critical';
  if (voltageDeviation < 5) {
    voltageStability = 'stable';
  } else if (voltageDeviation < 10) {
    voltageStability = 'unstable';
  } else {
    voltageStability = 'critical';
  }
  
  // 评估频率稳定性
  let frequencyStability: 'stable' | 'unstable' | 'critical';
  if (frequencyDeviation < 0.5) {
    frequencyStability = 'stable';
  } else if (frequencyDeviation < 1) {
    frequencyStability = 'unstable';
  } else {
    frequencyStability = 'critical';
  }
  
  // 评估谐波畸变
  let harmonicDistortion: 'low' | 'medium' | 'high';
  if (totalHarmonicDistortion < 5) {
    harmonicDistortion = 'low';
  } else if (totalHarmonicDistortion < 10) {
    harmonicDistortion = 'medium';
  } else {
    harmonicDistortion = 'high';
  }
  
  // 生成建议
  const recommendations: string[] = [];
  
  if (voltageStability !== 'stable') {
    recommendations.push('电压稳定性需要改善，建议检查无功补偿设备');
  }
  
  if (frequencyStability !== 'stable') {
    recommendations.push('频率稳定性需要改善，建议检查发电机组或电网连接');
  }
  
  if (harmonicDistortion !== 'low') {
    recommendations.push('谐波畸变率较高，建议安装谐波滤波器');
  }
  
  recommendations.push('定期监测电压质量指标');
  
  return {
    voltageStability,
    frequencyStability,
    harmonicDistortion,
    recommendations
  };
};

export default {
  fetchPowerAnalysis,
  fetchFaultAnalysis,
  calculatePowerLoss,
  calculatePowerFlow,
  analyzeFault,
  analyzeVoltageQuality
};
