import axios from 'axios';

// Unified Same-Origin API Client:
// Uses relative '/api' endpoint so requests route through port 3001 (Vite proxy)
// directly to backend. This completely eliminates:
// 1. Windows Firewall blocking port 5048 on Wi-Fi / Public networks.
// 2. Extra cross-origin CORS OPTIONS preflight latency on Wi-Fi connections.
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept native window.fetch to automatically include JWT Bearer token & handle 401
if (typeof window !== 'undefined' && window.fetch) {
  const originalFetch = window.fetch;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const token = sessionStorage.getItem('mitsuhide_auth_token');
      let modifiedInit = init ? { ...init } : {};
      if (token) {
        const headers = new Headers(modifiedInit.headers || {});
        if (!headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${token}`);
        }
        modifiedInit.headers = headers;
      }
      const res = await originalFetch(input, modifiedInit);
      if (res.status === 401) {
        sessionStorage.removeItem('mitsuhide_auth_user');
        sessionStorage.removeItem('mitsuhide_auth_token');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
      return res;
    } catch (err) {
      return originalFetch(input, init);
    }
  };
}

// Request interceptor: attach bearer session token if present
apiClient.interceptors.request.use((config) => {
  try {
    const token = sessionStorage.getItem('mitsuhide_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Ignore storage errors in non-browser environments
  }
  return config;
});

// Response interceptor for unified error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Auto logout on 401 Unauthorized
    if (error.response?.status === 401) {
      try {
        sessionStorage.removeItem('mitsuhide_auth_user');
        sessionStorage.removeItem('mitsuhide_auth_token');
        window.dispatchEvent(new Event('auth:unauthorized'));
      } catch {
        // Ignore
      }
    }
    const message = error.response?.data?.message || error.message || '通信エラーが発生しました。';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);
