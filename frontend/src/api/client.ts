import axios from 'axios';

// Dynamically use the current hostname (e.g. 'localhost' or '192.168.x.x') and configurable port
const apiHost = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
const apiPort = import.meta.env.VITE_API_PORT || '5048';
export const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${apiHost}:${apiPort}`;

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for unified error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || '通信エラーが発生しました。';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);
