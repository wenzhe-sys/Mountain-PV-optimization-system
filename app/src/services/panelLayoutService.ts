import { apiClient } from './apiClient';

// 获取后端真实优化结果
const fetchOptimizationResult = async (instanceId: string = 'r1'): Promise<any> => {
  try {
    const response = await apiClient.postAlgorithm(`/panel-layout?instance_id=${instanceId}`);
    if (response && response.status === 'success' && response.data) {
      return response.data;
    }
    throw new Error('获取优化结果失败');
  } catch (error) {
    console.error('获取优化结果失败:', error);
    return null;
  }
};

// 获取收敛曲线数据
const fetchConvergenceData = async (instanceId: string = 'r1'): Promise<any[]> => {
  try {
    const result = await fetchOptimizationResult(instanceId);
    if (result && result.module1_output && result.module1_output.optimization_history) {
      return result.module1_output.optimization_history;
    }
    return [];
  } catch (error) {
    console.error('获取收敛数据失败:', error);
    return [];
  }
};

// 获取帕累托前沿数据
const fetchParetoFrontData = async (instanceId: string = 'r1'): Promise<any[]> => {
  try {
    const result = await fetchOptimizationResult(instanceId);
    if (result && result.module3_output && result.module3_output.pareto_front) {
      return result.module3_output.pareto_front;
    }
    return [];
  } catch (error) {
    console.error('获取帕累托数据失败:', error);
    return [];
  }
};

// 获取核心指标
const fetchMetrics = async (instanceId: string = 'r1'): Promise<any> => {
  try {
    const result = await fetchOptimizationResult(instanceId);
    if (result && result.metrics) {
      return result.metrics;
    }
    return null;
  } catch (error) {
    console.error('获取指标失败:', error);
    return null;
  }
};

// 面板布局优化服务

// 面板布局优化算法
const optimizePanelLayout = (terrainData: {
  elevation: number[][];
  slope: number[][];
  solarRadiation: number[][];
}, panelOptions: {
  panelWidth: number;
  panelHeight: number;
  panelSpacing: number;
  rowSpacing: number;
  tiltAngle: number;
}): { x: number; y: number; angle: number; score: number }[] => {
  const { elevation, slope, solarRadiation } = terrainData;
  const { panelWidth, panelSpacing, rowSpacing } = panelOptions;
  const size = elevation.length;
  const panels: { x: number; y: number; angle: number; score: number }[] = [];

  // 遍历地形数据，计算每个位置的面板布局分数
  for (let i = 0; i < size; i += Math.ceil(rowSpacing)) {
    for (let j = 0; j < size; j += Math.ceil(panelWidth + panelSpacing)) {
      const slopeValue = slope[i][j];
      const solarValue = solarRadiation[i][j];

      // 计算面板布局分数
      // 1. 坡度因子：坡度越小越好
      const slopeFactor = Math.max(0, 1 - slopeValue / 10);

      // 2. 太阳辐射因子：辐射越高越好
      const radiationFactor = solarValue / 1000;

      // 3. 阴影遮挡因子：考虑周围地形
      const shadowFactor = calculateShadowFactor(terrainData, i, j);

      // 4. 综合分数
      const score = 0.3 * slopeFactor + 0.5 * radiationFactor + 0.2 * shadowFactor;

      // 只考虑分数高于0.6的位置
      if (score > 0.6) {
        panels.push({
          x: j,
          y: i,
          angle: calculateOptimalAngle(i, j, terrainData),
          score
        });
      }
    }
  }

  // 按分数排序
  panels.sort((a, b) => b.score - a.score);

  // 返回前20个最佳位置
  return panels.slice(0, 20);
};

// 计算阴影遮挡因子
const calculateShadowFactor = (terrainData: {
  elevation: number[][];
  slope: number[][];
  solarRadiation: number[][];
}, x: number, y: number): number => {
  const { elevation } = terrainData;
  const size = elevation.length;
  let shadowFactor = 1.0;

  // 检查周围地形是否会遮挡阳光
  // 主要检查东方和南方的地形
  for (let i = Math.max(0, x - 5); i < Math.min(size, x + 5); i++) {
    for (let j = Math.max(0, y - 5); j < Math.min(size, y + 5); j++) {
      const heightDiff = elevation[i][j] - elevation[x][y];
      const distance = Math.sqrt((i - x) ** 2 + (j - y) ** 2);

      // 如果周围地形高于当前位置，可能会遮挡阳光
      if (heightDiff > 5 && distance < 10) {
        shadowFactor -= 0.1 * (heightDiff / 10);
      }
    }
  }

  return Math.max(0, shadowFactor);
};

// 计算最佳面板倾角
const calculateOptimalAngle = (x: number, y: number, terrainData: {
  elevation: number[][];
  slope: number[][];
  solarRadiation: number[][];
}): number => {
  // 基于纬度和季节计算最佳倾角
  // 这里使用简化的计算方法
  const latitude = 35; // 假设位于北纬35度
  const baseAngle = latitude * 0.87; // 基础倾角
  const slopeValue = terrainData.slope[x][y];

  // 结合地形坡度调整倾角
  const optimalAngle = baseAngle - slopeValue * 0.5;

  // 确保倾角在合理范围内
  return Math.max(10, Math.min(45, optimalAngle));
};

// 生成面板布局建议
const generateLayoutSuggestions = (panels: { x: number; y: number; angle: number; score: number }[]) => {
  if (panels.length === 0) {
    return {
      message: '未找到合适的面板布局位置',
      recommendations: []
    };
  }

  // 计算平均分数
  const averageScore = panels.reduce((sum, panel) => sum + panel.score, 0) / panels.length;

  // 计算最佳倾角范围
  const angles = panels.map(panel => panel.angle);
  const avgAngle = angles.reduce((sum, angle) => sum + angle, 0) / angles.length;
  const minAngle = Math.min(...angles);
  const maxAngle = Math.max(...angles);

  // 生成推荐
  const recommendations = [
    `最佳面板布局位置的平均分数为 ${averageScore.toFixed(2)}`,
    `建议面板倾角范围：${minAngle.toFixed(1)}° - ${maxAngle.toFixed(1)}°`,
    `平均最佳倾角：${avgAngle.toFixed(1)}°`,
    '注意考虑地形坡度和阴影遮挡的影响',
    '建议进行实地考察以确认布局的可行性'
  ];

  return {
    message: `找到 ${panels.length} 个合适的面板布局位置`,
    recommendations
  };
};

export default {
  optimizePanelLayout,
  generateLayoutSuggestions,
  fetchOptimizationResult,
  fetchConvergenceData,
  fetchParetoFrontData,
  fetchMetrics
};