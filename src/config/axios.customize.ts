import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5004/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("admin_token");

    if (token) {
      // Đảm bảo headers luôn tồn tại
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      console.error("401 - Admin token thiếu hoặc hết hạn");
    }

    if (status === 403) {
      console.error(" 403 - Không có quyền admin");
    }

    return Promise.reject(error);
  }
);

export default api;
