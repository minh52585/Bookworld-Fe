// src/configs/adminAxios.ts
import axios from "axios";
export const API_BASE_URL = "http://localhost:5004/api"

const adminAxios = axios.create({
  baseURL: API_BASE_URL,
});

adminAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default {adminAxios};
