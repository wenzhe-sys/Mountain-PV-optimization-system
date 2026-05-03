// 成本预测服务

// 市场数据类型
interface MarketData {
  date: string;
  panelPrice: number; // 光伏面板价格 (元/W)
  inverterPrice: number; // 逆变器价格 (元/W)
  batteryPrice: number; // 电池价格 (元/kWh)
  laborCost: number; // 人工成本 (元/天)
  materialCost: number; // 材料成本指数
  inflationRate: number; // 通货膨胀率 (%)
}

// 项目参数类型
interface ProjectParams {
  capacity: number; // 项目容量 (kW)
  panelType: string; // 面板类型
  inverterType: string; // 逆变器类型
  batteryCapacity: number; // 电池容量 (kWh)
  terrainDifficulty: 'low' | 'medium' | 'high'; // 地形难度
  installationType: 'ground' | 'roof' | 'floating'; // 安装类型
  location: string; // 项目位置
  startDate: string; // 开始日期
  expectedLifetime: number; // 预期生命周期 (年)
}

// 成本预测结果类型
interface CostPredictionResult {
  initialCost: {
    panels: number;
    inverter: number;
    battery: number;
    installation: number;
    materials: number;
    permits: number;
    total: number;
  };
  operationalCost: {
    maintenance: number;
    monitoring: number;
    insurance: number;
    total: number;
  };
  lifecycleCost: number;
  levelizedCostOfEnergy: number; // LCOE (元/kWh)
  roi: number; // 投资回报率 (%)
  paybackPeriod: number; // 回收期 (年)
  sensitivityAnalysis: {
    panelPrice: number;
    inverterPrice: number;
    laborCost: number;
    inflationRate: number;
  };
  marketTrends: {
    panelPriceTrend: number[];
    inverterPriceTrend: number[];
    batteryPriceTrend: number[];
  };
}

// 模拟市场数据
const generateMarketData = (startDate: string, years: number): MarketData[] => {
  const data: MarketData[] = [];
  const start = new Date(startDate);
  
  for (let i = 0; i < years * 12; i++) {
    const date = new Date(start);
    date.setMonth(start.getMonth() + i);
    
    // 模拟价格趋势
    const panelPrice = 3.5 - (i * 0.01); // 面板价格逐年下降
    const inverterPrice = 1.2 - (i * 0.005); // 逆变器价格逐年下降
    const batteryPrice = 800 - (i * 5); // 电池价格逐年下降
    const laborCost = 300 + (i * 2); // 人工成本逐年上升
    const materialCost = 100 + (i * 0.5); // 材料成本逐年上升
    const inflationRate = 2 + (Math.sin(i / 12) * 0.5); // 通货膨胀率波动
    
    data.push({
      date: date.toISOString().split('T')[0],
      panelPrice,
      inverterPrice,
      batteryPrice,
      laborCost,
      materialCost,
      inflationRate
    });
  }
  
  return data;
};

// 计算初始成本
const calculateInitialCost = (params: ProjectParams, marketData: MarketData[]): CostPredictionResult['initialCost'] => {
  const currentMarketData = marketData[0];
  
  // 面板成本
  const panels = params.capacity * 1000 * currentMarketData.panelPrice;
  
  // 逆变器成本
  const inverter = params.capacity * 1000 * currentMarketData.inverterPrice;
  
  // 电池成本
  const battery = params.batteryCapacity * currentMarketData.batteryPrice;
  
  // 安装成本 (基于地形难度和安装类型)
  const terrainFactor = {
    low: 1.0,
    medium: 1.5,
    high: 2.0
  }[params.terrainDifficulty];
  
  const installationFactor = {
    ground: 1.0,
    roof: 1.3,
    floating: 1.8
  }[params.installationType];
  
  const installation = params.capacity * 500 * terrainFactor * installationFactor;
  
  // 材料成本
  const materials = params.capacity * 200;
  
  // 许可和其他成本
  const permits = params.capacity * 100;
  
  const total = panels + inverter + battery + installation + materials + permits;
  
  return {
    panels,
    inverter,
    battery,
    installation,
    materials,
    permits,
    total
  };
};

// 计算运营成本
const calculateOperationalCost = (params: ProjectParams): CostPredictionResult['operationalCost'] => {
  // 年度维护成本
  const maintenance = params.capacity * 100;
  
  // 监控成本
  const monitoring = params.capacity * 20;
  
  // 保险成本
  const insurance = params.capacity * 50;
  
  const total = maintenance + monitoring + insurance;
  
  return {
    maintenance,
    monitoring,
    insurance,
    total
  };
};

// 计算生命周期成本
const calculateLifecycleCost = (params: ProjectParams, initialCost: CostPredictionResult['initialCost'], operationalCost: CostPredictionResult['operationalCost'], marketData: MarketData[]): number => {
  let totalCost = initialCost.total;
  
  // 计算每年的运营成本，考虑通货膨胀
  for (let i = 1; i < params.expectedLifetime; i++) {
    const inflationFactor = marketData.slice(0, i * 12).reduce((sum, data) => sum + data.inflationRate / 100, 0);
    totalCost += operationalCost.total * (1 + inflationFactor);
  }
  
  return totalCost;
};

// 计算度电成本 (LCOE)
const calculateLCOE = (lifecycleCost: number, capacity: number, expectedLifetime: number): number => {
  // 假设年发电小时数为1200小时
  const annualProduction = capacity * 1200;
  const totalProduction = annualProduction * expectedLifetime;
  
  return lifecycleCost / totalProduction;
};

// 计算投资回报率和回收期
const calculateROI = (lifecycleCost: number, capacity: number, expectedLifetime: number): { roi: number; paybackPeriod: number } => {
  // 假设电价为0.5元/kWh
  const electricityPrice = 0.5;
  const annualProduction = capacity * 1200;
  const annualRevenue = annualProduction * electricityPrice;
  const totalRevenue = annualRevenue * expectedLifetime;
  
  const netProfit = totalRevenue - lifecycleCost;
  const roi = (netProfit / lifecycleCost) * 100;
  
  // 计算回收期
  const paybackPeriod = lifecycleCost / annualRevenue;
  
  return { roi, paybackPeriod };
};

// 敏感性分析
const performSensitivityAnalysis = (params: ProjectParams, marketData: MarketData[]): CostPredictionResult['sensitivityAnalysis'] => {
  // 面板价格敏感性
  const panelPriceIncrease = {
    ...params,
    // 面板价格上涨10%
  };
  const panelPriceData = marketData.map(data => ({
    ...data,
    panelPrice: data.panelPrice * 1.1
  }));
  const panelPriceInitialCost = calculateInitialCost(panelPriceIncrease, panelPriceData);
  
  // 逆变器价格敏感性
  const inverterPriceIncrease = {
    ...params,
    // 逆变器价格上涨10%
  };
  const inverterPriceData = marketData.map(data => ({
    ...data,
    inverterPrice: data.inverterPrice * 1.1
  }));
  const inverterPriceInitialCost = calculateInitialCost(inverterPriceIncrease, inverterPriceData);
  
  // 人工成本敏感性
  const laborCostIncrease = {
    ...params,
    // 人工成本上涨10%
  };
  const laborCostData = marketData.map(data => ({
    ...data,
    laborCost: data.laborCost * 1.1
  }));
  const laborCostInitialCost = calculateInitialCost(laborCostIncrease, laborCostData);
  
  // 通货膨胀率敏感性
  const inflationIncrease = {
    ...params,
    // 通货膨胀率上涨1%
  };
  const inflationData = marketData.map(data => ({
    ...data,
    inflationRate: data.inflationRate + 1
  }));
  const inflationInitialCost = calculateInitialCost(inflationIncrease, inflationData);
  
  return {
    panelPrice: ((panelPriceInitialCost.total - calculateInitialCost(params, marketData).total) / calculateInitialCost(params, marketData).total) * 100,
    inverterPrice: ((inverterPriceInitialCost.total - calculateInitialCost(params, marketData).total) / calculateInitialCost(params, marketData).total) * 100,
    laborCost: ((laborCostInitialCost.total - calculateInitialCost(params, marketData).total) / calculateInitialCost(params, marketData).total) * 100,
    inflationRate: ((inflationInitialCost.total - calculateInitialCost(params, marketData).total) / calculateInitialCost(params, marketData).total) * 100
  };
};

// 生成市场趋势
const generateMarketTrends = (marketData: MarketData[]): CostPredictionResult['marketTrends'] => {
  return {
    panelPriceTrend: marketData.map(data => data.panelPrice),
    inverterPriceTrend: marketData.map(data => data.inverterPrice),
    batteryPriceTrend: marketData.map(data => data.batteryPrice)
  };
};

// 预测成本
const predictCost = (params: ProjectParams): CostPredictionResult => {
  // 生成市场数据
  const marketData = generateMarketData(params.startDate, params.expectedLifetime);
  
  // 计算初始成本
  const initialCost = calculateInitialCost(params, marketData);
  
  // 计算运营成本
  const operationalCost = calculateOperationalCost(params);
  
  // 计算生命周期成本
  const lifecycleCost = calculateLifecycleCost(params, initialCost, operationalCost, marketData);
  
  // 计算度电成本
  const levelizedCostOfEnergy = calculateLCOE(lifecycleCost, params.capacity, params.expectedLifetime);
  
  // 计算投资回报率和回收期
  const { roi, paybackPeriod } = calculateROI(lifecycleCost, params.capacity, params.expectedLifetime);
  
  // 敏感性分析
  const sensitivityAnalysis = performSensitivityAnalysis(params, marketData);
  
  // 生成市场趋势
  const marketTrends = generateMarketTrends(marketData);
  
  return {
    initialCost,
    operationalCost,
    lifecycleCost,
    levelizedCostOfEnergy,
    roi,
    paybackPeriod,
    sensitivityAnalysis,
    marketTrends
  };
};

// 优化成本
const optimizeCost = (params: ProjectParams): { optimizedParams: ProjectParams; costReduction: number } => {
  // 基于项目参数生成优化建议
  const optimizedParams = {
    ...params,
    // 优化面板类型
    panelType: 'high-efficiency',
    // 优化逆变器类型
    inverterType: 'string',
    // 调整电池容量
    batteryCapacity: params.batteryCapacity * 0.8
  };
  
  // 计算原始成本
  const originalCost = predictCost(params).initialCost.total;
  
  // 计算优化后成本
  const optimizedCost = predictCost(optimizedParams).initialCost.total;
  
  // 计算成本降低百分比
  const costReduction = ((originalCost - optimizedCost) / originalCost) * 100;
  
  return {
    optimizedParams,
    costReduction
  };
};

export default {
  predictCost,
  optimizeCost
};