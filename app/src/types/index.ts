// Navigation types
export interface NavItem {
  id: string;
  label: string;
  icon: string;
}

// Dashboard types
export interface MetricCard {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: string;
}

export interface AlertItem {
  id: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

// Terrain types
export interface TerrainData {
  elevation: number[][];
  slope: number[][];
  aspect: number[][];
  solarRadiation: number[][];
  buildableArea: boolean[][];
}

export interface TerrainPoint {
  x: number;
  y: number;
  elevation: number;
  slope: number;
  aspect: number;
  solarRadiation: number;
  isBuildable: boolean;
}

// Panel layout types
export interface PanelZone {
  id: string;
  name: string;
  panels: Panel[];
  inverterId: string;
  capacity: number;
  perimeter: number;
  area: number;
}

export interface Panel {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  power: number;
  angle: number;
}

export interface Inverter {
  id: string;
  name: string;
  capacity: number;
  loadRate: number;
  x: number;
  y: number;
}

// Electrical equipment types
export interface Transformer {
  id: string;
  name: string;
  capacity: number;
  type: '3200kVA' | '1600kVA';
  x: number;
  y: number;
  connectedInverters: string[];
}

export interface CableRoute {
  id: string;
  from: string;
  to: string;
  type: 'DC' | 'AC';
  length: number;
  isShared: boolean;
  path: { x: number; y: number }[];
}

// Cost analysis types
export interface CostBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface CostAnalysis {
  constructionCost: CostBreakdown[];
  equipmentCost: CostBreakdown[];
  cableCost: CostBreakdown[];
  operationCost: CostBreakdown[];
  totalCost: number;
  optimizedCost: number;
  savings: number;
}

// Eco impact types
export interface EcoImpact {
  vegetationCoverage: {
    before: number;
    after: number;
    change: number;
  };
  carbonReduction: {
    annual: number;
    lifetime: number;
  };
  waterConservation: number;
  soilProtection: number;
}

// Monitoring types
export interface DeviceStatus {
  id: string;
  name: string;
  type: 'inverter' | 'transformer' | 'panel';
  status: 'online' | 'offline' | 'warning';
  power: number;
  efficiency: number;
  temperature: number;
  lastUpdate: string;
}

export interface PowerData {
  timestamp: string;
  generated: number;
  consumed: number;
  efficiency: number;
}

// Algorithm result types
export interface OptimizationResult {
  algorithm: string;
  iteration: number;
  objectiveValue: number;
  gap: number;
  time: number;
  status: 'optimal' | 'feasible' | 'infeasible';
}

export interface PanelCuttingResult {
  rawPanels: number;
  cutPanels: number;
  waste: number;
  cuttingScheme: {
    spec: string;
    count: number;
  }[];
}

export interface RoutingResult {
  totalLength: number;
  sharedLength: number;
  trenchLength: number;
  cableCost: number;
  trenchCost: number;
  savings: number;
}

// Instance types
export * from './instance';
