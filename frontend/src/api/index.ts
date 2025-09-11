import axios from 'axios';

const apiClient = axios.create({
  // Ensure default points to versioned API prefix
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Let axios set multipart boundaries automatically for FormData
  if (config.data instanceof FormData) {
    if (config.headers && 'Content-Type' in config.headers) {
      delete (config.headers as any)['Content-Type'];
    }
  } else {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

export default apiClient;
