# Hướng dẫn khởi động Backend Server

## Lỗi kết nối Backend

Nếu bạn thấy lỗi `ERR_CONNECTION_REFUSED` trong console, có nghĩa là backend server chưa được khởi động.

## Lỗi 404 - Route not found

Nếu thấy lỗi `404 Not Found` cho `/api/walletTransaction`, có nghĩa là:

### 1. Backend server đã chạy nhưng thiếu route

Cần thêm route trong backend:

**File: `routes/walletTransaction.js`** (tạo mới nếu chưa có)
```javascript
import express from 'express';
import { 
  getAllWalletTransactions, 
  getMyWalletTransactions,
  createTopUpVnPay,
  vnpayReturn,
  withdrawFromWallet,
  approveWithdraw
} from '../controllers/walletTransaction.controller.js';
import { authenticateToken } from '../middleware/auth.js'; // Middleware xác thực

const router = express.Router();

// Public routes
router.get('/result', vnpayReturn); // VNPay callback

// Protected routes (cần đăng nhập)
router.use(authenticateToken);

// Admin routes
router.get('/', getAllWalletTransactions);           // GET /api/walletTransaction
router.get('/my', getMyWalletTransactions);          // GET /api/walletTransaction/my

// User routes  
router.post('/create-topup', createTopUpVnPay);      // POST /api/walletTransaction/create-topup
router.post('/withdraw', withdrawFromWallet);        // POST /api/walletTransaction/withdraw

// Admin actions
router.patch('/approve/:transactionId', approveWithdraw); // PATCH /api/walletTransaction/approve/:id

export default router;
```

**File: `app.js` hoặc `server.js`** (thêm vào phần routes)
```javascript
import walletTransactionRoutes from './routes/walletTransaction.js';

// Mount routes
app.use('/api/walletTransaction', walletTransactionRoutes);
```

### 2. Kiểm tra server đã chạy đúng port

Server phải chạy trên port 5004:
```bash
npm start
# hoặc
node server.js
```

### 3. Test endpoints

Sau khi setup routes, test bằng browser hoặc Postman:
- `GET http://localhost:5004/api/walletTransaction` - Lấy tất cả giao dịch
- `GET http://localhost:5004/api/walletTransaction/my` - Giao dịch của user

## Cấu hình Backend cần thiết

### Database Models cần có:
- `Wallet` model với fields: user, balance, status
- `WalletTransaction` model với fields: wallet, user, type, amount, status, description

### Middleware cần có:
- Authentication middleware để protect routes
- CORS middleware để cho phép frontend kết nối

## Troubleshooting

- **Port đã được sử dụng**: Thay đổi port trong file config backend
- **Database không kết nối**: Kiểm tra connection string MongoDB  
- **CORS error**: Đảm bảo frontend URL được thêm vào CORS whitelist
- **Route 404**: Đảm bảo routes đã được mount đúng trong app.js