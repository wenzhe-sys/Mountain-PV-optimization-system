import apiClient from './apiClient';

export interface SiteSelectionRequest {
  instance_id: string;
}

export interface SiteSelectionResult {
  instance_id: string;
  terrain_summary?: {
    elevation_range: number[];
    slope_range: number[];
    area: number;
    grid_size: number;
    total_candidates: number;
  };
  site_score: {
    solar_radiation: number;
    terrain_suitability: number;
    accessibility: number;
    environmental_impact: number;
    total_score: number;
  };
  recommended_areas: {
    area_id: string;
    grid_coord: number[];
    coordinates: number[];
    score: number;
    elevation: number;
    slope: number;
    aspect: number;
    solar_radiation: number;
    solar_score: number;
    slope_score: number;
    aspect_score: number;
    panel_capacity: number;
    estimated_energy: number;
  }[];
  constraints: {
    max_slope: number;
    min_solar_radiation: number;
    max_elevation_diff?: number;
    distance_to_road?: number;
    grid_size: number;
  };
  scoring_weights?: {
    solar_radiation: number;
    slope: number;
    aspect: number;
    accessibility: number;
    stability: number;
  };
}

// 地形数据接口
interface TerrainData {
  elevation: number[][];
  slope: number[][];
  solarRadiation: number[][];
  windSpeed?: number[][];
  soilStability?: number[][];
}

// 选址点接口
interface SitePoint {
  x: number;
  y: number;
  score: number;
}

// 分析结果接口
interface AnalysisResult {
  message: string;
  recommendations: string[];
}

// 优化结果存储接口
interface OptimizationResult {
  instance_id: string;
  timestamp: number;
  result: any;
}

export const siteSelectionService = {
  /**
   * 从后端获取算例地形数据
   */
  fetchTerrainData: async (instanceId: string): Promise<any> => {
    try {
      console.log('从后端获取地形数据:', instanceId);
      const response = await apiClient.get(`/instances/${instanceId}`);
      if (response && response.status === 'success' && response.data) {
        console.log('获取到地形数据:', response.data.terrain_data);
        return response.data;
      }
      throw new Error('获取算例数据失败');
    } catch (error) {
      console.error('获取地形数据失败:', error);
      return null;
    }
  },

  /**
   * 获取算例列表
   */
  fetchInstanceList: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/instances');
      if (response && response.status === 'success' && response.data) {
        return response.data.instances || [];
      }
      return [];
    } catch (error) {
      console.error('获取算例列表失败:', error);
      return [];
    }
  },

  /**
   * 智能选址分析 - 基于后端真实地形数据
   */
  analyzeSite: async (params: SiteSelectionRequest): Promise<SiteSelectionResult> => {
    const { instance_id } = params;

    // 先尝试从本地存储获取结果
    const cachedResult = await siteSelectionService.getCachedResult(instance_id);
    if (cachedResult) {
      console.log('从本地存储获取缓存结果');
      return cachedResult;
    }

    // 调用后端API进行真实选址分析
    // 注意：POST方法，但API使用query string传递instance_id
    const queryString = `?instance_id=${instance_id}`;
    console.log('发送智能选址分析请求:', `/site-selection${queryString}`);

    try {
      // 后端是POST但使用query string，需要特殊处理
      const response = await apiClient.post(`/site-selection${queryString}`);

      console.log('智能选址分析响应:', response);

      // 后端返回格式: {status: "success", data: {...}}
      if (response && response.status === 'success' && response.data) {
        // 缓存结果到本地存储
        await siteSelectionService.cacheResult(instance_id, response.data);
        return response.data;
      } else {
        console.error('后端API响应格式错误:', response);
        throw new Error('后端API响应格式错误');
      }
    } catch (error) {
      console.error('智能选址分析失败:', error);
      throw error;
    }
  },
  
  /**
   * 缓存优化结果到本地存储
   */
  cacheResult: async (instance_id: string, result: any): Promise<void> => {
    try {
      const optimizationResult: OptimizationResult = {
        instance_id,
        timestamp: Date.now(),
        result
      };
      
      // 获取现有缓存
      const existingResults = JSON.parse(localStorage.getItem('optimizationResults') || '[]');
      
      // 移除相同instance_id的旧结果
      const filteredResults = existingResults.filter((item: OptimizationResult) => item.instance_id !== instance_id);
      
      // 添加新结果
      filteredResults.push(optimizationResult);
      
      // 限制缓存数量，只保留最近10个结果
      const limitedResults = filteredResults.slice(-10);
      
      // 保存到本地存储
      localStorage.setItem('optimizationResults', JSON.stringify(limitedResults));
      console.log('优化结果已缓存到本地存储');
    } catch (error) {
      console.error('缓存优化结果失败:', error);
    }
  },
  
  /**
   * 从本地存储获取缓存结果
   */
  getCachedResult: async (instance_id: string): Promise<SiteSelectionResult | null> => {
    try {
      const existingResults = JSON.parse(localStorage.getItem('optimizationResults') || '[]');
      const result = existingResults.find((item: OptimizationResult) => item.instance_id === instance_id);
      
      if (result) {
        // 检查缓存是否过期（超过24小时）
        const now = Date.now();
        const cacheTime = result.timestamp;
        const hoursDiff = (now - cacheTime) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          console.log('使用缓存的优化结果');
          return result.result;
        } else {
          console.log('缓存已过期，重新获取');
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('获取缓存结果失败:', error);
      return null;
    }
  },
  
  /**
   * 清除指定算例的缓存结果
   */
  clearCachedResult: async (instance_id: string): Promise<void> => {
    try {
      const existingResults = JSON.parse(localStorage.getItem('optimizationResults') || '[]');
      const filteredResults = existingResults.filter((item: OptimizationResult) => item.instance_id !== instance_id);
      localStorage.setItem('optimizationResults', JSON.stringify(filteredResults));
      console.log(`已清除算例 ${instance_id} 的缓存结果`);
    } catch (error) {
      console.error('清除缓存结果失败:', error);
    }
  },

  /**
   * 生成地形数据
   */
  generateTerrain: (): TerrainData => {
    const size = 50;
    const elevation: number[][] = [];
    const slope: number[][] = [];
    const solarRadiation: number[][] = [];

    for (let i = 0; i < size; i++) {
      const elevationRow: number[] = [];
      const slopeRow: number[] = [];
      const solarRow: number[] = [];

      for (let j = 0; j < size; j++) {
        // 生成基础地形
        const x = j / size * Math.PI * 4;
        const y = i / size * Math.PI * 4;
        const noise1 = Math.sin(x) * Math.cos(y) * 50;
        const noise2 = Math.sin(x * 2) * Math.cos(y * 2) * 25;
        const noise3 = Math.sin(x * 4) * Math.cos(y * 4) * 12.5;
        const elevationValue = 800 + noise1 + noise2 + noise3;

        elevationRow.push(elevationValue);

        // 计算坡度
        const slopeValue = Math.abs(noise1 / 20) + Math.abs(noise2 / 10) + Math.abs(noise3 / 5);
        slopeRow.push(Math.min(slopeValue, 45));

        // 计算太阳辐射
        const solarValue = 500 + Math.random() * 500;
        solarRow.push(solarValue);
      }

      elevation.push(elevationRow);
      slope.push(slopeRow);
      solarRadiation.push(solarRow);
    }

    return {
      elevation,
      slope,
      solarRadiation
    };
  },

  /**
   * 选址算法
   */
  siteSelectionAlgorithm: (terrainData: TerrainData): SitePoint[] => {
    const { elevation, slope, solarRadiation } = terrainData;
    const size = elevation.length;
    const sites: SitePoint[] = [];

    for (let i = 5; i < size - 5; i++) {
      for (let j = 5; j < size - 5; j++) {
        // 计算综合评分
        const elevationScore = 1 - Math.abs(elevation[i][j] - 1000) / 200;
        const slopeScore = 1 - slope[i][j] / 45;
        const solarScore = (solarRadiation[i][j] - 500) / 500;
        const windScore = terrainData.windSpeed ? 1 - (terrainData.windSpeed[i][j] - 5) / 10 : 0.8;
        const soilScore = terrainData.soilStability ? terrainData.soilStability[i][j] : 0.8;

        const score = (
          elevationScore * 0.2 +
          slopeScore * 0.3 +
          solarScore * 0.25 +
          windScore * 0.1 +
          soilScore * 0.15
        );

        if (score > 0.7) {
          sites.push({ x: j, y: i, score });
        }
      }
    }

    // 排序并返回前5个最佳位置
    sites.sort((a, b) => b.score - a.score);
    return sites.slice(0, 5);
  },

  /**
   * 分析选址结果
   */
  analyzeSiteSelection: (sites: SitePoint[]): AnalysisResult => {
    if (sites.length === 0) {
      return {
        message: '未找到合适的选址位置',
        recommendations: [
          '考虑调整地形参数',
          '尝试不同的评分权重',
          '检查输入数据是否正确'
        ]
      };
    }

    const bestSite = sites[0];
    const message = `找到 ${sites.length} 个合适的选址位置，最佳位置评分: ${bestSite.score.toFixed(2)}`;

    const recommendations = [
      '最佳位置具有良好的地形条件，适合建设光伏电站',
      '建议进行详细的地质勘察',
      '考虑周围环境因素，如遮挡物和风向',
      '制定合理的施工计划，确保工程质量',
      '定期监测电站运行状态，优化发电效率'
    ];

    return {
      message,
      recommendations
    };
  }
};

export default siteSelectionService;
