export interface IReview {
  _id: string;
  user: {
    _id: string;
    name: string;
    email?: string;
  };
  product: {
    _id: string;
    name: string;
  };
  order: string;
  rating: number;
  comment: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  admin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateReviewRequest {
  rating?: number;
  comment?: string;
  images?: string[];
}

export interface IUpdateReviewRequest {
  rating?: number;
  comment?: string;
  images?: string[];
}

export interface IReviewsResponse {
  items: IReview[];
  total: number;
  page: number;
  limit: number;
}

export interface IReviewFilters {
  rating?: number;
  page?: number;
  limit?: number;
}