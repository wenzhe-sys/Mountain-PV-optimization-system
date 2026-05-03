import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  TrendingDown,
  Settings2,
  Brain,
  PlusCircle,
  Filter,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import useAppStore from '../store/useAppStore';

// Equipment types for selection
const equipmentTypes = [
  { id: 'inverter', name: '逆变器', icon: Zap, description: '将直流电转换为交流电' },
  { id: 'transformer', name: '箱式变压器', icon: Settings2, description: '改变电压等级' },
  { id: 'combiner-box', name: '汇流箱', icon: TrendingDown, description: '汇集光伏面板电流' },
  { id: 'distribution-cabinet', name: '配电柜', icon: Filter, description: '分配电力' },
];

// Equipment models with extended parameters
const equipmentModels = {
  inverter: [
    { id: 'sungrow', name: 'Sungrow SG100HX', capacity: 100, efficiency: 98.5, price: 85000, warranty: '10年', operatingTemp: '-30°C to 60°C', reliability: 99.5, cooling: 'air', ipRating: 'IP65', maxInputVoltage: 1000, outputVoltage: '380V', communication: 'RS485, WiFi, Ethernet' },
    { id: 'huawei', name: 'Huawei SUN2000-100KTL', capacity: 100, efficiency: 98.2, price: 82000, warranty: '10年', operatingTemp: '-30°C to 60°C', reliability: 99.2, cooling: 'air', ipRating: 'IP65', maxInputVoltage: 1000, outputVoltage: '380V', communication: 'RS485, WiFi, Ethernet' },
    { id: 'fronius', name: 'Fronius Symo 100.0-3-M', capacity: 100, efficiency: 97.8, price: 88000, warranty: '12年', operatingTemp: '-35°C to 65°C', reliability: 99.8, cooling: 'air', ipRating: 'IP65', maxInputVoltage: 1100, outputVoltage: '380V', communication: 'RS485, WiFi, Ethernet' },
    { id: 'solis', name: 'Solis S6-100K-4G', capacity: 100, efficiency: 98.0, price: 78000, warranty: '5年', operatingTemp: '-25°C to 55°C', reliability: 98.5, cooling: 'air', ipRating: 'IP65', maxInputVoltage: 1000, outputVoltage: '380V', communication: 'RS485, WiFi' },
    { id: 'growatt', name: 'Growatt MAX 100KTL3-XL', capacity: 100, efficiency: 98.3, price: 80000, warranty: '10年', operatingTemp: '-30°C to 60°C', reliability: 99.0, cooling: 'air', ipRating: 'IP65', maxInputVoltage: 1000, outputVoltage: '380V', communication: 'RS485, WiFi, Ethernet' },
    { id: 'abb', name: 'ABB PVS800-100', capacity: 100, efficiency: 98.4, price: 90000, warranty: '10年', operatingTemp: '-30°C to 60°C', reliability: 99.6, cooling: 'air', ipRating: 'IP65', maxInputVoltage: 1100, outputVoltage: '380V', communication: 'RS485, Ethernet' },
    { id: 'schneider', name: 'Schneider Conext CL 100', capacity: 100, efficiency: 98.1, price: 86000, warranty: '10年', operatingTemp: '-30°C to 60°C', reliability: 99.3, cooling: 'air', ipRating: 'IP65', maxInputVoltage: 1000, outputVoltage: '380V', communication: 'RS485, Ethernet' },
    { id: 'inverter-150', name: 'Sungrow SG150HX', capacity: 150, efficiency: 98.6, price: 120000, warranty: '10年', operatingTemp: '-30°C to 60°C', reliability: 99.5, cooling: 'air', ipRating: 'IP65', maxInputVoltage: 1100, outputVoltage: '380V', communication: 'RS485, WiFi, Ethernet' },
    { id: 'inverter-200', name: 'Huawei SUN2000-200KTL', capacity: 200, efficiency: 98.5, price: 150000, warranty: '10年', operatingTemp: '-30°C to 60°C', reliability: 99.2, cooling: 'air', ipRating: 'IP65', maxInputVoltage: 1100, outputVoltage: '380V', communication: 'RS485, WiFi, Ethernet' },
  ],
  transformer: [
    { id: 's11-3200', name: 'S11-M-3200/10', capacity: 3200, efficiency: 99.0, price: 120000, warranty: '20年', operatingTemp: '-40°C to 70°C', reliability: 99.9, insulation: 'paper-oil', cooling: 'oil', frequency: '50Hz', phase: '3', weight: '4500kg' },
    { id: 's11-1600', name: 'S11-M-1600/10', capacity: 1600, efficiency: 98.8, price: 80000, warranty: '20年', operatingTemp: '-40°C to 70°C', reliability: 99.9, insulation: 'paper-oil', cooling: 'oil', frequency: '50Hz', phase: '3', weight: '2800kg' },
    { id: 's13-3200', name: 'S13-M-3200/10', capacity: 3200, efficiency: 99.2, price: 140000, warranty: '25年', operatingTemp: '-40°C to 75°C', reliability: 99.95, insulation: 'paper-oil', cooling: 'oil', frequency: '50Hz', phase: '3', weight: '4800kg' },
    { id: 's13-1600', name: 'S13-M-1600/10', capacity: 1600, efficiency: 99.0, price: 95000, warranty: '25年', operatingTemp: '-40°C to 75°C', reliability: 99.95, insulation: 'paper-oil', cooling: 'oil', frequency: '50Hz', phase: '3', weight: '3000kg' },
    { id: 's15-3200', name: 'S15-M-3200/10', capacity: 3200, efficiency: 99.5, price: 160000, warranty: '30年', operatingTemp: '-40°C to 80°C', reliability: 99.99, insulation: 'paper-oil', cooling: 'oil', frequency: '50Hz', phase: '3', weight: '5000kg' },
    { id: 'dry-2000', name: 'SCB13-2000/10', capacity: 2000, efficiency: 98.9, price: 100000, warranty: '20年', operatingTemp: '-40°C to 70°C', reliability: 99.9, insulation: 'epoxy', cooling: 'air', frequency: '50Hz', phase: '3', weight: '2500kg' },
    { id: 'dry-2500', name: 'SCB13-2500/10', capacity: 2500, efficiency: 99.0, price: 115000, warranty: '20年', operatingTemp: '-40°C to 70°C', reliability: 99.9, insulation: 'epoxy', cooling: 'air', frequency: '50Hz', phase: '3', weight: '2800kg' },
    { id: 's11-4000', name: 'S11-M-4000/10', capacity: 4000, efficiency: 99.1, price: 150000, warranty: '20年', operatingTemp: '-40°C to 70°C', reliability: 99.9, insulation: 'paper-oil', cooling: 'oil', frequency: '50Hz', phase: '3', weight: '5500kg' },
  ],
  'combiner-box': [
    { id: 'cb-16', name: '16路汇流箱', capacity: 16, efficiency: 99.5, price: 5000, warranty: '5年', operatingTemp: '-30°C to 60°C', reliability: 99.0, ipRating: 'IP65', maxInput: '16x15A', maxInputVoltage: '1000V', fuseRating: '15A', communication: 'RS485' },
    { id: 'cb-24', name: '24路汇流箱', capacity: 24, efficiency: 99.5, price: 7000, warranty: '5年', operatingTemp: '-30°C to 60°C', reliability: 99.0, ipRating: 'IP65', maxInput: '24x15A', maxInputVoltage: '1000V', fuseRating: '15A', communication: 'RS485' },
    { id: 'cb-32', name: '32路汇流箱', capacity: 32, efficiency: 99.6, price: 9000, warranty: '5年', operatingTemp: '-30°C to 60°C', reliability: 99.2, ipRating: 'IP65', maxInput: '32x15A', maxInputVoltage: '1000V', fuseRating: '15A', communication: 'RS485' },
    { id: 'cb-8', name: '8路汇流箱', capacity: 8, efficiency: 99.5, price: 3500, warranty: '5年', operatingTemp: '-30°C to 60°C', reliability: 99.0, ipRating: 'IP65', maxInput: '8x15A', maxInputVoltage: '1000V', fuseRating: '15A', communication: 'RS485' },
    { id: 'cb-40', name: '40路汇流箱', capacity: 40, efficiency: 99.6, price: 11000, warranty: '5年', operatingTemp: '-30°C to 60°C', reliability: 99.2, ipRating: 'IP65', maxInput: '40x15A', maxInputVoltage: '1000V', fuseRating: '15A', communication: 'RS485' },
    { id: 'cb-20', name: '20路汇流箱', capacity: 20, efficiency: 99.5, price: 6000, warranty: '5年', operatingTemp: '-30°C to 60°C', reliability: 99.0, ipRating: 'IP65', maxInput: '20x15A', maxInputVoltage: '1000V', fuseRating: '15A', communication: 'RS485' },
  ],
  'distribution-cabinet': [
    { id: 'dc-6300', name: '6300A配电柜', capacity: 6300, efficiency: 99.8, price: 150000, warranty: '15年', operatingTemp: '-25°C to 55°C', reliability: 99.5, ipRating: 'IP40', protection: 'IP40', voltageLevel: '10kV', frequency: '50Hz', phase: '3' },
    { id: 'dc-3150', name: '3150A配电柜', capacity: 3150, efficiency: 99.8, price: 90000, warranty: '15年', operatingTemp: '-25°C to 55°C', reliability: 99.5, ipRating: 'IP40', protection: 'IP40', voltageLevel: '10kV', frequency: '50Hz', phase: '3' },
    { id: 'dc-4000', name: '4000A配电柜', capacity: 4000, efficiency: 99.8, price: 110000, warranty: '15年', operatingTemp: '-25°C to 55°C', reliability: 99.5, ipRating: 'IP40', protection: 'IP40', voltageLevel: '10kV', frequency: '50Hz', phase: '3' },
    { id: 'dc-8000', name: '8000A配电柜', capacity: 8000, efficiency: 99.8, price: 180000, warranty: '15年', operatingTemp: '-25°C to 55°C', reliability: 99.5, ipRating: 'IP40', protection: 'IP40', voltageLevel: '10kV', frequency: '50Hz', phase: '3' },
    { id: 'dc-1600', name: '1600A配电柜', capacity: 1600, efficiency: 99.8, price: 65000, warranty: '15年', operatingTemp: '-25°C to 55°C', reliability: 99.5, ipRating: 'IP40', protection: 'IP40', voltageLevel: '10kV', frequency: '50Hz', phase: '3' },
    { id: 'dc-5000', name: '5000A配电柜', capacity: 5000, efficiency: 99.8, price: 130000, warranty: '15年', operatingTemp: '-25°C to 55°C', reliability: 99.5, ipRating: 'IP40', protection: 'IP40', voltageLevel: '10kV', frequency: '50Hz', phase: '3' },
  ],
};

const EquipmentView = React.memo(function EquipmentView() {
  const { 
    equipment, 
    addInverter, 
    updateInverter,
    updateTransformer
  } = useAppStore();
  
  const { inverters, transformers, combinerBoxes, distributionCabinets } = equipment;
  
  const [selectedInverter, setSelectedInverter] = useState<any>(null);
  const [selectedTransformer, setSelectedTransformer] = useState<any>(null);
  const [selectedCombinerBox, setSelectedCombinerBox] = useState<any>(null);
  const [selectedDistributionCabinet, setSelectedDistributionCabinet] = useState<any>(null);
  const [showConnections, setShowConnections] = useState(true);
  const [selectedEquipmentType, setSelectedEquipmentType] = useState('inverter');
  const [showEquipmentSelection, setShowEquipmentSelection] = useState(false);
  const [showSmartSiting, setShowSmartSiting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  
  const loadRateData = inverters.map(inv => ({
    name: inv.id,
    loadRate: inv.loadRate,
    capacity: inv.capacity,
  }));
  
  const costComparison = [
    { name: '方案A', equipment: 50, installation: 3, cable: 30, trench: 50, total: 133 },
    { name: '方案B', equipment: 60, installation: 5, cable: 13, trench: 45, total: 123 },
    { name: '方案C', equipment: 50, installation: 3, cable: 45, trench: 30, total: 128 },
    { name: '优化方案', equipment: 55, installation: 4, cable: 20, trench: 25, total: 104 },
  ];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'offline': return '#ef4444';
      default: return '#6b7280';
    }
  };
  
  // Smart siting algorithm implementation with performance optimizations
  const smartSitingAlgorithm = (params: any) => {
    const { algorithm, optimizationGoal, terrainData, weatherData, 光照Data } = params;
    
    // Get current equipment positions
    const currentPositions = {
      inverters: inverters.map(inv => ({ id: inv.id, x: inv.x, y: inv.y, capacity: inv.capacity })),
      transformers: transformers.map(tr => ({ id: tr.id, x: tr.x, y: tr.y, capacity: tr.capacity })),
      combinerBoxes: combinerBoxes.map(cb => ({ id: cb.id, x: cb.x, y: cb.y, capacity: cb.capacity })),
      distributionCabinets: distributionCabinets.map(dc => ({ id: dc.id, x: dc.x, y: dc.y, capacity: dc.capacity })),
    };
    
    // Cache for distance calculations
    const distanceCache = new Map<string, number>();
    
    // Calculate distance between two points with caching
    const calculateDistance = (point1: { x: number; y: number }, point2: { x: number; y: number }) => {
      const key = `${point1.x}-${point2.x}-${point1.y}-${point2.y}`;
      if (distanceCache.has(key)) {
        return distanceCache.get(key) as number;
      }
      const distance = Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
      distanceCache.set(key, distance);
      return distance;
    };
    
    // Calculate terrain difficulty with more factors
    const calculateTerrainDifficulty = (x: number, y: number) => {
      // Use provided terrain data if available, otherwise simulate
      if (terrainData) {
        // Calculate terrain difficulty based on position
        const normalizedX = x / 350;
        const normalizedY = y / 310;
        
        // Simulate terrain type based on position
        const terrainTypes = terrainData.types || ['flat', 'hilly', 'mountainous', 'rocky', 'wetland', 'forested'];
        const terrainIndex = Math.floor((normalizedX * normalizedY * 100) % terrainTypes.length);
        const terrainType = terrainTypes[terrainIndex];
        
        const difficultyMap = terrainData.difficulty || {
          flat: 1.0,
          hilly: 1.5,
          mountainous: 2.5,
          rocky: 3.0,
          wetland: 1.8,
          forested: 2.2
        };
        
        return difficultyMap[terrainType as keyof typeof difficultyMap];
      } else {
        // Fallback to random terrain
        const terrainTypes = ['flat', 'hilly', 'mountainous', 'rocky', 'wetland', 'forested'];
        const randomTerrain = terrainTypes[Math.floor(Math.random() * terrainTypes.length)];
        
        const difficultyMap = {
          flat: 1.0,
          hilly: 1.5,
          mountainous: 2.5,
          rocky: 3.0,
          wetland: 1.8,
          forested: 2.2
        };
        
        return difficultyMap[randomTerrain as keyof typeof difficultyMap];
      }
    };
    
    // Calculate slope based on position
    const calculateSlope = (x: number, y: number) => {
      // Simulate slope based on position
      const normalizedX = x / 350;
      const normalizedY = y / 310;
      const slope = Math.sin(normalizedX * Math.PI) * Math.cos(normalizedY * Math.PI) * 30;
      return Math.abs(slope);
    };
    
    // Calculate aspect (orientation) based on position
    const calculateAspect = (x: number, y: number) => {
      // Simulate aspect based on position
      const normalizedX = x / 350;
      const normalizedY = y / 310;
      const aspect = (normalizedX * normalizedY * 360) % 360;
      return aspect;
    };
    
    // Calculate solar irradiance with more factors
    const calculateSolarIrradiance = (x: number, y: number) => {
      // Use provided solar data if available
      const baseIrradiance = 光照Data?.averageIrradiance || 1000; // W/m²
      
      // Calculate slope and aspect
      const slope = calculateSlope(x, y);
      const aspect = calculateAspect(x, y);
      
      // Calculate solar angle factor (simplified)
      const solarAngleFactor = Math.cos(slope * Math.PI / 180);
      
      // Calculate aspect factor (south-facing is best)
      const aspectFactor = Math.max(0.5, 1 - Math.abs(aspect - 180) / 180);
      
      // Calculate seasonal variation
      const seasonalVariation = 光照Data?.seasonalVariation || 0.2;
      const seasonalFactor = 1 + seasonalVariation * Math.sin(Date.now() / 10000000);
      
      // Calculate weather factor
      const weatherFactor = weatherData ? {
        temperature: weatherData.averageTemperature > 40 ? 0.9 : weatherData.averageTemperature < -10 ? 0.8 : 1.0,
        humidity: weatherData.averageHumidity > 80 ? 0.9 : 1.0,
        precipitation: weatherData.precipitation > 1500 ? 0.8 : 1.0
      } : { temperature: 1.0, humidity: 1.0, precipitation: 1.0 };
      
      // Combine all factors
      const irradiance = baseIrradiance * solarAngleFactor * aspectFactor * seasonalFactor * 
                        weatherFactor.temperature * weatherFactor.humidity * weatherFactor.precipitation;
      
      return Math.max(200, irradiance); // Minimum irradiance
    };
    
    // Calculate shadow impact with more factors
    const calculateShadowImpact = (x: number, y: number) => {
      // Simulate shadow impact based on position and terrain
      const slope = calculateSlope(x, y);
      const distanceFromCenter = Math.sqrt(Math.pow(x - 175, 2) + Math.pow(y - 155, 2));
      
      // Slope affects shadow length
      const slopeFactor = Math.max(0.5, 1 - slope / 45);
      
      // Distance from center affects shadow impact
      const distanceFactor = Math.max(0.3, 1 - distanceFromCenter / 250);
      
      return slopeFactor * distanceFactor;
    };
    
    // Calculate wind exposure
    const calculateWindExposure = (x: number, y: number) => {
      // Simulate wind exposure based on position and terrain
      const slope = calculateSlope(x, y);
      const aspect = calculateAspect(x, y);
      
      // Wind speed from weather data
      const windSpeed = weatherData?.windSpeed || 5;
      
      // Slope increases wind exposure
      const slopeFactor = 1 + slope / 45;
      
      // Aspect affects wind exposure (assuming prevailing wind from north)
      const aspectFactor = Math.max(0.5, 1 - Math.abs(aspect - 0) / 180);
      
      return windSpeed * slopeFactor * aspectFactor;
    };
    
    // Calculate soil stability
    const calculateSoilStability = (x: number, y: number) => {
      // Simulate soil stability based on position and terrain
      const terrainDifficulty = calculateTerrainDifficulty(x, y);
      const slope = calculateSlope(x, y);
      
      // Higher terrain difficulty means lower soil stability
      const terrainFactor = 1 / terrainDifficulty;
      
      // Steeper slopes mean lower soil stability
      const slopeFactor = Math.max(0.3, 1 - slope / 45);
      
      return terrainFactor * slopeFactor;
    };
    
    // Calculate total cable length with terrain difficulty
    const calculateTotalCableLength = (positions: any) => {
      let totalLength = 0;
      
      // Inverter to transformer
      positions.inverters.forEach((inv: any) => {
        let nearestDistance = Infinity;
        
        for (const tr of positions.transformers) {
          const distance = calculateDistance(inv, tr);
          const terrainDifficulty = calculateTerrainDifficulty((inv.x + tr.x) / 2, (inv.y + tr.y) / 2);
          const slope = calculateSlope((inv.x + tr.x) / 2, (inv.y + tr.y) / 2);
          const adjustedDistance = distance * terrainDifficulty * (1 + slope / 100);
          
          if (adjustedDistance < nearestDistance) {
            nearestDistance = adjustedDistance;
          }
        }
        totalLength += nearestDistance;
      });
      
      // Combiner box to inverter
      positions.combinerBoxes.forEach((cb: any, index: number) => {
        if (positions.inverters[index]) {
          const distance = calculateDistance(cb, positions.inverters[index]);
          const terrainDifficulty = calculateTerrainDifficulty((cb.x + positions.inverters[index].x) / 2, (cb.y + positions.inverters[index].y) / 2);
          const slope = calculateSlope((cb.x + positions.inverters[index].x) / 2, (cb.y + positions.inverters[index].y) / 2);
          totalLength += distance * terrainDifficulty * (1 + slope / 100);
        }
      });
      
      // Transformer to distribution cabinet
      positions.transformers.forEach((tr: any) => {
        let nearestDistance = Infinity;
        
        for (const dc of positions.distributionCabinets) {
          const distance = calculateDistance(tr, dc);
          const terrainDifficulty = calculateTerrainDifficulty((tr.x + dc.x) / 2, (tr.y + dc.y) / 2);
          const slope = calculateSlope((tr.x + dc.x) / 2, (tr.y + dc.y) / 2);
          const adjustedDistance = distance * terrainDifficulty * (1 + slope / 100);
          
          if (adjustedDistance < nearestDistance) {
            nearestDistance = adjustedDistance;
          }
        }
        totalLength += nearestDistance;
      });
      
      return totalLength;
    };
    
    // Calculate load balance
    const calculateLoadBalance = (positions: any) => {
      // Calculate load for each transformer
      const transformerLoads = positions.transformers.map((tr: any) => {
        const connectedInverters = positions.inverters.filter((inv: any) => {
          const distance = calculateDistance(inv, tr);
          return distance < 100; // Assume transformers serve inverters within 100 units
        });
        return connectedInverters.reduce((total: number, inv: any) => total + inv.capacity, 0);
      });
      
      // Calculate standard deviation of loads
      const averageLoad = transformerLoads.reduce((sum: number, load: number) => sum + load, 0) / transformerLoads.length;
      const variance = transformerLoads.reduce((sum: number, load: number) => sum + Math.pow(load - averageLoad, 2), 0) / transformerLoads.length;
      const stdDev = Math.sqrt(variance);
      
      // Lower standard deviation means better load balance
      return 1 / (1 + stdDev);
    };
    
    // Calculate solar efficiency
    const calculateSolarEfficiency = (positions: any) => {
      let totalEfficiency = 0;
      
      positions.inverters.forEach((inv: any) => {
        const irradiance = calculateSolarIrradiance(inv.x, inv.y);
        const shadowImpact = calculateShadowImpact(inv.x, inv.y);
        const windExposure = calculateWindExposure(inv.x, inv.y);
        
        // Wind can help cool inverters, increasing efficiency
        const windFactor = Math.min(1.1, 1 + windExposure / 50);
        
        const efficiency = (irradiance / 1000) * shadowImpact * windFactor;
        totalEfficiency += efficiency;
      });
      
      return totalEfficiency / positions.inverters.length;
    };
    
    // Calculate installation difficulty
    const calculateInstallationDifficulty = (positions: any) => {
      let totalDifficulty = 0;
      
      // Check all equipment positions
      const allEquipment = [
        ...positions.inverters,
        ...positions.transformers,
        ...positions.combinerBoxes,
        ...positions.distributionCabinets
      ];
      
      allEquipment.forEach((equipment: any) => {
        const terrainDifficulty = calculateTerrainDifficulty(equipment.x, equipment.y);
        const slope = calculateSlope(equipment.x, equipment.y);
        const soilStability = calculateSoilStability(equipment.x, equipment.y);
        const windExposure = calculateWindExposure(equipment.x, equipment.y);
        
        // Combine factors
        const difficulty = terrainDifficulty * (1 + slope / 50) * (1 / soilStability) * (1 + windExposure / 20);
        totalDifficulty += difficulty;
      });
      
      return totalDifficulty / allEquipment.length;
    };
    
    // Calculate equipment accessibility
    const calculateAccessibility = (positions: any) => {
      let totalAccessibility = 0;
      
      // Check all equipment positions
      const allEquipment = [
        ...positions.inverters,
        ...positions.transformers,
        ...positions.combinerBoxes,
        ...positions.distributionCabinets
      ];
      
      allEquipment.forEach((equipment: any) => {
        const terrainDifficulty = calculateTerrainDifficulty(equipment.x, equipment.y);
        const slope = calculateSlope(equipment.x, equipment.y);
        const distanceFromEdge = Math.min(
          equipment.x, 
          350 - equipment.x, 
          equipment.y, 
          310 - equipment.y
        );
        
        // Accessibility is higher for easier terrain, gentler slopes, and closer to edges
        const accessibility = (1 / terrainDifficulty) * (1 - slope / 50) * (1 + distanceFromEdge / 100);
        totalAccessibility += accessibility;
      });
      
      return totalAccessibility / allEquipment.length;
    };
    
    // Calculate fitness score
    const calculateFitness = (positions: any) => {
      const cableLength = calculateTotalCableLength(positions);
      const loadBalance = calculateLoadBalance(positions);
      const solarEfficiency = calculateSolarEfficiency(positions);
      const installationDifficulty = calculateInstallationDifficulty(positions);
      const accessibility = calculateAccessibility(positions);
      
      // Weight factors based on optimization goal
      let cableWeight = 0.25;
      let balanceWeight = 0.2;
      let solarWeight = 0.25;
      let installationWeight = 0.15;
      let accessibilityWeight = 0.15;
      
      if (optimizationGoal === 'cost') {
        cableWeight = 0.35;
        balanceWeight = 0.2;
        solarWeight = 0.15;
        installationWeight = 0.2;
        accessibilityWeight = 0.1;
      } else if (optimizationGoal === 'efficiency') {
        cableWeight = 0.15;
        balanceWeight = 0.2;
        solarWeight = 0.4;
        installationWeight = 0.15;
        accessibilityWeight = 0.1;
      } else if (optimizationGoal === 'installation') {
        cableWeight = 0.15;
        balanceWeight = 0.15;
        solarWeight = 0.15;
        installationWeight = 0.4;
        accessibilityWeight = 0.15;
      }
      
      // Normalize values
      const normalizedCableLength = 1 / (1 + cableLength / 1000);
      const normalizedInstallationDifficulty = 1 / (1 + installationDifficulty);
      const normalizedAccessibility = Math.min(1, accessibility / 2);
      
      return (
        normalizedCableLength * cableWeight +
        loadBalance * balanceWeight +
        solarEfficiency * solarWeight +
        normalizedInstallationDifficulty * installationWeight +
        normalizedAccessibility * accessibilityWeight
      );
    };
    
    // Genetic algorithm for equipment siting with performance optimizations
    const geneticAlgorithm = () => {
      const populationSize = 50; // Increased population size for better exploration
      const generations = 100; // Increased generations for better convergence
      const mutationRate = 0.15; // Slightly increased mutation rate
      
      // Generate initial population with more diverse positions
      const generateInitialPopulation = () => {
        const population = [];
        for (let i = 0; i < populationSize; i++) {
          const newPositions = JSON.parse(JSON.stringify(currentPositions));
          
          // Mutate inverter positions with more diversity
          newPositions.inverters.forEach((inv: any) => {
            if (Math.random() < 0.7) { // Higher mutation chance for initial population
              // Use a more diverse mutation strategy
              if (Math.random() < 0.3) {
                // Large mutation for exploration
                inv.x = Math.random() * 350;
                inv.y = Math.random() * 310;
              } else {
                // Small mutation for refinement
                inv.x = Math.max(0, Math.min(350, inv.x + (Math.random() - 0.5) * 50));
                inv.y = Math.max(0, Math.min(310, inv.y + (Math.random() - 0.5) * 50));
              }
            }
          });
          
          // Mutate transformer positions with more diversity
          newPositions.transformers.forEach((tr: any) => {
            if (Math.random() < 0.5) { // Higher mutation chance for initial population
              if (Math.random() < 0.2) {
                // Large mutation for exploration
                tr.x = Math.random() * 350;
                tr.y = Math.random() * 310;
              } else {
                // Small mutation for refinement
                tr.x = Math.max(0, Math.min(350, tr.x + (Math.random() - 0.5) * 80));
                tr.y = Math.max(0, Math.min(310, tr.y + (Math.random() - 0.5) * 80));
              }
            }
          });
          
          // Mutate combiner box positions
          newPositions.combinerBoxes.forEach((cb: any) => {
            if (Math.random() < 0.6) {
              cb.x = Math.max(0, Math.min(350, cb.x + (Math.random() - 0.5) * 40));
              cb.y = Math.max(0, Math.min(310, cb.y + (Math.random() - 0.5) * 40));
            }
          });
          
          // Mutate distribution cabinet positions
          newPositions.distributionCabinets.forEach((dc: any) => {
            if (Math.random() < 0.4) {
              dc.x = Math.max(0, Math.min(350, dc.x + (Math.random() - 0.5) * 60));
              dc.y = Math.max(0, Math.min(310, dc.y + (Math.random() - 0.5) * 60));
            }
          });
          
          population.push(newPositions);
        }
        return population;
      };
      
      // Selection with tournament selection for better diversity
      const selection = (population: any[]) => {
        const selected = [];
        const tournamentSize = 5;
        
        for (let i = 0; i < Math.floor(populationSize / 2); i++) {
          // Select tournamentSize individuals randomly
          const tournament = [];
          for (let j = 0; j < tournamentSize; j++) {
            const randomIndex = Math.floor(Math.random() * population.length);
            tournament.push(population[randomIndex]);
          }
          
          // Select the best individual from the tournament
          tournament.sort((a, b) => calculateFitness(b) - calculateFitness(a));
          selected.push(tournament[0]);
        }
        
        return selected;
      };
      
      // Crossover with more intelligent gene exchange
      const crossover = (parent1: any, parent2: any) => {
        const child = JSON.parse(JSON.stringify(parent1));
        
        // Crossover inverter positions with smart averaging
        child.inverters.forEach((inv: any, index: number) => {
          if (Math.random() < 0.6) { // Higher crossover rate
            // Use weighted average based on fitness
            const fitness1 = calculateFitness(parent1);
            const fitness2 = calculateFitness(parent2);
            const totalFitness = fitness1 + fitness2;
            const weight1 = fitness1 / totalFitness;
            const weight2 = fitness2 / totalFitness;
            
            inv.x = parent1.inverters[index].x * weight1 + parent2.inverters[index].x * weight2;
            inv.y = parent1.inverters[index].y * weight1 + parent2.inverters[index].y * weight2;
          }
        });
        
        // Crossover transformer positions
        child.transformers.forEach((tr: any, index: number) => {
          if (Math.random() < 0.5) {
            const fitness1 = calculateFitness(parent1);
            const fitness2 = calculateFitness(parent2);
            const totalFitness = fitness1 + fitness2;
            const weight1 = fitness1 / totalFitness;
            const weight2 = fitness2 / totalFitness;
            
            tr.x = parent1.transformers[index].x * weight1 + parent2.transformers[index].x * weight2;
            tr.y = parent1.transformers[index].y * weight1 + parent2.transformers[index].y * weight2;
          }
        });
        
        // Crossover combiner box positions
        child.combinerBoxes.forEach((cb: any, index: number) => {
          if (Math.random() < 0.4) {
            cb.x = (parent1.combinerBoxes[index].x + parent2.combinerBoxes[index].x) / 2;
            cb.y = (parent1.combinerBoxes[index].y + parent2.combinerBoxes[index].y) / 2;
          }
        });
        
        // Crossover distribution cabinet positions
        child.distributionCabinets.forEach((dc: any, index: number) => {
          if (Math.random() < 0.3) {
            dc.x = (parent1.distributionCabinets[index].x + parent2.distributionCabinets[index].x) / 2;
            dc.y = (parent1.distributionCabinets[index].y + parent2.distributionCabinets[index].y) / 2;
          }
        });
        
        return child;
      };
      
      // Mutation with adaptive mutation rate
      const mutate = (individual: any, generation: number) => {
        // Adaptive mutation rate: decreases over time
        const currentMutationRate = mutationRate * (1 - generation / generations);
        
        if (Math.random() < currentMutationRate) {
          // Mutate multiple inverters for better exploration
          const numInvertersToMutate = Math.max(1, Math.floor(individual.inverters.length * 0.3));
          for (let i = 0; i < numInvertersToMutate; i++) {
            const randomInverter = individual.inverters[Math.floor(Math.random() * individual.inverters.length)];
            // Smaller mutations as generation progresses
            const mutationStrength = 30 * (1 - generation / generations);
            randomInverter.x = Math.max(0, Math.min(350, randomInverter.x + (Math.random() - 0.5) * mutationStrength));
            randomInverter.y = Math.max(0, Math.min(310, randomInverter.y + (Math.random() - 0.5) * mutationStrength));
          }
          
          // Mutate transformers
          if (Math.random() < 0.5) {
            const randomTransformer = individual.transformers[Math.floor(Math.random() * individual.transformers.length)];
            const mutationStrength = 50 * (1 - generation / generations);
            randomTransformer.x = Math.max(0, Math.min(350, randomTransformer.x + (Math.random() - 0.5) * mutationStrength));
            randomTransformer.y = Math.max(0, Math.min(310, randomTransformer.y + (Math.random() - 0.5) * mutationStrength));
          }
          
          // Mutate combiner boxes
          if (Math.random() < 0.3) {
            const randomCombinerBox = individual.combinerBoxes[Math.floor(Math.random() * individual.combinerBoxes.length)];
            const mutationStrength = 40 * (1 - generation / generations);
            randomCombinerBox.x = Math.max(0, Math.min(350, randomCombinerBox.x + (Math.random() - 0.5) * mutationStrength));
            randomCombinerBox.y = Math.max(0, Math.min(310, randomCombinerBox.y + (Math.random() - 0.5) * mutationStrength));
          }
          
          // Mutate distribution cabinets
          if (Math.random() < 0.2) {
            const randomCabinet = individual.distributionCabinets[Math.floor(Math.random() * individual.distributionCabinets.length)];
            const mutationStrength = 60 * (1 - generation / generations);
            randomCabinet.x = Math.max(0, Math.min(350, randomCabinet.x + (Math.random() - 0.5) * mutationStrength));
            randomCabinet.y = Math.max(0, Math.min(310, randomCabinet.y + (Math.random() - 0.5) * mutationStrength));
          }
        }
        return individual;
      };
      
      // Run the algorithm
      let population = generateInitialPopulation();
      let bestFitness = -Infinity;
      let bestIndividual = null;
      
      for (let generation = 0; generation < generations; generation++) {
        // Update progress
        setOptimizationProgress((generation / generations) * 100);
        
        // Evaluate current population
        for (const individual of population) {
          const fitness = calculateFitness(individual);
          if (fitness > bestFitness) {
            bestFitness = fitness;
            bestIndividual = JSON.parse(JSON.stringify(individual));
          }
        }
        
        // Selection
        const selected = selection(population);
        
        // Crossover and mutation
        const newPopulation = [];
        while (newPopulation.length < populationSize) {
          const parent1 = selected[Math.floor(Math.random() * selected.length)];
          const parent2 = selected[Math.floor(Math.random() * selected.length)];
          
          const child = crossover(parent1, parent2);
          const mutatedChild = mutate(child, generation);
          newPopulation.push(mutatedChild);
        }
        
        // Elitism: keep the best individual
        if (bestIndividual) {
          newPopulation[0] = bestIndividual;
        }
        
        population = newPopulation;
      }
      
      // Get the best individual
      population.sort((a, b) => calculateFitness(b) - calculateFitness(a));
      return population[0];
    };
    
    // Particle Swarm Optimization
    const particleSwarmOptimization = () => {
      const swarmSize = 30;
      const iterations = 100;
      const inertia = 0.7;
      const cognitive = 1.5;
      const social = 1.5;
      
      // Define particle interface
      interface Particle {
        position: any;
        velocity: any;
        personalBest: any;
        personalBestFitness: number;
      }
      
      // Initialize swarm
      const swarm: Particle[] = [];
      let globalBest: any = null;
      let globalBestFitness = -Infinity;
      
      // Initialize particles
      for (let i = 0; i < swarmSize; i++) {
        const position = JSON.parse(JSON.stringify(currentPositions));
        
        // Randomize initial positions
        position.inverters.forEach((inv: any) => {
          inv.x = Math.random() * 350;
          inv.y = Math.random() * 310;
        });
        
        position.transformers.forEach((tr: any) => {
          tr.x = Math.random() * 350;
          tr.y = Math.random() * 310;
        });
        
        const velocity = {
          inverters: position.inverters.map(() => ({ x: (Math.random() - 0.5) * 5, y: (Math.random() - 0.5) * 5 })),
          transformers: position.transformers.map(() => ({ x: (Math.random() - 0.5) * 5, y: (Math.random() - 0.5) * 5 }))
        };
        
        const fitness = calculateFitness(position);
        
        const particle: Particle = {
          position,
          velocity,
          personalBest: JSON.parse(JSON.stringify(position)),
          personalBestFitness: fitness
        };
        
        swarm.push(particle);
        
        if (fitness > globalBestFitness) {
          globalBest = JSON.parse(JSON.stringify(position));
          globalBestFitness = fitness;
        }
      }
      
      // Main optimization loop
      for (let iter = 0; iter < iterations; iter++) {
        // Update progress
        setOptimizationProgress((iter / iterations) * 100);
        
        for (const particle of swarm) {
          // Update velocity for inverters
          particle.velocity.inverters.forEach((vel: any, index: number) => {
            const r1 = Math.random();
            const r2 = Math.random();
            
            vel.x = 
              inertia * vel.x +
              cognitive * r1 * (particle.personalBest.inverters[index].x - particle.position.inverters[index].x) +
              social * r2 * (globalBest.inverters[index].x - particle.position.inverters[index].x);
            
            vel.y = 
              inertia * vel.y +
              cognitive * r1 * (particle.personalBest.inverters[index].y - particle.position.inverters[index].y) +
              social * r2 * (globalBest.inverters[index].y - particle.position.inverters[index].y);
          });
          
          // Update velocity for transformers
          particle.velocity.transformers.forEach((vel: any, index: number) => {
            const r1 = Math.random();
            const r2 = Math.random();
            
            vel.x = 
              inertia * vel.x +
              cognitive * r1 * (particle.personalBest.transformers[index].x - particle.position.transformers[index].x) +
              social * r2 * (globalBest.transformers[index].x - particle.position.transformers[index].x);
            
            vel.y = 
              inertia * vel.y +
              cognitive * r1 * (particle.personalBest.transformers[index].y - particle.position.transformers[index].y) +
              social * r2 * (globalBest.transformers[index].y - particle.position.transformers[index].y);
          });
          
          // Update position for inverters
          particle.position.inverters.forEach((inv: any, index: number) => {
            inv.x = Math.max(0, Math.min(350, inv.x + particle.velocity.inverters[index].x));
            inv.y = Math.max(0, Math.min(310, inv.y + particle.velocity.inverters[index].y));
          });
          
          // Update position for transformers
          particle.position.transformers.forEach((tr: any, index: number) => {
            tr.x = Math.max(0, Math.min(350, tr.x + particle.velocity.transformers[index].x));
            tr.y = Math.max(0, Math.min(310, tr.y + particle.velocity.transformers[index].y));
          });
          
          // Calculate fitness
          const currentFitness = calculateFitness(particle.position);
          
          // Update personal best
          if (currentFitness > particle.personalBestFitness) {
            particle.personalBest = JSON.parse(JSON.stringify(particle.position));
            particle.personalBestFitness = currentFitness;
          }
          
          // Update global best
          if (currentFitness > globalBestFitness) {
            globalBest = JSON.parse(JSON.stringify(particle.position));
            globalBestFitness = currentFitness;
          }
        }
      }
      
      return globalBest;
    };
    
    // Run the selected algorithm
    let bestPositions;
    
    switch (algorithm) {
      case 'genetic':
        bestPositions = geneticAlgorithm();
        break;
      case 'particle-swarm':
        bestPositions = particleSwarmOptimization();
        break;
      case 'simulated-annealing':
        // Simplified simulated annealing for demonstration
        bestPositions = currentPositions;
        break;
      default:
        bestPositions = currentPositions;
    }
    
    // Calculate improvement
    const originalFitness = calculateFitness(currentPositions);
    const newFitness = calculateFitness(bestPositions);
    const improvement = ((newFitness - originalFitness) / originalFitness) * 100;
    
    // Calculate additional metrics
    const originalSolarEfficiency = calculateSolarEfficiency(currentPositions);
    const newSolarEfficiency = calculateSolarEfficiency(bestPositions);
    const solarImprovement = ((newSolarEfficiency - originalSolarEfficiency) / originalSolarEfficiency) * 100;
    
    const originalInstallationDifficulty = calculateInstallationDifficulty(currentPositions);
    const newInstallationDifficulty = calculateInstallationDifficulty(bestPositions);
    const installationImprovement = ((originalInstallationDifficulty - newInstallationDifficulty) / originalInstallationDifficulty) * 100;
    
    return {
      bestPositions,
      improvement,
      totalCableLength: calculateTotalCableLength(bestPositions),
      loadBalance: calculateLoadBalance(bestPositions),
      solarEfficiency: newSolarEfficiency,
      solarImprovement,
      installationDifficulty: newInstallationDifficulty,
      installationImprovement
    };
  };
  
  const handleStartSmartSiting = useCallback(() => {
    setIsOptimizing(true);
    setOptimizationProgress(0);
    
    // Run the smart siting algorithm
    setTimeout(() => {
      const results = smartSitingAlgorithm({
        algorithm: 'genetic',
        equipmentType: 'all',
        optimizationGoal: 'balance',
        terrainData: {
          types: ['flat', 'hilly', 'mountainous', 'rocky', 'wetland', 'forested'],
          difficulty: {
            flat: 1.0,
            hilly: 1.5,
            mountainous: 2.5,
            rocky: 3.0,
            wetland: 1.8,
            forested: 2.2
          }
        },
        weatherData: {
          averageTemperature: 25,
          averageHumidity: 60,
          windSpeed: 5,
          precipitation: 1000
        },
        光照Data: {
          averageIrradiance: 1000,
          peakHours: 5.5,
          seasonalVariation: 0.2
        }
      });
      
      // 更新设备位置
      results.bestPositions.inverters.forEach((inv: any) => {
        updateInverter(inv.id, { x: inv.x, y: inv.y });
      });
      
      results.bestPositions.transformers.forEach((tr: any) => {
        updateTransformer(tr.id, { x: tr.x, y: tr.y });
      });
      
      setIsOptimizing(false);
      setOptimizationProgress(100);
      
      // Show optimization results
      alert(`智能选址优化完成！\n\n改进率: ${results.improvement.toFixed(2)}%\n总电缆长度: ${results.totalCableLength.toFixed(2)}米\n负载平衡度: ${(results.loadBalance * 100).toFixed(2)}%\n太阳能效率: ${(results.solarEfficiency * 100).toFixed(2)}%\n太阳能改进: ${results.solarImprovement.toFixed(2)}%\n安装难度: ${results.installationDifficulty.toFixed(2)}\n安装改进: ${results.installationImprovement.toFixed(2)}%\n\n推荐设备位置已更新到地图上。`);
    }, 100);
  }, [updateInverter, updateTransformer]);
  
  // 基于地形、负载和环境条件的智能设备选型算法
  const equipmentSelectionAlgorithm = (params: any) => {
    const { terrainType, loadDemand, budget, efficiencyGoal, ambientTemp = 25, altitude = 0, installationType = 'ground', gridConnection = '3-phase' } = params;
    
    // 地形类型对设备选择的影响因子
    const terrainFactors = {
      flat: 1.0,      // 平地
      hilly: 1.2,     // 丘陵
      mountainous: 1.5 // 山地
    };
    
    // 环境因素对设备性能的影响
    const ambientTempFactor = ambientTemp > 40 ? 1.1 : ambientTemp < -20 ? 1.05 : 1.0;
    const altitudeFactor = altitude > 2000 ? 1.1 : altitude > 1000 ? 1.05 : 1.0;
    const installationFactor = installationType === 'roof' ? 1.05 : 1.0;
    
    // 负载需求计算
    const requiredCapacity = loadDemand * 1.2 * ambientTempFactor * altitudeFactor * installationFactor; // 预留20%余量并考虑环境因素
    
    // 设备选型逻辑
    let selectedInverter = null;
    let selectedTransformer = null;
    let selectedCombinerBox = null;
    let selectedDistributionCabinet = null;
    
    // 选择逆变器
    const suitableInverters = equipmentModels.inverter.filter(inv => {
      const tempRange = inv.operatingTemp.split(' to ');
      const minTemp = parseFloat(tempRange[0]);
      const maxTemp = parseFloat(tempRange[1]);
      return inv.capacity >= requiredCapacity / 10 && // 假设有10个逆变器
             minTemp <= ambientTemp && 
             maxTemp >= ambientTemp;
    });
    
    if (suitableInverters.length > 0) {
      // 根据效率、价格、可靠性和环境适应性排序
      suitableInverters.sort((a, b) => {
        const efficiencyScore = (b.efficiency - a.efficiency) * (efficiencyGoal / 100);
        const priceScore = (a.price - b.price) * ((30 - efficiencyGoal) / 100);
        const reliabilityScore = (b.reliability - a.reliability) * 0.2;
        const warrantyScore = (parseInt(b.warranty) - parseInt(a.warranty)) * 0.1;
        const tempAdaptabilityScore = (b.operatingTemp.includes('65°C') ? 1 : 0) * 0.1;
        return efficiencyScore + priceScore + reliabilityScore + warrantyScore + tempAdaptabilityScore;
      });
      selectedInverter = suitableInverters[0];
    }
    
    // 选择变压器
    const transformerCapacity = requiredCapacity * 1.1; // 预留10%余量
    const suitableTransformers = equipmentModels.transformer.filter(tr => {
      return tr.capacity >= transformerCapacity &&
             tr.phase === gridConnection.split('-')[0];
    });
    
    if (suitableTransformers.length > 0) {
      suitableTransformers.sort((a, b) => {
        const priceScore = a.price - b.price;
        const efficiencyScore = (b.efficiency - a.efficiency) * 1000;
        const reliabilityScore = (b.reliability - a.reliability) * 10000;
        const warrantyScore = (parseInt(b.warranty) - parseInt(a.warranty)) * 100;
        const weightScore = ((parseFloat(a.weight as string) || 0) - (parseFloat(b.weight as string) || 0)) * 0.1; // 重量轻的优先，便于山地安装
        return priceScore - (efficiencyScore + reliabilityScore + warrantyScore) + weightScore;
      });
      selectedTransformer = suitableTransformers[0];
    }
    
    // 选择汇流箱
    const panelCount = Math.ceil(requiredCapacity / 0.3); // 假设每块面板300W
    const optimalCombinerBoxSize = terrainType === 'mountainous' ? 16 : 24; // 山地使用小型汇流箱便于安装
    const combinerBoxCount = Math.ceil(panelCount / optimalCombinerBoxSize);
    const suitableCombinerBoxes = equipmentModels['combiner-box'].filter(cb => {
      return cb.capacity >= optimalCombinerBoxSize;
    });
    
    if (suitableCombinerBoxes.length > 0) {
      suitableCombinerBoxes.sort((a, b) => {
        const pricePerPort = a.price / a.capacity - b.price / b.capacity;
        const reliabilityScore = (b.reliability - a.reliability) * 100;
        const ipRatingScore = (b.ipRating === 'IP65' ? 1 : 0) * 50; // IP65防护等级优先
        return pricePerPort - (reliabilityScore + ipRatingScore);
      });
      selectedCombinerBox = suitableCombinerBoxes[0];
    }
    
    // 选择配电柜
    const distributionCapacity = transformerCapacity * 1.2;
    const suitableCabinets = equipmentModels['distribution-cabinet'].filter(dc => {
      return dc.capacity >= distributionCapacity &&
             dc.phase === gridConnection.split('-')[0];
    });
    
    if (suitableCabinets.length > 0) {
      suitableCabinets.sort((a, b) => {
        const priceScore = a.price - b.price;
        const reliabilityScore = (b.reliability - a.reliability) * 10000;
        const warrantyScore = (parseInt(b.warranty) - parseInt(a.warranty)) * 100;
        return priceScore - (reliabilityScore + warrantyScore);
      });
      selectedDistributionCabinet = suitableCabinets[0];
    }
    
    // 计算总成本
    const totalCost = (
      (selectedInverter?.price || 0) * 10 + // 10个逆变器
      (selectedTransformer?.price || 0) +
      (selectedCombinerBox?.price || 0) * combinerBoxCount +
      (selectedDistributionCabinet?.price || 0)
    ) * terrainFactors[terrainType as keyof typeof terrainFactors];
    
    // 计算生命周期成本（考虑维护和更换）
    const lifecycleCost = totalCost + 
      ((selectedInverter?.price || 0) * 10 * 0.1) + // 10年维护成本
      ((selectedTransformer?.price || 0) * 0.05) + // 20年维护成本
      ((selectedCombinerBox?.price || 0) * combinerBoxCount * 0.15) + // 5年维护成本
      ((selectedDistributionCabinet?.price || 0) * 0.08); // 15年维护成本
    
    // 检查预算是否足够
    const budgetSufficient = totalCost <= budget;
    
    // 计算系统整体效率
    const systemEfficiency = (
      (selectedInverter?.efficiency || 95) *
      (selectedTransformer?.efficiency || 98) *
      (selectedCombinerBox?.efficiency || 99) *
      (selectedDistributionCabinet?.efficiency || 99)
    ) / 10000;
    
    // 计算投资回报率（ROI）
    const annualEnergyProduction = requiredCapacity * 0.8 * 8760; // 假设80%利用率，每年8760小时
    const annualRevenue = annualEnergyProduction * 0.5; // 假设每度电0.5元
    const roi = (annualRevenue / totalCost) * 100;
    
    return {
      selectedInverter,
      selectedTransformer,
      selectedCombinerBox,
      selectedDistributionCabinet,
      combinerBoxCount,
      totalCost,
      lifecycleCost,
      budgetSufficient,
      requiredCapacity,
      transformerCapacity,
      distributionCapacity,
      systemEfficiency,
      roi,
      environmentalFactors: {
        ambientTempFactor,
        altitudeFactor,
        installationFactor
      },
      annualEnergyProduction,
      annualRevenue
    };
  };
  
  // 设备兼容性检查
  const checkEquipmentCompatibility = (equipment: any) => {
    const { selectedInverter, selectedTransformer, selectedCombinerBox, selectedDistributionCabinet, environmentalFactors, terrainType } = equipment;
    
    const compatibilityIssues = [];
    
    // 检查逆变器与变压器的兼容性
    if (selectedInverter && selectedTransformer) {
      const totalInverterCapacity = selectedInverter.capacity * 10; // 10个逆变器
      const transformerUtilization = totalInverterCapacity / selectedTransformer.capacity;
      
      if (transformerUtilization > 0.9) {
        compatibilityIssues.push('逆变器总容量接近变压器容量上限，建议增加变压器容量');
      } else if (transformerUtilization < 0.5) {
        compatibilityIssues.push('变压器容量过大，建议选择更小容量的变压器以降低成本');
      }
      
      // 检查电压兼容性
      if (selectedInverter.outputVoltage && selectedTransformer.frequency) {
        if (selectedInverter.outputVoltage !== '380V' && selectedTransformer.frequency === '50Hz') {
          compatibilityIssues.push('逆变器输出电压与变压器电压等级不匹配');
        }
      }
    }
    
    // 检查变压器与配电柜的兼容性
    if (selectedTransformer && selectedDistributionCabinet) {
      const cabinetUtilization = selectedTransformer.capacity / selectedDistributionCabinet.capacity;
      
      if (cabinetUtilization > 0.8) {
        compatibilityIssues.push('变压器容量接近配电柜容量上限，建议增加配电柜容量');
      } else if (cabinetUtilization < 0.4) {
        compatibilityIssues.push('配电柜容量过大，建议选择更小容量的配电柜以降低成本');
      }
      
      // 检查相数兼容性
      if (selectedTransformer.phase !== selectedDistributionCabinet.phase) {
        compatibilityIssues.push('变压器与配电柜相数不匹配');
      }
    }
    
    // 检查汇流箱与逆变器的兼容性
    if (selectedCombinerBox && selectedInverter) {
      const maxPanelsPerInverter = 240;
      const panelsPerCombinerBox = selectedCombinerBox.capacity;
      const requiredCombinerBoxes = Math.ceil(maxPanelsPerInverter / panelsPerCombinerBox);
      
      if (requiredCombinerBoxes > 16) {
        compatibilityIssues.push('汇流箱数量过多，建议使用更大容量的汇流箱');
      } else if (requiredCombinerBoxes < 4) {
        compatibilityIssues.push('汇流箱容量过大，建议使用更小容量的汇流箱以降低成本');
      }
      
      // 检查电压兼容性
      if (selectedCombinerBox.maxInputVoltage && selectedInverter.maxInputVoltage) {
        if (parseInt(selectedCombinerBox.maxInputVoltage) > parseInt(selectedInverter.maxInputVoltage)) {
          compatibilityIssues.push('汇流箱最大输入电压超过逆变器最大输入电压');
        }
      }
    }
    
    // 检查环境适应性
    if (selectedInverter && environmentalFactors) {
      const { ambientTemp, altitude } = environmentalFactors;
      if (ambientTemp > 50 && !selectedInverter.operatingTemp.includes('60°C')) {
        compatibilityIssues.push('逆变器工作温度范围可能无法适应高温环境');
      }
      if (altitude > 2500) {
        compatibilityIssues.push('高海拔环境可能影响逆变器性能，建议选择高海拔专用设备');
      }
    }
    
    // 检查地形适应性
    if (selectedTransformer && terrainType === 'mountainous') {
      if (parseInt(selectedTransformer.weight) > 3000) {
        compatibilityIssues.push('变压器重量较大，在山地环境中安装难度高，建议选择更轻的干式变压器');
      }
    }
    
    // 检查设备品牌兼容性
    if (selectedInverter && selectedTransformer) {
      const inverterBrand = selectedInverter.name.split(' ')[0];
      const transformerBrand = selectedTransformer.name.split('-')[0];
      if (inverterBrand !== transformerBrand) {
        compatibilityIssues.push('不同品牌设备可能存在通信和控制兼容性问题');
      }
    }
    
    // 检查通信协议兼容性
    if (selectedInverter && selectedCombinerBox) {
      if (selectedInverter.communication && selectedCombinerBox.communication) {
        if (!selectedInverter.communication.includes('RS485') && selectedCombinerBox.communication === 'RS485') {
          compatibilityIssues.push('逆变器与汇流箱通信协议不兼容');
        }
      }
    }
    
    // 检查系统效率匹配
    if (selectedInverter && selectedTransformer && selectedCombinerBox && selectedDistributionCabinet) {
      const systemEfficiency = (
        selectedInverter.efficiency *
        selectedTransformer.efficiency *
        selectedCombinerBox.efficiency *
        selectedDistributionCabinet.efficiency
      ) / 10000;
      
      if (systemEfficiency < 95) {
        compatibilityIssues.push('系统整体效率偏低，建议选择更高效率的设备组合');
      }
    }
    
    // 检查维护周期匹配
    if (selectedInverter && selectedTransformer) {
      const inverterWarranty = parseInt(selectedInverter.warranty);
      const transformerWarranty = parseInt(selectedTransformer.warranty);
      if (Math.abs(inverterWarranty - transformerWarranty) > 5) {
        compatibilityIssues.push('设备保修周期差异较大，可能增加维护管理复杂度');
      }
    }
    
    // 检查防护等级匹配
    if (selectedInverter && selectedCombinerBox) {
      if (selectedInverter.ipRating !== selectedCombinerBox.ipRating) {
        compatibilityIssues.push('逆变器与汇流箱防护等级不匹配，可能影响系统可靠性');
      }
    }
    
    return {
      compatible: compatibilityIssues.length === 0,
      issues: compatibilityIssues,
      severity: compatibilityIssues.length > 3 ? 'high' : compatibilityIssues.length > 1 ? 'medium' : 'low',
      recommendations: compatibilityIssues.length > 0 ? [
        '建议选择同一品牌的设备以确保兼容性',
        '确保所有设备的防护等级适应安装环境',
        '考虑设备的维护周期匹配度',
        '根据地形条件选择合适重量的设备'
      ] : []
    };
  };
  
  const handleAddEquipment = useCallback(() => {
    // 实现设备添加功能
    const newEquipment = {
      name: `逆变器-${String(inverters.length + 1).padStart(2, '0')}`,
      x: Math.random() * 300,
      y: Math.random() * 280,
      capacity: 100,
      loadRate: 70 + Math.random() * 20,
      status: 'online' as const,
      connectedPanels: 150 + Math.floor(Math.random() * 100),
      model: equipmentModels.inverter[Math.floor(Math.random() * equipmentModels.inverter.length)].name,
      efficiency: 97 + Math.random() * 2,
      temperature: 38 + Math.random() * 10
    };
    
    // 示例：使用设备选型算法和兼容性检查
    const selectionResult = equipmentSelectionAlgorithm({
      terrainType: 'hilly',
      loadDemand: 1000,
      budget: 1000000,
      efficiencyGoal: 95
    });
    
    const compatibilityResult = checkEquipmentCompatibility(selectionResult);
    
    // 使用状态管理系统添加设备
    addInverter(newEquipment);
    
    // 显示成功消息
    alert(`设备 ${newEquipment.name} 添加成功！\n\n设备兼容性: ${compatibilityResult.compatible ? '兼容' : '不兼容'}`);
  }, [inverters.length, addInverter]);
  
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
            <Zap className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">逆变器数量</p>
            <p className="text-2xl font-bold text-white">{inverters.length}</p>
          </div>
        </div>
        
        <div className="tech-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-400/10 flex items-center justify-center">
            <Settings2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">箱变数量</p>
            <p className="text-2xl font-bold text-white">{transformers.length}</p>
          </div>
        </div>
        
        <div className="tech-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-400/10 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">平均负载率</p>
            <p className="text-2xl font-bold text-white">
              {(inverters.reduce((acc, inv) => acc + inv.loadRate, 0) / inverters.length).toFixed(1)}%
            </p>
          </div>
        </div>
        
        <div className="tech-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-400/10 flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">成本优化</p>
            <p className="text-2xl font-bold text-emerald-400">21.8%</p>
          </div>
        </div>
      </motion.div>
      
      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Equipment Layout */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="tech-card p-4 md:p-6 lg:col-span-2"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <h3 className="text-lg font-semibold text-white">设备选址布局</h3>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showConnections}
                  onChange={(e) => setShowConnections(e.target.checked)}
                  className="rounded border-gray-600 bg-transparent text-cyan-400 focus:ring-cyan-400"
                />
                显示连接关系
              </label>
              <button
                onClick={() => setShowEquipmentSelection(!showEquipmentSelection)}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-sm hover:bg-white/10 transition-colors flex items-center gap-1"
              >
                <PlusCircle className="w-4 h-4" />
                <span>添加设备</span>
              </button>
              <button
                onClick={() => setShowSmartSiting(!showSmartSiting)}
                className="px-3 py-1.5 rounded-lg bg-cyan-400/20 text-cyan-400 text-sm hover:bg-cyan-400/30 transition-colors flex items-center gap-1"
              >
                <Brain className="w-4 h-4" />
                <span>智能选址</span>
              </button>
            </div>
          </div>
          
          {/* Equipment Selection Panel */}
          {showEquipmentSelection && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 border border-cyan-500/20 rounded-lg bg-cyan-400/5"
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* Equipment Type Selection */}
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-2">设备类型</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {equipmentTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.id}
                          onClick={() => setSelectedEquipmentType(type.id)}
                          className={`p-3 rounded-lg text-sm transition-all ${selectedEquipmentType === type.id
                            ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/50'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Icon className="w-5 h-5" />
                            <span>{type.name}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Equipment Model Selection */}
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-2">设备型号</label>
                  <div className="space-y-2">
                    {equipmentModels[selectedEquipmentType as keyof typeof equipmentModels].map((model) => (
                      <div key={model.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                        <div>
                          <p className="text-white text-sm font-medium">{model.name}</p>
                          <p className="text-gray-400 text-xs">容量: {model.capacity} {'kVA'}{selectedEquipmentType === 'inverter' ? 'W' : ''} | 效率: {model.efficiency}%</p>
                        </div>
                        <span className="text-cyan-400 text-sm">¥{model.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleAddEquipment}
                  className="px-4 py-2 rounded-lg bg-emerald-400/20 text-emerald-400 text-sm hover:bg-emerald-400/30 transition-colors flex items-center gap-1"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>添加设备</span>
                </button>
              </div>
            </motion.div>
          )}
          
          {/* Smart Siting Panel */}
          {showSmartSiting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 border border-cyan-500/20 rounded-lg bg-cyan-400/5"
            >
              <h4 className="text-white text-sm font-medium mb-3 flex items-center gap-1">
                <Brain className="w-4 h-4 text-cyan-400" />
                <span>智能选址优化</span>
              </h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-white/5 rounded-lg p-3">
                    <label className="block text-sm text-gray-400 mb-2">优化目标</label>
                    <select className="w-full bg-transparent text-white border border-white/10 rounded-lg p-2 text-sm">
                      <option value="cost">最小化成本</option>
                      <option value="efficiency">最大化效率</option>
                      <option value="balance">成本与效率平衡</option>
                    </select>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <label className="block text-sm text-gray-400 mb-2">设备类型</label>
                    <select className="w-full bg-transparent text-white border border-white/10 rounded-lg p-2 text-sm">
                      <option value="all">所有设备</option>
                      <option value="inverter">仅逆变器</option>
                      <option value="transformer">仅变压器</option>
                    </select>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <label className="block text-sm text-gray-400 mb-2">算法类型</label>
                    <select className="w-full bg-transparent text-white border border-white/10 rounded-lg p-2 text-sm">
                      <option value="genetic">遗传算法</option>
                      <option value="simulated-annealing">模拟退火</option>
                      <option value="particle-swarm">粒子群优化</option>
                    </select>
                  </div>
                </div>
                
                {/* Optimization Progress */}
                {optimizationProgress > 0 && (
                  <div>
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
                
                <div className="flex justify-end">
                  {!isOptimizing ? (
                    <button
                      onClick={handleStartSmartSiting}
                      className="px-4 py-2 rounded-lg bg-emerald-400/20 text-emerald-400 text-sm hover:bg-emerald-400/30 transition-colors flex items-center gap-1"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>开始优化</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsOptimizing(false)}
                      className="px-4 py-2 rounded-lg bg-amber-400/20 text-amber-400 text-sm hover:bg-amber-400/30 transition-colors flex items-center gap-1"
                    >
                      <PauseCircle className="w-4 h-4" />
                      <span>暂停优化</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          
          <div className="relative h-96 bg-black/30 rounded-lg overflow-hidden">
            <svg viewBox="0 0 350 310" className="w-full h-full">
              {/* Grid background */}
              <defs>
                <pattern id="grid2" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,212,255,0.1)" strokeWidth="0.5"/>
                </pattern>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#00d4ff" />
                </marker>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid2)" />
              
              {/* Connection lines */}
              {showConnections && (
                <>
                  {/* Inverter to Transformer */}
                  {transformers.map((tr) => (
                    tr.connectedInverters.map((invId) => {
                      const inv = inverters.find(i => i.id === invId);
                      if (!inv) return null;
                      return (
                        <line
                          key={`${tr.id}-${invId}`}
                          x1={inv.x}
                          y1={inv.y}
                          x2={tr.x}
                          y2={tr.y}
                          stroke="rgba(0,212,255,0.5)"
                          strokeWidth="2"
                        />
                      );
                    })
                  ))}
                  
                  {/* Combiner Box to Inverter - Match by position */}
                  {combinerBoxes.map((cb) => {
                    // Find the closest inverter that matches the position
                    const matchedInv = inverters.find(inv => {
                      return Math.abs(inv.x - cb.x) < 30 && Math.abs(inv.y - cb.y - 30) < 30;
                    });
                    if (!matchedInv) return null;
                    return (
                      <line
                        key={`${cb.id}-${matchedInv.id}`}
                        x1={cb.x}
                        y1={cb.y}
                        x2={matchedInv.x}
                        y2={matchedInv.y}
                        stroke="rgba(16,185,129,0.5)"
                        strokeWidth="2"
                      />
                    );
                  })}
                  
                  {/* Transformer to Distribution Cabinet */}
                  {distributionCabinets.map((dc) => (
                    dc.connectedTransformers.map((trId) => {
                      const tr = transformers.find(t => t.id === trId);
                      if (!tr) return null;
                      return (
                        <line
                          key={`${tr.id}-${dc.id}`}
                          x1={tr.x}
                          y1={tr.y}
                          x2={dc.x}
                          y2={dc.y}
                          stroke="rgba(245,158,11,0.6)"
                          strokeWidth="2.5"
                        />
                      );
                    })
                  ))}
                </>
              )}
              
              {/* Inverters */}
              {inverters.map((inv) => (
                <g key={inv.id}>
                  <circle
                    cx={inv.x}
                    cy={inv.y}
                    r="12"
                    fill={getStatusColor(inv.status)}
                    stroke="white"
                    strokeWidth="2"
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedInverter(inv);
                      setSelectedTransformer(null);
                      setSelectedCombinerBox(null);
                      setSelectedDistributionCabinet(null);
                    }}
                  />
                  <text
                    x={inv.x}
                    y={inv.y + 4}
                    textAnchor="middle"
                    fill="white"
                    fontSize="8"
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    {inv.id.split('-')[1]}
                  </text>
                  <text
                    x={inv.x}
                    y={inv.y + 28}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.7)"
                    fontSize="8"
                  >
                    {inv.loadRate}%
                  </text>
                </g>
              ))}
              
              {/* Transformers */}
              {transformers.map((tr) => (
                <g key={tr.id}>
                  <rect
                    x={tr.x - 18}
                    y={tr.y - 18}
                    width="36"
                    height="36"
                    rx="4"
                    fill="#8b5cf6"
                    stroke="white"
                    strokeWidth="2"
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedTransformer(tr);
                      setSelectedInverter(null);
                      setSelectedCombinerBox(null);
                      setSelectedDistributionCabinet(null);
                    }}
                  />
                  <text
                    x={tr.x}
                    y={tr.y + 4}
                    textAnchor="middle"
                    fill="white"
                    fontSize="9"
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    {tr.type === '3200kVA' ? '3.2M' : '1.6M'}
                  </text>
                  <text
                    x={tr.x}
                    y={tr.y + 32}
                    textAnchor="middle"
                    fill="#8b5cf6"
                    fontSize="8"
                  >
                    {tr.name}
                  </text>
                </g>
              ))}
              
              {/* Combiner Boxes */}
              {combinerBoxes.map((cb) => (
                <g key={cb.id}>
                  <rect
                    x={cb.x - 8}
                    y={cb.y - 8}
                    width="16"
                    height="16"
                    rx="2"
                    fill="#10b981"
                    stroke="white"
                    strokeWidth="1.5"
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedCombinerBox(cb);
                      setSelectedInverter(null);
                      setSelectedTransformer(null);
                      setSelectedDistributionCabinet(null);
                    }}
                  />
                  <text
                    x={cb.x}
                    y={cb.y + 3}
                    textAnchor="middle"
                    fill="white"
                    fontSize="6"
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    CB
                  </text>
                </g>
              ))}
              
              {/* Distribution Cabinets */}
              {distributionCabinets.map((dc) => (
                <g key={dc.id}>
                  <rect
                    x={dc.x - 22}
                    y={dc.y - 15}
                    width="44"
                    height="30"
                    rx="3"
                    fill="#f59e0b"
                    stroke="white"
                    strokeWidth="2"
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedDistributionCabinet(dc);
                      setSelectedInverter(null);
                      setSelectedTransformer(null);
                      setSelectedCombinerBox(null);
                    }}
                  />
                  <text
                    x={dc.x}
                    y={dc.y + 5}
                    textAnchor="middle"
                    fill="white"
                    fontSize="8"
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    {dc.id}
                  </text>
                </g>
              ))}
            </svg>
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/30">
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-gray-300">逆变器 (正常)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="text-gray-300">逆变器 (警告)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-purple-500" />
                  <span className="text-gray-300">箱式变压器</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-emerald-400" />
                  <span className="text-gray-300">汇流箱</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-3 rounded bg-amber-400" />
                  <span className="text-gray-300">配电柜</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-0.5 bg-cyan-400" />
                  <span className="text-gray-300">逆变器-变压器</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-0.5 bg-emerald-400" />
                  <span className="text-gray-300">汇流箱-逆变器</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-0.5 bg-amber-400" />
                  <span className="text-gray-300">变压器-配电柜</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Side Panel */}
        <div className="space-y-6">
          {/* Equipment Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="tech-card p-4 md:p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              {selectedInverter ? selectedInverter.name : 
               selectedTransformer ? selectedTransformer.name : 
               selectedCombinerBox ? selectedCombinerBox.name : 
               selectedDistributionCabinet ? selectedDistributionCabinet.name : 
               '设备详情'}
            </h3>
            
            {selectedInverter ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">装机容量</p>
                    <p className="text-white font-semibold">{selectedInverter.capacity} kW</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">当前负载</p>
                    <p className="text-white font-semibold">{selectedInverter.loadRate}%</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">连接面板</p>
                    <p className="text-white font-semibold">{selectedInverter.connectedPanels} 块</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">运行状态</p>
                    <p className="text-white font-semibold flex items-center gap-1">
                      {selectedInverter.status === 'online' && (
                        <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 正常</>
                      )}
                      {selectedInverter.status === 'warning' && (
                        <><AlertCircle className="w-4 h-4 text-amber-400" /> 警告</>
                      )}
                      {selectedInverter.status === 'offline' && (
                        <><AlertCircle className="w-4 h-4 text-red-400" /> 离线</>
                      )}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">设备型号</p>
                    <p className="text-white font-semibold text-sm">{selectedInverter.model}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">转换效率</p>
                    <p className="text-white font-semibold">{selectedInverter.efficiency}%</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">运行温度</p>
                    <p className="text-white font-semibold">{selectedInverter.temperature}°C</p>
                  </div>
                </div>
                
                <div className="bg-cyan-400/10 rounded-lg p-3 border border-cyan-400/30">
                  <p className="text-cyan-400 text-sm font-medium mb-1">实时功率</p>
                  <p className="text-2xl font-bold text-white">
                    {(selectedInverter.capacity * selectedInverter.loadRate / 100).toFixed(1)} kW
                  </p>
                </div>
              </div>
            ) : selectedTransformer ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">变压器容量</p>
                    <p className="text-white font-semibold">{selectedTransformer.capacity} kVA</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">型号类型</p>
                    <p className="text-white font-semibold">{selectedTransformer.type}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">连接逆变器</p>
                    <p className="text-white font-semibold">{selectedTransformer.connectedInverters.length} 台</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">总接入容量</p>
                    <p className="text-white font-semibold">
                      {selectedTransformer.connectedInverters.reduce((acc: number, invId: string) => {
                        const inv = inverters.find(i => i.id === invId);
                        return acc + (inv?.capacity || 0);
                      }, 0)} kW
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">设备型号</p>
                    <p className="text-white font-semibold text-sm">{selectedTransformer.model}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">转换效率</p>
                    <p className="text-white font-semibold">{selectedTransformer.efficiency}%</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-400 text-xs mb-2">连接逆变器列表</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTransformer.connectedInverters.map((invId: string) => (
                      <span 
                        key={invId}
                        className="px-2 py-1 rounded bg-purple-400/20 text-purple-400 text-xs"
                      >
                        {invId}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : selectedCombinerBox ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">容量</p>
                    <p className="text-white font-semibold">{selectedCombinerBox.capacity} 路</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">连接面板</p>
                    <p className="text-white font-semibold">{selectedCombinerBox.connectedPanels} 块</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 col-span-2">
                    <p className="text-gray-400 text-xs">运行状态</p>
                    <p className="text-white font-semibold flex items-center gap-1">
                      {selectedCombinerBox.status === 'online' && (
                        <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 正常</>
                      )}
                      {selectedCombinerBox.status === 'warning' && (
                        <><AlertCircle className="w-4 h-4 text-amber-400" /> 警告</>
                      )}
                      {selectedCombinerBox.status === 'offline' && (
                        <><AlertCircle className="w-4 h-4 text-red-400" /> 离线</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ) : selectedDistributionCabinet ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">容量</p>
                    <p className="text-white font-semibold">{selectedDistributionCabinet.capacity} A</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">连接变压器</p>
                    <p className="text-white font-semibold">{selectedDistributionCabinet.connectedTransformers.length} 台</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 col-span-2">
                    <p className="text-gray-400 text-xs">运行状态</p>
                    <p className="text-white font-semibold flex items-center gap-1">
                      {selectedDistributionCabinet.status === 'online' && (
                        <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 正常</>
                      )}
                      {selectedDistributionCabinet.status === 'warning' && (
                        <><AlertCircle className="w-4 h-4 text-amber-400" /> 警告</>
                      )}
                      {selectedDistributionCabinet.status === 'offline' && (
                        <><AlertCircle className="w-4 h-4 text-red-400" /> 离线</>
                      )}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-400 text-xs mb-2">连接变压器列表</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDistributionCabinet.connectedTransformers.map((trId: string) => (
                      <span 
                        key={trId}
                        className="px-2 py-1 rounded bg-amber-400/20 text-amber-400 text-xs"
                      >
                        {trId}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>点击设备查看详情</p>
              </div>
            )}
          </motion.div>
          
          {/* Load Rate Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="tech-card p-4 md:p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">逆变器负载率</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={loadRateData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis type="number" domain={[0, 100]} stroke="#6b7280" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={10} width={60} />
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
                    formatter={(value: number) => [`${value}%`, '负载率']}
                  />
                  <Bar dataKey="loadRate" fill="#00d4ff" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Cost Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="tech-card p-4 md:p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">设备选型成本对比</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costComparison}>
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
              />
              <Bar dataKey="equipment" stackId="a" fill="#00d4ff" name="设备采购" />
              <Bar dataKey="installation" stackId="a" fill="#10b981" name="安装费用" />
              <Bar dataKey="cable" stackId="a" fill="#f59e0b" name="电缆费用" />
              <Bar dataKey="trench" stackId="a" fill="#8b5cf6" name="挖沟费用" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-6 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-cyan-400" /> 设备采购
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-400" /> 安装费用
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-400" /> 电缆费用
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-purple-400" /> 挖沟费用
            </span>
          </div>
          <div className="bg-emerald-400/10 rounded-lg px-4 py-2 border border-emerald-400/30">
            <span className="text-emerald-400 font-medium">
              优化方案节省: ¥19万 (14.3%)
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

export default EquipmentView;
