// 生态影响评估服务

// 环境影响类型
interface EnvironmentalImpact {
  type: 'biodiversity' | 'soil' | 'water' | 'air' | 'noise' | 'visual';
  impact: 'low' | 'medium' | 'high';
  description: string;
  mitigation: string[];
  score: number;
}

// 生态系统类型
interface Ecosystem {
  type: 'forest' | 'grassland' | 'wetland' | 'desert' | 'urban' | 'agricultural';
  coverage: number; // 覆盖率 (%)
  sensitivity: 'low' | 'medium' | 'high';
  protected: boolean;
}

// 项目参数
interface ProjectParams {
  capacity: number; // 项目容量 (kW)
  area: number; // 占地面积 (m²)
  location: string; // 项目位置
  terrainType: 'flat' | 'hilly' | 'mountainous'; // 地形类型
  ecosystemType: Ecosystem[]; // 生态系统类型
  constructionPeriod: number; // 建设周期 (月)
  operationalLifetime: number; // 运行寿命 (年)
  panelType: 'standard' | 'bifacial' | 'thin-film'; // 面板类型
  installationType: 'ground' | 'roof' | 'floating'; // 安装类型
  vegetationRemoval: number; // 植被移除面积 (m²)
  soilDisturbance: number; // 土壤扰动面积 (m²)
  waterUsage: number; // 用水量 (m³)
  noiseLevel: number; // 噪音水平 (dB)
}

// 评估结果
interface EcoImpactResult {
  overallImpact: 'low' | 'medium' | 'high';
  impactScore: number; // 0-100
  impacts: EnvironmentalImpact[];
  ecosystemImpacts: {
    ecosystem: Ecosystem;
    impact: 'low' | 'medium' | 'high';
    score: number;
  }[];
  carbonFootprint: {
    construction: number; // 建设阶段碳排放 (tCO₂)
    operation: number; // 运行阶段碳排放 (tCO₂/year)
    decommissioning: number; // 退役阶段碳排放 (tCO₂)
    total: number; // 总碳排放 (tCO₂)
    offset: number; // 碳抵消量 (tCO₂)
    net: number; // 净碳排放 (tCO₂)
  };
  mitigationMeasures: {
    measure: string;
    effectiveness: 'low' | 'medium' | 'high';
    cost: number; // 成本 (万元)
  }[];
  recommendations: string[];
  compliance: {
    regulations: string[];
    permits: string[];
    status: 'compliant' | 'partial' | 'non-compliant';
  };
}

// 计算生物多样性影响
const calculateBiodiversityImpact = (params: ProjectParams): EnvironmentalImpact => {
  let score = 0;
  let impact: 'low' | 'medium' | 'high' = 'low';
  
  // 基于生态系统类型和敏感性计算影响
  params.ecosystemType.forEach(ecosystem => {
    if (ecosystem.protected) {
      score += 30;
    }
    if (ecosystem.sensitivity === 'high') {
      score += 20;
    } else if (ecosystem.sensitivity === 'medium') {
      score += 10;
    }
  });
  
  // 基于植被移除面积计算影响
  if (params.vegetationRemoval > 10000) {
    score += 25;
  } else if (params.vegetationRemoval > 5000) {
    score += 15;
  } else if (params.vegetationRemoval > 1000) {
    score += 5;
  }
  
  // 确定影响等级
  if (score > 50) {
    impact = 'high';
  } else if (score > 25) {
    impact = 'medium';
  }
  
  return {
    type: 'biodiversity',
    impact,
    description: `项目建设可能对当地生物多样性造成${impact === 'high' ? '严重' : impact === 'medium' ? '中等' : '轻微'}影响，主要由于植被移除和栖息地破坏。`,
    mitigation: [
      '实施植被移植计划',
      '设置野生动物通道',
      '恢复周边栖息地',
      '进行生物多样性监测'
    ],
    score
  };
};

// 计算土壤影响
const calculateSoilImpact = (params: ProjectParams): EnvironmentalImpact => {
  let score = 0;
  let impact: 'low' | 'medium' | 'high' = 'low';
  
  // 基于土壤扰动面积计算影响
  if (params.soilDisturbance > 10000) {
    score += 30;
  } else if (params.soilDisturbance > 5000) {
    score += 20;
  } else if (params.soilDisturbance > 1000) {
    score += 10;
  }
  
  // 基于地形类型计算影响
  if (params.terrainType === 'mountainous') {
    score += 20;
  } else if (params.terrainType === 'hilly') {
    score += 10;
  }
  
  // 确定影响等级
  if (score > 40) {
    impact = 'high';
  } else if (score > 20) {
    impact = 'medium';
  }
  
  return {
    type: 'soil',
    impact,
    description: `项目建设可能对土壤造成${impact === 'high' ? '严重' : impact === 'medium' ? '中等' : '轻微'}影响，主要由于土壤扰动和可能的水土流失。`,
    mitigation: [
      '实施水土保持措施',
      '使用低影响施工方法',
      '覆盖裸露土壤',
      '建立排水系统'
    ],
    score
  };
};

// 计算水资源影响
const calculateWaterImpact = (params: ProjectParams): EnvironmentalImpact => {
  let score = 0;
  let impact: 'low' | 'medium' | 'high' = 'low';
  
  // 基于用水量计算影响
  if (params.waterUsage > 10000) {
    score += 30;
  } else if (params.waterUsage > 5000) {
    score += 20;
  } else if (params.waterUsage > 1000) {
    score += 10;
  }
  
  // 基于安装类型计算影响
  if (params.installationType === 'floating') {
    score += 25;
  }
  
  // 确定影响等级
  if (score > 40) {
    impact = 'high';
  } else if (score > 20) {
    impact = 'medium';
  }
  
  return {
    type: 'water',
    impact,
    description: `项目建设和运行可能对水资源造成${impact === 'high' ? '严重' : impact === 'medium' ? '中等' : '轻微'}影响，主要由于施工用水和可能的水污染。`,
    mitigation: [
      '实施节水措施',
      '建立雨水收集系统',
      '处理施工废水',
      '监测水质变化'
    ],
    score
  };
};

// 计算空气质量影响
const calculateAirImpact = (params: ProjectParams): EnvironmentalImpact => {
  let score = 0;
  let impact: 'low' | 'medium' | 'high' = 'low';
  
  // 基于建设周期计算影响
  if (params.constructionPeriod > 12) {
    score += 20;
  } else if (params.constructionPeriod > 6) {
    score += 10;
  }
  
  // 基于项目容量计算影响
  if (params.capacity > 10000) {
    score += 15;
  } else if (params.capacity > 5000) {
    score += 10;
  }
  
  // 确定影响等级
  if (score > 30) {
    impact = 'high';
  } else if (score > 15) {
    impact = 'medium';
  }
  
  return {
    type: 'air',
    impact,
    description: `项目建设可能对空气质量造成${impact === 'high' ? '严重' : impact === 'medium' ? '中等' : '轻微'}影响，主要由于施工扬尘和车辆排放。`,
    mitigation: [
      '实施扬尘控制措施',
      '使用低排放施工设备',
      '定期洒水降尘',
      '设置围挡'
    ],
    score
  };
};

// 计算噪音影响
const calculateNoiseImpact = (params: ProjectParams): EnvironmentalImpact => {
  let score = 0;
  let impact: 'low' | 'medium' | 'high' = 'low';
  
  // 基于噪音水平计算影响
  if (params.noiseLevel > 80) {
    score += 30;
  } else if (params.noiseLevel > 60) {
    score += 20;
  } else if (params.noiseLevel > 40) {
    score += 10;
  }
  
  // 基于建设周期计算影响
  if (params.constructionPeriod > 12) {
    score += 10;
  }
  
  // 确定影响等级
  if (score > 35) {
    impact = 'high';
  } else if (score > 20) {
    impact = 'medium';
  }
  
  return {
    type: 'noise',
    impact,
    description: `项目建设可能对周边环境造成${impact === 'high' ? '严重' : impact === 'medium' ? '中等' : '轻微'}噪音影响，主要由于施工设备和运输车辆。`,
    mitigation: [
      '合理安排施工时间',
      '使用低噪音设备',
      '设置隔音屏障',
      '监测噪音水平'
    ],
    score
  };
};

// 计算景观影响
const calculateVisualImpact = (params: ProjectParams): EnvironmentalImpact => {
  let score = 0;
  let impact: 'low' | 'medium' | 'high' = 'low';
  
  // 基于项目容量和占地面积计算影响
  if (params.area > 100000) {
    score += 25;
  } else if (params.area > 50000) {
    score += 15;
  } else if (params.area > 10000) {
    score += 5;
  }
  
  // 基于地形类型计算影响
  if (params.terrainType === 'mountainous') {
    score += 20;
  } else if (params.terrainType === 'hilly') {
    score += 10;
  }
  
  // 确定影响等级
  if (score > 40) {
    impact = 'high';
  } else if (score > 20) {
    impact = 'medium';
  }
  
  return {
    type: 'visual',
    impact,
    description: `项目建设可能对景观造成${impact === 'high' ? '严重' : impact === 'medium' ? '中等' : '轻微'}影响，主要由于大面积光伏面板的安装。`,
    mitigation: [
      '优化面板布局',
      '使用与环境协调的面板颜色',
      '保留景观视线',
      '进行景观恢复'
    ],
    score
  };
};

// 计算碳足迹
const calculateCarbonFootprint = (params: ProjectParams): EcoImpactResult['carbonFootprint'] => {
  // 建设阶段碳排放 (基于项目容量)
  const construction = params.capacity * 0.05; // 假设每kW产生0.05吨CO₂
  
  // 运行阶段碳排放 (基于面板类型)
  const operationFactor = {
    'standard': 0.0001,
    'bifacial': 0.00008,
    'thin-film': 0.00012
  }[params.panelType];
  const operation = params.capacity * operationFactor * 8760; // 年运行小时数
  
  // 退役阶段碳排放
  const decommissioning = params.capacity * 0.02;
  
  // 总碳排放
  const total = construction + (operation * params.operationalLifetime) + decommissioning;
  
  // 碳抵消量 (基于发电量)
  const offset = params.capacity * 0.5 * 8760 * params.operationalLifetime / 1000; // 假设每kWh抵消0.5kg CO₂
  
  // 净碳排放
  const net = total - offset;
  
  return {
    construction,
    operation,
    decommissioning,
    total,
    offset,
    net
  };
};

// 计算生态系统影响
const calculateEcosystemImpacts = (params: ProjectParams) => {
  return params.ecosystemType.map(ecosystem => {
    let score = 0;
    let impact: 'low' | 'medium' | 'high' = 'low';
    
    if (ecosystem.protected) {
      score += 30;
    }
    
    if (ecosystem.sensitivity === 'high') {
      score += 25;
    } else if (ecosystem.sensitivity === 'medium') {
      score += 15;
    }
    
    score += (ecosystem.coverage / 100) * 20;
    
    if (score > 50) {
      impact = 'high';
    } else if (score > 30) {
      impact = 'medium';
    }
    
    return {
      ecosystem,
      impact,
      score
    };
  });
};

// 生成减缓措施
const generateMitigationMeasures = (impacts: EnvironmentalImpact[]) => {
  const measures = [
    {
      measure: '实施植被恢复计划',
      effectiveness: 'high' as const,
      cost: 20
    },
    {
      measure: '建立水土保持系统',
      effectiveness: 'high' as const,
      cost: 15
    },
    {
      measure: '使用低影响施工方法',
      effectiveness: 'medium' as const,
      cost: 10
    },
    {
      measure: '设置野生动物通道',
      effectiveness: 'medium' as const,
      cost: 8
    },
    {
      measure: '实施扬尘控制措施',
      effectiveness: 'low' as const,
      cost: 5
    },
    {
      measure: '优化面板布局以减少景观影响',
      effectiveness: 'medium' as const,
      cost: 12
    }
  ];
  
  // 根据影响等级筛选措施
  const highImpacts = impacts.filter(impact => impact.impact === 'high');
  if (highImpacts.length > 0) {
    return measures.filter(measure => measure.effectiveness === 'high' || measure.effectiveness === 'medium');
  }
  
  return measures;
};

// 生成合规性分析
const generateCompliance = (params: ProjectParams) => {
  const regulations = [
    '环境影响评价法',
    '土地管理法',
    '水土保持法',
    '野生动物保护法',
    '大气污染防治法',
    '水污染防治法'
  ];
  
  const permits = [
    '环境影响评价批复',
    '土地使用许可证',
    '建设工程规划许可证',
    '施工许可证',
    '取水许可证',
    '排污许可证'
  ];
  
  // 简单的合规性评估
  let status: 'compliant' | 'partial' | 'non-compliant' = 'compliant';
  
  if (params.ecosystemType.some(ecosystem => ecosystem.protected)) {
    status = 'partial';
  }
  
  if (params.vegetationRemoval > 20000) {
    status = 'non-compliant';
  }
  
  return {
    regulations,
    permits,
    status
  };
};

// 生成建议
const generateRecommendations = (impacts: EnvironmentalImpact[]) => {
  const recommendations = [
    '进行详细的生物多样性调查',
    '制定生态恢复计划',
    '实施环境监测方案',
    '与当地社区进行充分沟通',
    '采用绿色施工技术',
    '优化项目设计以减少环境影响',
    '建立环境管理体系',
    '定期进行环境影响评估'
  ];
  
  // 根据影响等级调整建议
  const highImpacts = impacts.filter(impact => impact.impact === 'high');
  if (highImpacts.length > 0) {
    return recommendations.concat([
      '考虑重新选址以减少环境影响',
      '增加环境补偿措施',
      '制定更严格的环境管理计划'
    ]);
  }
  
  return recommendations;
};

// 评估生态影响
const assessEcoImpact = (params: ProjectParams): EcoImpactResult => {
  // 计算各项环境影响
  const impacts = [
    calculateBiodiversityImpact(params),
    calculateSoilImpact(params),
    calculateWaterImpact(params),
    calculateAirImpact(params),
    calculateNoiseImpact(params),
    calculateVisualImpact(params)
  ];
  
  // 计算总影响分数
  const totalScore = impacts.reduce((sum, impact) => sum + impact.score, 0) / impacts.length;
  
  // 确定总体影响等级
  let overallImpact: 'low' | 'medium' | 'high' = 'low';
  if (totalScore > 40) {
    overallImpact = 'high';
  } else if (totalScore > 25) {
    overallImpact = 'medium';
  }
  
  // 计算生态系统影响
  const ecosystemImpacts = calculateEcosystemImpacts(params);
  
  // 计算碳足迹
  const carbonFootprint = calculateCarbonFootprint(params);
  
  // 生成减缓措施
  const mitigationMeasures = generateMitigationMeasures(impacts);
  
  // 生成合规性分析
  const compliance = generateCompliance(params);
  
  // 生成建议
  const recommendations = generateRecommendations(impacts);
  
  return {
    overallImpact,
    impactScore: totalScore,
    impacts,
    ecosystemImpacts,
    carbonFootprint,
    mitigationMeasures,
    recommendations,
    compliance
  };
};

// 优化生态影响
const optimizeEcoImpact = (params: ProjectParams) => {
  // 基于原始参数生成优化建议
  const optimizedParams = {
    ...params,
    // 减少植被移除
    vegetationRemoval: params.vegetationRemoval * 0.7,
    // 减少土壤扰动
    soilDisturbance: params.soilDisturbance * 0.8,
    // 减少用水量
    waterUsage: params.waterUsage * 0.9,
    // 降低噪音水平
    noiseLevel: Math.max(40, params.noiseLevel - 10)
  };
  
  // 计算优化前后的影响
  const originalImpact = assessEcoImpact(params);
  const optimizedImpact = assessEcoImpact(optimizedParams);
  
  // 计算影响减少百分比
  const impactReduction = ((originalImpact.impactScore - optimizedImpact.impactScore) / originalImpact.impactScore) * 100;
  
  return {
    optimizedParams,
    originalImpact,
    optimizedImpact,
    impactReduction
  };
};

export default {
  assessEcoImpact,
  optimizeEcoImpact
};