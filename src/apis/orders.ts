import api from "../config/axios.customize";
import { IOrder } from "../types/order";

export const ordersAPI = {
  // Lấy danh sách đơn hàng (admin)
  getAllOrders: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    q?: string;
  }) => {
    return api.get<IBackendResponse<{
      items: IOrder[];
      total: number;
      page: number;
      limit: number;
    }>>("/orders/admin", { params });
  },

  // Lấy danh sách đơn hàng của user
  getUserOrders: (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    return api.get<IBackendResponse<IOrder[]>>("/orders/user", { params });
  },

  // Lấy chi tiết đơn hàng
  getOrderById: (id: string) => {
    return api.get<IBackendResponse<IOrder>>(`/orders/${id}`);
  },

  // Cập nhật trạng thái đơn hàng (admin only)
  updateOrderStatus: (id: string, data: { status: string; note?: string }) => {
    return api.patch<IBackendResponse<IOrder>>(`/orders/${id}/status`, data);
  },

  // Hủy đơn hàng
  cancelOrder: (id: string, note?: string) => {
    return api.patch<IBackendResponse<IOrder>>(`/orders/${id}/cancel`, { note });
  },

  // Thanh toán đơn hàng
  payOrder: (id: string) => {
    return api.post<IBackendResponse<{ order: IOrder; paymentUrl?: string }>>(`/orders/${id}/pay`);
  }
};