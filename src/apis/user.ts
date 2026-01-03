import axios from "axios";
import { IUserResponse } from "../types/user";

const API_URL = "http://localhost:5004/api/auth";

// Lấy danh sách tất cả user
export const getAllUsers = async (): Promise<IUserResponse> => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API_URL}/allUser`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
  return res.data;
};

// Cập nhật trạng thái user
export const updateUserStatus = async (userId: string) => {
  const token = localStorage.getItem("token");
  const res = await axios.patch(
    `${API_URL}/users/${userId}/status`,
    {},
    {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    }
  );
  return res.data;
};

// Xóa user
export const deleteUser = async (userId: string) => {
  const token = localStorage.getItem("token");
  const res = await axios.delete(`${API_URL}/users/${userId}`, {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });
  return res.data;
};

// Lấy thông tin chi tiết user
export const getUserById = async (userId: string) => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API_URL}/users/${userId}`, {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });
  return res.data;
};