import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Trích xuất message thân thiện từ Axios error hoặc backend ApiResponse
 */
export const getErrorMessage = (error, defaultMsg = 'Đã có lỗi xảy ra. Vui lòng thử lại.') => {
  if (!error) return defaultMsg;
  if (error.response?.data?.message) return error.response.data.message;
  if (typeof error.response?.data === 'string' && error.response.data.trim() !== '') return error.response.data;
  if (error.response?.data?.error) return error.response.data.error;
  if (error.message) return error.message;
  return defaultMsg;
};

export default api;

