import apiClient from './apiClient';

interface InstanceInfo {
  id: number;
  name: string;
  instance_id: string;
  n_nodes: number;
  status: string;
  created_at: string;
  available_modules?: number[];
}

interface PreloadedInstance {
  instance_id: string;
  has_results: number[];
}

const instanceService = {
  list: async (): Promise<InstanceInfo[]> => {
    const res = await apiClient.get('/instances');
    console.log('获取算例列表响应:', res);
    // 后端返回格式: {status: "success", data: [...]}
    if (res && res.status === 'success' && res.data) {
      return res.data;
    } else {
      console.error('后端API响应格式错误:', res);
      throw new Error('后端API响应格式错误');
    }
  },

  listPreloaded: async (): Promise<PreloadedInstance[]> => {
    const res = await apiClient.get('/instances/preloaded-list');
    console.log('获取预加载算例列表响应:', res);
    // 后端返回格式: {status: "success", data: [...]}
    if (res && res.status === 'success' && res.data) {
      return res.data;
    } else {
      console.error('后端API响应格式错误:', res);
      throw new Error('后端API响应格式错误');
    }
  },

  importPreloaded: async (instanceId: string): Promise<InstanceInfo> => {
    const res = await apiClient.post('/instances/preloaded', { instance_id: instanceId });
    console.log('导入预加载算例响应:', res);
    // 后端返回格式: {status: "success", data: {...}}
    if (res && res.status === 'success' && res.data) {
      return res.data;
    } else {
      console.error('后端API响应格式错误:', res);
      throw new Error('后端API响应格式错误');
    }
  },

  upload: async (file: File): Promise<InstanceInfo> => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await apiClient.post('/instances/upload', fd);
    console.log('上传算例响应:', res);
    // 后端返回格式: {status: "success", data: {...}}
    if (res && res.status === 'success' && res.data) {
      return res.data;
    } else {
      console.error('后端API响应格式错误:', res);
      throw new Error('后端API响应格式错误');
    }
  },

  get: async (instanceId: string): Promise<any> => {
    const res = await apiClient.get(`/instances/${instanceId}`);
    console.log('获取算例详情响应:', res);
    // 后端返回格式: {status: "success", data: {...}}
    if (res && res.status === 'success' && res.data) {
      // 将 processed_data 的内容展开到顶层，方便前端使用
      const data = res.data;
      if (data.processed_data) {
        return {
          ...data,
          // 顶层已有字段保留，同时从 processed_data 展开常用字段
          instance_info: data.processed_data.instance_info,
          terrain_data: data.processed_data.terrain_data,
          pva_list: data.processed_data.pva_list,
          pva_params: data.processed_data.pva_params,
          equipment_params: data.processed_data.equipment_params,
          loss_params: data.processed_data.loss_params,
          dist_matrix: data.processed_data.dist_matrix,
          constraint_info: data.processed_data.constraint_info,
        };
      }
      return data;
    } else {
      console.error('后端API响应格式错误:', res);
      throw new Error('后端API响应格式错误');
    }
  },

  delete: async (instanceId: string): Promise<any> => {
    const res = await apiClient.delete(`/instances/${instanceId}`);
    // 后端返回格式: {status: "success", data: {...}} 或 {status: "success", message: "..."}
    if (res && res.status === 'success') {
      return res;
    } else {
      console.error('后端API响应格式错误:', res);
      throw new Error('后端API响应格式错误');
    }
  },
};

export default instanceService;