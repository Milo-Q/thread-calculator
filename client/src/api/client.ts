import axios from 'axios';

// 获取API基础URL，确保以/api结尾
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) return '/api';
  
  // 如果环境变量已经包含/api，直接使用
  if (envUrl.endsWith('/api')) return envUrl;
  
  // 如果环境变量以/结尾，添加api
  if (envUrl.endsWith('/')) return `${envUrl}api`;
  
  // 否则添加/api
  return `${envUrl}/api`;
};

const API_BASE_URL = getApiBaseUrl();

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.error || error.message || '请求失败';
    return Promise.reject(new Error(message));
  }
);

// 创建类型安全的 apiClient
export const apiClient = {
  get: <T = any>(url: string, config?: any): Promise<T> => {
    return axiosInstance.get(url, config).then((response) => response as unknown as T);
  },
  post: <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return axiosInstance.post(url, data, config).then((response) => response as unknown as T);
  },
  put: <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return axiosInstance.put(url, data, config).then((response) => response as unknown as T);
  },
  delete: <T = any>(url: string, config?: any): Promise<T> => {
    return axiosInstance.delete(url, config).then((response) => response as unknown as T);
  },
  defaults: axiosInstance.defaults,
} as {
  get: <T = any>(url: string, config?: any) => Promise<T>;
  post: <T = any>(url: string, data?: any, config?: any) => Promise<T>;
  put: <T = any>(url: string, data?: any, config?: any) => Promise<T>;
  delete: <T = any>(url: string, config?: any) => Promise<T>;
  defaults: typeof axiosInstance.defaults;
};

export default apiClient;

