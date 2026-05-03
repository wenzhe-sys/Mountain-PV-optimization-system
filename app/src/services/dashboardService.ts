import { apiClient } from './apiClient';

// 获取后端仪表盘指标数据
const fetchDashboardMetrics = async (instanceId: string = 'r1'): Promise<any> => {
  try {
    const response = await apiClient.post(`/dashboard-metrics?instance_id=${instanceId}`);
    if (response && response.status === 'success' && response.data) {
      return response.data;
    }
    // 如果响应格式不对，返回null以使用mock数据
    return null;
  } catch (error) {
    // API不可用时返回null，使用mock数据
    console.warn('后端API不可用，将使用本地数据');
    return null;
  }
};

export default {
  fetchDashboardMetrics
};
