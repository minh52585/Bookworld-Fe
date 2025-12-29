import api from "../config/axios.customize";
import { IReview, ICreateReviewRequest, IUpdateReviewRequest, IReviewsResponse, IReviewFilters } from "../types/review";

export const reviewsAPI = {
  // ================= USER ACTIONS =================
  
  // Tạo review cho sản phẩm
  createReview: (productId: string, data: ICreateReviewRequest) => {
    return api.post<IBackendResponse<IReview>>(`/reviews/${productId}`, data);
  },

  // Cập nhật review của user
  updateReview: (reviewId: string, data: IUpdateReviewRequest) => {
    return api.put<IBackendResponse<IReview>>(`/reviews/${reviewId}`, data);
  },

  // Xóa review của user
  deleteReview: (reviewId: string) => {
    return api.delete<IBackendResponse<null>>(`/reviews/${reviewId}`);
  },

  // Lấy reviews của một sản phẩm (public)
  getReviewsByProduct: (productId: string) => {
    return api.get<IBackendResponse<IReview[]>>(`/reviews/product/${productId}`);
  },

  // ================= ADMIN ACTIONS =================
  
  // Lấy danh sách tất cả reviews (admin)
  getAllReviews: (filters?: IReviewFilters) => {
    return api.get<IBackendResponse<IReviewsResponse>>("/reviews/admin", { 
      params: filters 
    });
  },

  // Duyệt review (admin)
  approveReview: (reviewId: string) => {
    return api.patch<IBackendResponse<IReview>>(`/reviews/${reviewId}/approve`);
  },

  // Từ chối review (admin)
  rejectReview: (reviewId: string) => {
    return api.patch<IBackendResponse<IReview>>(`/reviews/${reviewId}/reject`);
  },
};