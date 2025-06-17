// Centralized API instance using fetch with global error handling
// Usage: import api from './instance'; await axiosInstance.post('/auth/login', data)

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { useAuthStore } from "../store/authStore";
import { ApiResponse } from "../types";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Retry logic
const MAX_RETRIES = 3;

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const config = error.config as AxiosRequestConfig & {
      _retryCount?: number;
    };
    // Retry logic for network or 5xx errors
    if (!config._retryCount) config._retryCount = 0;
    if (
      (!error.response || error.response.status >= 500) &&
      config._retryCount < MAX_RETRIES
    ) {
      config._retryCount += 1;
      return axiosInstance(config);
    }
    // 401 Unauthorized: logout
    if (error.response && error.response.status === 401) {
      useAuthStore.getState().logout();
      toast.error("Session expired. Please log in again.");
      return Promise.reject({ message: "Unauthorized" });
    }
    // Validation errors

    if (
      error.response &&
      error.response.status >= 400 &&
      error.response.status < 500 &&
      (error.response.data as { errors: Record<string, string> })?.errors
    ) {
      return Promise.reject(error.response.data);
    }
    // Other errors
    toast.error(
      (error.response?.data as { message: string })?.message ||
        error.message ||
        "An unexpected error occurred"
    );
    return Promise.reject({
      message:
        (error.response?.data as { message: string })?.message ||
        error.message ||
        "An unexpected error occurred",
    });
  }
);

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// axios get
const api = {
  async get<T>(url: string): Promise<ApiResponse<T>> {
    const response = await axiosInstance.get<ApiResponse<T>>(url);
    return response.data as ApiResponse<T>;
  },

  async post<T, D>(url: string, data: D): Promise<ApiResponse<T>> {
    const response = await axiosInstance.post<ApiResponse<T>>(url, data);
    return response.data as ApiResponse<T>;
  },

  async put<T, D>(url: string, data: D): Promise<ApiResponse<T>> {
    const response = await axiosInstance.put<ApiResponse<T>>(url, data);
    return response.data as ApiResponse<T>;
  },

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await axiosInstance.delete<ApiResponse<T>>(url);
    return response.data as ApiResponse<T>;
  },
};
export { toast, api };
