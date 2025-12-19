import axios from "axios";

/**
 * Axios instance cho ADMIN
 * Tự động gắn admin_token vào Authorization header
 */

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5004/api",
  withCredentials: true,
});

/**
 * Request interceptor
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("❌ 401 - Admin token thiếu hoặc hết hạn");
    }

    if (error.response?.status === 403) {
      console.error("⛔ 403 - Không có quyền admin");
    }

    return Promise.reject(error);
  }
);

export default api;
