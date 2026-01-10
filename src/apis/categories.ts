import api from '@/config/axios.customize';

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

// Lấy danh sách categories
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

// Lấy category theo ID
export const getCategoryById = async (id: string) => {
  const response = await api.get(`/categories/${id}`);
  return response.data;
};

// Tạo category mới
export const createCategory = async (data: Omit<ICategory, '_id' | 'createdAt' | 'updatedAt' | 'slug'>) => {
  const token = localStorage.getItem('admin_token');
  const response = await api.post('/categories', data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

// Cập nhật category
export const updateCategory = async (id: string, data: Partial<Omit<ICategory, '_id' | 'createdAt' | 'updatedAt' | 'slug'>>) => {
  const token = localStorage.getItem('admin_token');
  const response = await api.put(`/categories/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

// Xóa category
export const deleteCategory = async (id: string) => {
  const token = localStorage.getItem('admin_token');
  const response = await api.delete(`/categories/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};