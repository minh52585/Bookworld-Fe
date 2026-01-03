import { IUser } from "../types/user";

// Dữ liệu user mẫu dựa trên thông tin bạn cung cấp
export const sampleUser: IUser = {
  _id: "693170eca7e1d11ae3aa901d",
  name: "Phạm Nhật Minh",
  email: "minhpnph52585@gmail.com",
  password: "$2b$10$scmeuBnAPKfdUvWiyevRp.6lkYT0rjOwi8RxThRG9YvMcrnWwVywG",
  role: "user",
  createdAt: "2025-12-04T11:30:52.975+00:00",
  __v: 0,
  otpLastRequestAt: "2026-01-02T15:43:10.176+00:00",
  otpRequestCount: 1,
  otpVerifyAttempts: 0,
  resetPasswordExpires: "2026-01-02T15:58:10.202+00:00",
  resetPasswordOTP: "ebdb88d787fcda4425a723c2fd4e49f914a497d3b66c14a3bab9883192e03fd2",
  status: true
};

// Dữ liệu mẫu cho testing
export const sampleUsers: IUser[] = [
  sampleUser,
  {
    _id: "693170eca7e1d11ae3aa901e",
    name: "Nguyễn Văn Admin",
    email: "admin@bookworld.com",
    password: "$2b$10$scmeuBnAPKfdUvWiyevRp.6lkYT0rjOwi8RxThRG9YvMcrnWwVywG",
    role: "admin",
    createdAt: "2025-11-01T10:00:00.000+00:00",
    __v: 0,
    status: true
  },
  {
    _id: "693170eca7e1d11ae3aa901f",
    name: "Trần Thị Lan",
    email: "lan.tran@gmail.com",
    password: "$2b$10$scmeuBnAPKfdUvWiyevRp.6lkYT0rjOwi8RxThRG9YvMcrnWwVywG",
    role: "user",
    createdAt: "2025-12-10T14:20:30.000+00:00",
    __v: 0,
    otpRequestCount: 0,
    otpVerifyAttempts: 0,
    status: false
  },
  {
    _id: "693170eca7e1d11ae3aa9020",
    name: "Lê Hoàng Nam",
    email: "nam.le@yahoo.com",
    password: "$2b$10$scmeuBnAPKfdUvWiyevRp.6lkYT0rjOwi8RxThRG9YvMcrnWwVywG",
    role: "user",
    createdAt: "2025-12-15T09:15:45.000+00:00",
    __v: 0,
    phoneNumber: "0987654321",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    gender: "Nam",
    otpRequestCount: 2,
    otpVerifyAttempts: 1,
    status: true
  }
];