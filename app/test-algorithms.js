// 测试算法实现的正确性
const { nsga2, hybridOptimization } = require('./src/utils/advancedAlgorithms.ts');

// 测试NSGA-II算法
console.log('Testing NSGA-II algorithm...');
try {
  const testProblem = {
    objectives: [
      (x) => x.reduce((sum, val) => sum + val * val, 0),
      (x) => (x[0] - 1) * (x[0] - 1) + x.slice(1).reduce((sum, val) => sum + val * val, 0),
      (x) => x.reduce((sum, val, idx) => sum + (val - idx) * (val - idx), 0)
    ],
    constraints: [
      (x) => x[0] >= 0,
      (x) => x[1] >= 0,
      (x) => x.reduce((sum, val) => sum + val, 0) <= 10
    ],
    variableRanges: Array(5).fill({ min: 0, max: 5 }),
    populationSize: 50,
    generations: 100,
    crossoverRate: 0.8,
    mutationRate: 0.1
  };
  
  const nsga2Results = nsga2(testProblem);
  console.log('NSGA-II test passed!');
  console.log(`Found ${nsga2Results.length} solutions`);
  console.log('Best solution objectives:', nsga2Results[0].objectiveValues);
} catch (error) {
  console.error('NSGA-II test failed:', error);
}

// 测试混合优化算法
console.log('\nTesting Hybrid Optimization algorithm...');
try {
  const testProblem = {
    objectives: [
      (x) => x.reduce((sum, val) => sum + val * val, 0),
      (x) => (x[0] - 1) * (x[0] - 1) + x.slice(1).reduce((sum, val) => sum + val * val, 0)
    ],
    constraints: [
      (x) => x[0] >= 0,
      (x) => x[1] >= 0
    ],
    variableRanges: Array(5).fill({ min: 0, max: 5 }),
    populationSize: 50,
    generations: 100,
    gaProbability: 0.5,
    psoProbability: 0.5
  };
  
  const hybridResults = hybridOptimization(testProblem);
  console.log('Hybrid Optimization test passed!');
  console.log('Best solution:', hybridResults.bestSolution);
  console.log('Best fitness:', hybridResults.bestFitness);
} catch (error) {
  console.error('Hybrid Optimization test failed:', error);
}

console.log('\nAlgorithm tests completed!');
