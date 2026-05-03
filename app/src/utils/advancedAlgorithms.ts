// 高级优化算法库
// 实现多目标优化、混合算法和智能决策支持系统

import type { Panel, CableRoute } from '../types';

// Perlin noise function for more realistic terrain
function perlinNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  
  const a = ix + iy * 57;
  const b = a + 1;
  const c = a + 57;
  const d = c + 1;
  
  let r = Math.sin(a * 12.9898 + 78.233);
  r *= r;
  r -= r * r * r;
  const ra = r * (1 - u) + Math.sin(b * 12.9898 + 78.233) * u;
  
  r = Math.sin(c * 12.9898 + 78.233);
  r *= r;
  r -= r * r * r;
  const rb = r * (1 - u) + Math.sin(d * 12.9898 + 78.233) * u;
  
  r = ra * (1 - v) + rb * v;
  r *= r;
  return r * r * r;
}

// Generate terrain data with Perlin noise
export const generateTerrainData = () => {
  const size = 50;
  const elevation: number[][] = [];
  const slope: number[][] = [];
  const solarRadiation: number[][] = [];
  
  for (let i = 0; i < size; i++) {
    elevation[i] = [];
    slope[i] = [];
    solarRadiation[i] = [];
    for (let j = 0; j < size; j++) {
      // Create mountainous terrain using Perlin noise
      const x = i / size * 4;
      const y = j / size * 4;
      const height = 
        perlinNoise(x, y) * 30 +
        perlinNoise(x * 2, y * 2) * 15 +
        perlinNoise(x * 4, y * 4) * 5 +
        20;
      
      elevation[i][j] = Math.max(5, height);
      
      // Calculate slope
      const dx = i > 0 ? elevation[i][j] - elevation[i-1][j] : 0;
      const dy = j > 0 ? elevation[i][j] - elevation[i][j-1] : 0;
      slope[i][j] = Math.sqrt(dx * dx + dy * dy);
      
      // Solar radiation based on slope and aspect
      solarRadiation[i][j] = Math.max(0, 1000 - slope[i][j] * 50);
    }
  }
  
  return { elevation, slope, solarRadiation };
};

// 多目标优化问题定义
interface MultiObjectiveProblem {
  objectives: ((solution: any) => number)[];
  constraints: ((solution: any) => boolean)[];
  variableRanges: { min: number; max: number }[];
  populationSize: number;
  generations: number;
  crossoverRate: number;
  mutationRate: number;
}

// 多目标优化解
interface MultiObjectiveSolution {
  variables: number[];
  objectiveValues: number[];
  rank: number;
  crowdingDistance: number;
  feasible: boolean;
}

// NSGA-II 多目标优化算法 (增强版)
export const nsga2 = (problem: MultiObjectiveProblem): MultiObjectiveSolution[] => {
  // 初始化种群
  let population: MultiObjectiveSolution[] = [];
  for (let i = 0; i < problem.populationSize; i++) {
    const variables = problem.variableRanges.map(range => 
      range.min + Math.random() * (range.max - range.min)
    );
    const objectiveValues = problem.objectives.map(obj => obj(variables));
    const feasible = problem.constraints.every(constraint => constraint(variables));
    
    population.push({
      variables,
      objectiveValues,
      rank: 0,
      crowdingDistance: 0,
      feasible
    });
  }
  
  // 主进化循环
  for (let gen = 0; gen < problem.generations; gen++) {
    // 自适应参数调整
    const adaptiveCrossoverRate = problem.crossoverRate * (1 + 0.1 * Math.sin(gen / problem.generations * Math.PI));
    const adaptiveMutationRate = problem.mutationRate * (1 + 0.1 * Math.cos(gen / problem.generations * Math.PI));
    
    // 选择和交叉
    const offspring = [];
    for (let i = 0; i < problem.populationSize; i++) {
      // 锦标赛选择 (增强版)
      const parent1 = tournamentSelection(population, 3); // 增加锦标赛规模
      const parent2 = tournamentSelection(population, 3);
      
      // 多点交叉 (增强版)
      let childVariables: number[] = [];
      if (Math.random() < adaptiveCrossoverRate) {
        childVariables = multiPointCrossover(parent1.variables, parent2.variables);
      } else {
        childVariables = [...parent1.variables];
      }
      
      // 自适应变异 (增强版)
      for (let j = 0; j < childVariables.length; j++) {
        if (Math.random() < adaptiveMutationRate) {
          const range = problem.variableRanges[j];
          // 高斯变异
          const mutationStep = (range.max - range.min) * 0.1;
          childVariables[j] += (Math.random() - 0.5) * mutationStep;
          // 边界处理
          childVariables[j] = Math.max(range.min, Math.min(range.max, childVariables[j]));
        }
      }
      
      // 计算目标值
      const objectiveValues = problem.objectives.map(obj => obj(childVariables));
      const feasible = problem.constraints.every(constraint => constraint(childVariables));
      
      offspring.push({
        variables: childVariables,
        objectiveValues,
        rank: 0,
        crowdingDistance: 0,
        feasible
      });
    }
    
    // 合并种群
    const combinedPopulation = [...population, ...offspring];
    
    // 非支配排序
    const fronts = nonDominatedSorting(combinedPopulation);
    
    // 选择新种群
    population = [];
    let frontIndex = 0;
    while (population.length + fronts[frontIndex].length <= problem.populationSize) {
      // 计算拥挤距离 (增强版)
      calculateCrowdingDistanceEnhanced(fronts[frontIndex], problem.objectives.length);
      population = [...population, ...fronts[frontIndex]];
      frontIndex++;
    }
    
    // 处理最后一个前沿
    if (population.length < problem.populationSize) {
      calculateCrowdingDistanceEnhanced(fronts[frontIndex], problem.objectives.length);
      fronts[frontIndex].sort((a, b) => b.crowdingDistance - a.crowdingDistance);
      const remaining = problem.populationSize - population.length;
      population = [...population, ...fronts[frontIndex].slice(0, remaining)];
    }
  }
  
  return population;
};

// 锦标赛选择
const tournamentSelection = (population: MultiObjectiveSolution[], tournamentSize: number): MultiObjectiveSolution => {
  let best = population[Math.floor(Math.random() * population.length)];
  for (let i = 1; i < tournamentSize; i++) {
    const competitor = population[Math.floor(Math.random() * population.length)];
    if (isBetter(competitor, best)) {
      best = competitor;
    }
  }
  return best;
};

// 增强版锦标赛选择
const tournamentSelectionEnhanced = (population: any[], tournamentSize: number): any => {
  let best = population[Math.floor(Math.random() * population.length)];
  for (let i = 1; i < tournamentSize; i++) {
    const competitor = population[Math.floor(Math.random() * population.length)];
    if (isBetterSolution(competitor, best)) {
      best = competitor;
    }
  }
  return best;
};

// 非支配排序
const nonDominatedSorting = (population: MultiObjectiveSolution[]): MultiObjectiveSolution[][] => {
  const fronts: MultiObjectiveSolution[][] = [];
  const dominatedCounts: number[] = new Array(population.length).fill(0);
  const dominatedSolutions: number[][] = new Array(population.length).fill(0).map(() => []);
  
  // 计算支配关系
  for (let i = 0; i < population.length; i++) {
    for (let j = 0; j < population.length; j++) {
      if (i !== j) {
        if (dominates(population[i], population[j])) {
          dominatedSolutions[i].push(j);
        } else if (dominates(population[j], population[i])) {
          dominatedCounts[i]++;
        }
      }
    }
  }
  
  // 构建前沿
  while (true) {
    const currentFront: MultiObjectiveSolution[] = [];
    for (let i = 0; i < population.length; i++) {
      if (dominatedCounts[i] === 0) {
        currentFront.push(population[i]);
        dominatedCounts[i] = -1; // 标记为已处理
      }
    }
    
    if (currentFront.length === 0) break;
    
    currentFront.forEach((solution) => {
      solution.rank = fronts.length;
    });
    
    fronts.push(currentFront);
    
    // 更新支配计数
    currentFront.forEach((solution) => {
      const solutionIndex = population.indexOf(solution);
      dominatedSolutions[solutionIndex].forEach(dominatedIndex => {
        if (dominatedCounts[dominatedIndex] > 0) {
          dominatedCounts[dominatedIndex]--;
        }
      });
    });
  }
  
  return fronts;
};



// 支配关系判断
const dominates = (a: MultiObjectiveSolution, b: MultiObjectiveSolution): boolean => {
  let betterInAtLeastOne = false;
  for (let i = 0; i < a.objectiveValues.length; i++) {
    if (a.objectiveValues[i] > b.objectiveValues[i]) {
      return false;
    }
    if (a.objectiveValues[i] < b.objectiveValues[i]) {
      betterInAtLeastOne = true;
    }
  }
  return betterInAtLeastOne;
};

// 比较两个解的优劣
const isBetter = (a: MultiObjectiveSolution, b: MultiObjectiveSolution): boolean => {
  if (a.rank < b.rank) return true;
  if (a.rank > b.rank) return false;
  return a.crowdingDistance > b.crowdingDistance;
};

// 多点交叉
const multiPointCrossover = (parent1: number[], parent2: number[]): number[] => {
  const child = [...parent1];
  const crossoverPoints = [];
  
  // 生成2-3个交叉点
  const numPoints = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < numPoints; i++) {
    crossoverPoints.push(Math.floor(Math.random() * parent1.length));
  }
  
  // 排序交叉点
  crossoverPoints.sort((a, b) => a - b);
  
  // 执行交叉
  let takeFromParent2 = true;
  for (let i = 0; i < parent1.length; i++) {
    if (crossoverPoints.includes(i)) {
      takeFromParent2 = !takeFromParent2;
    }
    if (takeFromParent2) {
      child[i] = parent2[i];
    }
  }
  
  return child;
};

// 增强版拥挤距离计算
const calculateCrowdingDistanceEnhanced = (front: MultiObjectiveSolution[], objectiveCount: number) => {
  // 初始化拥挤距离
  front.forEach(solution => {
    solution.crowdingDistance = 0;
  });
  
  // 对每个目标进行排序
  for (let objIndex = 0; objIndex < objectiveCount; objIndex++) {
    front.sort((a, b) => a.objectiveValues[objIndex] - b.objectiveValues[objIndex]);
    
    // 边界解设置为无穷大
    front[0].crowdingDistance = Infinity;
    front[front.length - 1].crowdingDistance = Infinity;
    
    // 计算中间解的拥挤距离 (增强版)
    for (let i = 1; i < front.length - 1; i++) {
      const prev = front[i - 1].objectiveValues[objIndex];
      const next = front[i + 1].objectiveValues[objIndex];
      const range = front[front.length - 1].objectiveValues[objIndex] - front[0].objectiveValues[objIndex];
      if (range > 0) {
        // 加权拥挤距离
        const weight = 1 + 0.1 * Math.abs(i - front.length / 2) / (front.length / 2);
        front[i].crowdingDistance += (next - prev) / range * weight;
      }
    }
  }
};

// 混合优化算法 - 结合遗传算法和粒子群优化 (增强版)
export const hybridOptimization = (params: {
  objectives: ((solution: any) => number)[];
  constraints: ((solution: any) => boolean)[];
  variableRanges: { min: number; max: number }[];
  populationSize: number;
  generations: number;
  gaProbability: number; // 遗传算法概率
  psoProbability: number; // 粒子群优化概率
}) => {
  const { objectives, constraints, variableRanges, populationSize, generations, gaProbability, psoProbability } = params;
  
  // 初始化粒子群 (增强版)
  const particles = [];
  for (let i = 0; i < populationSize; i++) {
    // 初始化位置 - 均匀分布
    const position = variableRanges.map(range => {
      // 均匀分布初始化
      return range.min + Math.random() * (range.max - range.min);
    });
    const velocity = variableRanges.map(() => (Math.random() - 0.5) * 2);
    const fitness = objectives.map(obj => obj(position));
    const feasible = constraints.every(constraint => constraint(position));
    
    particles.push({
      position,
      velocity,
      bestPosition: [...position],
      bestFitness: [...fitness],
      fitness,
      feasible,
      age: 0 // 增加年龄属性
    });
  }
  
  // 全局最优
  let globalBest = particles.reduce((best, particle) => {
    return isBetterSolution(particle, best) ? particle : best;
  });
  
  // 主优化循环
  for (let gen = 0; gen < generations; gen++) {
    // 自适应参数调整
    const adaptiveW = 0.9 - 0.5 * (gen / generations); // 惯性权重递减
    const adaptiveC1 = 2.5 - 1.0 * (gen / generations); // 认知系数递减
    const adaptiveC2 = 0.5 + 1.0 * (gen / generations); // 社会系数递增
    
    for (let i = 0; i < populationSize; i++) {
      const particle = particles[i];
      particle.age++;
      
      // 算法选择概率随迭代调整
      const currentGaProbability = gaProbability * (1 - gen / (2 * generations));
      const currentPsoProbability = psoProbability * (1 + gen / (2 * generations));
      
      // 随机选择算法
      if (Math.random() < currentGaProbability) {
        // 使用遗传算法操作 (增强版)
        const parent1 = tournamentSelectionEnhanced(particles, 3);
        const parent2 = tournamentSelectionEnhanced(particles, 3);
        
        // 多点交叉
        const newPosition = multiPointCrossover(parent1.position, parent2.position);
        
        // 自适应变异
        const mutationRate = 0.1 * (1 + 0.5 * Math.sin(gen / generations * Math.PI));
        for (let j = 0; j < newPosition.length; j++) {
          if (Math.random() < mutationRate) {
            const range = variableRanges[j];
            // 高斯变异
            const mutationStep = (range.max - range.min) * 0.1;
            newPosition[j] += (Math.random() - 0.5) * mutationStep;
            // 边界处理
            newPosition[j] = Math.max(range.min, Math.min(range.max, newPosition[j]));
          }
        }
        
        particle.position = newPosition;
        particle.age = 0; // 重置年龄
      } else if (Math.random() < currentPsoProbability) {
        // 使用粒子群优化 (增强版)
        for (let j = 0; j < variableRanges.length; j++) {
          const r1 = Math.random();
          const r2 = Math.random();
          
          // 自适应惯性权重
          const w = adaptiveW;
          const c1 = adaptiveC1;
          const c2 = adaptiveC2;
          
          // 速度更新
          particle.velocity[j] = w * particle.velocity[j] + 
                               c1 * r1 * (particle.bestPosition[j] - particle.position[j]) + 
                               c2 * r2 * (globalBest.bestPosition[j] - particle.position[j]);
          
          // 速度限制
          const maxVelocity = (variableRanges[j].max - variableRanges[j].min) * 0.1;
          particle.velocity[j] = Math.max(-maxVelocity, Math.min(maxVelocity, particle.velocity[j]));
          
          // 更新位置
          particle.position[j] += particle.velocity[j];
          
          // 边界处理
          const range = variableRanges[j];
          particle.position[j] = Math.max(range.min, Math.min(range.max, particle.position[j]));
        }
      }
      
      // 计算新的适应度
      const newFitness = objectives.map(obj => obj(particle.position));
      const newFeasible = constraints.every(constraint => constraint(particle.position));
      
      // 更新个体最优
      if (isBetterFitness(newFitness, particle.bestFitness)) {
        particle.bestPosition = [...particle.position];
        particle.bestFitness = [...newFitness];
      }
      
      particle.fitness = newFitness;
      particle.feasible = newFeasible;
      
      // 更新全局最优
      if (isBetterSolution(particle, globalBest)) {
        globalBest = { ...particle };
      }
      
      // 粒子老化处理
      if (particle.age > generations / 10) {
        // 重新初始化老化粒子
        particle.position = variableRanges.map(range => 
          range.min + Math.random() * (range.max - range.min)
        );
        particle.velocity = variableRanges.map(() => (Math.random() - 0.5) * 2);
        particle.age = 0;
      }
    }
  }
  
  return {
    bestSolution: globalBest.bestPosition,
    bestFitness: globalBest.bestFitness,
    population: particles,
    algorithm: 'Hybrid GA-PSO'
  };
};

// 比较解的优劣
const isBetterSolution = (a: any, b: any): boolean => {
  if (!a.feasible && b.feasible) return false;
  if (a.feasible && !b.feasible) return true;
  return isBetterFitness(a.fitness, b.fitness);
};

// 比较适应度的优劣
const isBetterFitness = (a: number[], b: number[]): boolean => {
  let betterInAtLeastOne = false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] > b[i]) {
      return false;
    }
    if (a[i] < b[i]) {
      betterInAtLeastOne = true;
    }
  }
  return betterInAtLeastOne;
};

// 智能决策支持系统
export class DecisionSupportSystem {
  private historicalData: any[] = [];
  private currentScenario: any = null;
  
  // 添加历史数据
  addHistoricalData(data: any) {
    this.historicalData.push(data);
  }
  
  // 设置当前场景
  setCurrentScenario(scenario: any) {
    this.currentScenario = scenario;
  }
  
  // 生成决策建议
  generateRecommendations() {
    if (!this.currentScenario) {
      return { error: 'No current scenario set' };
    }
    
    // 基于历史数据和当前场景生成建议
    const similarScenarios = this.findSimilarScenarios(this.currentScenario, 5);
    const recommendations = this.analyzeScenarios(similarScenarios);
    
    return {
      recommendations,
      confidence: this.calculateConfidence(similarScenarios),
      expectedOutcomes: this.predictOutcomes(this.currentScenario)
    };
  }
  
  // 查找相似场景
  private findSimilarScenarios(scenario: any, k: number) {
    return this.historicalData
      .map(data => ({
        data,
        similarity: this.calculateSimilarity(scenario, data)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k)
      .map(item => item.data);
  }
  
  // 计算相似度
  private calculateSimilarity(a: any, b: any): number {
    // 简单的欧几里得距离
    const keys = Object.keys(a).filter(key => typeof a[key] === 'number');
    let sum = 0;
    for (const key of keys) {
      if (b[key] !== undefined) {
        sum += Math.pow(a[key] - b[key], 2);
      }
    }
    return 1 / (1 + Math.sqrt(sum));
  }
  
  // 分析场景
  private analyzeScenarios(scenarios: any[]) {
    // 基于相似场景的分析生成建议
    const recommendations = [];
    
    // 示例分析
    if (scenarios.length > 0) {
      const avgCost = scenarios.reduce((sum, s) => sum + (s.cost || 0), 0) / scenarios.length;
      const avgEfficiency = scenarios.reduce((sum, s) => sum + (s.efficiency || 0), 0) / scenarios.length;
      
      if (this.currentScenario.cost > avgCost * 1.1) {
        recommendations.push('成本高于历史平均水平，建议优化设备选型');
      }
      
      if (this.currentScenario.efficiency < avgEfficiency * 0.9) {
        recommendations.push('效率低于历史平均水平，建议优化系统配置');
      }
    }
    
    return recommendations;
  }
  
  // 计算置信度
  private calculateConfidence(scenarios: any[]): number {
    if (scenarios.length === 0) return 0;
    return Math.min(1, scenarios.length / 5);
  }
  
  // 预测结果
  private predictOutcomes(scenario: any): any {
    // 基于历史数据预测结果
    return {
      expectedCost: scenario.cost * 0.95,
      expectedEfficiency: scenario.efficiency * 1.05,
      expectedLifetime: 25
    };
  }
}

// 算法性能评估
export const evaluateAlgorithmPerformance = (algorithm: string, results: any[]) => {
  const objectives = results.map(r => r.objectiveValues);
  const times = results.map(r => r.time);
  
  // 计算统计指标
  const meanObjective = objectives[0].map((_: any, i: number) => 
    objectives.reduce((sum: number, obj: number[]) => sum + obj[i], 0) / objectives.length
  );
  
  const stdObjective = objectives[0].map((_: any, i: number) => {
    const mean = meanObjective[i];
    const variance = objectives.reduce((sum: number, obj: number[]) => sum + Math.pow(obj[i] - mean, 2), 0) / objectives.length;
    return Math.sqrt(variance);
  });
  
  const meanTime = times.reduce((sum, time) => sum + time, 0) / times.length;
  const stdTime = Math.sqrt(
    times.reduce((sum, time) => sum + Math.pow(time - meanTime, 2), 0) / times.length
  );
  
  return {
    algorithm,
    meanObjective,
    stdObjective,
    meanTime,
    stdTime,
    bestObjective: objectives.reduce((best, obj) => 
      isBetterFitness(obj, best) ? obj : best
    ),
    worstObjective: objectives.reduce((worst, obj) => 
      isBetterFitness(worst, obj) ? worst : obj
    )
  };
};

// 面板布局优化
export const optimizePanelLayout = (params: {
  areaWidth: number;
  areaHeight: number;
  panelWidth: number;
  panelHeight: number;
  maxPanels: number;
  terrainData: any;
}) => {
  const { areaWidth, areaHeight, panelWidth, panelHeight, maxPanels, terrainData } = params;
  
  // 定义多目标优化问题
  const problem: MultiObjectiveProblem = {
    objectives: [
      // 最大化发电量
      (solution) => {
        const panels = decodePanelLayout(solution, areaWidth, areaHeight, panelWidth, panelHeight);
        return -calculateTotalPower(panels, terrainData); // 最小化负值
      },
      // 最小化占地面积
      (solution) => {
        const panels = decodePanelLayout(solution, areaWidth, areaHeight, panelWidth, panelHeight);
        return calculateArea(panels);
      },
      // 最小化电缆长度
      (solution) => {
        const panels = decodePanelLayout(solution, areaWidth, areaHeight, panelWidth, panelHeight);
        return calculateCableLength(panels);
      }
    ],
    constraints: [
      // 不超出区域
      (solution) => {
        const panels = decodePanelLayout(solution, areaWidth, areaHeight, panelWidth, panelHeight);
        return panels.every(panel => 
          panel.x >= 0 && 
          panel.y >= 0 && 
          panel.x + panelWidth <= areaWidth && 
          panel.y + panelHeight <= areaHeight
        );
      },
      // 面板数量限制
      (solution) => {
        const panels = decodePanelLayout(solution, areaWidth, areaHeight, panelWidth, panelHeight);
        return panels.length <= maxPanels;
      },
      // 面板不重叠
      (solution) => {
        const panels = decodePanelLayout(solution, areaWidth, areaHeight, panelWidth, panelHeight);
        for (let i = 0; i < panels.length; i++) {
          for (let j = i + 1; j < panels.length; j++) {
            if (doPanelsOverlap(panels[i], panels[j], panelWidth, panelHeight)) {
              return false;
            }
          }
        }
        return true;
      }
    ],
    variableRanges: Array(maxPanels * 2).fill({ min: 0, max: 1 }), // 每个面板的x和y坐标（归一化）
    populationSize: 50,
    generations: 100,
    crossoverRate: 0.8,
    mutationRate: 0.1
  };
  
  // 运行NSGA-II算法
  const solutions = nsga2(problem);
  
  // 选择最优解
  const bestSolution = solutions.sort((a, b) => a.rank - b.rank)[0];
  const optimizedPanels = decodePanelLayout(bestSolution.variables, areaWidth, areaHeight, panelWidth, panelHeight);
  
  return {
    panels: optimizedPanels,
    totalPower: calculateTotalPower(optimizedPanels, terrainData),
    area: calculateArea(optimizedPanels),
    cableLength: calculateCableLength(optimizedPanels),
    algorithm: 'NSGA-II',
    status: 'optimal'
  };
};

// 解码面板布局
const decodePanelLayout = (solution: number[], areaWidth: number, areaHeight: number, panelWidth: number, panelHeight: number): Panel[] => {
  const panels: Panel[] = [];
  for (let i = 0; i < solution.length; i += 2) {
    const x = solution[i] * (areaWidth - panelWidth);
    const y = solution[i + 1] * (areaHeight - panelHeight);
    panels.push({
      id: `panel-${i/2}`,
      x,
      y,
      width: panelWidth,
      height: panelHeight,
      power: 0.35, // 假设每个面板350W
      angle: 30 // 假设固定角度
    });
  }
  return panels;
};

// 计算总发电量
const calculateTotalPower = (panels: Panel[], terrainData: any): number => {
  return panels.reduce((total, panel) => {
    // 简单计算，实际应考虑地形、光照等因素
    const x = Math.floor(panel.x);
    const y = Math.floor(panel.y);
    const solarRadiation = terrainData.solarRadiation?.[y]?.[x] || 1000;
    return total + panel.power * (solarRadiation / 1000);
  }, 0);
};

// 计算占地面积
const calculateArea = (panels: Panel[]): number => {
  if (panels.length === 0) return 0;
  
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;
  
  panels.forEach(panel => {
    minX = Math.min(minX, panel.x);
    minY = Math.min(minY, panel.y);
    maxX = Math.max(maxX, panel.x + panel.width);
    maxY = Math.max(maxY, panel.y + panel.height);
  });
  
  return (maxX - minX) * (maxY - minY);
};

// 计算电缆长度
const calculateCableLength = (panels: Panel[]): number => {
  if (panels.length === 0) return 0;
  
  // 简单计算，假设从原点到所有面板的距离之和
  return panels.reduce((total, panel) => {
    return total + Math.sqrt(panel.x * panel.x + panel.y * panel.y);
  }, 0);
};

// 检查面板是否重叠
const doPanelsOverlap = (panel1: Panel, panel2: Panel, panelWidth: number, panelHeight: number): boolean => {
  return (
    panel1.x < panel2.x + panelWidth &&
    panel1.x + panelWidth > panel2.x &&
    panel1.y < panel2.y + panelHeight &&
    panel1.y + panelHeight > panel2.y
  );
};

// 电缆路由优化
export const optimizeCableRouting = (params: {
  nodes: { id: string; x: number; y: number }[];
  cables: CableRoute[];
  terrainData: any;
}) => {
  const { nodes, cables, terrainData } = params;
  
  // 定义多目标优化问题
  const problem: MultiObjectiveProblem = {
    objectives: [
      // 最小化总电缆长度
      (solution) => {
        const routes = decodeCableRoutes(solution, nodes, cables);
        return calculateTotalCableLength(routes);
      },
      // 最小化挖沟长度
      (solution) => {
        const routes = decodeCableRoutes(solution, nodes, cables);
        return calculateTotalTrenchLength(routes);
      },
      // 最小化成本
      (solution) => {
        const routes = decodeCableRoutes(solution, nodes, cables);
        return calculateTotalCost(routes, terrainData);
      }
    ],
    constraints: [
      // 所有节点必须连接
      (solution) => {
        const routes = decodeCableRoutes(solution, nodes, cables);
        return allNodesConnected(routes, nodes.map(n => n.id));
      }
    ],
    variableRanges: Array(cables.length * 2).fill({ min: 0, max: 1 }), // 每个电缆的路径参数
    populationSize: 30,
    generations: 50,
    crossoverRate: 0.7,
    mutationRate: 0.1
  };
  
  // 运行NSGA-II算法
  const solutions = nsga2(problem);
  
  // 选择最优解
  const bestSolution = solutions.sort((a, b) => a.rank - b.rank)[0];
  const optimizedRoutes = decodeCableRoutes(bestSolution.variables, nodes, cables);
  
  return {
    routes: optimizedRoutes,
    totalLength: calculateTotalCableLength(optimizedRoutes),
    trenchLength: calculateTotalTrenchLength(optimizedRoutes),
    totalCost: calculateTotalCost(optimizedRoutes, terrainData),
    algorithm: 'NSGA-II',
    status: 'optimal'
  };
};

// 解码电缆路由
const decodeCableRoutes = (solution: number[], nodes: any[], cables: CableRoute[]): CableRoute[] => {
  return cables.map((cable, index) => {
    const fromNode = nodes.find(n => n.id === cable.from);
    const toNode = nodes.find(n => n.id === cable.to);
    
    if (!fromNode || !toNode) return cable;
    
    // 简单的路径生成
    const t1 = solution[index * 2];
    const t2 = solution[index * 2 + 1];
    
    const path = [
      { x: fromNode.x, y: fromNode.y },
      { 
        x: fromNode.x + (toNode.x - fromNode.x) * t1,
        y: fromNode.y + (toNode.y - fromNode.y) * t1
      },
      { 
        x: fromNode.x + (toNode.x - fromNode.x) * t2,
        y: fromNode.y + (toNode.y - fromNode.y) * t2
      },
      { x: toNode.x, y: toNode.y }
    ];
    
    return {
      ...cable,
      path
    };
  });
};

// 计算总电缆长度
const calculateTotalCableLength = (routes: CableRoute[]): number => {
  return routes.reduce((total, route) => {
    let length = 0;
    for (let i = 1; i < route.path.length; i++) {
      const prev = route.path[i - 1];
      const curr = route.path[i];
      length += Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));
    }
    return total + length;
  }, 0);
};

// 计算总挖沟长度
const calculateTotalTrenchLength = (routes: CableRoute[]): number => {
  // 简单计算，实际应考虑共沟情况
  return calculateTotalCableLength(routes) * 0.8; // 假设80%的路径可以共沟
};

// 计算总成本
const calculateTotalCost = (routes: CableRoute[], terrainData: any): number => {
  return routes.reduce((total, route) => {
    let cost = 0;
    for (let i = 1; i < route.path.length; i++) {
      const prev = route.path[i - 1];
      const curr = route.path[i];
      const length = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));
      
      // 基于地形的成本计算
      const midX = Math.floor((prev.x + curr.x) / 2);
      const midY = Math.floor((prev.y + curr.y) / 2);
      const slope = terrainData.slope?.[midY]?.[midX] || 0;
      const soilCostFactor = 1 + slope * 0.1; // 坡度越大，成本越高
      
      cost += length * 10 * soilCostFactor; // 假设每米10元基础成本
    }
    return total + cost;
  }, 0);
};

// 检查所有节点是否连接
const allNodesConnected = (routes: CableRoute[], nodeIds: string[]): boolean => {
  // 简单的连通性检查
  const connectedNodes = new Set<string>();
  
  routes.forEach(route => {
    connectedNodes.add(route.from);
    connectedNodes.add(route.to);
  });
  
  return nodeIds.every(id => connectedNodes.has(id));
};
