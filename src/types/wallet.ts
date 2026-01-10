export interface Wallet {
  _id: string;
  user: string | {
    _id: string;
    name?: string;
    email?: string;
  };
  balance: number;
  status: 'active' | 'locked';
  createdAt: string;
  updatedAt: string;
  __v?: number;
  stt?: number; // For table display
  key?: string; // For table display
}

export interface WalletTransaction {
  _id: string;
  wallet: string | {
    _id: string;
    balance: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  user: {
    _id: string;
    name: string;
    email: string;
  };
  type: 'Nạp tiền' | 'Rút tiền'; // Chỉ 2 loại theo backend
  amount: number;
  status: 'Chờ xử lý' | 'Thành công' | 'Thất bại' | 'Đã hủy';
  description: string;
  withdrawalMethod?: {
    _id: string;
    name: string;
  } | string;
  order?: {
    _id: string;
    total: number;
    status: string;
  } | string;
  createdAt: string;
  updatedAt: string;
  stt?: number; // For table display
  key?: string; // For table display
}

export interface WalletFormData {
  user: string;
  balance: number;
  status: 'active' | 'locked';
}

export interface TransactionFormData {
  wallet: string;
  type: 'Nạp tiền' | 'Rút tiền'; 
  amount: number;
  description: string;
  withdrawalMethod?: string;
}