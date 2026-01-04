import { useState, useEffect } from 'react';
import { Table, Tag, Alert, App, Button } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { transactionAPI } from '@/apis/wallets';
import { WalletTransaction } from '@/types/wallet';

const Wallets = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<{totalDeposit: number;totalWithdraw: number;}>({totalDeposit: 0,totalWithdraw: 0,});
  // Fetch all transactions
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await transactionAPI.getAllTransactions();
      if (response.success) {
        const formattedData = response.data.map((transaction: WalletTransaction, index: number) => ({
          ...transaction,
          stt: index + 1,
          key: transaction._id,
        }));
        setTransactions(formattedData);
         if (response.summary) {
          setSummary(response.summary);
        }
        message.success(`Đã tải ${formattedData.length} giao dịch từ backend`);
      } else {
        message.error(response.message || 'Lỗi khi lấy danh sách giao dịch');
      }
    } catch (error: any) {
      console.error('API Error:', error);
      if (error.message.includes('UNAUTHORIZED')) {
        message.error({
          content: 'Token admin hết hạn. Vui lòng đăng nhập lại.',
          duration: 5,
        });
      } else if (error.message.includes('FORBIDDEN')) {
        message.error('Tài khoản không có quyền admin.');
      } else if (error.message.includes('Route not found')) {
        message.warning({
          content: 'Backend chưa có route cho wallet transactions.',
          duration: 10,
        });
      } else if (error.message.includes('ERR_CONNECTION_REFUSED')) {
        message.error('Backend server chưa khởi động.');
      } else {
        message.error('Không thể lấy danh sách giao dịch từ backend.');
      }
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);
  const handleApproveWithdraw = async (transactionId: string) => {
    try {
      setLoading(true);
      const res = await transactionAPI.approveWithdrawal(transactionId);

      if (res.success) {
        message.success('Xác nhận rút tiền thành công');
        fetchTransactions(); // reload data
      } else {
        message.error(res.message || 'Xác nhận thất bại');
      }
    } catch (error: any) {
      message.error('Lỗi khi xác nhận rút tiền');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Chờ xử lý':
        return 'blue';
      case 'Thành công':
        return 'green';
      case 'Thất bại':
        return 'red';
      case 'Đã hủy':
        return 'default';
      default:
        return 'default';
    }
  };

  // Transaction columns
  const columns = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      width: 60,
    },
    {
      title: 'Người dùng',
      key: 'user',
      render: (record: WalletTransaction) => (
        <div>
          <div><strong>{record.user?.name || 'N/A'}</strong></div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.user?.email}
          </div>
        </div>
      ),
    },
    {
      title: 'Loại giao dịch',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'Nạp tiền' ? 'green' : 'red'}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: WalletTransaction) => (
        <span style={{ 
          fontWeight: 'bold', 
          color: record.type === 'Nạp tiền' ? '#52c41a' : '#ff4d4f',
          fontSize: '16px'
        }}>
          {record.type === 'Nạp tiền' ? '+' : '-'}{formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
  
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (record: WalletTransaction) => {
        if (record.type === 'Rút tiền' && record.status === 'Chờ xử lý') {
          return (
            <Button
              type="primary"
              danger
              size="small"
              onClick={() => handleApproveWithdraw(record._id)}
            >
              Xác nhận rút
            </Button>
          );
        }

        return (
          <Tag color={record.status === 'Thành công' ? 'green' : 'default'}>
            {record.status === 'Thành công' ? 'Đã xử lý' : '—'}
          </Tag>
        );
      },
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1> Quản lý giao dịch</h1>
        <Button
          type="primary"
          onClick={() => navigate('/wallets/management')}
        >
          Quản lý ví
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <Alert
          type="success"
          showIcon
          message="Tổng tiền nạp"
          description={
            <strong style={{ fontSize: 18 }}>
              {formatCurrency(summary.totalDeposit)}
            </strong>
          }
        />

        <Alert
          type="error"
          showIcon
          message="Tổng tiền rút"
          description={
            <strong style={{ fontSize: 18 }}>
              {formatCurrency(summary.totalWithdraw)}
            </strong>
          }
        />
      </div>

      <Table
        columns={columns}
        dataSource={transactions}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} giao dịch`,
        }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default Wallets;