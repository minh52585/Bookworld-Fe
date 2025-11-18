import axios from 'axios';
const API_URL = 'http://localhost:5004/api/products'; // base URL

// 1. Lấy danh sách sản phẩm
export const getProducts = async (page = 1, limit = 10) => {
  const res = await axios.get(`${API_URL}?page=${page}&limit=${limit}`);
  return res.data;
};

// 2. Lấy chi tiết sản phẩm
export const getProductById = async (id: string) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

// 3. Tạo sản phẩm mới
export const createProduct = async (data: any) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

// 4. Cập nhật sản phẩm
export const updateProduct = async (id: string, updates: any) => {
  const res = await axios.put(`${API_URL}/${id}`, updates);
  return res.data;
};

// 5. Xóa sản phẩm
export const deleteProduct = async (id: string) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};
