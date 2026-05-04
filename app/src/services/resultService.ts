import apiClient from './apiClient';

export interface JobStatus {
  id: number;
  status: string;
  progress: number;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}

const resultService = {
  getModule1: async (instanceId: string) => {
    const res = await apiClient.get(`/results/${instanceId}`);
    console.log('获取模块1结果响应:', res);
    if (res && res.status === 'success' && res.data && res.data.module1) {
      return res.data.module1;
    } else {
      console.error('后端API响应格式错误:', res);
      throw new Error('后端API响应格式错误');
    }
  },

  getModule2: async (instanceId: string) => {
    const res = await apiClient.get(`/results/${instanceId}`);
    console.log('获取模块2结果响应:', res);
    if (res && res.status === 'success' && res.data && res.data.module2) {
      return res.data.module2;
    } else {
      console.error('后端API响应格式错误:', res);
      throw new Error('后端API响应格式错误');
    }
  },

  getModule3: async (instanceId: string) => {
    const res = await apiClient.get(`/results/${instanceId}`);
    console.log('获取模块3结果响应:', res);
    if (res && res.status === 'success' && res.data && res.data.module3) {
      return res.data.module3;
    } else {
      console.error('后端API响应格式错误:', res);
      throw new Error('后端API响应格式错误');
    }
  },

  getSummary: async (instanceId: string) => {
    const res = await apiClient.get(`/results/${instanceId}`);
    console.log('获取结果摘要响应:', res);
    if (res && res.status === 'success' && res.data) {
      return res.data;
    } else {
      console.error('后端API响应格式错误:', res);
      throw new Error('后端API响应格式错误');
    }
  },

  getAll: async (instanceId: string) => {
    const res = await apiClient.get(`/results/${instanceId}`);
    console.log('获取所有结果响应:', res);
    if (res && res.status === 'success' && res.data) {
      return res.data;
    } else {
      console.error('后端API响应格式错误:', res);
      throw new Error('后端API响应格式错误');
    }
  },

  startComputation: async (instanceId: string, maxIter: number = 10): Promise<JobStatus> => {
    // 使用算法API调用优化
    const res = await apiClient.postAlgorithm('/optimize', { 
      instance_id: instanceId, 
      use_dqn: true, 
      max_iter: maxIter, 
      verbose: false 
    });
    console.log('开始计算响应:', res);
    if (res && res.status === 'success' && res.data) {
      return {
        id: 1,
        status: 'completed',
        progress: 100,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      };
    } else {
      console.error('后端API响应格式错误:', res);
      throw new Error('后端API响应格式错误');
    }
  },

  getJobStatus: async (jobId: number): Promise<JobStatus> => {
    // 由于后端没有提供作业状态查询端点，直接返回完成状态
    return {
      id: jobId,
      status: 'completed',
      progress: 100,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    };
  },
};

export default resultService;