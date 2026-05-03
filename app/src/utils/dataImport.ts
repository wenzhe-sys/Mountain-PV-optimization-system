// 数据导入工具

// 转义HTML特殊字符，防止XSS攻击
const escapeHTML = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// 清理和验证输入数据
const sanitizeData = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  } else if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitized[key] = sanitizeData(data[key]);
      }
    }
    return sanitized;
  } else if (typeof data === 'string') {
    return escapeHTML(data);
  }
  return data;
};

// 解析CSV文件
export const parseCSV = (csvContent: string): any[] => {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(header => escapeHTML(header.trim()));
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values: string[] = [];
    let currentValue = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(escapeHTML(currentValue.trim()));
        currentValue = '';
      } else {
        currentValue += char;
      }
    }

    values.push(escapeHTML(currentValue.trim()));

    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });

    result.push(row);
  }

  return result;
};

// 从文件读取CSV
export const importFromCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const data = parseCSV(csvContent);
        const sanitizedData = sanitizeData(data);
        resolve(sanitizedData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    reader.readAsText(file);
  });
};

// 从文件读取JSON
export const importFromJSON = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonContent = e.target?.result as string;
        // 验证JSON内容，防止恶意代码注入
        if (jsonContent.includes('<script') || jsonContent.includes('javascript:')) {
          reject(new Error('文件包含不安全内容'));
          return;
        }
        const data = JSON.parse(jsonContent);
        const sanitizedData = sanitizeData(data);
        resolve(sanitizedData);
      } catch (error) {
        reject(new Error('JSON解析失败'));
      }
    };
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    reader.readAsText(file);
  });
};

// 验证导入的数据格式
export const validateImportData = (data: any, type: string): boolean => {
  if (!Array.isArray(data)) {
    return false;
  }

  switch (type) {
    case 'inverters':
      return data.every((item: any) => 
        item.id && item.name && item.x && item.y && item.capacity
      );
    case 'transformers':
      return data.every((item: any) => 
        item.id && item.name && item.x && item.y && item.capacity
      );
    case 'combinerBoxes':
      return data.every((item: any) => 
        item.id && item.name && item.x && item.y && item.capacity
      );
    case 'distributionCabinets':
      return data.every((item: any) => 
        item.id && item.name && item.x && item.y && item.capacity
      );
    case 'cableRoutes':
      return data.every((item: any) => 
        item.id && item.from && item.to && item.length
      );
    case 'maintenanceSchedule':
      return data.every((item: any) => 
        item.id && item.device && item.type && item.date
      );
    case 'failurePrediction':
      return data.every((item: any) => 
        item.device && item.risk && item.remainingLife
      );
    default:
      return false;
  }
};