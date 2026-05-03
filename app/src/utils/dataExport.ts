// 数据导出工具

// 导出为CSV格式
export const exportToCSV = (data: any[], filename: string): void => {
  if (data.length === 0) return;

  // 获取所有字段名
  const headers = Object.keys(data[0]);
  
  // 创建CSV内容
  const csvContent = [
    headers.join(','), // 头部
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // 处理包含逗号或引号的值
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // 创建Blob对象
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  // 创建下载链接
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 导出为JSON格式
export const exportToJSON = (data: any, filename: string): void => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 导出系统数据
export const exportSystemData = (systemData: any): void => {
  const { equipment, cableRoutes, maintenanceSchedule, failurePrediction } = systemData;
  
  // 导出设备数据
  exportToCSV(equipment.inverters, 'inverters');
  exportToCSV(equipment.transformers, 'transformers');
  exportToCSV(equipment.combinerBoxes, 'combinerBoxes');
  exportToCSV(equipment.distributionCabinets, 'distributionCabinets');
  
  // 导出电缆路由数据
  exportToCSV(cableRoutes, 'cableRoutes');
  
  // 导出运维数据
  exportToCSV(maintenanceSchedule, 'maintenanceSchedule');
  exportToCSV(failurePrediction, 'failurePrediction');
  
  // 导出完整系统数据为JSON
  exportToJSON(systemData, 'systemData');
};