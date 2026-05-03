import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Database,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Download,
  FileDown,
  RefreshCw,
  Search,
  Filter,
  Map,
  Layers,
  Zap,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Target,
  Mountain,
  Eye,
  EyeOff,
  Trash2,
  Info,
  Star,
  Settings
} from 'lucide-react';
import instanceService from '../services/instanceService';
import resultService from '../services/resultService';
import useAppStore from '../store/useAppStore';

interface JobStatus {
  id: number;
  status: string;
  progress: number;
  error?: string;
}

interface InstanceInfo {
  id: number;
  name: string;
  instance_id: string;
  n_nodes: number;
  status: string;
  created_at: string;
  available_modules?: number[];
  processed_data?: any;
  terrain_info?: {
    min_elevation: number;
    max_elevation: number;
    average_slope: number;
    terrain_complexity: string;
  };
  panel_info?: {
    total_panels: number;
    panel_density: number;
    layout_efficiency: number;
  };
}

interface PreloadedInstance {
  instance_id: string;
  has_results: number[];
  type?: 'easy' | 'medium' | 'hard' | 'extended' | 'mountain' | 'hilly' | 'plain';
  difficulty?: string;
  terrainType?: string;
  scale?: string;
}

interface InstanceDetails {
  instance_info: {
    instance_id: string;
    type: string;
    difficulty: string;
    n_nodes: number;
    inverter_coord: number[];
    unit: string;
    source: string;
    version: string;
    desensitization_info?: {
      is_desensitized: boolean;
      note: string;
    };
  };
  terrain_data?: {
    grid_size: number;
    slope_matrix?: number[][];
    elevation_matrix?: number[][];
    elevation_range?: [number, number];
    slope_range?: [number, number];
  };
  equipment_params?: {
    inverter?: { q: number; r: number; p: number };
    transformer?: {
      Q_box_options: number[];
      c_box: Record<string, number>;
      c_install_box: Record<string, number>;
    };
    cable?: {
      c1: number;
      c2: number;
      c3: number;
      rho: number;
      r_c: number;
      I_max: number;
    };
    substation?: { Q_substation: number; coord: number[] };
  };
  loss_params?: {
    lambda: number;
    K_segments: number;
    I_segments: number[][];
    linear_params: { a_i: number; b_i: number }[];
    T: number;
    tau: number;
    r_d: number;
    C_elec: number;
    r_c: number;
    I_max: number;
  };
  pva_list?: any[];
  dist_matrix?: number[][];
  constraint_info?: Array<{
    type: string;
    value: any;
    desc?: string;
    priority: string;
    module: string;
  }>;
}

export default function InstanceManager() {
  const [instances, setInstances] = useState<InstanceInfo[]>([]);
  const [preloaded, setPreloaded] = useState<PreloadedInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<string | null>(null);
  const [runningJob, setRunningJob] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<InstanceInfo | null>(null);
  const [instanceDetails, setInstanceDetails] = useState<InstanceDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedInstances, setExpandedInstances] = useState<Set<string>>(new Set());
  const [detailedView, setDetailedView] = useState<boolean>(false);
  const [notification, setNotification] = useState<{type: string, message: string} | null>(null);
  const [selectedInstances, setSelectedInstances] = useState<Set<string>>(new Set());
  const [showBatchActions, setShowBatchActions] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [importProgress, setImportProgress] = useState<number>(0);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterTerrain, setFilterTerrain] = useState<string>('all');
  const [filterScale, setFilterScale] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('preloaded'); // preloaded, uploaded
  const [instanceTags, setInstanceTags] = useState<Record<string, string[]>>({});
  const [showTagInput, setShowTagInput] = useState<string | null>(null);
  const [newTag, setNewTag] = useState<string>('');
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [comparisonInstances, setComparisonInstances] = useState<InstanceInfo[]>([]);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [templatePreviewData, setTemplatePreviewData] = useState<any>(null);
  const [templatePreviewLoading, setTemplatePreviewLoading] = useState(false);

  const currentInstanceId = useAppStore((s) => s.currentInstanceId);
  const setCurrentInstanceId = useAppStore((s) => s.setCurrentInstanceId);

  // 标签管理功能
  const addTag = (instanceId: string, tag: string) => {
    if (!tag.trim()) return;
    setInstanceTags(prev => ({
      ...prev,
      [instanceId]: [...(prev[instanceId] || []), tag.trim()]
    }));
    setNewTag('');
    setShowTagInput(null);
  };

  const removeTag = (instanceId: string, tag: string) => {
    setInstanceTags(prev => ({
      ...prev,
      [instanceId]: (prev[instanceId] || []).filter(t => t !== tag)
    }));
  };

  // 过滤算例
  const filteredPreloaded = preloaded.filter(item => {
    const matchesSearch = item.instance_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || item.difficulty === filterDifficulty;
    const matchesTerrain = filterTerrain === 'all' || item.terrainType === filterTerrain;
    const matchesScale = filterScale === 'all' || item.scale === filterScale;
    return matchesSearch && matchesDifficulty && matchesTerrain && matchesScale;
  });

  const INSTANCES_WITH_RESULTS = [
    'r1', 'r2', 'r3', 'r10', 'r11', 'r12', 'r14', 'r15', 'r16', 'r18', 'r19', 'r20',
    'r27', 'r28', 'r54', 'r65', 'r100', 'r101'
  ];

  const sortedPreloaded = [...filteredPreloaded].sort((a, b) => {
    const aHasResults = INSTANCES_WITH_RESULTS.includes(a.instance_id);
    const bHasResults = INSTANCES_WITH_RESULTS.includes(b.instance_id);
    if (aHasResults && !bHasResults) return -1;
    if (!aHasResults && bHasResults) return 1;

    switch (sortBy) {
      case 'difficulty':
        const difficultyOrder: Record<string, number> = { '简单': 0, '中等': 1, '困难': 2, '山地': 3, '丘陵': 4, '平原': 5, '扩展': 6 };
        return sortOrder === 'asc'
          ? (difficultyOrder[a.difficulty || ''] ?? 999) - (difficultyOrder[b.difficulty || ''] ?? 999)
          : (difficultyOrder[b.difficulty || ''] ?? 999) - (difficultyOrder[a.difficulty || ''] ?? 999);
      case 'instance_id':
        return sortOrder === 'asc' 
          ? a.instance_id.localeCompare(b.instance_id)
          : b.instance_id.localeCompare(a.instance_id);
      default:
        return 0;
    }
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('开始获取算例数据...');
      
      try {
        // 尝试从后端API获取数据
        const [instList, preList] = await Promise.all([
          instanceService.list(),
          instanceService.listPreloaded(),
        ]);
        
        console.log('获取算例数据成功:', {
          instListLength: instList.length,
          preListLength: preList.length
        });
        
        // 处理算例类型和难度
        const processedPreloaded = preList.map(item => {
          const instanceId = item.instance_id;
          let type: 'easy' | 'medium' | 'hard' | 'extended' | 'mountain' | 'hilly' | 'plain' = 'easy';
          let difficulty = '简单';
          let terrainType = '未知';
          let scale = '中型';
          
          // 基于实例ID判断类型和难度
          if (instanceId.startsWith('r1') && !instanceId.startsWith('r10') && !instanceId.startsWith('r18')) {
            type = 'easy';
            difficulty = '简单';
            terrainType = '平原';
            scale = '小型';
          } else if (instanceId.startsWith('r3') || instanceId.startsWith('r6') || instanceId.startsWith('r7')) {
            type = 'medium';
            difficulty = '中等';
            terrainType = '丘陵';
            scale = '中型';
          } else if (instanceId.startsWith('r4') || instanceId.startsWith('r8') || instanceId.startsWith('r11')) {
            type = 'hard';
            difficulty = '困难';
            terrainType = '山地';
            scale = '大型';
          } else if (instanceId.startsWith('r18') || instanceId.startsWith('r19') || instanceId.startsWith('r20')) {
            type = 'mountain';
            difficulty = '山地';
            terrainType = '山地';
            scale = '大型';
          } else if (instanceId.startsWith('r10') || instanceId.startsWith('r12')) {
            type = 'hilly';
            difficulty = '丘陵';
            terrainType = '丘陵';
            scale = '中型';
          } else if (instanceId.startsWith('r13') || instanceId.startsWith('r14')) {
            type = 'plain';
            difficulty = '平原';
            terrainType = '平原';
            scale = '大型';
          } else {
            type = 'extended';
            difficulty = '扩展';
            terrainType = '混合';
            scale = '中型';
          }
          
          return {
            ...item,
            type,
            difficulty,
            terrainType,
            scale
          };
        });
        
        setInstances(instList);
        setPreloaded(processedPreloaded);
        console.log('算例数据设置成功:', {
          instancesLength: instList.length,
          preloadedLength: processedPreloaded.length
        });
      } catch (apiError) {
        console.error('API调用失败，使用模拟数据:', apiError);
        // 使用模拟数据
        const mockInstances: InstanceInfo[] = [
          {
            id: 1,
            name: '算例 r1',
            instance_id: 'r1',
            n_nodes: 100,
            status: 'completed',
            created_at: '2026-04-03T12:00:00',
            available_modules: [1, 2, 3],
            terrain_info: {
              min_elevation: 100,
              max_elevation: 200,
              average_slope: 5,
              terrain_complexity: '简单'
            },
            panel_info: {
              total_panels: 500,
              panel_density: 100,
              layout_efficiency: 85
            }
          },
          {
            id: 2,
            name: '算例 r2',
            instance_id: 'r2',
            n_nodes: 200,
            status: 'uploaded',
            created_at: '2026-04-02T10:00:00',
            available_modules: [1, 2],
            terrain_info: {
              min_elevation: 50,
              max_elevation: 150,
              average_slope: 3,
              terrain_complexity: '简单'
            },
            panel_info: {
              total_panels: 800,
              panel_density: 120,
              layout_efficiency: 90
            }
          }
        ];
        
        const mockPreloaded: PreloadedInstance[] = [
          { instance_id: 'r3', has_results: [1], type: 'medium', difficulty: '中等', terrainType: '丘陵', scale: '中型' },
          { instance_id: 'r4', has_results: [], type: 'hard', difficulty: '困难', terrainType: '山地', scale: '大型' },
          { instance_id: 'r5', has_results: [], type: 'mountain', difficulty: '山地', terrainType: '山地', scale: '大型' },
          { instance_id: 'r6', has_results: [1, 2], type: 'medium', difficulty: '中等', terrainType: '丘陵', scale: '中型' },
          { instance_id: 'r7', has_results: [], type: 'easy', difficulty: '简单', terrainType: '平原', scale: '小型' }
        ];
        
        setInstances(mockInstances);
        setPreloaded(mockPreloaded);
        console.log('使用模拟数据完成');
      }
    } catch (e: any) {
      console.error('获取算例数据失败:', e);
      setError(e.message || '获取算例数据失败');
      // 即使发生错误，也设置一些模拟数据，确保页面能加载
      const mockInstances: InstanceInfo[] = [
        {
          id: 1,
          name: '算例 r1',
          instance_id: 'r1',
          n_nodes: 100,
          status: 'completed',
          created_at: '2026-04-03T12:00:00',
          available_modules: [1, 2, 3]
        }
      ];
      
      const mockPreloaded: PreloadedInstance[] = [
        { instance_id: 'r2', has_results: [1, 2], type: 'easy', difficulty: '简单', terrainType: '平原', scale: '小型' },
        { instance_id: 'r3', has_results: [1], type: 'medium', difficulty: '中等', terrainType: '丘陵', scale: '中型' }
      ];
      
      setInstances(mockInstances);
      setPreloaded(mockPreloaded);
    } finally {
      setLoading(false);
      console.log('获取算例数据完成');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleImport = async (instanceId: string) => {
    try {
      setImporting(instanceId);
      setError(null);
      setImportProgress(0);
      
      // 模拟导入进度
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 300);
      
      await instanceService.importPreloaded(instanceId);
      setImportProgress(100);
      clearInterval(progressInterval);
      
      await fetchData();
      setNotification({ type: 'success', message: `算例 ${instanceId} 导入成功` });
      setTimeout(() => setNotification(null), 3000);
    } catch (e: any) {
      setError(e.message);
      setNotification({ type: 'error', message: `导入失败: ${e.message}` });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setImporting(null);
      setImportProgress(0);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setError(null);
      setUploadProgress(0);
      
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 300);
      
      await instanceService.upload(file);
      setUploadProgress(100);
      clearInterval(progressInterval);
      
      await fetchData();
      setNotification({ type: 'success', message: '算例上传成功' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      setError(err.message);
      setNotification({ type: 'error', message: `上传失败: ${err.message}` });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      e.target.value = '';
      setUploadProgress(0);
    }
  };

  const handleRun = async (instanceId: string) => {
    try {
      setError(null);
      const job = await resultService.startComputation(instanceId);
      setRunningJob(job);
      setNotification({ type: 'info', message: '算法开始运行' });
      setTimeout(() => setNotification(null), 3000);
      pollJob(job.id);
    } catch (e: any) {
      setError(e.message);
      setNotification({ type: 'error', message: `运行失败: ${e.message}` });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const pollJob = async (jobId: number) => {
    const interval = setInterval(async () => {
      try {
        const status = await resultService.getJobStatus(jobId);
        setRunningJob(status);
        if (status.status === 'completed') {
          clearInterval(interval);
          fetchData();
          setNotification({ type: 'success', message: '算法运行完成' });
          setTimeout(() => setNotification(null), 3000);
        } else if (status.status === 'failed') {
          clearInterval(interval);
          setNotification({ type: 'error', message: '算法运行失败' });
          setTimeout(() => setNotification(null), 3000);
        }
      } catch {
        clearInterval(interval);
      }
    }, 2000);
  };

  const fetchInstanceDetails = async (instanceId: string) => {
    try {
      setSelectedInstance(instances.find(inst => inst.instance_id === instanceId) || null);

      const details = await instanceService.get(instanceId);
      console.log('算例详情数据:', details);

      if (details) {
        setInstanceDetails(details);
        setShowDetails(true);
      } else {
        throw new Error('获取算例详情失败: 数据为空');
      }
    } catch (error: any) {
      console.error('获取算例详情失败:', error);
      setNotification({ type: 'error', message: error.message || '获取算例详情失败' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const toggleInstanceExpansion = (instanceId: string) => {
    setExpandedInstances(prev => {
      const newSet = new Set(prev);
      if (newSet.has(instanceId)) {
        newSet.delete(instanceId);
      } else {
        newSet.add(instanceId);
      }
      return newSet;
    });
  };

  const handleDelete = async (instanceId: string) => {
    if (window.confirm(`确定要删除算例 ${instanceId} 吗？`)) {
      try {
        setError(null);
        await instanceService.delete(instanceId);
        await fetchData();
        // 如果删除的是当前选中的算例，清除选中状态
        if (currentInstanceId === instanceId) {
          setCurrentInstanceId('');
        }
        // 从选中集合中移除
        setSelectedInstances(prev => {
          const newSet = new Set(prev);
          newSet.delete(instanceId);
          return newSet;
        });
        setNotification({ type: 'success', message: `算例 ${instanceId} 删除成功` });
        setTimeout(() => setNotification(null), 3000);
      } catch (e: any) {
        setError(e.message);
        setNotification({ type: 'error', message: `删除失败: ${e.message}` });
        setTimeout(() => setNotification(null), 3000);
      }
    }
  };

  const handleBatchDelete = async () => {
    if (selectedInstances.size === 0) return;
    if (window.confirm(`确定要删除选中的 ${selectedInstances.size} 个算例吗？`)) {
      try {
        setError(null);
        for (const instanceId of selectedInstances) {
          await instanceService.delete(instanceId);
          // 如果删除的是当前选中的算例，清除选中状态
          if (currentInstanceId === instanceId) {
            setCurrentInstanceId('');
          }
        }
        await fetchData();
        setSelectedInstances(new Set());
        setShowBatchActions(false);
        setNotification({ type: 'success', message: `成功删除 ${selectedInstances.size} 个算例` });
        setTimeout(() => setNotification(null), 3000);
      } catch (e: any) {
        setError(e.message);
        setNotification({ type: 'error', message: `批量删除失败: ${e.message}` });
        setTimeout(() => setNotification(null), 3000);
      }
    }
  };

  const toggleInstanceSelection = (instanceId: string) => {
    setSelectedInstances(prev => {
      const newSet = new Set(prev);
      if (newSet.has(instanceId)) {
        newSet.delete(instanceId);
      } else {
        newSet.add(instanceId);
      }
      setShowBatchActions(newSet.size > 0);
      return newSet;
    });
  };

  // 算例比较功能
  const addToComparison = (instance: InstanceInfo) => {
    setComparisonInstances(prev => {
      // 最多比较3个算例
      if (prev.length >= 3) {
        return prev;
      }
      // 避免重复添加
      if (prev.some(inst => inst.instance_id === instance.instance_id)) {
        return prev;
      }
      return [...prev, instance];
    });
  };

  const removeFromComparison = (instanceId: string) => {
    setComparisonInstances(prev => prev.filter(inst => inst.instance_id !== instanceId));
  };

  const openComparison = () => {
    if (comparisonInstances.length < 2) {
      setNotification({ type: 'info', message: '请至少选择2个算例进行比较' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    setShowComparison(true);
  };

  const closeComparison = () => {
    setShowComparison(false);
  };

  const sortInstances = (insts: InstanceInfo[]) => {
    return [...insts].sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortBy) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'instance_id':
          aVal = a.instance_id.toLowerCase();
          bVal = b.instance_id.toLowerCase();
          break;
        case 'n_nodes':
          aVal = a.n_nodes;
          bVal = b.n_nodes;
          break;
        case 'created_at':
        default:
          aVal = new Date(a.created_at).getTime();
          bVal = new Date(b.created_at).getTime();
          break;
      }
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const importedIds = new Set(instances.map((i) => i.instance_id));

  const statusColors: Record<string, string> = {
    uploaded: 'text-yellow-400',
    processing: 'text-blue-400',
    completed: 'text-green-400',
    failed: 'text-red-400',
  };
  const statusLabels: Record<string, string> = {
    uploaded: '已上传',
    processing: '计算中',
    completed: '已完成',
    failed: '失败',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Notification */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 ${notification.type === 'success' ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30' : notification.type === 'error' ? 'bg-red-400/20 text-red-400 border border-red-400/30' : 'bg-blue-400/20 text-blue-400 border border-blue-400/30'}`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : notification.type === 'error' ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <Info className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </motion.div>
      )}

      {/* Header */}
      <motion.div 
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h2 
          className="text-2xl font-bold text-white flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/30"
          >
            <Database className="w-5 h-5 text-white" />
          </motion.div>
          算例管理
        </motion.h2>
        <motion.div 
          className="flex flex-wrap gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.05 }}
          >
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索算例..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/5 text-gray-300 border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
            />
          </motion.div>
          <motion.select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-4 py-2 bg-white/5 text-gray-300 border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
          >
            <option value="all">全部难度</option>
            <option value="简单">简单</option>
            <option value="中等">中等</option>
            <option value="困难">困难</option>
            <option value="山地">山地</option>
            <option value="丘陵">丘陵</option>
            <option value="平原">平原</option>
            <option value="扩展">扩展</option>
          </motion.select>
          <motion.select
            value={filterTerrain}
            onChange={(e) => setFilterTerrain(e.target.value)}
            className="px-4 py-2 bg-white/5 text-gray-300 border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
          >
            <option value="all">全部地形</option>
            <option value="平原">平原</option>
            <option value="丘陵">丘陵</option>
            <option value="山地">山地</option>
            <option value="混合">混合</option>
          </motion.select>
          <motion.select
            value={filterScale}
            onChange={(e) => setFilterScale(e.target.value)}
            className="px-4 py-2 bg-white/5 text-gray-300 border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
          >
            <option value="all">全部规模</option>
            <option value="小型">小型</option>
            <option value="中型">中型</option>
            <option value="大型">大型</option>
          </motion.select>
          <motion.select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-white/5 text-gray-300 border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
          >
            <option value="created_at">创建时间</option>
            <option value="name">名称</option>
            <option value="instance_id">算例ID</option>
            <option value="n_nodes">节点数</option>
          </motion.select>
          <motion.button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-300 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            {sortOrder === 'asc' ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            {sortOrder === 'asc' ? '升序' : '降序'}
          </motion.button>
          <motion.label 
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 rounded-lg cursor-pointer hover:bg-cyan-600/30 transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Upload className="w-4 h-4" />
            上传算例
            <input type="file" accept=".txt" className="hidden" onChange={handleUpload} />
          </motion.label>
          <motion.button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-300 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className="w-4 h-4" />
            刷新
          </motion.button>
          <motion.button
            onClick={() => setDetailedView(!detailedView)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-300 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            {detailedView ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            {detailedView ? '简洁视图' : '详细视图'}
          </motion.button>
        </motion.div>
      </motion.div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* 上传进度 */}
      {uploadProgress > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
        >
          <div className="flex items-center gap-3 text-blue-400 mb-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-medium">上传中...</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">进度: {uploadProgress.toFixed(0)}%</p>
        </motion.div>
      )}

      {/* 导入进度 */}
      {importProgress > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
        >
          <div className="flex items-center gap-3 text-green-400 mb-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-medium">导入中...</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${importProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">进度: {importProgress.toFixed(0)}%</p>
        </motion.div>
      )}

      {/* 批量操作栏 */}
      {showBatchActions && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-white text-sm">
              已选择 <span className="font-medium text-cyan-400">{selectedInstances.size}</span> 个算例
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedInstances(new Set());
                setShowBatchActions(false);
              }}
              className="px-4 py-2 bg-white/5 text-gray-300 border border-white/10 rounded-lg hover:bg-white/10 transition"
            >
              取消
            </button>
            <button
              onClick={() => {
                // 将选中的算例添加到比较列表
                const selectedInstancesArray = instances.filter(inst => selectedInstances.has(inst.instance_id));
                selectedInstancesArray.forEach(instance => addToComparison(instance));
                setSelectedInstances(new Set());
                setShowBatchActions(false);
                openComparison();
              }}
              className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition flex items-center gap-2"
              disabled={selectedInstances.size < 2}
            >
              <BarChart3 className="w-4 h-4" />
              批量比较
            </button>
            <button
              onClick={handleBatchDelete}
              className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              批量删除
            </button>
          </div>
        </motion.div>
      )}

      {/* 算例模板下载 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/30"
            >
              <FileDown className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h3 className="text-lg font-semibold text-white">工程级标准算例模板</h3>
              <p className="text-xs text-cyan-400">专业模板，即下即用</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              id: 'template-easy',
              name: '简单场景模板',
              description: '平原地形，100-200个面板节点，适合初学者',
              difficulty: '简单',
              terrain: '平原',
              scale: '小型',
              features: ['基础地形数据', '标准设备参数', '完整约束条件'],
              downloadUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=simple%20solar%20farm%20template%20file&image_size=square'
            },
            {
              id: 'template-medium',
              name: '中等场景模板',
              description: '丘陵地形，300-500个面板节点，适合专业设计',
              difficulty: '中等',
              terrain: '丘陵',
              scale: '中型',
              features: ['复杂地形数据', '多设备选型', '高级约束条件'],
              downloadUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=medium%20solar%20farm%20template%20file&image_size=square'
            },
            {
              id: 'template-hard',
              name: '复杂场景模板',
              description: '山地地形，600-1000个面板节点，适合工程级项目',
              difficulty: '困难',
              terrain: '山地',
              scale: '大型',
              features: ['高精度地形数据', '多设备配置', '完整工程参数'],
              downloadUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=complex%20solar%20farm%20template%20file&image_size=square'
            }
          ].map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-cyan-400/30 transition-all duration-300"
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 212, 255, 0.1)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-white font-medium">{template.name}</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full ${template.difficulty === '简单' ? 'bg-green-400/10 text-green-400' : template.difficulty === '中等' ? 'bg-yellow-400/10 text-yellow-400' : 'bg-red-400/10 text-red-400'}`}>
                  {template.difficulty}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-3">{template.description}</p>
              <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                <div className="flex items-center gap-1">
                  <Mountain className="w-3 h-3 text-emerald-400" />
                  <span className="text-gray-400">{template.terrain}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3 text-blue-400" />
                  <span className="text-gray-400">{template.scale}</span>
                </div>
              </div>
              <div className="space-y-1 mb-4">
                {template.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-1 text-xs text-gray-500">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                    {feature}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={async () => {
                    try {
                      setTemplatePreviewLoading(true);
                      setNotification({ type: 'info', message: `正在加载模板 ${template.name}...` });
                      
                      const response = await fetch(`/algorithm/templates/${template.id}/preview`);
                      const data = await response.json();
                      
                      if (data.status === 'success' && data.data) {
                        setTemplatePreviewData(data.data);
                        setShowTemplatePreview(true);
                        setNotification({ type: 'success', message: `模板 ${template.name} 加载成功` });
                      } else {
                        setNotification({ type: 'error', message: '加载模板失败' });
                      }
                    } catch (error) {
                      console.error('加载模板失败:', error);
                      setNotification({ type: 'error', message: '加载模板失败' });
                    } finally {
                      setTemplatePreviewLoading(false);
                      setTimeout(() => setNotification(null), 3000);
                    }
                  }}
                  className="text-xs px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition flex items-center gap-1"
                  disabled={templatePreviewLoading}
                >
                  <Eye className="w-3 h-3" />
                  {templatePreviewLoading ? '加载中...' : '预览'}
                </button>
                <button
                  onClick={async () => {
                    // 下载模板 - 调用后端API
                    try {
                      setNotification({ type: 'info', message: `正在下载模板 ${template.name}...` });
                      const response = await fetch(`/algorithm/templates/${template.id}/download`);
                      const data = await response.json();
                      if (data.status === 'success' && data.data) {
                        // 创建下载链接
                        const blob = new Blob([data.data.content], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = data.data.filename;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        setNotification({ type: 'success', message: `模板 ${template.name} 下载成功` });
                      } else {
                        setNotification({ type: 'error', message: '下载模板失败' });
                      }
                    } catch (error) {
                      console.error('下载模板失败:', error);
                      setNotification({ type: 'error', message: '下载模板失败' });
                    } finally {
                      setTimeout(() => setNotification(null), 3000);
                    }
                  }}
                  className="text-xs px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-lg hover:from-cyan-600 hover:to-emerald-600 transition flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  下载
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <p className="text-xs text-gray-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            模板包含完整的工程参数，可直接导入系统使用，适合快速开始项目设计。
          </p>
        </div>
      </motion.div>

      {/* 比较按钮 */}
      {comparisonInstances.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-white text-sm">
              已选择 <span className="font-medium text-cyan-400">{comparisonInstances.length}</span> 个算例用于比较
            </span>
            <div className="flex flex-wrap gap-2">
              {comparisonInstances.map(instance => (
                <span key={instance.instance_id} className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center gap-1">
                  {instance.instance_id}
                  <button
                    onClick={() => removeFromComparison(instance.instance_id)}
                    className="hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setComparisonInstances([])}
              className="px-4 py-2 bg-white/5 text-gray-300 border border-white/10 rounded-lg hover:bg-white/10 transition"
            >
              清空
            </button>
            <button
              onClick={openComparison}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-lg hover:from-cyan-600 hover:to-emerald-600 transition flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              开始比较
            </button>
          </div>
        </motion.div>
      )}

      {/* 运行任务状态 */}
      {runningJob && runningJob.status !== 'completed' && runningJob.status !== 'failed' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
        >
          <div className="flex items-center gap-3 text-blue-400 mb-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-medium">算法运行中 — {runningJob.status}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${runningJob.progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">进度: {runningJob.progress}%</p>
        </motion.div>
      )}

      {/* 已导入算例列表 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
          已导入算例
        </h3>
        {loading ? (
          <div className="text-center text-gray-500 py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-t-cyan-400 border-r-cyan-400 border-b-cyan-400 border-l-transparent rounded-full mx-auto mb-4"
            ></motion.div>
            <motion.p 
              className="text-gray-400"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              加载中...
            </motion.p>
          </div>
        ) : instances.length === 0 ? (
          <motion.div 
            className="text-center text-gray-500 py-12 border border-dashed border-white/10 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="mb-4"
            >
              <Database className="w-16 h-16 mx-auto opacity-30" />
            </motion.div>
            <p className="text-lg mb-2">暂无算例</p>
            <p className="text-sm text-gray-500">请从下方导入预置算例或上传新算例</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sortInstances(instances).map((inst, index) => {
              const isExpanded = expandedInstances.has(inst.instance_id);
              const isSelected = currentInstanceId === inst.instance_id;
              const isCheckboxSelected = selectedInstances.has(inst.instance_id);
              
              return (
                <motion.div
                  key={inst.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-500/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 212, 255, 0.1)" }}
                >
                  <div 
                    className="p-4 cursor-pointer" 
                    onClick={() => setCurrentInstanceId(inst.instance_id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isCheckboxSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleInstanceSelection(inst.instance_id);
                          }}
                          className="w-4 h-4 rounded border border-white/30 bg-white/5 text-cyan-400 focus:ring-cyan-500"
                        />
                        <span className="text-white font-semibold">{inst.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${statusColors[inst.status] || 'text-gray-400'}`}>
                          {statusLabels[inst.status] || inst.status}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleInstanceExpansion(inst.instance_id);
                          }}
                          className="text-gray-400 hover:text-cyan-400 transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>ID: {inst.instance_id} · 节点数: {inst.n_nodes}</p>
                      <p>
                        可用结果:{' '}
                        {(inst.available_modules || []).length > 0
                          ? (inst.available_modules || []).map((m) => `模块${m}`).join('、')
                          : '无'}
                      </p>
                      <p>创建时间: {new Date(inst.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {isSelected && (
                        <span className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded">
                          当前选中
                        </span>
                      )}
                      {inst.status === 'uploaded' && (
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRun(inst.instance_id);
                          }}
                          className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 flex items-center gap-1"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <PlayCircle className="w-3 h-3" />
                          运行算法
                        </motion.button>
                      )}
                      {inst.status === 'completed' && (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      )}
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchInstanceDetails(inst.instance_id);
                        }}
                        className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 flex items-center gap-1"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Eye className="w-3 h-3" />
                        查看详情
                      </motion.button>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(inst.instance_id);
                        }}
                        className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 flex items-center gap-1"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Trash2 className="w-3 h-3" />
                        删除
                      </motion.button>
                    </div>
                  </div>
                  
                  {isExpanded && detailedView && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-4 pb-4 border-t border-white/10"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div className="bg-white/5 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-1">
                            <Mountain className="w-3 h-3 text-cyan-400" />
                            地形信息
                          </h4>
                          <div className="text-xs text-gray-400 space-y-1">
                            <p>最小海拔: {inst.terrain_info?.min_elevation || 'N/A'}m</p>
                            <p>最大海拔: {inst.terrain_info?.max_elevation || 'N/A'}m</p>
                            <p>平均坡度: {inst.terrain_info?.average_slope || 'N/A'}°</p>
                            <p>地形复杂度: {inst.terrain_info?.terrain_complexity || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-1">
                            <Layers className="w-3 h-3 text-emerald-400" />
                            面板信息
                          </h4>
                          <div className="text-xs text-gray-400 space-y-1">
                            <p>面板总数: {inst.panel_info?.total_panels || 'N/A'}</p>
                            <p>面板密度: {inst.panel_info?.panel_density || 'N/A'} 块/亩</p>
                            <p>布局效率: {inst.panel_info?.layout_efficiency || 'N/A'}%</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* 预置算例 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
          可导入预置算例
        </h3>
        {preloaded.filter((p) => !importedIds.has(p.instance_id)).length === 0 ? (
          <motion.div 
            className="text-center text-gray-500 py-12 border border-dashed border-white/10 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="mb-4"
            >
              <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-400 opacity-50" />
            </motion.div>
            <p className="text-lg mb-2">所有预置算例已导入</p>
            <p className="text-sm text-gray-500">您可以上传新的算例文件</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPreloaded
              .filter((p) => !importedIds.has(p.instance_id))
              .map((p, index) => {
                let typeColor = 'text-gray-400';
                let typeBg = 'bg-white/5';
                switch (p.type) {
                  case 'easy':
                    typeColor = 'text-green-400';
                    typeBg = 'bg-green-400/10';
                    break;
                  case 'medium':
                    typeColor = 'text-yellow-400';
                    typeBg = 'bg-yellow-400/10';
                    break;
                  case 'hard':
                    typeColor = 'text-red-400';
                    typeBg = 'bg-red-400/10';
                    break;
                  case 'mountain':
                    typeColor = 'text-purple-400';
                    typeBg = 'bg-purple-400/10';
                    break;
                  case 'hilly':
                    typeColor = 'text-blue-400';
                    typeBg = 'bg-blue-400/10';
                    break;
                  case 'plain':
                    typeColor = 'text-emerald-400';
                    typeBg = 'bg-emerald-400/10';
                    break;
                  case 'extended':
                    typeColor = 'text-pink-400';
                    typeBg = 'bg-pink-400/10';
                    break;
                }
                
                return (
                  <motion.button
                    key={p.instance_id}
                    disabled={importing === p.instance_id}
                    onClick={() => handleImport(p.instance_id)}
                    className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition text-left disabled:opacity-50"
                    whileHover={{ scale: 1.02, y: -5, boxShadow: "0 10px 25px -5px rgba(0, 212, 255, 0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <motion.div
                          whileHover={{ rotate: 15, scale: 1.1 }}
                          className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/30"
                        >
                          <FileText className="w-4 h-4 text-white" />
                        </motion.div>
                        <span className="text-white text-sm font-medium">{p.instance_id}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${typeColor} ${typeBg} border border-white/10`}>
                        {p.difficulty}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <motion.div 
                        className="text-xs text-gray-500 flex items-center gap-1"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Mountain className="w-3 h-3 text-emerald-400" />
                        {p.terrainType}
                      </motion.div>
                      <motion.div 
                        className="text-xs text-gray-500 flex items-center gap-1"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Target className="w-3 h-3 text-blue-400" />
                        {p.scale}
                      </motion.div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      {p.has_results.length > 0
                        ? `已有模块 ${p.has_results.join(',')} 结果`
                        : '需运行算法'}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <motion.span 
                        className="text-xs text-cyan-400 flex items-center gap-1"
                        whileHover={{ scale: 1.1 }}
                      >
                        <Download className="w-3 h-3" />
                        导入
                      </motion.span>
                      {importing === p.instance_id && (
                        <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
          </div>
        )}
      </div>

      {/* 算例详细信息模态框 */}
      {showDetails && instanceDetails && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-5xl max-h-[85vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-white/10 sticky top-0 bg-gray-900 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-400" />
                  算例详细信息
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-white transition-colors text-xl"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-400 mt-2">
                算例ID: <span className="text-cyan-400">{instanceDetails.instance_info?.instance_id}</span>
                <span className="mx-2">·</span>
                来源: <span className="text-white">{instanceDetails.instance_info?.source}</span>
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* 基本信息 */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-1">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  基本信息
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">算例ID</p>
                    <p className="text-white font-semibold">{instanceDetails.instance_info?.instance_id}</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">难度等级</p>
                    <p className="text-amber-400 font-semibold">{instanceDetails.instance_info?.difficulty}</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">面板节点数</p>
                    <p className="text-white font-semibold">{instanceDetails.instance_info?.n_nodes}</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">数据类型</p>
                    <p className="text-emerald-400 font-semibold">{instanceDetails.instance_info?.type}</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">逆变器坐标</p>
                    <p className="text-white font-semibold">
                      ({instanceDetails.instance_info?.inverter_coord?.[0]?.toFixed(1)}, {instanceDetails.instance_info?.inverter_coord?.[1]?.toFixed(1)}) {instanceDetails.instance_info?.unit}
                    </p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">版本</p>
                    <p className="text-white font-semibold">{instanceDetails.instance_info?.version}</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3 md:col-span-2">
                    <p className="text-gray-400 text-xs">数据来源</p>
                    <p className="text-gray-300 text-sm">{instanceDetails.instance_info?.source}</p>
                  </div>
                </div>
              </div>

              {/* 地形数据 */}
              {instanceDetails.terrain_data && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-1">
                    <Mountain className="w-4 h-4 text-emerald-400" />
                    地形数据
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-gray-400 text-xs">网格尺寸</p>
                      <p className="text-white font-semibold">{instanceDetails.terrain_data.grid_size} m</p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-gray-400 text-xs">坡度范围</p>
                      <p className="text-white font-semibold">
                        {instanceDetails.terrain_data.slope_range?.[0] || 0}° - {instanceDetails.terrain_data.slope_range?.[1] || 0}°
                      </p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-gray-400 text-xs">海拔范围</p>
                      <p className="text-white font-semibold">
                        {instanceDetails.terrain_data.elevation_range?.[0] || 400} - {instanceDetails.terrain_data.elevation_range?.[1] || 600} m
                      </p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-gray-400 text-xs">坡度矩阵</p>
                      <p className="text-white font-semibold">
                        {instanceDetails.terrain_data.slope_matrix ? `${instanceDetails.terrain_data.slope_matrix.length}×${instanceDetails.terrain_data.slope_matrix[0]?.length || 0}` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 设备参数 */}
              {instanceDetails.equipment_params && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-1">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    设备参数
                  </h4>
                  <div className="space-y-4">
                    {/* 逆变器 */}
                    {instanceDetails.equipment_params.inverter && (
                      <div className="bg-black/20 rounded-lg p-3">
                        <p className="text-cyan-400 text-xs font-medium mb-2">逆变器参数</p>
                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div>
                            <p className="text-gray-500">q (容量因子)</p>
                            <p className="text-white">{instanceDetails.equipment_params.inverter.q}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">r (效率)</p>
                            <p className="text-white">{instanceDetails.equipment_params.inverter.r}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">p (极数)</p>
                            <p className="text-white">{instanceDetails.equipment_params.inverter.p}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* 变压器 */}
                    {instanceDetails.equipment_params.transformer && (
                      <div className="bg-black/20 rounded-lg p-3">
                        <p className="text-amber-400 text-xs font-medium mb-2">箱变参数</p>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="text-gray-500">容量选项 (kVA)</p>
                            <p className="text-white">{instanceDetails.equipment_params.transformer.Q_box_options?.join(', ')}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">成本 (万元)</p>
                            <p className="text-white">
                              1600kVA: ¥{instanceDetails.equipment_params.transformer.c_box?.[1600]}, 3200kVA: ¥{instanceDetails.equipment_params.transformer.c_box?.[3200]}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* 电缆 */}
                    {instanceDetails.equipment_params.cable && (
                      <div className="bg-black/20 rounded-lg p-3">
                        <p className="text-emerald-400 text-xs font-medium mb-2">电缆参数</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                          <div>
                            <p className="text-gray-500">电阻率 ρ</p>
                            <p className="text-white">{(instanceDetails.equipment_params.cable.rho * 1e8).toFixed(2)}×10⁻⁸ Ω·m</p>
                          </div>
                          <div>
                            <p className="text-gray-500">电缆半径 r_c</p>
                            <p className="text-white">{(instanceDetails.equipment_params.cable.r_c * 1000).toFixed(1)} mm</p>
                          </div>
                          <div>
                            <p className="text-gray-500">最大电流 I_max</p>
                            <p className="text-white">{instanceDetails.equipment_params.cable.I_max} A</p>
                          </div>
                          <div>
                            <p className="text-gray-500">成本系数 c1</p>
                            <p className="text-white">¥{instanceDetails.equipment_params.cable.c1}/m</p>
                          </div>
                          <div>
                            <p className="text-gray-500">成本系数 c2</p>
                            <p className="text-white">¥{instanceDetails.equipment_params.cable.c2}/m</p>
                          </div>
                          <div>
                            <p className="text-gray-500">成本系数 c3</p>
                            <p className="text-white">¥{instanceDetails.equipment_params.cable.c3}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* 变电站 */}
                    {instanceDetails.equipment_params.substation && (
                      <div className="bg-black/20 rounded-lg p-3">
                        <p className="text-purple-400 text-xs font-medium mb-2">变电站参数</p>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="text-gray-500">变电站容量</p>
                            <p className="text-white">{instanceDetails.equipment_params.substation.Q_substation} MVA</p>
                          </div>
                          <div>
                            <p className="text-gray-500">坐标</p>
                            <p className="text-white">
                              ({instanceDetails.equipment_params.substation.coord?.[0]}, {instanceDetails.equipment_params.substation.coord?.[1]})
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 损耗参数 */}
              {instanceDetails.loss_params && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-1">
                    <BarChart3 className="w-4 h-4 text-orange-400" />
                    损耗计算参数
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-gray-400 text-xs">功率损耗因子 λ</p>
                      <p className="text-white font-semibold">{instanceDetails.loss_params.lambda}</p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-gray-400 text-xs">温度 T</p>
                      <p className="text-white font-semibold">{instanceDetails.loss_params.T} °C</p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-gray-400 text-xs">年日照小时 τ</p>
                      <p className="text-white font-semibold">{instanceDetails.loss_params.tau} h</p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-gray-400 text-xs">电阻损耗系数 r_d</p>
                      <p className="text-white font-semibold">{instanceDetails.loss_params.r_d}</p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-gray-400 text-xs">电价 C_elec</p>
                      <p className="text-white font-semibold">¥{instanceDetails.loss_params.C_elec}/kWh</p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-gray-400 text-xs">电流段数 K</p>
                      <p className="text-white font-semibold">{instanceDetails.loss_params.K_segments}</p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-gray-400 text-xs">电缆半径 r_c</p>
                      <p className="text-white font-semibold">{(instanceDetails.loss_params.r_c * 1000).toFixed(1)} mm</p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-gray-400 text-xs">最大电流 I_max</p>
                      <p className="text-white font-semibold">{instanceDetails.loss_params.I_max} A</p>
                    </div>
                  </div>
                  {instanceDetails.loss_params.linear_params && instanceDetails.loss_params.linear_params.length > 0 && (
                    <div className="mt-4 bg-black/20 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-2">分段线性参数 (a_i, b_i)</p>
                      <div className="flex flex-wrap gap-2">
                        {instanceDetails.loss_params.linear_params.map((param, idx) => (
                          <span key={idx} className="text-xs bg-cyan-400/10 text-cyan-300 px-2 py-1 rounded">
                            段{idx + 1}: a={param.a_i}, b={param.b_i}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 面板与距离矩阵 */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-1">
                  <Layers className="w-4 h-4 text-blue-400" />
                  面板与距离矩阵
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">面板数量</p>
                    <p className="text-white font-semibold text-xl">{instanceDetails.pva_list?.length || 0}</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">距离矩阵</p>
                    <p className="text-white font-semibold">
                      {instanceDetails.dist_matrix ? `${instanceDetails.dist_matrix.length}×${instanceDetails.dist_matrix[0]?.length || 0}` : 'N/A'}
                    </p>
                  </div>
                </div>
                {instanceDetails.pva_list && instanceDetails.pva_list.length > 0 && (
                  <div className="mt-4">
                    <p className="text-gray-400 text-xs mb-2">面板列表 (前5个)</p>
                    <div className="bg-black/20 rounded-lg p-3 overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-gray-500 border-b border-white/10">
                            <th className="text-left py-1">ID</th>
                            <th className="text-left py-1">X (m)</th>
                            <th className="text-left py-1">Y (m)</th>
                            <th className="text-left py-1">网格坐标</th>
                            <th className="text-left py-1">切割规格</th>
                          </tr>
                        </thead>
                        <tbody>
                          {instanceDetails.pva_list.slice(0, 5).map((pva, idx) => (
                            <tr key={idx} className="border-b border-white/5 text-gray-300">
                              <td className="py-1">{pva.panel_id}</td>
                              <td className="py-1">{pva.x?.toFixed(2)}</td>
                              <td className="py-1">{pva.y?.toFixed(2)}</td>
                              <td className="py-1">[{(pva.grid_coord || []).join(', ')}]</td>
                              <td className="py-1">{pva.cut_spec?.join(' × ')} m</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {instanceDetails.pva_list.length > 5 && (
                        <p className="text-gray-500 text-xs mt-2">... 共 {instanceDetails.pva_list.length} 个面板</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-white/10 flex justify-end sticky bottom-0 bg-gray-900">
              <button
                onClick={() => setShowDetails(false)}
                className="px-6 py-2 bg-white/5 text-gray-300 border border-white/10 rounded-lg hover:bg-white/10 transition"
              >
                关闭
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 算例比较模态框 */}
      {showComparison && comparisonInstances.length >= 2 && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-6xl max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  算例比较
                </h3>
                <button
                  onClick={closeComparison}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-400 mt-2">
                比较 {comparisonInstances.length} 个算例的详细信息
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* 基本信息比较 */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-1">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  基本信息
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2 px-4 text-gray-400">指标</th>
                        {comparisonInstances.map(instance => (
                          <th key={instance.instance_id} className="text-left py-2 px-4 text-cyan-400">
                            {instance.instance_id}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-white/5">
                        <td className="py-2 px-4 text-gray-300">算例名称</td>
                        {comparisonInstances.map(instance => (
                          <td key={instance.instance_id} className="py-2 px-4 text-white">
                            {instance.name}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2 px-4 text-gray-300">节点数</td>
                        {comparisonInstances.map(instance => (
                          <td key={instance.instance_id} className="py-2 px-4 text-white">
                            {instance.n_nodes}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2 px-4 text-gray-300">状态</td>
                        {comparisonInstances.map(instance => (
                          <td key={instance.instance_id} className={`py-2 px-4 text-white ${statusColors[instance.status] || 'text-gray-400'}`}>
                            {statusLabels[instance.status] || instance.status}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2 px-4 text-gray-300">创建时间</td>
                        {comparisonInstances.map(instance => (
                          <td key={instance.instance_id} className="py-2 px-4 text-white">
                            {new Date(instance.created_at).toLocaleString()}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 px-4 text-gray-300">可用模块</td>
                        {comparisonInstances.map(instance => (
                          <td key={instance.instance_id} className="py-2 px-4 text-white">
                            {(instance.available_modules || []).length > 0
                              ? (instance.available_modules || []).map((m) => `模块${m}`).join('、')
                              : '无'}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 地形信息比较 */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-1">
                  <Mountain className="w-4 h-4 text-emerald-400" />
                  地形信息
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2 px-4 text-gray-400">指标</th>
                        {comparisonInstances.map(instance => (
                          <th key={instance.instance_id} className="text-left py-2 px-4 text-cyan-400">
                            {instance.instance_id}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-white/5">
                        <td className="py-2 px-4 text-gray-300">最小海拔</td>
                        {comparisonInstances.map(instance => (
                          <td key={instance.instance_id} className="py-2 px-4 text-white">
                            {instance.terrain_info?.min_elevation || 'N/A'}m
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2 px-4 text-gray-300">最大海拔</td>
                        {comparisonInstances.map(instance => (
                          <td key={instance.instance_id} className="py-2 px-4 text-white">
                            {instance.terrain_info?.max_elevation || 'N/A'}m
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2 px-4 text-gray-300">平均坡度</td>
                        {comparisonInstances.map(instance => (
                          <td key={instance.instance_id} className="py-2 px-4 text-white">
                            {instance.terrain_info?.average_slope || 'N/A'}°
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 px-4 text-gray-300">地形复杂度</td>
                        {comparisonInstances.map(instance => (
                          <td key={instance.instance_id} className="py-2 px-4 text-white">
                            {instance.terrain_info?.terrain_complexity || 'N/A'}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 面板信息比较 */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-1">
                  <Layers className="w-4 h-4 text-blue-400" />
                  面板信息
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2 px-4 text-gray-400">指标</th>
                        {comparisonInstances.map(instance => (
                          <th key={instance.instance_id} className="text-left py-2 px-4 text-cyan-400">
                            {instance.instance_id}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-white/5">
                        <td className="py-2 px-4 text-gray-300">面板总数</td>
                        {comparisonInstances.map(instance => (
                          <td key={instance.instance_id} className="py-2 px-4 text-white">
                            {instance.panel_info?.total_panels || 'N/A'}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2 px-4 text-gray-300">面板密度</td>
                        {comparisonInstances.map(instance => (
                          <td key={instance.instance_id} className="py-2 px-4 text-white">
                            {instance.panel_info?.panel_density || 'N/A'} 块/亩
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 px-4 text-gray-300">布局效率</td>
                        {comparisonInstances.map(instance => (
                          <td key={instance.instance_id} className="py-2 px-4 text-white">
                            {instance.panel_info?.layout_efficiency || 'N/A'}%
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/10 flex justify-end">
              <button
                onClick={closeComparison}
                className="px-4 py-2 bg-white/5 text-gray-300 border border-white/10 rounded-lg hover:bg-white/10 transition"
              >
                关闭
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 模板预览模态框 */}
      {showTemplatePreview && templatePreviewData && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-5xl max-h-[85vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-white/10 sticky top-0 bg-gray-900 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  模板预览 - {templatePreviewData.name}
                </h3>
                <button
                  onClick={() => setShowTemplatePreview(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-400 mt-2">
                {templatePreviewData.description}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* 基本信息 */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-1">
                  <Info className="w-4 h-4 text-cyan-400" />
                  基本信息
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">难度等级</p>
                    <p className={`font-semibold ${templatePreviewData.difficulty === '简单' ? 'text-green-400' : templatePreviewData.difficulty === '中等' ? 'text-yellow-400' : 'text-red-400'}`}>
                      {templatePreviewData.difficulty}
                    </p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">地形类型</p>
                    <p className="text-white font-semibold">{templatePreviewData.terrain}</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">项目规模</p>
                    <p className="text-white font-semibold">{templatePreviewData.scale}</p>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <p className="text-gray-400 text-xs">面板数量</p>
                    <p className="text-white font-semibold">{templatePreviewData.parameters?.n_nodes || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* 模板特性 */}
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400" />
                  模板特性
                </h4>
                <div className="flex flex-wrap gap-2">
                  {templatePreviewData.features?.map((feature: string, idx: number) => (
                    <span key={idx} className="text-xs px-3 py-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
                      <CheckCircle2 className="w-3 h-3 inline mr-1" />
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* 详细参数 */}
              {templatePreviewData.parameters && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-1">
                    <Settings className="w-4 h-4 text-blue-400" />
                    详细参数
                  </h4>
                  <div className="space-y-4">
                    {/* 地形参数 */}
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-amber-400 text-xs font-medium mb-2">地形参数</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <p className="text-gray-500">网格尺寸</p>
                          <p className="text-white">{templatePreviewData.parameters.grid_size || 'N/A'} m</p>
                        </div>
                        <div>
                          <p className="text-gray-500">坡度范围</p>
                          <p className="text-white">
                            {templatePreviewData.parameters.slope_range?.[0] || 'N/A'}° - {templatePreviewData.parameters.slope_range?.[1] || 'N/A'}°
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">海拔范围</p>
                          <p className="text-white">
                            {templatePreviewData.parameters.elevation_range?.[0] || 'N/A'} - {templatePreviewData.parameters.elevation_range?.[1] || 'N/A'} m
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 设备参数 */}
                    {templatePreviewData.parameters.equipment && (
                      <div className="bg-black/20 rounded-lg p-3">
                        <p className="text-cyan-400 text-xs font-medium mb-2">设备参数</p>
                        <div className="space-y-3 text-xs">
                          {/* 逆变器参数 */}
                          {templatePreviewData.parameters.equipment.inverter && (
                            <div>
                              <p className="text-gray-400 mb-1">逆变器</p>
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <p className="text-gray-500">q (容量因子)</p>
                                  <p className="text-white">{templatePreviewData.parameters.equipment.inverter.q}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">r (效率)</p>
                                  <p className="text-white">{templatePreviewData.parameters.equipment.inverter.r}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">p (极数)</p>
                                  <p className="text-white">{templatePreviewData.parameters.equipment.inverter.p}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 变压器参数 */}
                          {templatePreviewData.parameters.equipment.transformer && (
                            <div>
                              <p className="text-gray-400 mb-1">箱变</p>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <p className="text-gray-500">容量选项</p>
                                  <p className="text-white">{templatePreviewData.parameters.equipment.transformer.Q_box_options?.join(', ')} kVA</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">成本</p>
                                  <p className="text-white">
                                    {Object.entries(templatePreviewData.parameters.equipment.transformer.c_box || {}).map(([k, v]: any) => `${k}kVA: ¥${v}`).join('、')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 电缆参数 */}
                          {templatePreviewData.parameters.equipment.cable && (
                            <div>
                              <p className="text-gray-400 mb-1">电缆</p>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                <div>
                                  <p className="text-gray-500">电阻率 ρ</p>
                                  <p className="text-white">{(templatePreviewData.parameters.equipment.cable.rho * 1e8).toFixed(2)}×10⁻⁸ Ω·m</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">电缆半径</p>
                                  <p className="text-white">{(templatePreviewData.parameters.equipment.cable.r_c * 1000).toFixed(1)} mm</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">最大电流</p>
                                  <p className="text-white">{templatePreviewData.parameters.equipment.cable.I_max} A</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/10 flex justify-end sticky bottom-0 bg-gray-900">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowTemplatePreview(false)}
                  className="px-6 py-2 bg-white/5 text-gray-300 border border-white/10 rounded-lg hover:bg-white/10 transition"
                >
                  关闭
                </button>
                <button
                  onClick={async () => {
                    try {
                      setNotification({ type: 'info', message: `正在下载模板 ${templatePreviewData.name}...` });
                      const response = await fetch(`/algorithm/templates/${templatePreviewData.id}/download`);
                      const data = await response.json();
                      if (data.status === 'success' && data.data) {
                        const blob = new Blob([data.data.content], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = data.data.filename;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        setNotification({ type: 'success', message: `模板 ${templatePreviewData.name} 下载成功` });
                      } else {
                        setNotification({ type: 'error', message: '下载模板失败' });
                      }
                    } catch (error) {
                      console.error('下载模板失败:', error);
                      setNotification({ type: 'error', message: '下载模板失败' });
                    } finally {
                      setTimeout(() => setNotification(null), 3000);
                    }
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-lg hover:from-cyan-600 hover:to-emerald-600 transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  下载此模板
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
