import { apiClient } from './apiClient';

// 获取后端成本分析数据
const fetchCostAnalysis = async (instanceId: string = 'r1'): Promise<any> => {
  try {
    const response = await apiClient.post(`/api/cost-analysis?instance_id=${instanceId}`);
    if (response && response.status === 'success' && response.data) {
      return response.data;
    }
    throw new Error('获取成本分析数据失败');
  } catch (error) {
    console.error('获取成本分析数据失败:', error);
    return null;
  }
};

export default {
  fetchCostAnalysis
};
