// 项目服务

const API_URL = 'http://localhost:5000/api';

// 获取令牌
const getToken = (): string => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('未登录');
  }
  return token;
};

// 创建项目
const createProject = async (projectData: {
  name: string;
  description: string;
  location: string;
  capacity: number;
}): Promise<any> => {
  const response = await fetch(`${API_URL}/projects/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '创建项目失败');
  }

  const data = await response.json();
  return data.data.project;
};

// 获取所有项目
const getAllProjects = async (): Promise<any[]> => {
  const response = await fetch(`${API_URL}/projects/all`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '获取项目列表失败');
  }

  const data = await response.json();
  return data.data.projects;
};

// 获取单个项目
const getProject = async (projectId: string): Promise<any> => {
  const response = await fetch(`${API_URL}/projects/${projectId}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '获取项目失败');
  }

  const data = await response.json();
  return data.data.project;
};

// 更新项目
const updateProject = async (projectId: string, projectData: any): Promise<any> => {
  const response = await fetch(`${API_URL}/projects/${projectId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(projectData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '更新项目失败');
  }

  const data = await response.json();
  return data.data.project;
};

// 删除项目
const deleteProject = async (projectId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/projects/${projectId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '删除项目失败');
  }
};

// 更新地形数据
const updateTerrainData = async (projectId: string, terrainData: {
  elevation: number[][];
  slope: number[][];
  solarRadiation: number[][];
}): Promise<any> => {
  const response = await fetch(`${API_URL}/projects/${projectId}/terrain`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(terrainData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '更新地形数据失败');
  }

  const data = await response.json();
  return data.data.project;
};

export default {
  createProject,
  getAllProjects,
  getProject,
  updateProject,
  deleteProject,
  updateTerrainData,
};