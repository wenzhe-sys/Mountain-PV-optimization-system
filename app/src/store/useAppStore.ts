import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 定义设备类型
interface Inverter {
  id: string;
  name: string;
  x: number;
  y: number;
  capacity: number;
  loadRate: number;
  status: 'online' | 'offline' | 'warning';
  connectedPanels: number;
  model: string;
  efficiency: number;
  temperature: number;
}

interface Transformer {
  id: string;
  name: string;
  x: number;
  y: number;
  capacity: number;
  type: '3200kVA' | '1600kVA';
  connectedInverters: string[];
  model: string;
  efficiency: number;
}

interface CombinerBox {
  id: string;
  name: string;
  x: number;
  y: number;
  capacity: number;
  connectedPanels: number;
  status: 'online' | 'offline' | 'warning';
}

interface DistributionCabinet {
  id: string;
  name: string;
  x: number;
  y: number;
  capacity: number;
  connectedTransformers: string[];
  status: 'online' | 'offline' | 'warning';
}

// 定义电缆路由类型
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

// 定义维护计划类型
interface MaintenanceSchedule {
  id: number;
  device: string;
  type: string;
  date: string;
  status: 'scheduled' | 'completed';
  duration: string;
  cost: number;
}

// 定义故障预测类型
interface FailurePrediction {
  device: string;
  risk: '高' | '中' | '低';
  remainingLife: string;
  reason: string;
  recommendedAction: string;
}

// 定义状态类型
interface AppState {
  // 用户认证
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    role: 'admin' | 'user';
    name: string;
  } | null;
  
  // 系统状态
  activeSection: string;
  sidebarOpen: boolean;
  currentInstanceId: string | null;
  theme: 'dark' | 'light';
  
  // 设备数据
  equipment: {
    inverters: Inverter[];
    transformers: Transformer[];
    combinerBoxes: CombinerBox[];
    distributionCabinets: DistributionCabinet[];
  };
  
  // 电缆路由数据
  cableRoutes: CableRoute[];
  
  // 运维数据
  maintenanceSchedule: MaintenanceSchedule[];
  failurePrediction: FailurePrediction[];
  
  // 操作方法
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setUser: (user: { id: string; email: string; role: 'admin' | 'user'; name: string } | null) => void;
  setActiveSection: (section: string) => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentInstanceId: (id: string | null) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  
  // 设备操作
  addInverter: (inverter: Omit<Inverter, 'id'>) => void;
  updateInverter: (id: string, updates: Partial<Inverter>) => void;
  deleteInverter: (id: string) => void;
  
  addTransformer: (transformer: Omit<Transformer, 'id'>) => void;
  updateTransformer: (id: string, updates: Partial<Transformer>) => void;
  deleteTransformer: (id: string) => void;
  
  addCombinerBox: (combinerBox: Omit<CombinerBox, 'id'>) => void;
  updateCombinerBox: (id: string, updates: Partial<CombinerBox>) => void;
  deleteCombinerBox: (id: string) => void;
  
  addDistributionCabinet: (cabinet: Omit<DistributionCabinet, 'id'>) => void;
  updateDistributionCabinet: (id: string, updates: Partial<DistributionCabinet>) => void;
  deleteDistributionCabinet: (id: string) => void;
  
  // 电缆路由操作
  addCableRoute: (route: Omit<CableRoute, 'id'>) => void;
  updateCableRoute: (id: string, updates: Partial<CableRoute>) => void;
  deleteCableRoute: (id: string) => void;
  
  // 运维操作
  addMaintenanceSchedule: (schedule: Omit<MaintenanceSchedule, 'id'>) => void;
  updateMaintenanceSchedule: (id: number, updates: Partial<MaintenanceSchedule>) => void;
  deleteMaintenanceSchedule: (id: number) => void;
  
  // 重置状态
  resetState: () => void;
}

// 初始设备数据
const initialInverters: Inverter[] = [
  { id: 'INV-01', name: '逆变器-01', x: 60, y: 90, capacity: 100, loadRate: 85, status: 'online', connectedPanels: 240, model: 'Sungrow SG100HX', efficiency: 98.5, temperature: 42 },
  { id: 'INV-02', name: '逆变器-02', x: 140, y: 90, capacity: 100, loadRate: 78, status: 'online', connectedPanels: 200, model: 'Huawei SUN2000-100KTL', efficiency: 98.2, temperature: 40 },
  { id: 'INV-03', name: '逆变器-03', x: 220, y: 90, capacity: 100, loadRate: 92, status: 'online', connectedPanels: 220, model: 'Fronius Symo 100.0-3-M', efficiency: 97.8, temperature: 45 },
  { id: 'INV-04', name: '逆变器-04', x: 300, y: 90, capacity: 100, loadRate: 65, status: 'warning', connectedPanels: 160, model: 'Sungrow SG100HX', efficiency: 98.5, temperature: 52 },
  { id: 'INV-05', name: '逆变器-05', x: 60, y: 130, capacity: 100, loadRate: 88, status: 'online', connectedPanels: 190, model: 'Huawei SUN2000-100KTL', efficiency: 98.2, temperature: 41 },
  { id: 'INV-06', name: '逆变器-06', x: 140, y: 130, capacity: 100, loadRate: 95, status: 'online', connectedPanels: 260, model: 'Fronius Symo 100.0-3-M', efficiency: 97.8, temperature: 48 },
  { id: 'INV-07', name: '逆变器-07', x: 220, y: 130, capacity: 100, loadRate: 72, status: 'online', connectedPanels: 150, model: 'Sungrow SG100HX', efficiency: 98.5, temperature: 39 },
  { id: 'INV-08', name: '逆变器-08', x: 300, y: 130, capacity: 100, loadRate: 80, status: 'online', connectedPanels: 180, model: 'Huawei SUN2000-100KTL', efficiency: 98.2, temperature: 43 },
];

const initialTransformers: Transformer[] = [
  { id: 'TR-01', name: '箱变-01', x: 340, y: 110, capacity: 3200, type: '3200kVA', connectedInverters: ['INV-01', 'INV-02', 'INV-03', 'INV-04'], model: 'S11-M-3200/10', efficiency: 99.0 },
  { id: 'TR-02', name: '箱变-02', x: 340, y: 190, capacity: 3200, type: '3200kVA', connectedInverters: ['INV-05', 'INV-06', 'INV-07', 'INV-08'], model: 'S11-M-3200/10', efficiency: 99.0 },
];

const initialCombinerBoxes: CombinerBox[] = [
  { id: 'CB-01', name: '汇流箱-01', x: 60, y: 40, capacity: 16, connectedPanels: 120, status: 'online' },
  { id: 'CB-02', name: '汇流箱-02', x: 140, y: 40, capacity: 16, connectedPanels: 100, status: 'online' },
  { id: 'CB-03', name: '汇流箱-03', x: 220, y: 40, capacity: 16, connectedPanels: 110, status: 'online' },
  { id: 'CB-04', name: '汇流箱-04', x: 300, y: 40, capacity: 16, connectedPanels: 80, status: 'online' },
  { id: 'CB-05', name: '汇流箱-05', x: 60, y: 60, capacity: 16, connectedPanels: 95, status: 'online' },
  { id: 'CB-06', name: '汇流箱-06', x: 140, y: 60, capacity: 16, connectedPanels: 130, status: 'online' },
  { id: 'CB-07', name: '汇流箱-07', x: 220, y: 60, capacity: 16, connectedPanels: 75, status: 'online' },
  { id: 'CB-08', name: '汇流箱-08', x: 300, y: 60, capacity: 16, connectedPanels: 90, status: 'online' },
];

const initialDistributionCabinets: DistributionCabinet[] = [
  { id: 'DC-01', name: '配电柜-01', x: 340, y: 250, capacity: 6300, connectedTransformers: ['TR-01', 'TR-02'], status: 'online' },
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
    const substationId = 'TR-01';
    
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

// 初始电缆路由数据
const initialCableRoutes: CableRoute[] = generateCableRoutes();

// 初始维护计划数据
const initialMaintenanceSchedule: MaintenanceSchedule[] = [
  { id: 1, device: 'INV-01', type: '定期维护', date: '2024-07-15', status: 'scheduled', duration: '4小时', cost: 1200 },
  { id: 2, device: 'TR-01', type: '预防性维护', date: '2024-07-20', status: 'scheduled', duration: '6小时', cost: 1800 },
  { id: 3, device: 'INV-04', type: '故障维修', date: '2024-07-10', status: 'completed', duration: '3小时', cost: 900 },
  { id: 4, device: 'DC-01', type: '定期维护', date: '2024-07-25', status: 'scheduled', duration: '5小时', cost: 1500 },
];

// 初始故障预测数据
const initialFailurePrediction: FailurePrediction[] = [
  { device: 'INV-04', risk: '高', remainingLife: '3个月', reason: '温度异常', recommendedAction: '立即检修' },
  { device: 'TR-02', risk: '中', remainingLife: '12个月', reason: '绝缘老化', recommendedAction: '计划更换' },
  { device: 'INV-06', risk: '低', remainingLife: '18个月', reason: '轻微振动', recommendedAction: '定期检查' },
  { device: 'DC-01', risk: '低', remainingLife: '24个月', reason: '正常损耗', recommendedAction: '常规维护' },
];

// 创建状态管理
const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // 初始状态
      isAuthenticated: true,
      user: {
        id: '1',
        email: 'admin@example.com',
        role: 'admin',
        name: '系统管理员'
      },
      activeSection: 'dashboard',
      sidebarOpen: true,
      currentInstanceId: null,
      theme: 'dark',
      
      equipment: {
        inverters: initialInverters,
        transformers: initialTransformers,
        combinerBoxes: initialCombinerBoxes,
        distributionCabinets: initialDistributionCabinets,
      },
      
      cableRoutes: initialCableRoutes,
      maintenanceSchedule: initialMaintenanceSchedule,
      failurePrediction: initialFailurePrediction,
      
      // 操作方法
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setUser: (user) => set({ user }),
      setActiveSection: (activeSection) => set({ activeSection }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setCurrentInstanceId: (currentInstanceId) => set({ currentInstanceId }),
      setTheme: (theme) => set({ theme }),

      
      // 设备操作
      addInverter: (inverter) => set((state) => ({
        equipment: {
          ...state.equipment,
          inverters: [...state.equipment.inverters, {
            ...inverter,
            id: `INV-${String(state.equipment.inverters.length + 1).padStart(2, '0')}`,
          }],
        },
      })),
      
      updateInverter: (id, updates) => set((state) => ({
        equipment: {
          ...state.equipment,
          inverters: state.equipment.inverters.map((inv) =>
            inv.id === id ? { ...inv, ...updates } : inv
          ),
        },
      })),
      
      deleteInverter: (id) => set((state) => ({
        equipment: {
          ...state.equipment,
          inverters: state.equipment.inverters.filter((inv) => inv.id !== id),
        },
      })),
      
      addTransformer: (transformer) => set((state) => ({
        equipment: {
          ...state.equipment,
          transformers: [...state.equipment.transformers, {
            ...transformer,
            id: `TR-${String(state.equipment.transformers.length + 1).padStart(2, '0')}`,
          }],
        },
      })),
      
      updateTransformer: (id, updates) => set((state) => ({
        equipment: {
          ...state.equipment,
          transformers: state.equipment.transformers.map((tr) =>
            tr.id === id ? { ...tr, ...updates } : tr
          ),
        },
      })),
      
      deleteTransformer: (id) => set((state) => ({
        equipment: {
          ...state.equipment,
          transformers: state.equipment.transformers.filter((tr) => tr.id !== id),
        },
      })),
      
      addCombinerBox: (combinerBox) => set((state) => ({
        equipment: {
          ...state.equipment,
          combinerBoxes: [...state.equipment.combinerBoxes, {
            ...combinerBox,
            id: `CB-${String(state.equipment.combinerBoxes.length + 1).padStart(2, '0')}`,
          }],
        },
      })),
      
      updateCombinerBox: (id, updates) => set((state) => ({
        equipment: {
          ...state.equipment,
          combinerBoxes: state.equipment.combinerBoxes.map((cb) =>
            cb.id === id ? { ...cb, ...updates } : cb
          ),
        },
      })),
      
      deleteCombinerBox: (id) => set((state) => ({
        equipment: {
          ...state.equipment,
          combinerBoxes: state.equipment.combinerBoxes.filter((cb) => cb.id !== id),
        },
      })),
      
      addDistributionCabinet: (cabinet) => set((state) => ({
        equipment: {
          ...state.equipment,
          distributionCabinets: [...state.equipment.distributionCabinets, {
            ...cabinet,
            id: `DC-${String(state.equipment.distributionCabinets.length + 1).padStart(2, '0')}`,
          }],
        },
      })),
      
      updateDistributionCabinet: (id, updates) => set((state) => ({
        equipment: {
          ...state.equipment,
          distributionCabinets: state.equipment.distributionCabinets.map((dc) =>
            dc.id === id ? { ...dc, ...updates } : dc
          ),
        },
      })),
      
      deleteDistributionCabinet: (id) => set((state) => ({
        equipment: {
          ...state.equipment,
          distributionCabinets: state.equipment.distributionCabinets.filter((dc) => dc.id !== id),
        },
      })),
      
      // 电缆路由操作
      addCableRoute: (route) => set((state) => ({
        cableRoutes: [...state.cableRoutes, {
          ...route,
          id: `C${String(state.cableRoutes.length + 1).padStart(2, '0')}`,
        }],
      })),
      
      updateCableRoute: (id, updates) => set((state) => ({
        cableRoutes: state.cableRoutes.map((route) =>
          route.id === id ? { ...route, ...updates } : route
        ),
      })),
      
      deleteCableRoute: (id) => set((state) => ({
        cableRoutes: state.cableRoutes.filter((route) => route.id !== id),
      })),
      
      // 运维操作
      addMaintenanceSchedule: (schedule) => set((state) => ({
        maintenanceSchedule: [...state.maintenanceSchedule, {
          ...schedule,
          id: state.maintenanceSchedule.length + 1,
        }],
      })),
      
      updateMaintenanceSchedule: (id, updates) => set((state) => ({
        maintenanceSchedule: state.maintenanceSchedule.map((schedule) =>
          schedule.id === id ? { ...schedule, ...updates } : schedule
        ),
      })),
      
      deleteMaintenanceSchedule: (id) => set((state) => ({
        maintenanceSchedule: state.maintenanceSchedule.filter((schedule) => schedule.id !== id),
      })),
      
      // 重置状态
      resetState: () => set({
        isAuthenticated: false,
        user: null,
        activeSection: 'dashboard',
        sidebarOpen: true,
        equipment: {
          inverters: initialInverters,
          transformers: initialTransformers,
          combinerBoxes: initialCombinerBoxes,
          distributionCabinets: initialDistributionCabinets,
        },
        cableRoutes: initialCableRoutes,
        maintenanceSchedule: initialMaintenanceSchedule,
        failurePrediction: initialFailurePrediction,
      }),
    }),
    {
      name: 'solar-farm-app-storage',
    }
  )
);

export default useAppStore;