const API_URL = '/api';
const ALGORITHM_URL = '/algorithm';

// 缓存机制
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

// 请求队列，用于合并相同的请求
const requestQueue: Record<string, Promise<any>> = {};

async function request(baseUrl: string, path: string, options: RequestInit = {}, useCache: boolean = true): Promise<any> {
  // 生成请求键
  const requestKey = `${options.method || 'GET'}_${baseUrl}${path}_${options.body ? JSON.stringify(options.body) : ''}`;
  
  // 检查是否有相同的请求正在进行
  if (requestQueue[requestKey] !== undefined) {
    return requestQueue[requestKey];
  }
  
  // 检查缓存
  if (useCache && options.method === 'GET' && cache[requestKey]) {
    const cached = cache[requestKey];
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // 自动添加Authorization header
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 设置请求超时
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 5分钟超时

  try {
    // 添加到请求队列
    const requestPromise = fetch(`${baseUrl}${path}`, { 
      ...options, 
      headers,
      mode: 'cors',
      signal: controller.signal
    })
    .then(async (res) => {
      clearTimeout(timeoutId);
      
      // 检查响应是否为空或状态是否为204 No Content
      if (res.status === 204 || res.headers.get('content-length') === '0') {
        throw new Error('Empty response from server');
      }
      
      // 尝试解析JSON，但处理可能的解析错误
      const text = await res.text();
      if (!text || text.trim() === '') {
        throw new Error('Empty response body');
      }
      
      try {
        const data = JSON.parse(text);
        if (!res.ok) {
          throw new Error(data.detail || data.message || '请求失败');
        }
        
        // 缓存GET请求结果
        if (useCache && options.method === 'GET') {
          cache[requestKey] = {
            data,
            timestamp: Date.now()
          };
        }
        
        return data;
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response text:', text);
        throw new Error('Failed to parse server response');
      }
    })
    .catch((error) => {
      clearTimeout(timeoutId);
      // 从请求队列中移除
      delete requestQueue[requestKey];
      throw error;
    })
    .finally(() => {
      // 从请求队列中移除
      delete requestQueue[requestKey];
    });
    
    requestQueue[requestKey] = requestPromise;
    return requestPromise;
  } catch (error) {
    clearTimeout(timeoutId);
    delete requestQueue[requestKey];
    console.error('API请求失败:', error);
    throw error;
  }
}

// 带重试机制的请求
async function requestWithRetry(baseUrl: string, path: string, options: RequestInit = {}, useCache: boolean = true, retries: number = 3): Promise<any> {
  let lastError: Error = new Error('请求失败');
  
  for (let i = 0; i < retries; i++) {
    try {
      return await request(baseUrl, path, options, useCache);
    } catch (error) {
      lastError = error as Error;
      console.warn(`请求失败，重试 ${i + 1}/${retries}...`);
      // 指数退避
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  
  throw lastError;
}

export const apiClient = {
  // 算例管理相关 API
  get: (path: string, useCache: boolean = true) => requestWithRetry(API_URL, path, { method: 'GET' }, useCache),
  post: (path: string, body?: any, useCache: boolean = false) =>
    requestWithRetry(API_URL, path, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }, useCache),
  delete: (path: string, useCache: boolean = false) =>
    requestWithRetry(API_URL, path, {
      method: 'DELETE',
    }, useCache),
  
  // 算法相关 API
  getAlgorithm: (path: string, useCache: boolean = true) => requestWithRetry(ALGORITHM_URL, path, { method: 'GET' }, useCache),
  postAlgorithm: (path: string, body?: any, useCache: boolean = false) =>
    requestWithRetry(ALGORITHM_URL, path, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }, useCache),
  
  // 清除缓存
  clearCache: () => {
    Object.keys(cache).forEach(key => delete cache[key]);
  },
  // 获取缓存状态
  getCacheSize: () => Object.keys(cache).length,
};

export default apiClient;