export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt?: string;
  __v: number;
  otpLastRequestAt?: string;
  otpRequestCount?: number;
  otpVerifyAttempts?: number;
  resetPasswordExpires?: string;
  resetPasswordOTP?: string;
  status?: boolean;
  avatar_url?: string;
  phoneNumber?: string;
  address?: string;
  gender?: string;
}

export interface IUserTableData {
  id: string;
  stt: number;
  usersName: string;
  fullName: string;
  email: string;
  avatar_url: string;
  role_id: string;
  status: boolean;
  created_at: string;
  update_at?: string;
  phoneNumber?: string;
  address?: string;
  gender?: string;
  otpRequestCount?: number;
  lastLogin?: string;
}

export interface IUserResponse {
  success: boolean;
  data: IUser[];
  message?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    limit: number;
  };
}