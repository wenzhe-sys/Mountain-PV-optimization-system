import apiClient from './apiClient';

// 优化请求参数接口
export interface OptimizationRequest {
  instance_id: string;
  use_dqn: boolean;
  max_iter: number;
  verbose: boolean;
  fast_mode: boolean;
}

export interface OptimizationResult {
  status?: string;
  module1_output: any;
  module2_output: any;
  module3_output: any;
  metrics: {
    coverage_rate: number;
    trench_optimization_rate: number;
    constraint_satisfaction: number;
    efficiency: number;
    reliability: number;
    pareto_solutions: number;
    total_cost: number;
    lcoe?: number;
  };
}

export interface InstanceList {
  status: string;
  data: string[];
}

export interface ResultsResponse {
  status: string;
  data: {
    module1: any;
    module2: any;
    module3: any;
  };
}

export const optimizationService = {
  /**
   * 运行光伏电站设计优化
   */
  runOptimization: async (params: OptimizationRequest): Promise<OptimizationResult> => {
    console.log('发送优化请求:', '/api/optimize', params);
    
    try {
      const response = await apiClient.post('/optimize', params);
      console.log('后端API响应:', response);
      console.log('响应类型:', typeof response);
      console.log('响应keys:', response ? Object.keys(response) : 'response为空');
      
      if (!response) {
        console.error('后端API响应为空');
        throw new Error('后端API响应为空');
      }
      
      // 情况1: 后端返回 {status: "success", data: {...}}
      if (response.status === 'success' && response.data) {
        console.log('优化结果数据:', response.data);
        console.log('data类型:', typeof response.data);
        console.log('data keys:', response.data ? Object.keys(response.data) : 'data为空');
        return response.data;
      }
      // 情况2: 后端返回任务提交状态，需要轮询任务结果
      else if (response.status === 'task_submitted') {
        console.log('任务已提交，task_id:', response.task_id, '开始轮询...');
        // 轮询任务状态，最多等待5分钟
        const maxAttempts = 60;
        const intervalMs = 5000;
        for (let i = 0; i < maxAttempts; i++) {
          await new Promise(resolve => setTimeout(resolve, intervalMs));
          try {
            const taskStatus = await apiClient.get(`/api/task/${response.task_id}`);
            console.log(`轮询 ${i + 1}/${maxAttempts}:`, taskStatus);
            // 检查 task_status 或 status 字段
            const taskStatusValue = taskStatus.task_status || taskStatus.status;
            if (taskStatusValue === 'completed') {
              console.log('任务完成，获取到结果:', taskStatus.result);
              return taskStatus.result;
            }
            if (taskStatusValue === 'failed') {
              throw new Error('任务执行失败');
            }
          } catch (error) {
            console.warn(`轮询失败:`, error);
          }
        }
        throw new Error('任务超时未完成');
      }
      // 情况3: 后端直接返回优化结果数据
      else if (response.module1_output || response.module2_output || response.module3_output || response.metrics) {
        console.log('优化结果数据 (直接返回):', response);
        return response;
      }
      // 情况4: 后端返回的是完整的优化结果，但没有status字段
      else {
        console.log('优化结果数据 (完整结果):', response);
        console.log('返回结果:', response);
        return response;
      }
    } catch (error) {
      console.error('优化请求失败:', error);
      throw error;
    }
  },

  /**
   * 获取可用的算例列表
   */
  getInstances: async (): Promise<string[]> => {
    const response = await apiClient.get('/instances');
    console.log('获取算例列表响应:', response);
    // 检查后端返回格式
    if (Array.isArray(response)) {
      // 后端直接返回字符串数组
      return response;
    } else if (response && response.status === 'success' && response.data) {
      // 后端返回 {status: "success", data: [...]}
      if (Array.isArray(response.data)) {
        // 检查data数组中的元素类型
        if (response.data.length > 0 && typeof response.data[0] === 'string') {
          // data是字符串数组
          return response.data;
        } else {
          // data是对象数组，每个对象有instance_id属性
          return response.data.map((instance: any) => instance.instance_id);
        }
      }
    }
    console.error('后端API响应格式错误:', response);
    throw new Error('后端API响应格式错误');
  },

  /**
   * 获取指定算例的优化结果
   */
  getResults: async (instance_id: string): Promise<ResultsResponse['data']> => {
    const response = await apiClient.get(`/api/results/${instance_id}`);
    console.log('获取优化结果响应:', response);
    // 后端返回格式: {status: "success", data: {...}}
    if (response && response.status === 'success' && response.data) {
      return response.data;
    } else {
      console.error('后端API响应格式错误:', response);
      throw new Error('后端API响应格式错误');
    }
  },

  /**
   * 健康检查
   */
  healthCheck: async (): Promise<{ status: string; message: string }> => {
    const response = await apiClient.get('/health');
    console.log('健康检查响应:', response);
    if (response) {
      return response;
    } else {
      console.error('后端API响应格式错误:', response);
      throw new Error('后端API响应格式错误');
    }
  },
};

export default optimizationService;