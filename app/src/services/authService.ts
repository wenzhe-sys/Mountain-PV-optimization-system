// 认证服务

// 本地模拟登录（因为Node.js后端未运行）
const mockUsers = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'password123',
    name: '系统管理员',
    role: 'admin'
  },
  {
    id: '2',
    email: 'user@example.com',
    password: 'password123',
    name: '普通用户',
    role: 'user'
  }
];

// 登录
const login = async (email: string, password: string): Promise<{ token: string; user: any }> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 查找用户
  const user = mockUsers.find(u => u.email === email && u.password === password);
  
  if (!user) {
    throw new Error('邮箱或密码错误');
  }
  
  // 生成模拟token
  const token = `mock-token-${user.id}-${Date.now()}`;
  
  // 存储令牌和用户信息
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  return {
    token,
    user
  };
};

// 注册
const signup = async (name: string, email: string, password: string, role: string = 'user'): Promise<{ token: string; user: any }> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 检查邮箱是否已存在
  if (mockUsers.some(u => u.email === email)) {
    throw new Error('邮箱已被注册');
  }
  
  // 创建新用户
  const newUser = {
    id: (mockUsers.length + 1).toString(),
    email,
    password,
    name,
    role
  };
  
  mockUsers.push(newUser);
  
  // 存储用户信息
  localStorage.setItem('user', JSON.stringify(newUser));
  
  return {
    token: `registered-user-${newUser.id}`,
    user: newUser
  };
};

// 登出
const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// 获取当前用户
const getCurrentUser = (): any => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

// 检查用户是否已登录
const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};

// 检查用户权限
const hasPermission = (requiredRole: string): boolean => {
  const user = getCurrentUser();
  if (!user) {
    return false;
  }

  // 角色权限层级：admin > user
  const roleHierarchy: Record<string, number> = {
    admin: 2,
    user: 1
  };

  return (roleHierarchy[user.role] || 0) >= (roleHierarchy[requiredRole] || 0);
};

// 获取当前用户信息
const getMe = async (): Promise<any> => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('未登录');
  }
  return user;
};

export default {
  login,
  signup,
  logout,
  getCurrentUser,
  isAuthenticated,
  hasPermission,
  getMe
};