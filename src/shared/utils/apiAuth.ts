import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { config as appConfig } from '../../core/server/config';

const apiAuth = axios.create({
  baseURL: appConfig.apiAuthUrl,
  withCredentials: true,
});

const apiDirection: AxiosInstance = axios.create({
  baseURL: appConfig.apiDirectionUrl,
  withCredentials: true,
});

apiAuth.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = appConfig.apiAuthKey;

    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

apiDirection.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = appConfig.apiAuthKey;

    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

export { apiAuth, apiDirection };
export default apiAuth;
