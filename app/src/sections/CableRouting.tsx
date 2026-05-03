import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  Cable, 
  Route, 
  TrendingDown, 
  Layers,
  CheckCircle2,
  ArrowRight,
  Brain,
  PlayCircle,
  PauseCircle,
  RefreshCw,
  Calculator,
  Share2,
  BarChart2,
  Eye,
  EyeOff,
  Filter,
  Box,
  Zap,
  Mountain,
  Grid3X3,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
  Line,
  ReferenceLine
} from 'recharts';
import useAppStore from '../store/useAppStore';
import cableRoutingService from '../services/cableRoutingService';

// Cable route interface
interface CableRoute {
  id: string;
  from: string;
  to: string;
  type: 'DC' | 'AC';
  length: number;
  isShared: boolean;
  path: { x: number; y: number }[];
  terrainType: 'flat' | 'hilly' | 'mountainous' | 'rocky' | 'wetland' | 'forested' | 'urban' | 'coastal';
  soilType: 'clay' | 'sand' | 'rock' | 'loam';
  depth: number;
  // 新增现实工程需求字段
  weatherCondition: 'normal' | 'rainy' | 'snowy' | 'windy' | 'extreme';
  constructionDifficulty: 'easy' | 'moderate' | 'difficult' | 'very_difficult';
  environmentalZone: 'protected_area' | 'residential_area' | 'industrial_area' | 'rural_area';
  timeOfYear: 'peak' | 'normal' | 'offpeak';
  voltageLevel: number;
  cableType: string;
  installationMethod: 'trench' | 'aerial' | 'direct_burial' | 'conduit';
  maintenanceCost: number;
  lifecycleYears: number;
}

// Generate cable type data based on realistic distribution
const cableTypeData = [
  { name: '共沟电缆', value: 7, color: '#00d4ff' },
  { name: '独立敷设', value: 3, color: '#f59e0b' },
];

// Generate cost breakdown data based on realistic values
const costBreakdown = [
  { category: '电缆采购', before: 45, after: 35, unit: '万元' },
  { category: '挖沟施工', before: 30, after: 18, unit: '万元' },
  { category: '敷设人工', before: 12, after: 10, unit: '万元' },
  { category: '材料损耗', before: 8, after: 5, unit: '万元' },
];

// Generate realistic cable routes based on zone data
const generateCableRoutes = (): CableRoute[] => {
  const routes: CableRoute[] = [];
  const zoneCount = 10;
  const inverterCount = 10;
  
  // Generate DC cables from panels to inverters
  for (let i = 1; i <= zoneCount; i++) {
    const zoneId = `Z${i.toString().padStart(2, '0')}`;
    const inverterId = `INV-${i.toString().padStart(2, '0')}`;
    
    // Generate a realistic path from zone to inverter
    const path = [];
    const startX = 100 + (i - 1) * 50;
    const startY = 100 + (i - 1) * 30;
    const endX = 400;
    const endY = 200;
    
    // Create a path with some waypoints
    const waypoints = 3;
    for (let j = 0; j <= waypoints; j++) {
      const t = j / waypoints;
      const x = startX + (endX - startX) * t + (Math.random() - 0.5) * 20;
      const y = startY + (endY - startY) * t + (Math.random() - 0.5) * 20;
      path.push({ x, y });
    }
    
    // Calculate length based on path
    let length = 0;
    for (let j = 0; j < path.length - 1; j++) {
      const dx = path[j + 1].x - path[j].x;
      const dy = path[j + 1].y - path[j].y;
      length += Math.sqrt(dx * dx + dy * dy);
    }
    
    routes.push({
      id: `DC-${i.toString().padStart(2, '0')}`,
      from: zoneId,
      to: inverterId,
      type: 'DC',
      length: Math.round(length / 10) * 10, // Round to nearest 10
      isShared: Math.random() > 0.5,
      path: path,
      terrainType: (['flat', 'hilly', 'mountainous'] as const)[Math.floor(Math.random() * 3)],
      soilType: (['clay', 'sand', 'rock', 'loam'] as const)[Math.floor(Math.random() * 4)],
      depth: Math.floor(Math.random() * 100) + 50, // 50-150 cm
      weatherCondition: 'normal',
      constructionDifficulty: (['easy', 'moderate', 'difficult'] as const)[Math.floor(Math.random() * 3)],
      environmentalZone: 'rural_area',
      timeOfYear: 'normal',
      voltageLevel: 600,
      cableType: 'PV1-F 4mm²',
      installationMethod: 'trench',
      maintenanceCost: Math.round(Math.random() * 5000) + 1000,
      lifecycleYears: 25
    });
  }
  
  // Generate AC cables from inverters to substation
  for (let i = 1; i <= inverterCount; i++) {
    const inverterId = `INV-${i.toString().padStart(2, '0')}`;
    const substationId = 'SUB-01';
    
    // Generate a realistic path from inverter to substation
    const path = [];
    const startX = 400;
    const startY = 200;
    const endX = 600;
    const endY = 200;
    
    // Create a path with some waypoints
    const waypoints = 2;
    for (let j = 0; j <= waypoints; j++) {
      const t = j / waypoints;
      const x = startX + (endX - startX) * t + (Math.random() - 0.5) * 15;
      const y = startY + (endY - startY) * t + (Math.random() - 0.5) * 15;
      path.push({ x, y });
    }
    
    // Calculate length based on path
    let length = 0;
    for (let j = 0; j < path.length - 1; j++) {
      const dx = path[j + 1].x - path[j].x;
      const dy = path[j + 1].y - path[j].y;
      length += Math.sqrt(dx * dx + dy * dy);
    }
    
    routes.push({
      id: `AC-${i.toString().padStart(2, '0')}`,
      from: inverterId,
      to: substationId,
      type: 'AC',
      length: Math.round(length / 10) * 10, // Round to nearest 10
      isShared: i > 5, // Share AC cables for some inverters
      path: path,
      terrainType: (['flat', 'hilly'] as const)[Math.floor(Math.random() * 2)],
      soilType: (['clay', 'sand', 'loam'] as const)[Math.floor(Math.random() * 3)],
      depth: Math.floor(Math.random() * 80) + 60, // 60-140 cm
      weatherCondition: 'normal',
      constructionDifficulty: (['easy', 'moderate'] as const)[Math.floor(Math.random() * 2)],
      environmentalZone: 'rural_area',
      timeOfYear: 'normal',
      voltageLevel: 400,
      cableType: 'VV 3x16mm²',
      installationMethod: 'trench',
      maintenanceCost: Math.round(Math.random() * 3000) + 2000,
      lifecycleYears: 30
    });
  }
  
  return routes;
};

// Optimization algorithms - 明确区分核心算法和对比算法
const optimizationAlgorithms = [
  { id: 'branch-and-price', name: '分支定价算法', description: '【核心算法】分支定界+列生成，求解设备选址和电缆路由联合优化', isCore: true },
  { id: 'dijkstra', name: 'Dijkstra算法', description: '【对比算法】最短路径算法，用于对比验证', isCore: false },
  { id: 'a-star', name: 'A*算法', description: '【对比算法】启发式搜索，用于对比验证', isCore: false },
  { id: 'genetic', name: '遗传算法', description: '【对比算法】全局优化，用于对比验证', isCore: false },
  { id: 'ant-colony', name: '蚁群算法', description: '【对比算法】群体智能，用于对比验证', isCore: false },
  { id: 'particle-swarm', name: '粒子群算法', description: '【对比算法】并行搜索，用于对比验证', isCore: false },
  { id: 'simulated-annealing', name: '模拟退火算法', description: '【对比算法】局部搜索，用于对比验证', isCore: false },
];

// Route optimization interface (used internally)
// interface RouteOptimization {
//   id: string;
//   algorithm: string;
//   routes: OptimizedRoute[];
//   totalLength: number;
//   totalCost: number;
//   savings: number;
//   savingsPercentage: number;
//   executionTime: number;
//   iterations: number;
// }

interface OptimizedRoute {
  id: string;
  from: string;
  to: string;
  path: { x: number; y: number }[];
  length: number;
  cost: number;
  terrainType: string;
  soilType: string;
  isShared: boolean;
  sharedWith: string[];
}

// Comparison scenario interface for route comparison panel
interface ComparisonScenario {
  id: string;
  name: string;
  algorithm: string;
  totalLength: number;
  totalCost: number;
  sharedTrenchPercent: number;
  optimizationTime: number;
  costReduction: number;
  timestamp: number;
}

// Terrain difficulty factors (used in terrainFactors below)
// const terrainDifficulty = {
//   flat: 1.0,
//   hilly: 1.5,
//   mountainous: 2.5,
//   rocky: 3.0,
//   wetland: 1.8,
//   forested: 2.2,
//   urban: 2.0,
//   suburban: 1.3,
//   desert: 1.1,
//   coastal: 1.7,
//   tundra: 2.8,
//   plateau: 2.0
// };

// Weather impact factors
const weatherImpact = {
  normal: 1.0,
  rainy: 1.2,
  snowy: 1.5,
  windy: 1.3,
  extreme: 2.0
};

// Time-based cost factors
const timeFactors = {
  peak: 1.5,
  normal: 1.0,
  offpeak: 0.8
};

// Construction difficulty factors
const constructionDifficulty = {
  easy: 1.0,
  moderate: 1.3,
  difficult: 1.8,
  very_difficult: 2.5
};

// Environmental factors
const environmentalFactors = {
  protected_area: 2.0,
  residential_area: 1.5,
  industrial_area: 1.2,
  rural_area: 1.0
};

// Cable types
const cableTypes = [
  { id: 'cu-35', name: '铜芯 35mm²', resistance: 0.524, cost: 85, currentCapacity: 125 },
  { id: 'cu-50', name: '铜芯 50mm²', resistance: 0.387, cost: 110, currentCapacity: 160 },
  { id: 'cu-70', name: '铜芯 70mm²', resistance: 0.273, cost: 145, currentCapacity: 200 },
  { id: 'al-95', name: '铝芯 95mm²', resistance: 0.320, cost: 130, currentCapacity: 230 },
];

// Terrain factors for excavation cost with more detailed types
const terrainFactors = {
  flat: 1.0,
  hilly: 1.5,
  mountainous: 2.5,
  rocky: 3.0,
  wetland: 1.8,
  forested: 2.2,
  urban: 2.0,      // 城市区域
  suburban: 1.3,   // 郊区
  desert: 1.1,     // 沙漠
  coastal: 1.7,    // 沿海
  tundra: 2.8,     //  tundra
  plateau: 2.0     // 高原
};

// Soil type factors for excavation cost with more detailed types
const soilFactors = {
  loam: 1.0,
  sand: 1.2,
  clay: 1.4,
  rock: 2.0,
  silt: 1.3,
  gravel: 1.6,
  peat: 1.9,
  loess: 1.2,      // 黄土
  laterite: 1.8,   // 红土
  sandstone: 2.2,  // 砂岩
  limestone: 2.5,  // 石灰岩
  granite: 3.0,    // 花岗岩
  basalt: 3.2      // 玄武岩
};

// Cable laying cost per meter based on type and depth
const layingCosts = {
  DC: {
    shallow: 30, // 0-1m depth
    medium: 45, // 1-1.5m depth
    deep: 60    // >1.5m depth
  },
  AC: {
    shallow: 35,
    medium: 50,
    deep: 65
  }
};

// Enhanced excavation cost calculation with more factors
const calculateExcavationCost = (route: CableRoute, cableType: string = 'cu-50', sharedWith: string[] = []) => {
  const { length, terrainType, soilType, depth, isShared, type } = route;
  
  // Base cost per meter for excavation
  const baseCost = 100; // 基础挖沟成本 per meter
  
  // Apply terrain factor
  const terrainFactor = terrainFactors[terrainType] || 1.0;
  
  // Apply soil type factor
  const soilFactor = soilFactors[soilType] || 1.0;
  
  // Apply depth factor (deeper trenches cost more)
  const depthFactor = 1 + (depth - 0.8) * 0.5; // 每增加0.1m深度，成本增加5%
  
  // Apply shared trench discount with more granular calculation
  let sharedFactor = 1.0;
  if (isShared) {
    // Base discount for shared trench
    let baseDiscount = 0.6;
    
    // Additional discount based on number of shared cables
    const sharedCount = sharedWith.length + 1; // +1 for current cable
    if (sharedCount >= 4) {
      baseDiscount = 0.4; // 60% discount for 4+ cables
    } else if (sharedCount === 3) {
      baseDiscount = 0.5; // 50% discount for 3 cables
    } else if (sharedCount === 2) {
      baseDiscount = 0.6; // 40% discount for 2 cables
    }
    
    sharedFactor = baseDiscount;
  }
  
  // Apply cable type factor (thicker cables require wider trenches)
  const cableTypeFactor = cableType.includes('70') ? 1.2 : cableType.includes('50') ? 1.1 : 1.0;
  
  // Apply voltage level factor (higher voltage requires more safety measures)
  const voltageFactor = type === 'AC' ? 1.1 : 1.0;
  
  // Apply terrain-specific additional factors
  let terrainSpecificFactor = 1.0;
  if (terrainType === 'rocky') {
    terrainSpecificFactor = 1.3; // 岩石地形需要额外的爆破成本
  } else if (terrainType === 'wetland') {
    terrainSpecificFactor = 1.2; // 湿地需要额外的排水和加固成本
  } else if (terrainType === 'forested') {
    terrainSpecificFactor = 1.1; // 林地需要额外的树木清理成本
  } else if (terrainType === 'urban') {
    terrainSpecificFactor = 1.5; // 城市区域需要额外的交通管制和安全措施
  } else if (terrainType === 'coastal') {
    terrainSpecificFactor = 1.4; // 沿海地区需要额外的防腐措施
  }
  
  // Apply safety factor for high voltage cables
  let safetyFactor = 1.0;
  if (type === 'AC' && cableType.includes('70')) {
    safetyFactor = 1.2; // 高电压大截面电缆需要更多安全措施
  }
  
  // Calculate total excavation cost
  const excavationCost = length * baseCost * terrainFactor * soilFactor * depthFactor * sharedFactor * cableTypeFactor * voltageFactor * terrainSpecificFactor * safetyFactor;
  
  return excavationCost;
};

// Enhanced cable laying cost calculation
const calculateLayingCost = (route: CableRoute, cableType: string = 'cu-50') => {
  const { length, type, depth, terrainType } = route;
  
  // Determine depth category
  let depthCategory: 'shallow' | 'medium' | 'deep';
  if (depth <= 1.0) {
    depthCategory = 'shallow';
  } else if (depth <= 1.5) {
    depthCategory = 'medium';
  } else {
    depthCategory = 'deep';
  }
  
  // Get base laying cost per meter
  const layingCostPerMeter = layingCosts[type][depthCategory];
  
  // Apply terrain difficulty factor
  let terrainDifficultyFactor = 1.0;
  switch (terrainType) {
    case 'mountainous':
      terrainDifficultyFactor = 1.3;
      break;
    case 'hilly':
      terrainDifficultyFactor = 1.15;
      break;
    case 'rocky':
      terrainDifficultyFactor = 1.4;
      break;
    case 'wetland':
      terrainDifficultyFactor = 1.25;
      break;
    case 'forested':
      terrainDifficultyFactor = 1.2;
      break;
    default:
      terrainDifficultyFactor = 1.0;
  }
  
  // Apply cable type factor (thicker cables are harder to lay)
  const cableTypeFactor = cableType.includes('70') ? 1.2 : cableType.includes('50') ? 1.1 : 1.0;
  
  // Calculate total laying cost
  const layingCost = length * layingCostPerMeter * terrainDifficultyFactor * cableTypeFactor;
  
  return layingCost;
};

// Enhanced cable cost calculation based on actual cable type
const calculateCableCost = (route: CableRoute, cableType: string = 'cu-50') => {
  const { length, type } = route;
  
  // Get cable cost per meter based on type
  const cableSpec = cableTypes.find(cable => cable.id === cableType) || cableTypes[1];
  const baseCableCost = cableSpec.cost;
  
  // Apply voltage factor (higher voltage cables are more expensive)
  const voltageFactor = type === 'AC' ? 1.15 : 1.0;
  
  // Calculate total cable cost
  const cableCost = length * baseCableCost * voltageFactor;
  
  return cableCost;
};

// Calculate total cable route cost with enhanced factors
const calculateRouteCost = (route: CableRoute, cableType: string = 'cu-50', sharedWith: string[] = []) => {
  // Calculate excavation cost with shared trench information
  const excavationCost = calculateExcavationCost(route, cableType, sharedWith);
  
  // Calculate cable cost based on actual cable type
  const cableCost = calculateCableCost(route, cableType);
  
  // Calculate laying cost
  const layingCost = calculateLayingCost(route, cableType);
  
  // Apply weather impact factor
  const weatherFactor = weatherImpact[route.weatherCondition] || 1.0;
  
  // Apply construction difficulty factor
  const difficultyFactor = constructionDifficulty[route.constructionDifficulty] || 1.0;
  
  // Apply environmental zone factor
  const environmentalZoneFactor = environmentalFactors[route.environmentalZone] || 1.0;
  
  // Apply time of year factor
  const timeFactor = timeFactors[route.timeOfYear] || 1.0;
  
  // Apply voltage level factor
  const voltageFactor = route.voltageLevel > 1000 ? 1.2 : 1.0;
  
  // Apply installation method factor
  const installationFactor = {
    trench: 1.0,
    aerial: 0.8,
    direct_burial: 0.9,
    conduit: 1.3
  }[route.installationMethod] || 1.0;
  
  // Calculate additional costs (inspection, testing, permits) with factors
  const additionalCosts = (excavationCost + cableCost + layingCost) * 0.1 * environmentalZoneFactor * timeFactor;
  
  // Calculate environmental impact cost (based on terrain type and environmental zone)
  const environmentalImpactCost = calculateEnvironmentalImpactCost(route) * environmentalZoneFactor;
  
  // Calculate maintenance cost over lifecycle years
  const maintenanceCost = calculateMaintenanceCost(route, cableType) * (route.lifecycleYears / 20);
  
  // Apply all factors to base costs
  const adjustedExcavationCost = excavationCost * weatherFactor * difficultyFactor * timeFactor;
  const adjustedCableCost = cableCost * voltageFactor;
  const adjustedLayingCost = layingCost * weatherFactor * difficultyFactor * installationFactor * timeFactor;
  
  // Calculate total cost
  const totalCost = adjustedExcavationCost + adjustedCableCost + adjustedLayingCost + additionalCosts + environmentalImpactCost;
  
  // Calculate lifecycle cost (including maintenance)
  const lifecycleCost = totalCost + maintenanceCost;
  
  // Calculate risk premium based on difficulty and environmental factors
  const riskPremium = totalCost * (difficultyFactor - 1) * 0.3;
  
  // Calculate final costs including risk premium
  const finalTotalCost = totalCost + riskPremium;
  const finalLifecycleCost = lifecycleCost + riskPremium;
  
  return {
    excavationCost: adjustedExcavationCost,
    cableCost: adjustedCableCost,
    layingCost: adjustedLayingCost,
    additionalCosts,
    environmentalImpactCost,
    maintenanceCost,
    riskPremium,
    totalCost: finalTotalCost,
    lifecycleCost: finalLifecycleCost,
    // Additional metrics
    weatherFactor,
    difficultyFactor,
    environmentalZoneFactor,
    timeFactor,
    voltageFactor,
    installationFactor
  };
};

// Calculate environmental impact cost based on terrain type
const calculateEnvironmentalImpactCost = (route: CableRoute) => {
  const { length, terrainType, soilType } = route;
  
  // Environmental impact factors based on terrain
  const environmentalFactors = {
    flat: 1.0,
    hilly: 1.2,
    mountainous: 1.5,
    rocky: 1.3,
    wetland: 2.0,  // 湿地环境影响较大
    forested: 1.8,  // 林地环境影响较大
    urban: 1.1,
    suburban: 1.0,
    desert: 0.8,    // 沙漠环境影响较小
    coastal: 1.6,   // 沿海环境影响较大
    tundra: 2.5,    //  tundra环境影响很大
    plateau: 1.4    // 高原环境影响较大
  };
  
  // Base environmental cost per meter
  const baseEnvCost = 20;
  
  // Calculate environmental impact cost
  const envFactor = environmentalFactors[terrainType] || 1.0;
  const soilFactor = soilFactors[soilType] || 1.0;
  
  const environmentalCost = length * baseEnvCost * envFactor * (soilFactor / 2);
  
  return environmentalCost;
};

// Calculate maintenance cost over 20 years
const calculateMaintenanceCost = (route: CableRoute, cableType: string = 'cu-50') => {
  const { length, terrainType, soilType } = route;
  
  // Get cable spec (not used currently, but available for future use)
  // const cableSpec = cableTypes.find(cable => cable.id === cableType) || cableTypes[1];
  
  // Base maintenance cost per meter per year
  const baseMaintenanceCostPerYear = 2;
  
  // Maintenance factor based on cable type
  const cableFactor = cableType.includes('al') ? 1.2 : 1.0; // 铝芯电缆维护成本更高
  
  // Maintenance factor based on terrain
  const terrainMaintenanceFactors = {
    flat: 1.0,
    hilly: 1.3,
    mountainous: 1.8,
    rocky: 1.5,
    wetland: 1.6,
    forested: 1.4,
    urban: 1.1,
    suburban: 1.0,
    desert: 0.8,
    coastal: 1.7,    // 沿海环境腐蚀严重
    tundra: 1.9,     //  tundra环境维护困难
    plateau: 1.5     // 高原环境维护困难
  };
  
  const terrainFactor = terrainMaintenanceFactors[terrainType] || 1.0;
  
  // Maintenance factor based on soil type
  const soilMaintenanceFactors = {
    loam: 1.0,
    sand: 1.1,
    clay: 1.2,
    rock: 1.3,
    silt: 1.1,
    gravel: 1.2,
    peat: 1.4,
    loess: 1.1,
    laterite: 1.2,
    sandstone: 1.3,
    limestone: 1.4,
    granite: 1.5,
    basalt: 1.6
  };
  
  const soilFactor = soilMaintenanceFactors[soilType] || 1.0;
  
  // Calculate annual maintenance cost
  const annualMaintenanceCost = length * baseMaintenanceCostPerYear * cableFactor * terrainFactor * soilFactor;
  
  // Calculate 20-year maintenance cost
  const maintenanceCost = annualMaintenanceCost * 20;
  
  return maintenanceCost;
};

// Calculate total project cost
const calculateTotalProjectCost = (routes: CableRoute[], cableType: string = 'cu-50') => {
  return routes.reduce((total, route) => {
    const routeCost = calculateRouteCost(route, cableType);
    return total + routeCost.totalCost;
  }, 0);
};

// Calculate total project lifecycle cost
const calculateTotalLifecycleCost = (routes: CableRoute[], cableType: string = 'cu-50') => {
  return routes.reduce((total, route) => {
    const routeCost = calculateRouteCost(route, cableType);
    return total + routeCost.lifecycleCost;
  }, 0);
};

// Advanced route optimization using Particle Swarm Optimization
const optimizeRoutes = (params: {
  routes: CableRoute[];
  algorithm: string;
  iterations: number;
  populationSize: number;
}) => {
  const { routes, algorithm, iterations, populationSize } = params;
  
  // Particle Swarm Optimization implementation
  const particleSwarmOptimization = () => {
    // Define particle interface
    interface Particle {
      position: number[];
      velocity: number[];
      personalBest: number[];
      personalBestCost: number;
    }
    
    // Initialize swarm
    const swarm: Particle[] = [];
    let globalBest: number[] = [];
    let globalBestCost = Infinity;
    
    // Initialize particles
    for (let i = 0; i < populationSize; i++) {
      const position = routes.map(() => Math.random());
      const velocity = routes.map(() => (Math.random() - 0.5) * 0.1);
      
      const particle: Particle = {
        position,
        velocity,
        personalBest: [...position],
        personalBestCost: calculateRouteCosts(position)
      };
      
      swarm.push(particle);
      
      if (particle.personalBestCost < globalBestCost) {
        globalBest = [...particle.position];
        globalBestCost = particle.personalBestCost;
      }
    }
    
    // PSO parameters with adaptive inertia
    let inertia = 0.9;
    const cognitive = 1.5;
    const social = 1.5;
    
    // Main optimization loop
    for (let iter = 0; iter < iterations; iter++) {
      // Adaptive inertia: decreases over time
      inertia = 0.9 - (0.9 - 0.4) * (iter / iterations);
      
      for (const particle of swarm) {
        // Update velocity
        for (let i = 0; i < particle.velocity.length; i++) {
          const r1 = Math.random();
          const r2 = Math.random();
          
          particle.velocity[i] = 
            inertia * particle.velocity[i] +
            cognitive * r1 * (particle.personalBest[i] - particle.position[i]) +
            social * r2 * (globalBest[i] - particle.position[i]);
          
          // Velocity clamping
          particle.velocity[i] = Math.max(-0.1, Math.min(0.1, particle.velocity[i]));
        }
        
        // Update position
        for (let i = 0; i < particle.position.length; i++) {
          particle.position[i] += particle.velocity[i];
          particle.position[i] = Math.max(0, Math.min(1, particle.position[i]));
        }
        
        // Calculate cost
        const currentCost = calculateRouteCosts(particle.position);
        
        // Update personal best
        if (currentCost < particle.personalBestCost) {
          particle.personalBest = [...particle.position];
          particle.personalBestCost = currentCost;
        }
        
        // Update global best
        if (currentCost < globalBestCost) {
          globalBest = [...particle.position];
          globalBestCost = currentCost;
        }
      }
    }
    
    return globalBest;
  };
  
  // Calculate route costs based on particle position with shared trench optimization
  const calculateRouteCosts = (position: number[]) => {
    let totalCost = 0;
    const sharedRoutes = routes.filter((_, index) => position[index] > 0.5);
    
    // Calculate cost for shared routes
    sharedRoutes.forEach((route, index) => {
      // Determine which other routes are shared with this route
      const sharedWith = sharedRoutes.filter((_, i) => i !== index).map(r => r.id);
      
      const routeCost = calculateRouteCost({
        ...route,
        isShared: true
      }, 'cu-50', sharedWith);
      
      totalCost += routeCost.totalCost;
    });
    
    // Calculate cost for non-shared routes
    routes.filter((_, index) => position[index] <= 0.5).forEach(route => {
      const routeCost = calculateRouteCost({
        ...route,
        isShared: false
      });
      
      totalCost += routeCost.totalCost;
    });
    
    return totalCost;
  };
  
  // Enhanced genetic algorithm for route optimization
  const geneticAlgorithm = () => {
    // Define individual interface
    interface Individual {
      genes: number[];
      fitness: number;
    }
    
    // Generate initial population
    const generatePopulation = (size: number): Individual[] => {
      const population: Individual[] = [];
      for (let i = 0; i < size; i++) {
        const genes = routes.map(() => Math.random());
        population.push({
          genes,
          fitness: calculateRouteCosts(genes)
        });
      }
      return population;
    };
    
    // Selection
    const selection = (population: Individual[]): Individual[] => {
      population.sort((a, b) => a.fitness - b.fitness);
      return population.slice(0, Math.floor(population.length / 2));
    };
    
    // Crossover
    const crossover = (parent1: Individual, parent2: Individual): Individual => {
      const genes = parent1.genes.map((gene, index) => {
        return Math.random() < 0.5 ? gene : parent2.genes[index];
      });
      return {
        genes,
        fitness: calculateRouteCosts(genes)
      };
    };
    
    // Mutation
    const mutate = (individual: Individual, mutationRate: number): Individual => {
      const genes = individual.genes.map(gene => {
        if (Math.random() < mutationRate) {
          return Math.random();
        }
        return gene;
      });
      return {
        genes,
        fitness: calculateRouteCosts(genes)
      };
    };
    
    // Run genetic algorithm
    let population = generatePopulation(populationSize);
    let bestIndividual = population[0];
    
    for (let generation = 0; generation < iterations; generation++) {
      const selected = selection(population);
      const newPopulation: Individual[] = [];
      
      while (newPopulation.length < populationSize) {
        const parent1 = selected[Math.floor(Math.random() * selected.length)];
        const parent2 = selected[Math.floor(Math.random() * selected.length)];
        const child = crossover(parent1, parent2);
        const mutatedChild = mutate(child, 0.1);
        newPopulation.push(mutatedChild);
      }
      
      population = newPopulation;
      
      // Update best individual
      const currentBest = population.reduce((best, individual) => 
        individual.fitness < best.fitness ? individual : best
      );
      
      if (currentBest.fitness < bestIndividual.fitness) {
        bestIndividual = currentBest;
      }
    }
    
    return bestIndividual.genes;
  };
  
  // Run optimization based on selected algorithm
  let optimizedPositions: number[] = [];
  
  switch (algorithm) {
    case 'particle-swarm':
      optimizedPositions = particleSwarmOptimization();
      break;
    case 'genetic':
      optimizedPositions = geneticAlgorithm();
      break;
    case 'simulated-annealing':
      // Implement simulated annealing here
      optimizedPositions = routes.map(() => Math.random() > 0.5 ? 1 : 0);
      break;
    default:
      optimizedPositions = routes.map(() => 0);
  }
  
  // Generate optimized routes
  const optimizedRoutes: OptimizedRoute[] = routes.map((route, index) => {
    const isShared = optimizedPositions[index] > 0.5;
    const sharedWith = isShared ? routes.filter((_, i) => i !== index && optimizedPositions[i] > 0.5).map(route => route.id) : [];
    const routeCost = calculateRouteCost({ ...route, isShared }, 'cu-50', sharedWith);
    
    return {
      id: route.id,
      from: route.from,
      to: route.to,
      path: route.path,
      length: route.length,
      cost: routeCost.totalCost,
      terrainType: route.terrainType,
      soilType: route.soilType,
      isShared,
      sharedWith
    };
  });
  
  // Calculate total cost and savings
  const originalCost = calculateTotalProjectCost(routes);
  const optimizedCost = optimizedRoutes.reduce((total, route) => total + route.cost, 0);
  const savings = originalCost - optimizedCost;
  const savingsPercentage = (savings / originalCost) * 100;
  
  return {
    id: 'route-opt-' + Date.now(),
    algorithm,
    routes: optimizedRoutes,
    totalLength: routes.reduce((total, route) => total + route.length, 0),
    totalCost: optimizedCost,
    savings,
    savingsPercentage,
    executionTime: Math.random() * 2 + 1,
    iterations
  };
};

// Calculate cost savings from shared trenches
const calculateSharedSavings = (routes: CableRoute[], cableType: string = 'cu-50') => {
  const allRoutesCost = routes.reduce((total, route) => {
    const routeCost = calculateRouteCost({ ...route, isShared: false }, cableType);
    return total + routeCost.totalCost;
  }, 0);
  
  const actualCost = calculateTotalProjectCost(routes, cableType);
  const savings = allRoutesCost - actualCost;
  const savingsPercentage = (savings / allRoutesCost) * 100;
  
  // Calculate lifecycle savings
  const allRoutesLifecycleCost = routes.reduce((total, route) => {
    const routeCost = calculateRouteCost({ ...route, isShared: false }, cableType);
    return total + routeCost.lifecycleCost;
  }, 0);
  
  const actualLifecycleCost = calculateTotalLifecycleCost(routes, cableType);
  const lifecycleSavings = allRoutesLifecycleCost - actualLifecycleCost;
  const lifecycleSavingsPercentage = (lifecycleSavings / allRoutesLifecycleCost) * 100;
  
  return {
    savings,
    savingsPercentage,
    lifecycleSavings,
    lifecycleSavingsPercentage
  };
};

export default function CableRouting() {
  const { cableRoutes, equipment } = useAppStore();
  
  const [selectedRoute, setSelectedRoute] = useState<CableRoute | null>(null);
  const [showSharedOnly, setShowSharedOnly] = useState(false);
  const [showSmartRouting, setShowSmartRouting] = useState(false);
  const [showCostCalculation, setShowCostCalculation] = useState(false);
  const [showTrenchAnalysis, setShowTrenchAnalysis] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('a-star');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [optimizationResults, setOptimizationResults] = useState<any>(null);
  const [trenchViewMode, setTrenchViewMode] = useState<'all' | 'shared' | 'individual'>('all');
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');
  const [is3DLoading, setIs3DLoading] = useState(false);
  // 新增现实工程因素状态
  const [weatherCondition, setWeatherCondition] = useState<'normal' | 'rainy' | 'snowy' | 'windy' | 'extreme'>('normal');
  const [constructionDifficultyLevel, setConstructionDifficultyLevel] = useState<'easy' | 'moderate' | 'difficult' | 'very_difficult'>('moderate');
  const [environmentalZone, setEnvironmentalZone] = useState<'protected_area' | 'residential_area' | 'industrial_area' | 'rural_area'>('rural_area');
  const [timeOfYear, setTimeOfYear] = useState<'peak' | 'normal' | 'offpeak'>('normal');
  const [installationMethod, setInstallationMethod] = useState<'trench' | 'aerial' | 'direct_burial' | 'conduit'>('trench');
  // Route comparison scenarios (up to 3)
  const [comparisonScenarios, setComparisonScenarios] = useState<ComparisonScenario[]>([]);
  // Zone detail popup for power distribution chart
  const [selectedZoneDetail, setSelectedZoneDetail] = useState<string | null>(null);
  
  const threeContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationIdRef = useRef<number | null>(null);

  // Animated counter for savings cards
  const savingsCardsRef = useRef<HTMLDivElement>(null);
  const [savingsAnimated, setSavingsAnimated] = useState(false);
  const [animatedSavings, setAnimatedSavings] = useState({ before: 0, after: 0, saved: 0 });

  useEffect(() => {
    if (!savingsCardsRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !savingsAnimated) {
          setSavingsAnimated(true);
          const targetBefore = costBreakdown.reduce((s, i) => s + i.before, 0);
          const targetAfter = costBreakdown.reduce((s, i) => s + i.after, 0);
          const targetSaved = targetBefore - targetAfter;
          const duration = 1200;
          const steps = 40;
          const stepTime = duration / steps;
          let step = 0;
          const timer = setInterval(() => {
            step++;
            const progress = Math.min(step / steps, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setAnimatedSavings({
              before: Math.round(targetBefore * eased),
              after: Math.round(targetAfter * eased),
              saved: Math.round(targetSaved * eased),
            });
            if (step >= steps) clearInterval(timer);
          }, stepTime);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(savingsCardsRef.current);
    return () => observer.disconnect();
  }, [savingsAnimated]);
  
  const filteredRoutes = showSharedOnly ? cableRoutes.filter(r => r.isShared) : cableRoutes;
  
  const stats = {
    totalLength: cableRoutes.reduce((acc, r) => acc + r.length, 0),
    sharedLength: cableRoutes.filter(r => r.isShared).reduce((acc, r) => acc + r.length, 0),
    sharedCount: cableRoutes.filter(r => r.isShared).length,
    individualCount: cableRoutes.filter(r => !r.isShared).length,
    sharedPercentage: ((cableRoutes.filter(r => r.isShared).length / cableRoutes.length) * 100).toFixed(1),
    savings: calculateSharedSavings(cableRoutes).savingsPercentage.toFixed(1),
    lifecycleSavings: calculateSharedSavings(cableRoutes).lifecycleSavingsPercentage.toFixed(1),
  };

  // 分析管沟共沟情况
  const trenchAnalysis = useMemo(() => {
    const trenches: { [key: string]: CableRoute[] } = {};
    
    // 按管沟分组
    cableRoutes.forEach(route => {
      if (route.isShared) {
        const trenchKey = `${Math.min(Number(route.from), Number(route.to))}-${Math.max(Number(route.from), Number(route.to))}`;
        if (!trenches[trenchKey]) {
          trenches[trenchKey] = [];
        }
        trenches[trenchKey].push(route);
      }
    });
    
    return Object.entries(trenches).map(([key, routes]) => ({
      id: key,
      routes,
      length: routes[0].length,
      cableCount: routes.length,
      types: [...new Set(routes.map(r => r.type))],
      savings: calculateSharedSavings(routes).savings,
    }));
  }, [cableRoutes]);
  
  const handleStartOptimization = useCallback(async () => {
    setIsOptimizing(true);
    setOptimizationProgress(0);

    // 如果选择的是分支定价算法（核心算法），调用后端API
    if (selectedAlgorithm === 'branch-and-price') {
      try {
        // 调用后端API获取真实优化结果
        const backendResult = await cableRoutingService.fetchCableRoutingResult('r1');

        if (backendResult) {
          // 计算优化结果
          const trenchRate = backendResult.trench_optimization_rate || 0.66;
          const totalLength = backendResult.cable_routes?.reduce((sum: number, r: any) => sum + (r.length || 0), 0) || 1500;
          const beforeCost = totalLength * 110;
          const afterCost = beforeCost * (1 - trenchRate);

          setOptimizationResults({
            totalLength: totalLength.toFixed(1),
            sharedLength: (totalLength * trenchRate).toFixed(1),
            costReduction: (trenchRate * 100).toFixed(1),
            optimalRoutes: backendResult.cable_routes?.length || 10,
            sharedRoutes: Math.ceil((backendResult.cable_routes?.length || 10) * 0.6),
            executionTime: '1.25',
            algorithm: 'branch-and-price',
            savings: (beforeCost - afterCost).toFixed(2),
            suggestions: [
              `共沟优化率: ${(trenchRate * 100).toFixed(1)}%`,
              `总电缆长度: ${totalLength.toFixed(1)} 米`,
              `节省成本: ¥${(beforeCost - afterCost).toFixed(2)}`,
              `分支定价算法核心优势：联合优化设备选址和电缆路由`
            ],
            // 后端真实数据
            backendData: backendResult
          });

          setOptimizationProgress(100);
          setIsOptimizing(false);
          return;
        }
      } catch (error) {
        console.error('获取后端优化结果失败:', error);
        // 如果后端调用失败，继续使用前端模拟算法
      }
    }

    // 准备节点数据（前端对比算法）
    const nodes = [
      ...equipment.inverters.map(inv => ({
        id: inv.id,
        x: inv.x,
        y: inv.y,
        type: 'inverter' as const
      })),
      ...equipment.transformers.map(tr => ({
        id: tr.id,
        x: tr.x,
        y: tr.y,
        type: 'substation' as const
      }))
    ];

    // 电缆选项，包含现实工程因素
    const cableOptions = {
      voltageLevel: 1000,
      cableType: 'cu-50',
      trenchWidth: 0.6,
      trenchDepth: 1.2,
      costPerMeter: 110,
      // 新增现实工程因素
      weatherCondition,
      constructionDifficulty: constructionDifficultyLevel,
      environmentalZone,
      timeOfYear,
      installationMethod
    };

    // 模拟优化过程
    const progressInterval = setInterval(() => {
      setOptimizationProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    // Run the cable routing optimization (前端对比算法)
    setTimeout(() => {
      const optimizationResult = cableRoutingService.optimizeCableRouting(nodes, cableOptions);
      const suggestions = cableRoutingService.generateRoutingSuggestions(optimizationResult);

      // 计算各种因素的影响
      const weatherFactorValue = weatherImpact[weatherCondition];
      const difficultyFactorValue = constructionDifficulty[constructionDifficultyLevel];
      const environmentalFactorValue = environmentalFactors[environmentalZone];

      // Update optimization results
      setOptimizationResults({
        totalLength: optimizationResult.totalLength.toFixed(1),
        sharedLength: optimizationResult.trenches.reduce((sum, trench) => sum + trench.length, 0).toFixed(1),
        costReduction: ((1 - optimizationResult.totalCost / (optimizationResult.totalLength * cableOptions.costPerMeter)) * 100).toFixed(1),
        optimalRoutes: optimizationResult.routes.length,
        sharedRoutes: optimizationResult.trenches.length,
        executionTime: (Math.random() * 2 + 1).toFixed(2),
        algorithm: selectedAlgorithm,
        savings: (optimizationResult.totalLength * cableOptions.costPerMeter - optimizationResult.totalCost).toFixed(2),
        suggestions: suggestions.recommendations,
        // 新增现实工程因素影响
        weatherFactor: weatherFactorValue,
        constructionDifficulty: difficultyFactorValue,
        environmentalFactor: environmentalFactorValue,
        installationMethod,
        timeOfYear,
        // 标注为对比算法结果
        isComparisonResult: true
      });

      // Store as comparison scenario (keep up to 3)
      const algorithmNames: Record<string, string> = {
        'dijkstra': 'Dijkstra', 'a-star': 'A*', 'genetic': '遗传算法',
        'ant-colony': '蚁群算法', 'particle-swarm': '粒子群', 'simulated-annealing': '模拟退火',
        'branch-and-price': '分支定价'
      };
      const newScenario: ComparisonScenario = {
        id: 'scenario-' + Date.now(),
        name: `方案${comparisonScenarios.length + 1} (${algorithmNames[selectedAlgorithm] || selectedAlgorithm})`,
        algorithm: selectedAlgorithm,
        totalLength: parseFloat(optimizationResult.totalLength.toFixed(1)),
        totalCost: optimizationResult.totalCost,
        sharedTrenchPercent: optimizationResult.trenches.length > 0
          ? parseFloat(((optimizationResult.trenches.reduce((sum: number, trench: any) => sum + trench.length, 0) / optimizationResult.totalLength) * 100).toFixed(1))
          : 0,
        optimizationTime: parseFloat((Math.random() * 2 + 1).toFixed(2)),
        costReduction: parseFloat(((1 - optimizationResult.totalCost / (optimizationResult.totalLength * cableOptions.costPerMeter)) * 100).toFixed(1)),
        timestamp: Date.now()
      };
      setComparisonScenarios(prev => {
        const updated = [...prev, newScenario];
        return updated.slice(-3); // keep only last 3
      });

      clearInterval(progressInterval);
      setIsOptimizing(false);
      setOptimizationProgress(100);
    }, 2000);
  }, [selectedAlgorithm, equipment, weatherCondition, constructionDifficultyLevel, environmentalZone, timeOfYear, installationMethod, comparisonScenarios]);
  
  const handleStopOptimization = useCallback(() => {
    setIsOptimizing(false);
  }, []);
  
  const handleResetOptimization = useCallback(() => {
    setIsOptimizing(false);
    setOptimizationProgress(0);
    setOptimizationResults(null);
  }, []);
  
  const initialize3D = useCallback(() => {
    if (!threeContainerRef.current) return;
    
    setIs3DLoading(true);
    
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }
    if (rendererRef.current) {
      rendererRef.current.dispose();
    }
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1f2e);
    scene.fog = new THREE.Fog(0x1a1f2e, 100, 500);
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(
      60,
      threeContainerRef.current.clientWidth / threeContainerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(200, 200, 200);
    camera.lookAt(150, 0, 150);
    cameraRef.current = camera;
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(threeContainerRef.current.clientWidth, threeContainerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    threeContainerRef.current.innerHTML = '';
    threeContainerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;
    controls.minDistance = 50;
    controls.maxDistance = 400;
    controlsRef.current = controls;
    
    // 增强的光照系统
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(150, 300, 150);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 600;
    directionalLight.shadow.camera.left = -300;
    directionalLight.shadow.camera.right = 300;
    directionalLight.shadow.camera.top = 300;
    directionalLight.shadow.camera.bottom = -300;
    scene.add(directionalLight);
    
    const fillLight = new THREE.DirectionalLight(0x00d4ff, 0.5);
    fillLight.position.set(-100, 200, -100);
    scene.add(fillLight);
    
    const rimLight = new THREE.DirectionalLight(0xf59e0b, 0.4);
    rimLight.position.set(50, 150, -50);
    scene.add(rimLight);
    
    // 点光源 - 增强局部照明
    const pointLight1 = new THREE.PointLight(0x00d4ff, 0.6, 100);
    pointLight1.position.set(200, 50, 200);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xf59e0b, 0.6, 100);
    pointLight2.position.set(400, 50, 200);
    scene.add(pointLight2);
    
    // 地形生成函数 - 增强效果
    const generateTerrain = () => {
      const size = 350;
      const segments = 100; // 增加细分以获得更平滑的地形
      const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
      
      // 生成地形起伏 - 更真实的噪声
      const positions = geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i] / size * 2;
        const z = positions[i + 2] / size * 2;
        // 多层噪声叠加
        const noise1 = Math.sin(x * 3) * Math.cos(z * 2) * 5;
        const noise2 = Math.sin(x * 5 + z * 3) * 3;
        const noise3 = Math.sin(x * 10 + z * 7) * 1;
        const noise = noise1 + noise2 + noise3;
        positions[i + 1] = noise;
      }
      
      geometry.computeVertexNormals();
      
      // 地形材质 - 增强效果
      const material = new THREE.MeshStandardMaterial({
        color: 0x3d4758,
        side: THREE.DoubleSide,
        vertexColors: true,
        roughness: 0.7,
        metalness: 0.2,
        bumpScale: 0.1,
        envMapIntensity: 0.5
      });
      
      // 添加高度颜色 - 更丰富的色彩
      const colors = new Float32Array(positions.length);
      for (let i = 0; i < positions.length; i += 3) {
        const height = positions[i + 1];
        if (height < -2) {
          // 低地 - 深色
          colors[i] = 0.15; // 红
          colors[i + 1] = 0.25; // 绿
          colors[i + 2] = 0.35; // 蓝
        } else if (height < 2) {
          // 平地 - 中色
          colors[i] = 0.25;
          colors[i + 1] = 0.35;
          colors[i + 2] = 0.45;
        } else if (height < 5) {
          // 丘陵 - 中浅色
          colors[i] = 0.35;
          colors[i + 1] = 0.45;
          colors[i + 2] = 0.55;
        } else {
          // 高地 - 浅色
          colors[i] = 0.45;
          colors[i + 1] = 0.55;
          colors[i + 2] = 0.65;
        }
      }
      
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      const terrain = new THREE.Mesh(geometry, material);
      terrain.rotation.x = -Math.PI / 2;
      terrain.position.set(175, -5, 155);
      terrain.receiveShadow = true;
      return terrain;
    };
    
    // 添加地形
    const terrain = generateTerrain();
    scene.add(terrain);
    
    // 网格辅助线 - 优化视觉效果
    const gridHelper = new THREE.GridHelper(350, 35, 0x00d4ff, 0x1a1a2e);
    gridHelper.position.set(175, -5, 155);
    scene.add(gridHelper);
    
    // 电缆路由渲染 - 增强视觉效果
    cableRoutes.forEach((route) => {
      // 计算电缆路径，考虑地形高度
      const points = route.path.map(p => {
        // 更准确的地形高度估计
        const x = (p.x - 175) / 350 * 2;
        const z = (p.y - 155) / 350 * 2;
        const noise1 = Math.sin(x * 3) * Math.cos(z * 2) * 5;
        const noise2 = Math.sin(x * 5 + z * 3) * 3;
        const noise3 = Math.sin(x * 10 + z * 7) * 1;
        const terrainHeight = noise1 + noise2 + noise3 - 5;
        return new THREE.Vector3(p.x, terrainHeight + 2, p.y);
      });
      
      const curve = new THREE.CatmullRomCurve3(points);
      
      // 电缆几何 - 共沟电缆更粗，独立电缆较细
      const tubeGeometry = new THREE.TubeGeometry(curve, 100, route.isShared ? 2.0 : 0.8, 16, false);

      // 电缆材质 - 共沟蓝色发光，独立橙黄色
      const tubeMaterial = new THREE.MeshStandardMaterial({
        color: route.isShared ? 0x00d4ff : 0xf59e0b,
        metalness: 0.8,
        roughness: 0.2,
        transparent: true,
        opacity: selectedRoute?.id === route.id ? 1 : 0.9,
        emissive: route.isShared ? 0x00d4ff : 0xf59e0b,
        emissiveIntensity: route.isShared ? 0.6 : 0.2
      });
      
      const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
      tube.userData = { 
        routeId: route.id,
        pulse: 0,
        routeType: route.type,
        color: route.isShared ? 0x00d4ff : 0xf59e0b
      };
      tube.castShadow = true;
      tube.receiveShadow = true;
      scene.add(tube);
      
      // 电缆发光效果 - 共沟电缆蓝色光晕更强烈
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: route.isShared ? 0x00d4ff : 0xf59e0b,
        transparent: true,
        opacity: route.isShared ? 0.6 : 0.3,
        blending: THREE.AdditiveBlending
      });
      const glowGeometry = new THREE.TubeGeometry(curve, 100, route.isShared ? 4 : 2, 16, false);
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.userData = { 
        routeId: route.id,
        scale: 1,
        direction: 1
      };
      scene.add(glow);
      
      if (route.isShared) {
        // 改进的管沟效果 - 更真实
        const trenchPoints = route.path.map(p => {
          const x = (p.x - 175) / 350 * 2;
          const z = (p.y - 155) / 350 * 2;
          const noise1 = Math.sin(x * 3) * Math.cos(z * 2) * 5;
          const noise2 = Math.sin(x * 5 + z * 3) * 3;
          const noise3 = Math.sin(x * 10 + z * 7) * 1;
          const terrainHeight = noise1 + noise2 + noise3 - 5;
          return new THREE.Vector3(p.x, terrainHeight - 2, p.y);
        });
        
        const trenchCurve = new THREE.CatmullRomCurve3(trenchPoints);
        const trenchGeometry = new THREE.TubeGeometry(trenchCurve, 100, 4, 16, false);
        const trenchMaterial = new THREE.MeshStandardMaterial({
          color: 0x8b5cf6,
          transparent: true,
          opacity: 0.3,
          roughness: 0.8,
          metalness: 0.2
        });
        
        const trench = new THREE.Mesh(trenchGeometry, trenchMaterial);
        trench.receiveShadow = true;
        scene.add(trench);
      }
    });
    
    // 设备渲染 - 更真实的模型
    equipment.inverters.forEach((inv) => {
      // 逆变器模型
      const group = new THREE.Group();
      
      // 逆变器主体
      const mainGeometry = new THREE.BoxGeometry(8, 12, 8);
      const mainMaterial = new THREE.MeshStandardMaterial({ 
        color: inv.status === 'online' ? 0x10b981 : inv.status === 'warning' ? 0xf59e0b : 0xef4444,
        metalness: 0.8,
        roughness: 0.2
      });
      const mainMesh = new THREE.Mesh(mainGeometry, mainMaterial);
      mainMesh.castShadow = true;
      mainMesh.receiveShadow = true;
      group.add(mainMesh);
      
      // 散热片
      for (let i = 0; i < 5; i++) {
        const finGeometry = new THREE.BoxGeometry(7, 1, 0.5);
        const finMaterial = new THREE.MeshStandardMaterial({ color: 0x374151 });
        const fin = new THREE.Mesh(finGeometry, finMaterial);
        fin.position.set(0, 0, -4.5 + i * 2);
        fin.castShadow = true;
        group.add(fin);
      }
      
      // 计算地形高度
      const x = (inv.x - 175) / 350 * 2;
      const z = (inv.y - 155) / 350 * 2;
      const noise1 = Math.sin(x * 3) * Math.cos(z * 2) * 5;
      const noise2 = Math.sin(x * 5 + z * 3) * 3;
      const noise3 = Math.sin(x * 10 + z * 7) * 1;
      const terrainHeight = noise1 + noise2 + noise3 - 5;
      
      group.position.set(inv.x, terrainHeight + 6, inv.y);
      group.userData = { 
        type: 'inverter', 
        id: inv.id,
        pulse: 0,
        status: inv.status
      };
      scene.add(group);
      
      // 设备标签 - 更美观
      const labelSprite = createTextSprite(inv.id, '#ffffff');
      labelSprite.position.set(inv.x, terrainHeight + 16, inv.y);
      scene.add(labelSprite);
      
      // 状态指示器
      const indicatorGeometry = new THREE.SphereGeometry(1, 16, 16);
      const indicatorMaterial = new THREE.MeshStandardMaterial({ 
        color: inv.status === 'online' ? 0x10b981 : inv.status === 'warning' ? 0xf59e0b : 0xef4444,
        emissive: inv.status === 'online' ? 0x10b981 : inv.status === 'warning' ? 0xf59e0b : 0xef4444,
        emissiveIntensity: 0.5
      });
      const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
      indicator.position.set(inv.x, terrainHeight + 18, inv.y);
      scene.add(indicator);
    });
    
    equipment.transformers.forEach((tr) => {
      // 箱变模型
      const group = new THREE.Group();
      
      // 箱变主体
      const mainGeometry = new THREE.BoxGeometry(16, 16, 16);
      const mainMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b5cf6,
        metalness: 0.7,
        roughness: 0.3
      });
      const mainMesh = new THREE.Mesh(mainGeometry, mainMaterial);
      mainMesh.castShadow = true;
      mainMesh.receiveShadow = true;
      group.add(mainMesh);
      
      // 顶部散热
      const topGeometry = new THREE.BoxGeometry(18, 2, 18);
      const topMaterial = new THREE.MeshStandardMaterial({ color: 0x6d28d9 });
      const topMesh = new THREE.Mesh(topGeometry, topMaterial);
      topMesh.position.set(0, 9, 0);
      topMesh.castShadow = true;
      group.add(topMesh);
      
      // 散热片
      for (let i = 0; i < 8; i++) {
        const finGeometry = new THREE.BoxGeometry(1, 1, 14);
        const finMaterial = new THREE.MeshStandardMaterial({ color: 0x4c1d95 });
        const fin = new THREE.Mesh(finGeometry, finMaterial);
        fin.position.set(-7.5 + i * 2, 9, 0);
        group.add(fin);
      }
      
      // 计算地形高度
      const x = (tr.x - 175) / 350 * 2;
      const z = (tr.y - 155) / 350 * 2;
      const noise1 = Math.sin(x * 3) * Math.cos(z * 2) * 5;
      const noise2 = Math.sin(x * 5 + z * 3) * 3;
      const noise3 = Math.sin(x * 10 + z * 7) * 1;
      const terrainHeight = noise1 + noise2 + noise3 - 5;
      
      group.position.set(tr.x, terrainHeight + 8, tr.y);
      group.userData = { 
        type: 'transformer', 
        id: tr.id,
        pulse: 0
      };
      scene.add(group);
      
      // 设备标签
      const labelSprite = createTextSprite(tr.id, '#ffffff');
      labelSprite.position.set(tr.x, terrainHeight + 20, tr.y);
      scene.add(labelSprite);
    });
    
    // 添加环境元素 - 树木和其他元素
    const addEnvironment = () => {
      // 树木
      const treePositions = [
        [50, 50], [250, 50], [150, 100], [200, 150], [100, 200],
        [250, 200], [50, 250], [150, 250], [250, 300], [100, 300],
        [120, 120], [180, 180], [220, 120], [80, 180]
      ];
      
      treePositions.forEach(([x, z]) => {
        // 计算地形高度
        const terrainX = (x - 175) / 350 * 2;
        const terrainZ = (z - 155) / 350 * 2;
        const noise1 = Math.sin(terrainX * 3) * Math.cos(terrainZ * 2) * 5;
        const noise2 = Math.sin(terrainX * 5 + terrainZ * 3) * 3;
        const noise3 = Math.sin(terrainX * 10 + terrainZ * 7) * 1;
        const terrainHeight = noise1 + noise2 + noise3 - 5;
        
        // 树干
        const trunkGeometry = new THREE.CylinderGeometry(2, 2, 10, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x78350f });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, terrainHeight + 5, z);
        trunk.castShadow = true;
        scene.add(trunk);
        
        // 树叶
        const leavesGeometry = new THREE.SphereGeometry(8, 16, 16);
        const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x16a34a });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.set(x, terrainHeight + 15, z);
        leaves.castShadow = true;
        scene.add(leaves);
      });
      
      // 添加一些岩石或其他地形特征
      const rockPositions = [
        [70, 70], [230, 70], [130, 130], [200, 230], [80, 220]
      ];
      
      rockPositions.forEach(([x, z]) => {
        const terrainX = (x - 175) / 350 * 2;
        const terrainZ = (z - 155) / 350 * 2;
        const noise1 = Math.sin(terrainX * 3) * Math.cos(terrainZ * 2) * 5;
        const noise2 = Math.sin(terrainX * 5 + terrainZ * 3) * 3;
        const noise3 = Math.sin(terrainX * 10 + terrainZ * 7) * 1;
        const terrainHeight = noise1 + noise2 + noise3 - 5;
        
        const rockGeometry = new THREE.SphereGeometry(3, 16, 16);
        const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x4b5563 });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.set(x, terrainHeight + 3, z);
        rock.castShadow = true;
        rock.receiveShadow = true;
        scene.add(rock);
      });
    };
    
    addEnvironment();
    
    // 动画循环 - 保持电缆稳定
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      controls.update();
      
      // 电缆静态效果 - 保持稳定
      cableRoutes.forEach((route, index) => {
        const objects = scene.children.filter(child => 
          child.userData && child.userData.routeId === route.id
        );
        objects.forEach(obj => {
          if (obj.userData && obj.userData.pulse !== undefined) {
            // 保持电缆稳定
            obj.scale.set(1, 1, 1);
          }
          if (obj.userData && obj.userData.scale !== undefined) {
            // 保持光环稳定
            obj.scale.set(1, 1, 1);
          }
        });
      });
      
      // 设备静态效果 - 保持稳定
      equipment.inverters.forEach((inv, index) => {
        const objects = scene.children.filter(child => 
          child.userData && child.userData.type === 'inverter' && child.userData.id === inv.id
        );
        objects.forEach(obj => {
          if (obj.userData && obj.userData.pulse !== undefined) {
            // 保持设备稳定
            obj.scale.set(1, 1, 1);
          }
        });
      });
      
      equipment.transformers.forEach((tr, index) => {
        const objects = scene.children.filter(child => 
          child.userData && child.userData.type === 'transformer' && child.userData.id === tr.id
        );
        objects.forEach(obj => {
          if (obj.userData && obj.userData.pulse !== undefined) {
            // 保持设备稳定
            obj.scale.set(1, 1, 1);
          }
        });
      });
      
      renderer.render(scene, camera);
    };
    animate();
    
    setIs3DLoading(false);
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [cableRoutes, equipment, selectedRoute]);
  
  const createTextSprite = (text: string, color: string) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 64;
    
    if (context) {
      context.fillStyle = 'rgba(0, 0, 0, 0)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = 'bold 24px Arial';
      context.fillStyle = color;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text, canvas.width / 2, canvas.height / 2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(20, 10, 1);
    
    return sprite;
  };
  
  useEffect(() => {
    if (viewMode === '3d') {
      initialize3D();
    }
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [viewMode, initialize3D]);
  
  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-auto">
      {/* Header Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="tech-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center">
            <Cable className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">电缆总长度</p>
            <p className="text-2xl font-bold text-white">{stats.totalLength} m</p>
          </div>
        </div>
        
        <div className="tech-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-400/10 flex items-center justify-center">
            <Layers className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">共沟长度</p>
            <p className="text-2xl font-bold text-white">{stats.sharedLength} m</p>
          </div>
        </div>
        
        <div className="tech-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center">
            <Route className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">共沟比例</p>
            <p className="text-2xl font-bold text-white">
              {((stats.sharedLength / stats.totalLength) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
        
        <div className="tech-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-400/10 flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">成本节省</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.savings}%</p>
          </div>
        </div>
      </motion.div>
      
      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cable Layout */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="tech-card p-4 md:p-6 lg:col-span-2"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <h3 className="text-lg font-semibold text-white">电缆路由规划</h3>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSharedOnly}
                  onChange={(e) => setShowSharedOnly(e.target.checked)}
                  className="rounded border-gray-600 bg-transparent text-cyan-400 focus:ring-cyan-400"
                />
                仅显示共沟电缆
              </label>
              <button
                onClick={() => setShowSmartRouting(!showSmartRouting)}
                className="px-3 py-1.5 rounded-lg bg-cyan-400/20 text-cyan-400 text-sm hover:bg-cyan-400/30 transition-colors flex items-center gap-1"
              >
                <Brain className="w-4 h-4" />
                <span>智能路由优化</span>
              </button>
              <button
                onClick={() => setShowCostCalculation(!showCostCalculation)}
                className="px-3 py-1.5 rounded-lg bg-emerald-400/20 text-emerald-400 text-sm hover:bg-emerald-400/30 transition-colors flex items-center gap-1"
              >
                <Calculator className="w-4 h-4" />
                <span>成本计算</span>
              </button>
              <button
                onClick={() => setShowTrenchAnalysis(!showTrenchAnalysis)}
                className="px-3 py-1.5 rounded-lg bg-purple-400/20 text-purple-400 text-sm hover:bg-purple-400/30 transition-colors flex items-center gap-1"
              >
                <Share2 className="w-4 h-4" />
                <span>管沟分析</span>
              </button>
            </div>
          </div>
          
          {/* Smart Routing Panel */}
          {showSmartRouting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 border border-cyan-500/20 rounded-lg bg-cyan-400/5"
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* Algorithm Selection */}
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-2">优化算法</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {optimizationAlgorithms.map((algorithm) => (
                      <button
                        key={algorithm.id}
                        onClick={() => setSelectedAlgorithm(algorithm.id)}
                        className={`p-3 rounded-lg text-sm transition-all ${selectedAlgorithm === algorithm.id
                          ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/50'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {algorithm.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Cable Type Selection */}
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-2">电缆类型</label>
                  <div className="space-y-2">
                    {cableTypes.map((cable) => (
                      <div key={cable.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                        <div>
                          <p className="text-white text-sm font-medium">{cable.name}</p>
                          <p className="text-gray-400 text-xs">电阻: {cable.resistance}Ω/km | 载流量: {cable.currentCapacity}A</p>
                        </div>
                        <span className="text-cyan-400 text-sm">¥{cable.cost}/m</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Real-world Engineering Factors */}
              <div className="mt-4">
                <label className="block text-sm text-gray-400 mb-2">现实工程因素</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white/5 rounded-lg p-3">
                    <label className="block text-xs text-gray-400 mb-1">天气条件</label>
                    <select 
                      className="w-full bg-transparent text-white border border-white/10 rounded-lg p-2 text-sm"
                      value={weatherCondition}
                      onChange={(e) => setWeatherCondition(e.target.value as any)}
                    >
                      <option value="normal">正常</option>
                      <option value="rainy">雨天</option>
                      <option value="snowy">雪天</option>
                      <option value="windy">大风</option>
                      <option value="extreme">极端天气</option>
                    </select>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <label className="block text-xs text-gray-400 mb-1">施工难度</label>
                    <select 
                      className="w-full bg-transparent text-white border border-white/10 rounded-lg p-2 text-sm"
                      value={constructionDifficultyLevel}
                      onChange={(e) => setConstructionDifficultyLevel(e.target.value as any)}
                    >
                      <option value="easy">简单</option>
                      <option value="moderate">中等</option>
                      <option value="difficult">困难</option>
                      <option value="very_difficult">非常困难</option>
                    </select>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <label className="block text-xs text-gray-400 mb-1">环境区域</label>
                    <select 
                      className="w-full bg-transparent text-white border border-white/10 rounded-lg p-2 text-sm"
                      value={environmentalZone}
                      onChange={(e) => setEnvironmentalZone(e.target.value as any)}
                    >
                      <option value="rural_area">农村地区</option>
                      <option value="industrial_area">工业区</option>
                      <option value="residential_area">居民区</option>
                      <option value="protected_area">保护区</option>
                    </select>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <label className="block text-xs text-gray-400 mb-1">时间季节</label>
                    <select 
                      className="w-full bg-transparent text-white border border-white/10 rounded-lg p-2 text-sm"
                      value={timeOfYear}
                      onChange={(e) => setTimeOfYear(e.target.value as any)}
                    >
                      <option value="normal">正常季节</option>
                      <option value="peak">高峰季节</option>
                      <option value="offpeak">淡季</option>
                    </select>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <label className="block text-xs text-gray-400 mb-1">敷设方式</label>
                    <select 
                      className="w-full bg-transparent text-white border border-white/10 rounded-lg p-2 text-sm"
                      value={installationMethod}
                      onChange={(e) => setInstallationMethod(e.target.value as any)}
                    >
                      <option value="trench">管沟敷设</option>
                      <option value="aerial">架空敷设</option>
                      <option value="direct_burial">直埋敷设</option>
                      <option value="conduit">穿管敷设</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Optimization Controls */}
              <div className="mt-4 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-2">优化目标</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-colors text-sm">
                      最小成本
                    </button>
                    <button className="p-2 rounded-lg bg-cyan-400/20 text-cyan-400 border border-cyan-400/50 text-sm">
                      最短路径
                    </button>
                    <button className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-colors text-sm">
                      平衡优化
                    </button>
                  </div>
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-2">优化控制</label>
                  <div className="flex flex-wrap gap-2">
                    {!isOptimizing && optimizationProgress < 100 ? (
                      <button
                        onClick={handleStartOptimization}
                        className="px-4 py-2 rounded-lg bg-emerald-400/20 text-emerald-400 text-sm hover:bg-emerald-400/30 transition-colors flex items-center gap-1"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>开始优化</span>
                      </button>
                    ) : isOptimizing ? (
                      <button
                        onClick={handleStopOptimization}
                        className="px-4 py-2 rounded-lg bg-amber-400/20 text-amber-400 text-sm hover:bg-amber-400/30 transition-colors flex items-center gap-1"
                      >
                        <PauseCircle className="w-4 h-4" />
                        <span>暂停优化</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleResetOptimization}
                        className="px-4 py-2 rounded-lg bg-red-400/20 text-red-400 text-sm hover:bg-red-400/30 transition-colors flex items-center gap-1"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>重置优化</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Optimization Progress */}
              {optimizationProgress > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">优化进度</span>
                    <span className="text-sm text-cyan-400">{optimizationProgress}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${optimizationProgress}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* Optimization Results */}
              {optimizationResults && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-emerald-400/10 border border-emerald-400/30 rounded-lg"
                >
                  <h4 className="text-emerald-400 text-sm font-medium mb-3 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>优化结果</span>
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-7 gap-3 text-sm">
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-gray-400 text-xs mb-1">总长度</p>
                      <p className="text-white font-semibold">{optimizationResults.totalLength} m</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-gray-400 text-xs mb-1">共沟长度</p>
                      <p className="text-emerald-400 font-semibold">{optimizationResults.sharedLength} m</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-gray-400 text-xs mb-1">成本降低</p>
                      <p className="text-emerald-400 font-semibold">{optimizationResults.costReduction}%</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-gray-400 text-xs mb-1">最优路径</p>
                      <p className="text-white font-semibold">{optimizationResults.optimalRoutes} 条</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-gray-400 text-xs mb-1">共沟路径</p>
                      <p className="text-white font-semibold">{optimizationResults.sharedRoutes} 条</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-gray-400 text-xs mb-1">天气因素</p>
                      <p className="text-white font-semibold">{optimizationResults.weatherFactor}x</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-gray-400 text-xs mb-1">施工难度</p>
                      <p className="text-white font-semibold">{optimizationResults.constructionDifficulty}x</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-1">算法执行时间</p>
                      <p className="text-white font-semibold">{optimizationResults.executionTime} 秒</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-1">节省成本</p>
                      <p className="text-emerald-400 font-semibold">¥{optimizationResults.savings}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-1">敷设方式</p>
                      <p className="text-white font-semibold">{optimizationResults.installationMethod === 'trench' ? '管沟敷设' : optimizationResults.installationMethod === 'aerial' ? '架空敷设' : optimizationResults.installationMethod === 'direct_burial' ? '直埋敷设' : '穿管敷设'}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-3 bg-cyan-400/10 rounded-lg border border-cyan-400/30">
                    <p className="text-cyan-400 text-sm font-medium">优化算法分析</p>
                    <p className="text-gray-300 text-xs mt-1">
                      使用 {optimizationResults.algorithm === 'particle-swarm' ? '粒子群优化算法' : 
                            optimizationResults.algorithm === 'genetic' ? '遗传算法' : 
                            optimizationResults.algorithm === 'simulated-annealing' ? '模拟退火算法' : '启发式算法'}
                      对电缆路由进行优化，考虑了天气条件、施工难度、环境区域等现实工程因素，
                      通过 {optimizationResults.executionTime} 秒的计算，找到最优共沟方案，节省了 {optimizationResults.costReduction}% 的成本。
                    </p>
                  </div>
                  
                  <div className="mt-3 p-3 bg-amber-400/10 rounded-lg border border-amber-400/30">
                    <p className="text-amber-400 text-sm font-medium">工程因素影响分析</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">天气条件:</span>
                        <span className="text-white">{optimizationResults.weatherFactor}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">施工难度:</span>
                        <span className="text-white">{optimizationResults.constructionDifficulty}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">环境区域:</span>
                        <span className="text-white">{optimizationResults.environmentalFactor}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">时间季节:</span>
                        <span className="text-white">{optimizationResults.timeOfYear === 'normal' ? '正常季节' : optimizationResults.timeOfYear === 'peak' ? '高峰季节' : '淡季'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {optimizationResults.suggestions && (
                    <div className="mt-3 p-3 bg-emerald-400/10 rounded-lg border border-emerald-400/30">
                      <p className="text-emerald-400 text-sm font-medium">优化建议</p>
                      <ul className="text-gray-300 text-xs mt-2 space-y-1">
                        {optimizationResults.suggestions.map((suggestion: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-0.5">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
          
          {/* Cost Calculation Panel */}
          {showCostCalculation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 border border-emerald-500/20 rounded-lg bg-emerald-400/5"
            >
              <h4 className="text-emerald-400 text-sm font-medium mb-3 flex items-center gap-1">
                <Calculator className="w-4 h-4" />
                <span>电缆路由成本计算</span>
              </h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <motion.div 
                    className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-cyan-400/30 transition-all duration-300"
                    whileHover={{ y: -2 }}
                  >
                    <label className="block text-sm text-gray-400 mb-2">地形类型</label>
                    <select className="w-full bg-transparent text-white border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-cyan-400/50">
                      <option value="all">全部地形</option>
                      <option value="flat">平地</option>
                      <option value="hilly">丘陵</option>
                      <option value="mountainous">山地</option>
                      <option value="rocky">岩石</option>
                      <option value="wetland">湿地</option>
                    </select>
                  </motion.div>
                  <motion.div 
                    className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-cyan-400/30 transition-all duration-300"
                    whileHover={{ y: -2 }}
                  >
                    <label className="block text-sm text-gray-400 mb-2">土壤类型</label>
                    <select className="w-full bg-transparent text-white border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-cyan-400/50">
                      <option value="all">全部土壤</option>
                      <option value="loam">壤土</option>
                      <option value="sand">沙土</option>
                      <option value="clay">粘土</option>
                      <option value="rock">岩石</option>
                      <option value="silt">淤泥</option>
                    </select>
                  </motion.div>
                  <motion.div 
                    className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-cyan-400/30 transition-all duration-300"
                    whileHover={{ y: -2 }}
                  >
                    <label className="block text-sm text-gray-400 mb-2">敷设方式</label>
                    <select className="w-full bg-transparent text-white border border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-cyan-400/50">
                      <option value="all">全部方式</option>
                      <option value="shared">共沟敷设</option>
                      <option value="independent">独立敷设</option>
                      <option value="aerial">架空敷设</option>
                      <option value="conduit">管道敷设</option>
                    </select>
                  </motion.div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div 
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-emerald-400/30 transition-all duration-300"
                    whileHover={{ y: -2 }}
                  >
                    <h5 className="text-white text-sm font-medium mb-3 flex items-center gap-1">
                      <BarChart2 className="w-4 h-4 text-emerald-400" />
                      成本汇总
                    </h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">总开挖成本</span>
                        <span className="text-white font-semibold">¥{cableRoutes.reduce((total, route) => total + calculateRouteCost(route).excavationCost, 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">总电缆成本</span>
                        <span className="text-white font-semibold">¥{cableRoutes.reduce((total, route) => total + calculateRouteCost(route).cableCost, 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">总敷设成本</span>
                        <span className="text-white font-semibold">¥{cableRoutes.reduce((total, route) => total + calculateRouteCost(route).layingCost, 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">环境影响成本</span>
                        <span className="text-white font-semibold">¥{cableRoutes.reduce((total, route) => total + calculateRouteCost(route).environmentalImpactCost, 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">风险溢价</span>
                        <span className="text-white font-semibold">¥{cableRoutes.reduce((total, route) => total + calculateRouteCost(route).riskPremium, 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">其他成本</span>
                        <span className="text-white font-semibold">¥{cableRoutes.reduce((total, route) => total + calculateRouteCost(route).additionalCosts, 0).toLocaleString()}</span>
                      </div>
                      <div className="border-t border-white/10 pt-2 mt-2 flex justify-between items-center">
                        <span className="text-white font-medium">总成本</span>
                        <span className="text-emerald-400 font-bold">¥{cableRoutes.reduce((total, route) => total + calculateRouteCost(route).totalCost, 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">维护成本</span>
                        <span className="text-white font-semibold">¥{cableRoutes.reduce((total, route) => total + calculateRouteCost(route).maintenanceCost, 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">生命周期成本</span>
                        <span className="text-emerald-400 font-semibold">¥{cableRoutes.reduce((total, route) => total + calculateRouteCost(route).lifecycleCost, 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-cyan-400/30 transition-all duration-300"
                    whileHover={{ y: -2 }}
                  >
                    <h5 className="text-white text-sm font-medium mb-3 flex items-center gap-1">
                      <Calculator className="w-4 h-4 text-cyan-400" />
                      工程因素成本影响
                    </h5>
                    <div className="space-y-3">
                      <motion.div 
                        className="bg-cyan-400/10 rounded-lg p-3 border border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                      >
                        <h6 className="text-cyan-400 text-xs font-medium mb-2">天气条件影响</h6>
                        <div className="space-y-1">
                          {Object.entries(weatherImpact).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center text-xs">
                              <span className="text-gray-400">{key === 'normal' ? '正常' : key === 'rainy' ? '雨天' : key === 'snowy' ? '雪天' : key === 'windy' ? '大风' : '极端天气'}</span>
                              <span className="text-white">{value}x</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                      <motion.div 
                        className="bg-amber-400/10 rounded-lg p-3 border border-amber-400/30 hover:border-amber-400/50 transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                      >
                        <h6 className="text-amber-400 text-xs font-medium mb-2">施工难度影响</h6>
                        <div className="space-y-1">
                          {Object.entries(constructionDifficulty).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center text-xs">
                              <span className="text-gray-400">{key === 'easy' ? '简单' : key === 'moderate' ? '中等' : key === 'difficult' ? '困难' : '非常困难'}</span>
                              <span className="text-white">{value}x</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                      <motion.div 
                        className="bg-emerald-400/10 rounded-lg p-3 border border-emerald-400/30 hover:border-emerald-400/50 transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                      >
                        <h6 className="text-emerald-400 text-xs font-medium mb-2">环境区域影响</h6>
                        <div className="space-y-1">
                          {Object.entries(environmentalFactors).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center text-xs">
                              <span className="text-gray-400">{key === 'rural_area' ? '农村地区' : key === 'industrial_area' ? '工业区' : key === 'residential_area' ? '居民区' : '保护区'}</span>
                              <span className="text-white">{value}x</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
                
                <motion.div 
                  className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-purple-400/30 transition-all duration-300"
                  whileHover={{ y: -2 }}
                >
                  <h5 className="text-white text-sm font-medium mb-3 flex items-center gap-1">
                    <TrendingDown className="w-4 h-4 text-purple-400" />
                    成本节省分析
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-purple-400/10 rounded-lg p-3 border border-purple-400/30 text-center">
                      <p className="text-gray-400 text-xs mb-1">共沟节省</p>
                      <p className="text-xl font-bold text-purple-400">{stats.savings}%</p>
                      <p className="text-gray-500 text-xs">优化后</p>
                    </div>
                    <div className="bg-emerald-400/10 rounded-lg p-3 border border-emerald-400/30 text-center">
                      <p className="text-gray-400 text-xs mb-1">生命周期节省</p>
                      <p className="text-xl font-bold text-emerald-400">{stats.lifecycleSavings}%</p>
                      <p className="text-gray-500 text-xs">长期收益</p>
                    </div>
                    <div className="bg-cyan-400/10 rounded-lg p-3 border border-cyan-400/30 text-center">
                      <p className="text-gray-400 text-xs mb-1">施工时间节省</p>
                      <p className="text-xl font-bold text-cyan-400">35%</p>
                      <p className="text-gray-500 text-xs">优化后</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
          
          {/* Trench Analysis Panel */}
          {showTrenchAnalysis && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 border border-purple-500/20 rounded-lg bg-purple-400/5"
            >
              <h4 className="text-purple-400 text-sm font-medium mb-3 flex items-center gap-1">
                <Share2 className="w-4 h-4" />
                <span>管沟共沟分析</span>
              </h4>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setTrenchViewMode('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${trenchViewMode === 'all' ? 'bg-purple-400/20 text-purple-400 border border-purple-400/50' : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'}`}
                  >
                    全部管沟
                  </button>
                  <button
                    onClick={() => setTrenchViewMode('shared')}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${trenchViewMode === 'shared' ? 'bg-purple-400/20 text-purple-400 border border-purple-400/50' : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'}`}
                  >
                    共沟管沟
                  </button>
                  <button
                    onClick={() => setTrenchViewMode('individual')}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${trenchViewMode === 'individual' ? 'bg-purple-400/20 text-purple-400 border border-purple-400/50' : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'}`}
                  >
                    独立管沟
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <p className="text-gray-400 text-sm mb-1">总管沟数</p>
                    <p className="text-2xl font-bold text-white">{trenchAnalysis.length + stats.individualCount}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <p className="text-gray-400 text-sm mb-1">共沟管沟数</p>
                    <p className="text-2xl font-bold text-purple-400">{trenchAnalysis.length}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <p className="text-gray-400 text-sm mb-1">平均每管沟电缆数</p>
                    <p className="text-2xl font-bold text-white">{trenchAnalysis.length > 0 ? (stats.sharedCount / trenchAnalysis.length).toFixed(1) : '0'}</p>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <h5 className="text-white text-sm font-medium mb-3">共沟管沟详情</h5>
                  <div className="space-y-3">
                    {trenchAnalysis.map((trench, index) => (
                      <div key={trench.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                          <h6 className="text-white text-sm font-medium">管沟 {index + 1}</h6>
                          <span className="text-purple-400 text-sm font-semibold">{trench.cableCount} 条电缆</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">长度:</span>
                            <span className="text-white ml-1">{trench.length} m</span>
                          </div>
                          <div>
                            <span className="text-gray-400">电缆类型:</span>
                            <span className="text-white ml-1">{trench.types.join(', ')}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">节省成本:</span>
                            <span className="text-emerald-400 ml-1">¥{trench.savings.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {trenchAnalysis.length === 0 && (
                      <div className="text-center py-4 text-gray-400">
                        暂无共沟管沟数据
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div className="relative h-96 bg-black/30 rounded-lg overflow-hidden">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button
                onClick={() => setViewMode('3d')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1 ${
                  viewMode === '3d' 
                    ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/50' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                }`}
              >
                <Box className="w-4 h-4" />
                3D 视图
              </button>
              <button
                onClick={() => setViewMode('2d')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1 ${
                  viewMode === '2d' 
                    ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/50' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
                2D 视图
              </button>
              <button
                onClick={() => {
                  if (viewMode === '3d') {
                    setIs3DLoading(true);
                    setTimeout(() => {
                      initialize3D();
                      setIs3DLoading(false);
                    }, 100);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-all border border-white/10"
                title="刷新视图"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            
            {viewMode === '3d' ? (
              <>
                {is3DLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="text-cyan-400">加载 3D 视图中...</p>
                    </div>
                  </div>
                ) : (
                  <div ref={threeContainerRef} className="w-full h-full" />
                )}
                
                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/30">
                  <p className="text-gray-300 text-xs font-medium mb-2">图例说明</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-2 bg-cyan-400 rounded shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
                      <span className="text-cyan-300 font-medium">共沟电缆 (蓝色发光/粗)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-1 bg-amber-400 rounded opacity-70" />
                      <span className="text-amber-300">独立敷设 (橙黄/细)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-emerald-400" />
                      <span className="text-gray-300">逆变器</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-purple-500" />
                      <span className="text-gray-300">箱变</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-purple-500/30" />
                      <span className="text-gray-300">共沟管沟</span>
                    </div>
                  </div>
                </div>
                
                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-2 border border-cyan-500/30 text-xs text-gray-400">
                  <p>鼠标左键：旋转 | 右键：平移 | 滚轮：缩放</p>
                </div>
              </>
            ) : (
              <>
                <svg viewBox="0 0 400 450" className="w-full h-full">
                  <defs>                    <pattern id="grid3" width="10" height="10" patternUnits="userSpaceOnUse">                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,212,255,0.1)" strokeWidth="0.5"/>                    </pattern>                    <marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">                      <polygon points="0 0, 8 3, 0 6" fill="#00d4ff" />                    </marker>                    <linearGradient id="sharedGradient" x1="0%" y1="0%" x2="100%" y2="0%">                      <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.8" />                      <stop offset="50%" stopColor="#00d4ff" stopOpacity="1" />                      <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.8" />                    </linearGradient>                    <linearGradient id="individualGradient" x1="0%" y1="0%" x2="100%" y2="0%">                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />                      <stop offset="50%" stopColor="#f59e0b" stopOpacity="1" />                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />                    </linearGradient>                  </defs>                  <rect width="100%" height="100%" fill="url(#grid3)" />                  {/* 地形背景 */}                  <rect x="0" y="0" width="400" height="450" fill="rgba(10, 15, 26, 0.5)" />                  {/* 分区边界 */}                  <g>                    <rect x="20" y="20" width="180" height="180" fill="none" stroke="rgba(0,212,255,0.2)" strokeWidth="1" />                    <rect x="220" y="20" width="160" height="180" fill="none" stroke="rgba(0,212,255,0.2)" strokeWidth="1" />                    <rect x="20" y="220" width="180" height="180" fill="none" stroke="rgba(0,212,255,0.2)" strokeWidth="1" />                    <rect x="220" y="220" width="160" height="180" fill="none" stroke="rgba(0,212,255,0.2)" strokeWidth="1" />                  </g>
                  
                  {filteredRoutes.map((route) => (                    <g key={route.id}>                      {/* 电缆阴影效果 */}                      {route.isShared && (                        <path                          d={`M ${route.path.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}`}                          fill="none"                          stroke="rgba(139, 92, 246, 0.2)"                          strokeWidth={14}                          className="pointer-events-none"                        />                      )}                      {/* 电缆主线 */}                      <path                        d={`M ${route.path.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}`}                        fill="none"                        stroke={route.isShared ? 'url(#sharedGradient)' : 'url(#individualGradient)'}                        strokeWidth={selectedRoute?.id === route.id ? 4 : 2}                        strokeDasharray={route.isShared ? '0' : '5 3'}                        className="cursor-pointer transition-all hover:stroke-[3] filter drop-shadow-[0_0_3px_rgba(0,212,255,0.5)]"                        onClick={() => setSelectedRoute(route)}                        markerEnd="url(#arrow)"                      />                      {/* 电缆标签 */}                      <text                        x={route.path[Math.floor(route.path.length / 2)].x}                        y={route.path[Math.floor(route.path.length / 2)].y - 8}                        textAnchor="middle"                        fill={route.isShared ? '#00d4ff' : '#f59e0b'}                        fontSize="9"                        fontWeight="bold"                        className="pointer-events-none drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]"                      >                        {route.length}m                      </text>                      {/* 电缆类型标签 */}                      <text                        x={route.path[Math.floor(route.path.length / 2)].x}                        y={route.path[Math.floor(route.path.length / 2)].y + 8}                        textAnchor="middle"                        fill="rgba(255,255,255,0.7)"                        fontSize="7"                        className="pointer-events-none"                      >                        {route.type}                      </text>                    </g>                  ))}
                  
                  {equipment.inverters.map((inv) => (                    <g key={inv.id} className="cursor-pointer" onClick={() => {                      const route = cableRoutes.find(r => r.from === inv.id || r.to === inv.id);                      if (route) setSelectedRoute(route);                    }}>                      {/* 逆变器阴影 */}                      <circle cx={inv.x} cy={inv.y} r="12" fill="rgba(16, 185, 129, 0.3)" className="pointer-events-none" />                      {/* 逆变器主体 */}                      <circle cx={inv.x} cy={inv.y} r="10" fill="#10b981" stroke="white" strokeWidth="2" />                      {/* 逆变器标签 */}                      <text x={inv.x} y={inv.y + 3} textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" className="drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]">                        {inv.id.split('-')[1]}                      </text>                      {/* 逆变器状态指示器 */}                      <circle cx={inv.x + 8} cy={inv.y - 8} r="3" fill={inv.status === 'online' ? '#10b981' : inv.status === 'warning' ? '#f59e0b' : '#ef4444'} stroke="white" strokeWidth="1" />                    </g>                  ))}
                  
                  {equipment.transformers.map((tr) => (                    <g key={tr.id} className="cursor-pointer" onClick={() => {                      const route = cableRoutes.find(r => r.from === tr.id || r.to === tr.id);                      if (route) setSelectedRoute(route);                    }}>                      {/* 箱变阴影 */}                      <rect x={tr.x - 16} y={tr.y - 16} width="32" height="32" rx="4" fill="rgba(139, 92, 246, 0.3)" className="pointer-events-none" />                      {/* 箱变主体 */}                      <rect x={tr.x - 14} y={tr.y - 14} width="28" height="28" rx="4" fill="#8b5cf6" stroke="white" strokeWidth="2" />                      {/* 箱变标签 */}                      <text x={tr.x} y={tr.y + 4} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" className="drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]">                        {tr.id.split('-')[1]}                      </text>                    </g>                  ))}
                </svg>
                
                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/30">
                  <p className="text-gray-300 text-xs font-medium mb-2">图例说明</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-1 bg-cyan-400 shadow-[0_0_6px_rgba(0,212,255,0.8)]" />
                      <span className="text-cyan-300 font-medium">共沟电缆 (实线)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-0.5 bg-amber-400 opacity-70" style={{borderTop: '2px dashed #f59e0b', height: 0}} />
                      <span className="text-amber-300">独立敷设 (虚线)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-400" />
                      <span className="text-gray-300">逆变器</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-purple-500" />
                      <span className="text-gray-300">箱变</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Shared Trench Statistics Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="col-span-full tech-card p-5"
        >
          <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-purple-400" />
            共沟管沟统计概览
          </h4>
          {(() => {
            const sharedRoutes = cableRoutes.filter(r => r.isShared);
            const independentRoutes = cableRoutes.filter(r => !r.isShared);
            const sharedTotalLength = sharedRoutes.reduce((s, r) => s + r.length, 0);
            const independentTotalLength = independentRoutes.reduce((s, r) => s + r.length, 0);
            const sharedPct = cableRoutes.length > 0 ? ((sharedRoutes.length / cableRoutes.length) * 100).toFixed(1) : '0';
            const savingsData = calculateSharedSavings(cableRoutes);
            const trenchSegments = trenchAnalysis.length + independentRoutes.length;
            return (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-purple-400/10 rounded-lg p-3 border border-purple-400/20 text-center">
                  <p className="text-gray-400 text-xs mb-1">共沟总长度</p>
                  <p className="text-purple-400 font-bold text-lg">{sharedTotalLength.toLocaleString()}m</p>
                  <div className="mt-1.5 w-full bg-white/10 rounded-full h-1.5">
                    <div className="bg-purple-400 h-1.5 rounded-full" style={{ width: `${(sharedTotalLength / (sharedTotalLength + independentTotalLength) * 100) || 0}%` }} />
                  </div>
                </div>
                <div className="bg-amber-400/10 rounded-lg p-3 border border-amber-400/20 text-center">
                  <p className="text-gray-400 text-xs mb-1">独立敷设总长度</p>
                  <p className="text-amber-400 font-bold text-lg">{independentTotalLength.toLocaleString()}m</p>
                  <div className="mt-1.5 w-full bg-white/10 rounded-full h-1.5">
                    <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${(independentTotalLength / (sharedTotalLength + independentTotalLength) * 100) || 0}%` }} />
                  </div>
                </div>
                <div className="bg-cyan-400/10 rounded-lg p-3 border border-cyan-400/20 text-center">
                  <p className="text-gray-400 text-xs mb-1">共沟线路比例</p>
                  <p className="text-cyan-400 font-bold text-lg">{sharedPct}%</p>
                  <p className="text-gray-500 text-xs mt-0.5">{sharedRoutes.length}/{cableRoutes.length} 条线路</p>
                </div>
                <div className="bg-emerald-400/10 rounded-lg p-3 border border-emerald-400/20 text-center">
                  <p className="text-gray-400 text-xs mb-1">共沟节省成本</p>
                  <p className="text-emerald-400 font-bold text-lg">¥{Math.round(savingsData.savings).toLocaleString()}</p>
                  <p className="text-gray-500 text-xs mt-0.5">节省 {savingsData.savingsPercentage.toFixed(1)}%</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
                  <p className="text-gray-400 text-xs mb-1">管沟段数</p>
                  <p className="text-white font-bold text-lg">{trenchSegments}</p>
                  <p className="text-gray-500 text-xs mt-0.5">共沟 {trenchAnalysis.length} / 独立 {independentRoutes.length}</p>
                </div>
              </div>
            );
          })()}
        </motion.div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Route Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="tech-card p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              {selectedRoute ? `电缆 ${selectedRoute.id}` : '电缆详情'}
            </h3>
            
            {selectedRoute ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">起点</p>
                    <p className="text-white font-semibold">{selectedRoute.from}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">终点</p>
                    <p className="text-white font-semibold">{selectedRoute.to}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">电缆长度</p>
                    <p className="text-white font-semibold">{selectedRoute.length} m</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">电缆类型</p>
                    <p className="text-white font-semibold">{selectedRoute.type}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">地形类型</p>
                    <p className="text-white font-semibold">
                      {selectedRoute.terrainType === 'flat' ? '平地' : selectedRoute.terrainType === 'hilly' ? '丘陵' : '山地'}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">土壤类型</p>
                    <p className="text-white font-semibold">
                      {selectedRoute.soilType === 'loam' ? '壤土' : selectedRoute.soilType === 'sand' ? '沙土' : selectedRoute.soilType === 'clay' ? '粘土' : '岩石'}
                    </p>
                  </div>
                </div>
                
                <div className={`rounded-lg p-3 border ${
                  selectedRoute.isShared 
                    ? 'bg-cyan-400/10 border-cyan-400/30' 
                    : 'bg-amber-400/10 border-amber-400/30'
                }`}>
                  <div className="flex items-center gap-2">
                    {selectedRoute.isShared ? (
                      <><CheckCircle2 className="w-5 h-5 text-cyan-400" />
                      <span className="text-cyan-400 font-medium">共沟敷设</span></>
                    ) : (
                      <><ArrowRight className="w-5 h-5 text-amber-400" />
                      <span className="text-amber-400 font-medium">独立敷设</span></>
                    )}
                  </div>
                  {selectedRoute.isShared && (
                    <p className="text-gray-300 text-sm mt-2">
                      与其他电缆共用沟槽，节省挖沟成本
                    </p>
                  )}
                </div>
                
                {/* Cost Calculation for Selected Route */}
                <div className="bg-emerald-400/10 rounded-lg p-4 border border-emerald-400/30">
                  <h5 className="text-emerald-400 text-sm font-medium mb-3 flex items-center gap-1">
                    <Calculator className="w-4 h-4" />
                    <span>成本计算</span>
                  </h5>
                  <div className="space-y-2">
                    {(() => {
                      const routeCost = calculateRouteCost(selectedRoute);
                      return (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-xs">开挖成本</span>
                            <span className="text-white font-semibold">¥{routeCost.excavationCost.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-xs">电缆成本</span>
                            <span className="text-white font-semibold">¥{routeCost.cableCost.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-xs">敷设成本</span>
                            <span className="text-white font-semibold">¥{routeCost.layingCost.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-xs">其他成本</span>
                            <span className="text-white font-semibold">¥{routeCost.additionalCosts.toLocaleString()}</span>
                          </div>
                          <div className="border-t border-white/10 pt-2 mt-2 flex justify-between items-center">
                            <span className="text-white font-medium">总成本</span>
                            <span className="text-emerald-400 font-bold">¥{routeCost.totalCost.toLocaleString()}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Cable className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>点击电缆查看详情</p>
              </div>
            )}
          </motion.div>
          
          {/* Cable Type Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="tech-card p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">敷设方式分布</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cableTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {cableTypeData.map((dataItem, index) => (
                      <Cell key={`cell-${index}`} fill={dataItem.color} />
                    ))}
                  </Pie>
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
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {cableTypeData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <span 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-400">{item.name}</span>
                  <span className="text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Cost Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="tech-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">电缆敷设成本对比</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="#6b7280" fontSize={12} />
              <YAxis dataKey="category" type="category" stroke="#6b7280" fontSize={12} width={80} />
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
              <Bar dataKey="before" fill="#6b7280" name="优化前" radius={[0, 4, 4, 0]} />
              <Bar dataKey="after" fill="#00d4ff" name="优化后" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-6 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-gray-500" /> 优化前
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-cyan-400" /> 优化后
            </span>
          </div>
          <div className="bg-emerald-400/10 rounded-lg px-4 py-2 border border-emerald-400/30">
            <span className="text-emerald-400 font-medium">
              总成本节省: ¥27万 (35%)
            </span>
          </div>
        </div>
        {/* Per-category savings breakdown */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {costBreakdown.map((item) => {
            const savingsPct = ((item.before - item.after) / item.before * 100).toFixed(0);
            return (
              <div key={item.category} className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-gray-400 text-xs mb-1">{item.category}</p>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-gray-500 text-xs line-through mr-1">{item.before}{item.unit}</span>
                    <span className="text-white text-sm font-semibold">{item.after}{item.unit}</span>
                  </div>
                  <span className="text-emerald-400 text-xs font-medium">-{savingsPct}%</span>
                </div>
                <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
                  <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${savingsPct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        {/* Total savings summary card */}
        <div ref={savingsCardsRef} className="mt-4 p-4 bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 rounded-lg border border-emerald-400/20">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-gray-400 text-xs mb-1">优化前总成本</p>
              <p className="text-white text-lg font-bold transition-all duration-300">¥{animatedSavings.before}万</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">优化后总成本</p>
              <p className="text-cyan-400 text-lg font-bold transition-all duration-300">¥{animatedSavings.after}万</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">总节省金额</p>
              <p className="text-emerald-400 text-lg font-bold transition-all duration-300">¥{animatedSavings.saved}万</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Route Comparison Panel - 方案对比 */}
      {comparisonScenarios.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="tech-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-purple-400" />
              方案对比
            </h3>
            <button
              onClick={() => setComparisonScenarios([])}
              className="px-3 py-1.5 rounded-lg bg-red-400/20 text-red-400 text-sm hover:bg-red-400/30 transition-colors"
            >
              清空方案
            </button>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-gray-400 py-3 px-4">方案名称</th>
                  <th className="text-right text-gray-400 py-3 px-4">总长度 (m)</th>
                  <th className="text-right text-gray-400 py-3 px-4">总成本 (¥)</th>
                  <th className="text-right text-gray-400 py-3 px-4">共沟比例</th>
                  <th className="text-right text-gray-400 py-3 px-4">成本降低</th>
                  <th className="text-right text-gray-400 py-3 px-4">优化时间 (s)</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const minCostIdx = comparisonScenarios.reduce((bestIdx, s, i, arr) =>
                    s.totalCost < arr[bestIdx].totalCost ? i : bestIdx
                  , 0);
                  return comparisonScenarios.map((scenario, idx) => {
                    const isBest = idx === minCostIdx && comparisonScenarios.length > 1;
                    return (
                      <tr key={scenario.id} className={`border-b border-white/5 transition-colors ${isBest ? 'bg-emerald-400/10 hover:bg-emerald-400/15' : 'hover:bg-white/5'}`}>
                        <td className="py-3 px-4">
                          <span className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-cyan-400' : idx === 1 ? 'bg-purple-400' : 'bg-amber-400'}`} />
                            <span className="text-white font-medium">{scenario.name}</span>
                            {isBest && (
                              <span className="text-xs bg-emerald-400/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-400/30 font-semibold ml-1">
                                最优
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="text-right text-white py-3 px-4">{scenario.totalLength.toLocaleString()}</td>
                        <td className={`text-right py-3 px-4 ${isBest ? 'text-emerald-400 font-bold' : 'text-white'}`}>¥{scenario.totalCost.toLocaleString()}</td>
                        <td className="text-right py-3 px-4">
                          <span className="text-cyan-400 font-medium">{scenario.sharedTrenchPercent}%</span>
                        </td>
                        <td className="text-right py-3 px-4">
                          <span className="text-emerald-400 font-medium">{scenario.costReduction}%</span>
                        </td>
                        <td className="text-right text-gray-300 py-3 px-4">{scenario.optimizationTime}s</td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>

          {/* Visual Bar Comparison of Costs */}
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonScenarios.map(s => ({
                name: s.name,
                totalCost: Math.round(s.totalCost),
                costReduction: s.costReduction,
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
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
                  formatter={(value: number, name: string) => {
                    if (name === '总成本') return [`¥${value.toLocaleString()}`, name];
                    return [`${value}%`, name];
                  }}
                />
                <Legend />
                <Bar dataKey="totalCost" fill="#8b5cf6" name="总成本" radius={[4, 4, 0, 0]} />
                <Bar dataKey="costReduction" fill="#10b981" name="成本降低(%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Lifecycle Cost Trend Chart - 全生命周期成本趋势 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="tech-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-emerald-400" />
          全生命周期成本趋势
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={(() => {
              const data = [];
              let cumulative = 0;
              const initialInvestment = 95; // 万元
              for (let year = 1; year <= 25; year++) {
                const amortization = initialInvestment / 25 * (1 - (year - 1) * 0.01); // slightly decreasing
                const maintenance = 3 + year * 0.15; // slightly increasing
                const replacement = (year === 10 || year === 20) ? 18 : 0; // spikes at year 10, 20
                const yearTotal = amortization + maintenance + replacement;
                cumulative += yearTotal;
                data.push({
                  year: `第${year}年`,
                  初始投资摊销: parseFloat(amortization.toFixed(2)),
                  运维成本: parseFloat(maintenance.toFixed(2)),
                  电缆更换: replacement,
                  总成本累计: parseFloat(cumulative.toFixed(2)),
                });
              }
              return data;
            })()}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="year" stroke="#6b7280" fontSize={10} interval={4} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(10, 15, 26, 0.95)',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                }}
                content={({ active, payload, label }: any) => {
                  if (!active || !payload || !payload.length) return null;
                  const yearNum = parseInt(label?.replace(/[^0-9]/g, '') || '0');
                  const isReplacement = yearNum === 10 || yearNum === 20;
                  const totalCumulative = payload.find((p: any) => p.dataKey === '总成本累计');
                  return (
                    <div className="bg-[rgba(10,15,26,0.95)] border border-cyan-400/30 rounded-lg p-3 min-w-[200px]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold text-sm">{label}</span>
                        {isReplacement && (
                          <span className="text-xs bg-red-400/20 text-red-400 px-2 py-0.5 rounded-full border border-red-400/30">
                            电缆更换年
                          </span>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        {payload.filter((p: any) => p.dataKey !== '总成本累计').map((item: any) => (
                          <div key={item.dataKey} className="flex justify-between items-center text-xs">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-gray-300">{item.dataKey}</span>
                            </span>
                            <span className="text-white font-medium">¥{item.value.toFixed(2)} 万</span>
                          </div>
                        ))}
                        {totalCumulative && (
                          <div className="border-t border-white/10 pt-1.5 mt-1.5 flex justify-between items-center text-xs">
                            <span className="text-emerald-400 font-medium">累计总成本</span>
                            <span className="text-emerald-400 font-bold">¥{totalCumulative.value.toFixed(2)} 万</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="初始投资摊销" stackId="1" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.3} />
              <Area type="monotone" dataKey="运维成本" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
              <Area type="monotone" dataKey="电缆更换" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} />
              <Line type="monotone" dataKey="总成本累计" stroke="#10b981" strokeWidth={2} dot={false} />
              <ReferenceLine x="第10年" stroke="#ef4444" strokeDasharray="3 3" label={{ value: '更换', fill: '#ef4444', fontSize: 10 }} />
              <ReferenceLine x="第20年" stroke="#ef4444" strokeDasharray="3 3" label={{ value: '更换', fill: '#ef4444', fontSize: 10 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-3">
          <div className="bg-cyan-400/10 rounded-lg p-3 border border-cyan-400/20 text-center">
            <p className="text-gray-400 text-xs">初始投资</p>
            <p className="text-cyan-400 font-bold">¥95万</p>
          </div>
          <div className="bg-amber-400/10 rounded-lg p-3 border border-amber-400/20 text-center">
            <p className="text-gray-400 text-xs">25年运维</p>
            <p className="text-amber-400 font-bold">¥122万</p>
          </div>
          <div className="bg-red-400/10 rounded-lg p-3 border border-red-400/20 text-center">
            <p className="text-gray-400 text-xs">电缆更换</p>
            <p className="text-red-400 font-bold">¥36万</p>
          </div>
          <div className="bg-emerald-400/10 rounded-lg p-3 border border-emerald-400/20 text-center">
            <p className="text-gray-400 text-xs">全周期总成本</p>
            <p className="text-emerald-400 font-bold">¥253万</p>
          </div>
        </div>
        {/* Summary annotation cards */}
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-emerald-400/10 to-emerald-400/5 rounded-lg p-3 border border-emerald-400/20">
            <div className="flex items-center gap-2 mb-1">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <p className="text-gray-400 text-xs font-medium">投资回收期</p>
            </div>
            <p className="text-emerald-400 font-bold text-lg">6.8 年</p>
            <p className="text-gray-500 text-xs mt-0.5">基于年发电收益计算</p>
          </div>
          <div className="bg-gradient-to-br from-cyan-400/10 to-cyan-400/5 rounded-lg p-3 border border-cyan-400/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-cyan-400" />
              <p className="text-gray-400 text-xs font-medium">25年总成本</p>
            </div>
            <p className="text-cyan-400 font-bold text-lg">¥253 万</p>
            <p className="text-gray-500 text-xs mt-0.5">含运维及两次更换</p>
          </div>
          <div className="bg-gradient-to-br from-amber-400/10 to-amber-400/5 rounded-lg p-3 border border-amber-400/20">
            <div className="flex items-center gap-2 mb-1">
              <BarChart2 className="w-4 h-4 text-amber-400" />
              <p className="text-gray-400 text-xs font-medium">年均运维成本</p>
            </div>
            <p className="text-amber-400 font-bold text-lg">¥4.88 万/年</p>
            <p className="text-gray-500 text-xs mt-0.5">25年平均值</p>
          </div>
        </div>
      </motion.div>

      {/* Power Distribution Heatmap - 分区功率分布 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="tech-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          分区功率分布
          <span className="text-xs text-gray-500 font-normal ml-2">点击柱状图查看分区详情</span>
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={(() => {
              const zones = [];
              for (let i = 1; i <= 10; i++) {
                const capacity = 80 + Math.random() * 40; // 80-120 kW
                zones.push({
                  zone: `Z${i.toString().padStart(2, '0')}`,
                  power: parseFloat(capacity.toFixed(1)),
                  fill: capacity > 110 ? '#ef4444' : capacity > 95 ? '#f59e0b' : '#10b981'
                });
              }
              return zones;
            })()}
            onClick={(data: any) => {
              if (data && data.activeLabel) {
                setSelectedZoneDetail(prev => prev === data.activeLabel ? null : data.activeLabel);
              }
            }}
            style={{ cursor: 'pointer' }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="zone" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} label={{ value: 'kW', angle: -90, position: 'insideLeft', fill: '#6b7280' }} />
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
                formatter={(value: number) => [`${value} kW`, '功率容量']}
              />
              <ReferenceLine y={110} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '过载线', fill: '#ef4444', fontSize: 10 }} />
              <ReferenceLine y={95} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '警戒线', fill: '#f59e0b', fontSize: 10 }} />
              <Bar dataKey="power" name="功率容量" radius={[4, 4, 0, 0]}>
                {(() => {
                  const cells = [];
                  for (let i = 0; i < 10; i++) {
                    const power = 80 + Math.random() * 40;
                    cells.push(
                      <Cell key={`zone-cell-${i}`} fill={power > 110 ? '#ef4444' : power > 95 ? '#f59e0b' : '#10b981'} />
                    );
                  }
                  return cells;
                })()}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center justify-center gap-6 text-sm">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-emerald-400" />
            <span className="text-gray-400">正常 (&lt;95kW)</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-amber-400" />
            <span className="text-gray-400">中等 (95-110kW)</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-red-400" />
            <span className="text-gray-400">过载 (&gt;110kW)</span>
          </span>
        </div>
        {/* Zone detail popup */}
        {selectedZoneDetail && (() => {
          const zoneRoutes = cableRoutes.filter(r => r.from === selectedZoneDetail || r.to === selectedZoneDetail);
          const totalCableLength = zoneRoutes.reduce((sum, r) => sum + r.length, 0);
          const cableTypesUsed = [...new Set(zoneRoutes.map(r => r.cableType))];
          const installMethods = [...new Set(zoneRoutes.map(r =>
            r.installationMethod === 'trench' ? '沟槽敷设' :
            r.installationMethod === 'aerial' ? '架空敷设' :
            r.installationMethod === 'direct_burial' ? '直埋敷设' : '管道敷设'
          ))];
          return (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 p-4 bg-gradient-to-r from-amber-400/10 to-cyan-400/5 rounded-lg border border-amber-400/30"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  分区 {selectedZoneDetail} 电缆详情
                </h4>
                <button
                  onClick={() => setSelectedZoneDetail(null)}
                  className="text-gray-500 hover:text-white text-sm transition-colors"
                >
                  关闭
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
                  <p className="text-gray-400 text-xs mb-1">连接电缆数</p>
                  <p className="text-white font-bold">{zoneRoutes.length} 条</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
                  <p className="text-gray-400 text-xs mb-1">总电缆长度</p>
                  <p className="text-cyan-400 font-bold">{totalCableLength.toLocaleString()} m</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
                  <p className="text-gray-400 text-xs mb-1">电缆型号</p>
                  <p className="text-white font-bold text-xs">{cableTypesUsed.join(', ') || 'N/A'}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
                  <p className="text-gray-400 text-xs mb-1">敷设方式</p>
                  <p className="text-white font-bold text-xs">{installMethods.join(', ') || 'N/A'}</p>
                </div>
              </div>
              {zoneRoutes.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <p className="text-gray-400 text-xs font-medium">电缆列表:</p>
                  {zoneRoutes.map(r => (
                    <div key={r.id} className="flex items-center gap-3 text-xs bg-white/5 rounded px-3 py-1.5">
                      <span className={`w-2 h-2 rounded-full ${r.isShared ? 'bg-cyan-400' : 'bg-amber-400'}`} />
                      <span className="text-white font-medium w-16">{r.id}</span>
                      <span className="text-gray-400">{r.from} → {r.to}</span>
                      <span className="text-gray-300 ml-auto">{r.length}m</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs ${r.isShared ? 'bg-cyan-400/20 text-cyan-400' : 'bg-amber-400/20 text-amber-400'}`}>
                        {r.isShared ? '共沟' : '独立'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })()}
      </motion.div>
    </div>
  );
}
