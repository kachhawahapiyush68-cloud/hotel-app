// src/api/httpClient.ts
import axios from 'axios';
import { API_BASE_URL } from '../config/env';
import { useAuthStore } from '../store/authStore';

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});
