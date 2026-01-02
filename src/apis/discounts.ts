import api from '@/config/axios.customize';

export const createDiscount = (payload: any) => api.post('/discounts', payload);
export const updateDiscount = (id: string, payload: any) => api.put(`/discounts/update/${id}`, payload);
export const getDiscounts = (params?: any) => api.get('/discounts', { params });
export const getDiscountById = (id: string) => api.get(`/discounts/${id}`);
export const validateDiscount = (body: any) => api.post('/discounts/validate', body);
export const deleteDiscount = (body: any) => api.delete('/discounts', { data: body });

export default {
  createDiscount,
  updateDiscount,
  getDiscounts,
  getDiscountById,
  validateDiscount,
  deleteDiscount,
};