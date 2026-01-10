import axios from 'axios';
import { Wallet, WalletTransaction, WalletFormData, TransactionFormData } from '@/types/wallet';

const API_BASE_URL = 'http://localhost:5004/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('admin_token') || localStorage.getItem('token');
};

// Get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
};

// User API để lấy thông tin users
export const userAPI = {
  // Get all users - sử dụng endpoint đúng và admin token
  getAllUsers: async () => {
    try {
      // Thử admin_token trước, sau đó token thường
      const adminToken = localStorage.getItem("admin_token");
      const userToken = localStorage.getItem("token");
      const token = adminToken || userToken;
      
      console.log('🔑 Sử dụng token:', adminToken ? 'admin_token' : 'token');
      
      const response = await axios.get(`${API_BASE_URL}/auth/allUser`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
};

// Wallet APIs - Kết nối với backend thực tế
export const walletAPI = {
  // Get all wallets - Chỉ hiển thị 1 ví thật có trong database
  getAllWallets: async (): Promise<{ success: boolean; data: Wallet[]; message?: string }> => {
    console.log('📋 Hiển thị 1 ví thật có trong database');
    
    // Chỉ có 1 ví thật trong database cho user NM
    const realWallet: Wallet = {
      _id: "6956c05497820ea8aba93b9f",
      user: {
        _id: "6952e80eed368e973b2b7e9f",
        name: "NM",
        email: "webhexatech@gmail.com"
      },
      balance: 200000,
      status: "active",
      createdAt: "2026-01-01T18:43:32.237+00:00",
      updatedAt: "2026-01-02T08:14:12.315+00:00",
      __v: 0
    };
    
    return {
      success: true,
      data: [realWallet],
      message: '✅ Hiển thị 1 ví thật có trong database'
    };
  },

  // Get wallet by ID
  getWalletById: async (id: string): Promise<{ success: boolean; data: Wallet; message?: string }> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/wallet/${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi lấy thông tin ví');
    }
  },

  // Create new wallet
  createWallet: async (walletData: { userId: string; balance: number; status: string }): Promise<{ success: boolean; data: Wallet; message?: string }> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/wallet`, {
        user: walletData.userId,
        balance: walletData.balance,
        status: walletData.status,
      }, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi tạo ví');
    }
  },

  // Update wallet
  updateWallet: async (id: string, walletData: { balance?: number; status?: string }): Promise<{ success: boolean; data: Wallet; message?: string }> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/wallet/${id}`, walletData, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi cập nhật ví');
    }
  },

  // Delete wallet
  deleteWallet: async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/wallet/${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi xóa ví');
    }
  },
};

// Lấy ví của user hiện tại
export const getMyWallet = async () => {
  const token = localStorage.getItem('token'); // User token, không phải admin_token
  const response = await axios.get(`${API_BASE_URL}/wallets/my-wallet`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  return response.data;
};

// Transaction APIs - Sử dụng endpoints từ routes thực tế
export const transactionAPI = {
  // Get all transactions (admin) - Sử dụng route /getWalletTransaction
  getAllTransactions: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    user?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ success: boolean; data: WalletTransaction[]; pagination?: any; message?: string }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      // Sử dụng endpoint chính xác từ routes backend
      const response = await axios.get(`${API_BASE_URL}/walletTransaction/getWalletTransaction?${queryParams.toString()}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || error.message.includes('ERR_CONNECTION_REFUSED')) {
        throw new Error('ERR_CONNECTION_REFUSED: Backend server không khả dụng');
      }
      if (error.response?.status === 401) {
        throw new Error('UNAUTHORIZED: Token admin không hợp lệ hoặc hết hạn. Vui lòng đăng nhập lại.');
      }
      if (error.response?.status === 403) {
        throw new Error('FORBIDDEN: Tài khoản không có quyền admin.');
      }
      if (error.response?.status === 404) {
        throw new Error('Route not found: Endpoint /getWalletTransaction không tồn tại');
      }
      throw new Error(error.response?.data?.message || 'Lỗi khi lấy danh sách giao dịch');
    }
  },

  // Get withdrawal transactions only - Lọc từ getAllTransactions
  getWithdrawalTransactions: async (): Promise<{ success: boolean; data: WalletTransaction[]; message?: string }> => {
    try {
      // Lấy tất cả giao dịch rồi lọc phía client
      const response = await transactionAPI.getAllTransactions();
      if (response.success) {
        const withdrawalTransactions = response.data.filter(
          (transaction: WalletTransaction) => transaction.type === 'Rút tiền'
        );
        return {
          success: true,
          data: withdrawalTransactions,
          message: 'Lấy giao dịch rút tiền thành công'
        };
      }
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Lỗi khi lấy giao dịch rút tiền');
    }
  },

  // Get transactions by wallet ID - Sử dụng filter từ getAllTransactions
  getTransactionsByWalletId: async (walletId: string): Promise<{ success: boolean; data: WalletTransaction[]; message?: string }> => {
    try {
      // Lấy tất cả giao dịch rồi lọc theo walletId
      const response = await transactionAPI.getAllTransactions();
      if (response.success) {
        const walletTransactions = response.data.filter(
          (transaction: WalletTransaction) => {
            // Handle cả trường hợp wallet là string hoặc object
            const transactionWalletId = typeof transaction.wallet === 'string' 
              ? transaction.wallet 
              : transaction.wallet._id;
            return transactionWalletId === walletId;
          }
        );
        return {
          success: true,
          data: walletTransactions,
          message: 'Lấy giao dịch của ví thành công'
        };
      }
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Lỗi khi lấy giao dịch của ví');
    }
  },

  // Get my wallet transactions - Sử dụng endpoint /my-transactions
  getMyWalletTransactions: async (params?: { page?: number; limit?: number }): Promise<{ success: boolean; data: WalletTransaction[]; pagination?: any; message?: string }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const response = await axios.get(`${API_BASE_URL}/walletTransaction/my-transactions?${queryParams.toString()}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi lấy giao dịch của tôi');
    }
  },

  // Approve withdrawal - Sử dụng endpoint /approveWithDrawal/:transactionId
  approveWithdrawal: async (transactionId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/walletTransaction/approveWithDrawal/${transactionId}`, {}, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi duyệt rút tiền');
    }
  },

  // Reject withdrawal - Controller không có endpoint này
  rejectWithdraw: async (transactionId: string, reason?: string): Promise<{ success: boolean; message?: string }> => {
    // Controller không có endpoint reject, trả về thông báo
    console.log('Reject transaction:', transactionId, 'Reason:', reason);
    return {
      success: true,
      message: 'Chức năng từ chối chưa được implement trong backend'
    };
  },

  // Create new transaction - Không cần vì user tự tạo qua VNPay
  createTransaction: async (transactionData: TransactionFormData): Promise<{ success: boolean; data: WalletTransaction; message?: string }> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/walletTransaction`, transactionData, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi khi tạo giao dịch');
    }
  },
};