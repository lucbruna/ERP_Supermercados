import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { parseCookies, setCookie, destroyCookie } from 'nookies';

interface FailedRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const { token } = parseCookies();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { refreshToken } = parseCookies();
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken },
        );

        const { token: newToken, refreshToken: newRefreshToken } = data;

        setCookie(null, 'token', newToken, {
          maxAge: 60 * 60, // 1 hour
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });

        setCookie(null, 'refreshToken', newRefreshToken, {
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        destroyCookie(null, 'token');
        destroyCookie(null, 'refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;

export const rhApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_RH_URL || 'http://localhost:3002/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

rhApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const { token } = parseCookies();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const financialApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_FINANCIAL_URL || 'http://localhost:3003/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

financialApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const { token } = parseCookies();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const crmApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CRM_URL || 'http://localhost:3006/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

crmApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const { token } = parseCookies();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const inventoryApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_INVENTORY_URL || 'http://localhost:3005/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

inventoryApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const { token } = parseCookies();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const comprasApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_COMPRAS_URL || 'http://localhost:3009/api/v1/compras',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

comprasApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const { token } = parseCookies();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const fiscalApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_FISCAL_URL || 'http://localhost:3015/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

fiscalApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const { token } = parseCookies();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const pdvApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PDV_URL || 'http://localhost:3004/api/v1/pdv',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

pdvApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const { token } = parseCookies();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const integrationApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_INTEGRATION_URL || 'http://localhost:3016/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

integrationApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const { token } = parseCookies();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const frotaApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_FROTA_URL || 'http://localhost:3011/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

frotaApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const { token } = parseCookies();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const codigoBarrasApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CODIGO_BARRAS_URL || 'http://localhost:3012/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

codigoBarrasApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const { token } = parseCookies();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const contratosApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CONTRATOS_URL || 'http://localhost:3013/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

contratosApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const { token } = parseCookies();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const habilidadesApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_HABILIDADES_URL || 'http://localhost:3014/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

habilidadesApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const { token } = parseCookies();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
