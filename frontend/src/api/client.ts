import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://localhost:7001/api', // default ASP.NET Core HTTPS port
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
