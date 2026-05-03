import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Upload, 
  FileText, 
  FileJson, 
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { exportSystemData, exportToCSV } from '../utils/dataExport';
import { importFromCSV, importFromJSON, validateImportData } from '../utils/dataImport';

interface DataManagerProps {
  onClose: () => void;
}

export default function DataManager({ onClose }: DataManagerProps) {
  const { 
    equipment, 
    cableRoutes, 
    maintenanceSchedule, 
    failurePrediction,
    addInverter,
    addTransformer,
    addCombinerBox,
    addDistributionCabinet,
    addCableRoute,
    addMaintenanceSchedule
  } = useAppStore();

  const [importStatus, setImportStatus] = useState<{ status: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ 
    status: 'idle', 
    message: '' 
  });
  const [importType, setImportType] = useState('inverters');

  const handleExportAll = () => {
    const systemData = {
      equipment,
      cableRoutes,
      maintenanceSchedule,
      failurePrediction
    };
    exportSystemData(systemData);
  };

  const handleExportType = (type: string) => {
    let data: any[] = [];
    const filename = type;

    switch (type) {
      case 'inverters':
        data = equipment.inverters;
        break;
      case 'transformers':
        data = equipment.transformers;
        break;
      case 'combinerBoxes':
        data = equipment.combinerBoxes;
        break;
      case 'distributionCabinets':
        data = equipment.distributionCabinets;
        break;
      case 'cableRoutes':
        data = cableRoutes;
        break;
      case 'maintenanceSchedule':
        data = maintenanceSchedule;
        break;
      case 'failurePrediction':
        data = failurePrediction;
        break;
      default:
        return;
    }

    exportToCSV(data, filename);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus({ status: 'loading', message: '正在导入数据...' });

    try {
      let data: any;

      if (file.name.endsWith('.csv')) {
        data = await importFromCSV(file);
      } else if (file.name.endsWith('.json')) {
        data = await importFromJSON(file);
      } else {
        throw new Error('不支持的文件格式');
      }

      // 验证数据
      if (!validateImportData(data, importType)) {
        throw new Error('数据格式不正确');
      }

      // 导入数据
      switch (importType) {
        case 'inverters':
          data.forEach((item: any) => addInverter(item));
          break;
        case 'transformers':
          data.forEach((item: any) => addTransformer(item));
          break;
        case 'combinerBoxes':
          data.forEach((item: any) => addCombinerBox(item));
          break;
        case 'distributionCabinets':
          data.forEach((item: any) => addDistributionCabinet(item));
          break;
        case 'cableRoutes':
          data.forEach((item: any) => addCableRoute(item));
          break;
        case 'maintenanceSchedule':
          data.forEach((item: any) => addMaintenanceSchedule(item));
          break;
        default:
          break;
      }

      setImportStatus({ status: 'success', message: '数据导入成功！' });
      setTimeout(() => {
        setImportStatus({ status: 'idle', message: '' });
      }, 3000);

    } catch (error) {
      setImportStatus({ status: 'error', message: (error as Error).message });
      setTimeout(() => {
        setImportStatus({ status: 'idle', message: '' });
      }, 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-[#0f172a] rounded-2xl border border-cyan-500/30 w-full max-w-2xl max-h-[80vh] overflow-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-cyan-500/20 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            <span>数据管理</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <XCircle className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Export Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-400" />
              <span>数据导出</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Export All */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExportAll}
                className="p-4 rounded-lg bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 border border-emerald-400/30 flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-400/10 flex items-center justify-center">
                  <FileJson className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-medium">导出全部数据</p>
                  <p className="text-gray-400 text-sm">导出为CSV和JSON格式</p>
                </div>
              </motion.button>

              {/* Export by Type */}
              <div className="grid grid-cols-2 gap-2">
                {
                  [
                    { key: 'inverters', label: '逆变器' },
                    { key: 'transformers', label: '变压器' },
                    { key: 'cableRoutes', label: '电缆路由' },
                    { key: 'maintenanceSchedule', label: '运维计划' }
                  ].map((item) => (
                    <motion.button
                      key={item.key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleExportType(item.key)}
                      className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm"
                    >
                      {item.label}
                    </motion.button>
                  ))
                }
              </div>
            </div>
          </div>

          {/* 算例模板下载 */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-cyan-400" />
              <span>算例模板下载</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  name: '简单算例模板',
                  description: '适用于小型山地光伏项目',
                  filename: 'simple_instance_template.json',
                  sampleData: {
                    instance_id: 'simple_example',
                    type: 'public',
                    difficulty: 'easy',
                    n_nodes: 10,
                    inverter_coord: [0, 0],
                    unit: 'kW',
                    source: 'template',
                    version: '1.0',
                    terrain_data: {
                      grid_size: 100,
                      slope_matrix: Array(10).fill(null).map(() => Array(10).fill(5))
                    },
                    equipment_params: {
                      inverter: { q: 0.02, r: 0.05, p: 0.01 },
                      transformer: {
                        Q_box_options: [1600, 3200],
                        c_box: { '1600': 150000, '3200': 250000 },
                        c_install_box: { '1600': 50000, '3200': 80000 }
                      },
                      cable: {
                        c1: 100,
                        c2: 200,
                        c3: 300,
                        rho: 1.72e-8,
                        r_c: 0.015,
                        I_max: 200
                      },
                      substation: { Q_substation: 10000, coord: [50, 50] }
                    }
                  }
                },
                {
                  name: '中等算例模板',
                  description: '适用于中型山地光伏项目',
                  filename: 'medium_instance_template.json',
                  sampleData: {
                    instance_id: 'medium_example',
                    type: 'public',
                    difficulty: 'medium',
                    n_nodes: 50,
                    inverter_coord: [0, 0],
                    unit: 'kW',
                    source: 'template',
                    version: '1.0',
                    terrain_data: {
                      grid_size: 200,
                      slope_matrix: Array(20).fill(null).map(() => Array(20).fill(10))
                    },
                    equipment_params: {
                      inverter: { q: 0.02, r: 0.05, p: 0.01 },
                      transformer: {
                        Q_box_options: [1600, 3200, 4800],
                        c_box: { '1600': 150000, '3200': 250000, '4800': 350000 },
                        c_install_box: { '1600': 50000, '3200': 80000, '4800': 100000 }
                      },
                      cable: {
                        c1: 100,
                        c2: 200,
                        c3: 300,
                        rho: 1.72e-8,
                        r_c: 0.015,
                        I_max: 200
                      },
                      substation: { Q_substation: 30000, coord: [100, 100] }
                    }
                  }
                },
                {
                  name: '复杂算例模板',
                  description: '适用于大型山地光伏项目',
                  filename: 'complex_instance_template.json',
                  sampleData: {
                    instance_id: 'complex_example',
                    type: 'public',
                    difficulty: 'hard',
                    n_nodes: 100,
                    inverter_coord: [0, 0],
                    unit: 'kW',
                    source: 'template',
                    version: '1.0',
                    terrain_data: {
                      grid_size: 300,
                      slope_matrix: Array(30).fill(null).map(() => Array(30).fill(15))
                    },
                    equipment_params: {
                      inverter: { q: 0.02, r: 0.05, p: 0.01 },
                      transformer: {
                        Q_box_options: [1600, 3200, 4800, 6400],
                        c_box: { '1600': 150000, '3200': 250000, '4800': 350000, '6400': 450000 },
                        c_install_box: { '1600': 50000, '3200': 80000, '4800': 100000, '6400': 120000 }
                      },
                      cable: {
                        c1: 100,
                        c2: 200,
                        c3: 300,
                        rho: 1.72e-8,
                        r_c: 0.015,
                        I_max: 200
                      },
                      substation: { Q_substation: 50000, coord: [150, 150] }
                    }
                  }
                }
              ].map((template, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(template.sampleData, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = template.filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="p-4 rounded-lg bg-gradient-to-r from-cyan-400/20 to-blue-400/20 border border-cyan-400/30 flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-cyan-400/10 flex items-center justify-center mb-3">
                    <FileJson className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h4 className="text-white font-medium mb-1">{template.name}</h4>
                  <p className="text-gray-400 text-xs mb-3">{template.description}</p>
                  <span className="text-xs text-cyan-400">下载模板</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Import Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-amber-400" />
              <span>数据导入</span>
            </h3>

            <div className="space-y-4">
              {/* Import Type Selection */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">数据类型</label>
                <select
                  value={importType}
                  onChange={(e) => setImportType(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="inverters">逆变器</option>
                  <option value="transformers">变压器</option>
                  <option value="combinerBoxes">汇流箱</option>
                  <option value="distributionCabinets">配电柜</option>
                  <option value="cableRoutes">电缆路由</option>
                  <option value="maintenanceSchedule">运维计划</option>
                </select>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">上传文件</label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-10 h-10 text-gray-400" />
                      <p className="text-white">点击或拖拽文件到此处</p>
                      <p className="text-gray-400 text-sm">支持 CSV 和 JSON 格式</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Import Status */}
              {importStatus.status !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg ${importStatus.status === 'success' ? 'bg-emerald-400/10 border border-emerald-400/30' : importStatus.status === 'error' ? 'bg-red-400/10 border border-red-400/30' : 'bg-blue-400/10 border border-blue-400/30'}`}
                >
                  <div className="flex items-center gap-2">
                    {importStatus.status === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    {importStatus.status === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
                    {importStatus.status === 'loading' && <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />}
                    <span className={`${importStatus.status === 'success' ? 'text-emerald-400' : importStatus.status === 'error' ? 'text-red-400' : 'text-blue-400'}`}>
                      {importStatus.message}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-cyan-500/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
          >
            关闭
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}