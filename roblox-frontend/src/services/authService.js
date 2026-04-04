import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// สร้าง axios instance
const authAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: เพิ่ม token ใน header อัตโนมัติ
authAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: Handle token refresh
authAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ถ้า token หมดอายุ (401) และยังไม่ได้ retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return authAPI(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ===== Auth APIs =====

export const login = async (email, password) => {
  const response = await authAPI.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (name, email, password) => {
  const response = await authAPI.post('/auth/register', { name, email, password });
  return response.data;
};

export const logout = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  const response = await authAPI.post('/auth/logout', { refreshToken });
  localStorage.clear();
  return response.data;
};

export const getProfile = async () => {
  const response = await authAPI.get('/auth/me');
  return response.data;
};

export default authAPI;
