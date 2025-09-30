import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { store } from '@/store';
import { logout } from '@/store/slices/userSlice';

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 获取 token 的函数
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }
  return null;
};

// 清除认证信息的函数
const clearAuth = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }
  // 清除 Redux 中的用户状态
  store.dispatch(logout());
};

// 跳转到登录页的函数
const redirectToLogin = (): void => {
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    // 避免在登录页面重复跳转
    if (!currentPath.includes('/login')) {
      // 保存当前页面路径，登录后可以跳转回来
      sessionStorage.setItem('redirectPath', currentPath);
      window.location.href = '/login';
    }
  }
};

// 请求拦截器
request.interceptors.request.use(
  (config: any) => {
    const token = getToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 未登录且目标需要认证时，直接跳转登录页并中断该请求
    if (typeof window !== 'undefined') {
      const noToken = !token;
      const requiresAuth = config?.url ? checkAuthRequired(String(config.url)) : true;
      const onLogin = window.location.pathname.includes('/login');
      if (noToken && requiresAuth && !onLogin) {
        redirectToLogin();
        // 返回挂起的 Promise，阻止后续无效请求继续
        return new Promise(() => {});
      }
    }

    console.log('🚀 发送请求:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ 请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('✅ 响应成功:', response.status, response.config.url);
    
    // 如果响应中包含新的 token，更新本地存储
    const newToken = response.headers['x-new-token'];
    if (newToken && typeof window !== 'undefined') {
      localStorage.setItem('token', newToken);
    }
    
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    
    console.error('❌ 响应错误:', status, url);
    
    switch (status) {
      case 401:
        // 未授权，清除认证信息并跳转到登录页
        console.warn('🔐 未授权访问，跳转到登录页');
        clearAuth();
        redirectToLogin();
        break;
        
      case 403:
        // 禁止访问
        console.error('🚫 访问被禁止');
        break;
        
      case 404:
        // 资源不存在
        console.error('🔍 请求的资源不存在');
        break;
        
      case 422:
        // 请求参数错误
        console.error('📝 请求参数错误');
        break;
        
      case 429:
        // 请求过于频繁
        console.error('⏰ 请求过于频繁，请稍后再试');
        break;
        
      case 500:
      case 502:
      case 503:
      case 504:
        // 服务器错误
        console.error('🔧 服务器错误，请稍后再试');
        break;
        
      default:
        console.error('🌐 网络错误或未知错误');
    }
    
    return Promise.reject(error);
  }
);

// 检查是否需要认证的函数
export const checkAuthRequired = (url: string): boolean => {
  const publicPaths = ['/login', '/register', '/forgot-password', '/public'];
  return !publicPaths.some(path => url.includes(path));
};

// 检查用户是否已登录
export const isAuthenticated = (): boolean => {
  const token = getToken();
  const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  return !!(token && user);
};

export default request;