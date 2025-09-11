import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig } from 'axios';

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

export const redirectToLogin = () => {
  window.location.assign('/login');
};

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

export const refreshAccessToken = async (
  refreshToken: string,
): Promise<TokenResponse> => {
  const response = await apiClient.post<TokenResponse>(
    '/auth/refresh',
    { refresh_token: refreshToken },
  );
  return response.data;
};

export const handleApiError = async (
  error: AxiosError,
  redirect: () => void = redirectToLogin,
) => {
  if (error.response?.status === 401) {
    if (error.config) {
      const refresh = localStorage.getItem('refreshToken');
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
      if (refresh && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const { access_token, refresh_token } = await refreshAccessToken(refresh);
          localStorage.setItem('token', access_token);
          localStorage.setItem('refreshToken', refresh_token);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${access_token}`,
          };
          return apiClient.request(originalRequest);
        } catch {
          redirect();
        }
      } else {
        redirect();
      }
    } else {
      redirect();
    }
  }
  // Placeholder for toast notifications or other handling
  console.error(error);
  return Promise.reject(error);
};

apiClient.interceptors.response.use(
  (response) => response,
  handleApiError,
);

export default apiClient;
