import { apiClient } from './apiClient';

// 获取后端真实电缆路由数据
const fetchCableRoutingResult = async (instanceId: string = 'r1'): Promise<any> => {
  try {
    const response = await apiClient.post(`/api/optimize?instance_id=${instanceId}`);
    if (response && response.status === 'success' && response.data) {
      return response.data.module2_output;
    }
    throw new Error('获取电缆路由结果失败');
  } catch (error) {
    console.error('获取电缆路由结果失败:', error);
    return null;
  }
};

// 获取设备选址数据
const fetchEquipmentSelection = async (instanceId: string = 'r1'): Promise<any> => {
  try {
    const result = await fetchCableRoutingResult(instanceId);
    if (result && result.equipment_selection) {
      return result.equipment_selection;
    }
    return [];
  } catch (error) {
    console.error('获取设备选址失败:', error);
    return [];
  }
};

// 获取电缆路由数据
const fetchCableRoutes = async (instanceId: string = 'r1'): Promise<any[]> => {
  try {
    const result = await fetchCableRoutingResult(instanceId);
    if (result && result.cable_routes) {
      return result.cable_routes;
    }
    return [];
  } catch (error) {
    console.error('获取电缆路由失败:', error);
    return [];
  }
};

// 获取共沟优化数据
const fetchTrenchSummary = async (instanceId: string = 'r1'): Promise<any> => {
  try {
    const result = await fetchCableRoutingResult(instanceId);
    if (result && result.trench_summary) {
      return result.trench_summary;
    }
    return null;
  } catch (error) {
    console.error('获取共沟信息失败:', error);
    return null;
  }
};

// 电缆路由服务

// 电缆路由优化算法
const optimizeCableRouting = (nodes: {
  id: string;
  x: number;
  y: number;
  type: 'panel' | 'inverter' | 'substation';
}[], cableOptions: {
  voltageLevel: number;
  cableType: string;
  trenchWidth: number;
  trenchDepth: number;
  costPerMeter: number;
}): {
  routes: {
    id: string;
    startId: string;
    endId: string;
    path: { x: number; y: number }[];
    length: number;
    cost: number;
  }[];
  trenches: {
    id: string;
    path: { x: number; y: number }[];
    length: number;
    cost: number;
  }[];
  totalCost: number;
  totalLength: number;
  optimizationScore: number;
} => {
  // 1. 计算所有节点之间的距离
  const distances: { from: string; to: string; distance: number }[] = [];
  
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const distance = calculateDistance(nodes[i], nodes[j]);
      distances.push({ from: nodes[i].id, to: nodes[j].id, distance });
    }
  }

  // 2. 按距离排序
  distances.sort((a, b) => a.distance - b.distance);

  // 3. 使用Kruskal算法构建最小生成树
  const mst = buildMinimumSpanningTree(nodes, distances);

  // 4. 生成电缆路由
  const routes = generateRoutes(nodes, mst, cableOptions);

  // 5. 优化共沟
  const { trenches, totalCost, totalLength } = optimizeTrenching(routes, cableOptions);

  // 6. 计算优化分数
  const optimizationScore = calculateOptimizationScore(routes, trenches);

  return {
    routes,
    trenches,
    totalCost,
    totalLength,
    optimizationScore
  };
};

// 计算两点之间的距离
const calculateDistance = (node1: { x: number; y: number }, node2: { x: number; y: number }): number => {
  const dx = node1.x - node2.x;
  const dy = node1.y - node2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// 构建最小生成树
const buildMinimumSpanningTree = (nodes: any[], distances: any[]): any[] => {
  const parent: Record<string, string> = {};
  const mst: any[] = [];

  // 初始化父节点
  nodes.forEach(node => {
    parent[node.id] = node.id;
  });

  // 查找根节点
  const find = (node: string): string => {
    if (parent[node] !== node) {
      parent[node] = find(parent[node]);
    }
    return parent[node];
  };

  // 合并两个集合
  const union = (node1: string, node2: string): boolean => {
    const root1 = find(node1);
    const root2 = find(node2);
    
    if (root1 === root2) {
      return false;
    }
    
    parent[root2] = root1;
    return true;
  };

  // 构建MST
  for (const distance of distances) {
    if (union(distance.from, distance.to)) {
      mst.push(distance);
    }
  }

  return mst;
};

// 生成电缆路由
const generateRoutes = (nodes: any[], mst: any[], cableOptions: any): any[] => {
  const routes: any[] = [];
  
  mst.forEach((edge, index) => {
    const startNode = nodes.find(node => node.id === edge.from);
    const endNode = nodes.find(node => node.id === edge.to);
    
    if (startNode && endNode) {
      const path = generatePath(startNode, endNode);
      const length = edge.distance;
      const cost = length * cableOptions.costPerMeter;
      
      routes.push({
        id: `route-${index + 1}`,
        startId: edge.from,
        endId: edge.to,
        path,
        length,
        cost
      });
    }
  });
  
  return routes;
};

// 生成路径
const generatePath = (startNode: { x: number; y: number }, endNode: { x: number; y: number }): { x: number; y: number }[] => {
  const path: { x: number; y: number }[] = [];
  const steps = 10; // 路径点数量
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = startNode.x + (endNode.x - startNode.x) * t;
    const y = startNode.y + (endNode.y - startNode.y) * t;
    path.push({ x, y });
  }
  
  return path;
};

// 优化共沟
const optimizeTrenching = (routes: any[], cableOptions: any): {
  trenches: any[];
  totalCost: number;
  totalLength: number;
} => {
  const trenches: any[] = [];
  let totalLength = 0;
  
  // 简单的共沟优化：将重叠的路径合并
  routes.forEach((route, index) => {
    let merged = false;
    
    // 检查是否可以与现有管沟合并
    for (const trench of trenches) {
      if (canMergePaths(route.path, trench.path)) {
        // 合并路径
        trench.path = mergePaths(route.path, trench.path);
        trench.length = calculatePathLength(trench.path);
        merged = true;
        break;
      }
    }
    
    // 如果不能合并，创建新管沟
    if (!merged) {
      const length = calculatePathLength(route.path);
      totalLength += length;
      
      trenches.push({
        id: `trench-${trenches.length + 1}`,
        path: route.path,
        length,
        cost: length * cableOptions.costPerMeter * 1.5 // 管沟成本是电缆成本的1.5倍
      });
    }
  });
  
  // 计算总成本
  const totalCost = trenches.reduce((sum, trench) => sum + trench.cost, 0);
  
  return {
    trenches,
    totalCost,
    totalLength
  };
};

// 检查路径是否可以合并
const canMergePaths = (path1: { x: number; y: number }[], path2: { x: number; y: number }[]): boolean => {
  // 简单检查：如果路径之间的距离小于管沟宽度，则可以合并
  for (const point1 of path1) {
    for (const point2 of path2) {
      const distance = calculateDistance(point1, point2);
      if (distance < 2) { // 假设管沟宽度为2米
        return true;
      }
    }
  }
  return false;
};

// 合并路径
const mergePaths = (path1: { x: number; y: number }[], path2: { x: number; y: number }[]): { x: number; y: number }[] => {
  // 简单合并：将两个路径的点合并并去重
  const allPoints = [...path1, ...path2];
  const uniquePoints = [];
  const seen = new Set();
  
  for (const point of allPoints) {
    const key = `${point.x.toFixed(2)},${point.y.toFixed(2)}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniquePoints.push(point);
    }
  }
  
  return uniquePoints;
};

// 计算路径长度
const calculatePathLength = (path: { x: number; y: number }[]): number => {
  let length = 0;
  for (let i = 1; i < path.length; i++) {
    length += calculateDistance(path[i-1], path[i]);
  }
  return length;
};

// 计算优化分数
const calculateOptimizationScore = (routes: any[], trenches: any[]): number => {
  const originalLength = routes.reduce((sum, route) => sum + route.length, 0);
  const optimizedLength = trenches.reduce((sum, trench) => sum + trench.length, 0);
  const lengthReduction = (originalLength - optimizedLength) / originalLength;
  
  // 优化分数：基于长度减少和共沟率
  const trenchEfficiency = trenches.length / routes.length;
  const score = (lengthReduction * 0.7) + (1 - trenchEfficiency) * 0.3;
  
  return score;
};

// 生成电缆路由建议
const generateRoutingSuggestions = (result: {
  routes: any[];
  trenches: any[];
  totalCost: number;
  totalLength: number;
  optimizationScore: number;
}) => {
  const { routes, trenches, totalCost, totalLength, optimizationScore } = result;
  
  const recommendations = [
    `共沟优化率: ${(optimizationScore * 100).toFixed(2)}%`,
    `总电缆长度: ${totalLength.toFixed(1)} 米`,
    `总成本: ¥${totalCost.toFixed(2)}`,
    `管沟数量: ${trenches.length} 条`,
    `路由数量: ${routes.length} 条`,
    '建议使用相同电压等级的电缆共用管沟，以降低成本',
    '考虑地形因素，避开陡峭坡度和障碍物',
    '定期检查电缆路由，确保安全运行'
  ];
  
  return {
    message: `电缆路由优化完成，共找到 ${routes.length} 条路由，${trenches.length} 条管沟`,
    recommendations
  };
};

export default {
  optimizeCableRouting,
  generateRoutingSuggestions,
  fetchCableRoutingResult,
  fetchEquipmentSelection,
  fetchCableRoutes,
  fetchTrenchSummary
};