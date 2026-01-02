import { useState, useEffect } from 'react';
import { Table, Button, Tag, Alert, App } from 'antd';
import { ArrowLeftOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { transactionAPI } from '@/apis/wallets';
import { WalletTransaction } from '@/types/wallet';

const WalletTransactions = () => {
  const { walletId } = useParams<{ walletId: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch transactions for specific wallet
  const fetchTransactions = async () => {
    if (!walletId) return;
    
    setLoading(true);
    try {
      const response = await transactionAPI.getTransactionsByWalletId(walletId);
      if (response.success) {
        const formattedData = response.data.map((transaction: WalletTransaction, index: number) => ({
          ...transaction,
          stt: index + 1,
          key: transaction._id,
        }));
        setTransactions(formattedData);
      } else {
        message.error(response.message || 'Lỗi khi lấy giao dịch');
      }
    } catch (error: any) {
      console.error('API Error:', error);
      message.error('Không thể lấy danh sách giao dịch của ví này từ backend.');
      setTransactions([]); // Set empty array thay vì dữ liệu mẫu
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [walletId]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Get transaction type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Nạp tiền':
        return 'green';
      case 'Rút tiền':
        return 'red';
      case 'Thanh toán':
        return 'orange';
      case 'Hoàn tiền':
        return 'cyan';
      default:
        return 'default';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Thành công':
        return 'green';
      case 'Chờ xử lý':
        return 'orange';
      case 'Thất bại':
        return 'red';
      case 'Đã hủy':
        return 'default';
      default:
        return 'default';
    }
  };

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
        <Tag color={getTypeColor(type)}>
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
          color: record.type === 'Nạp tiền' ? '#52c41a' : '#ff4d4f' 
        }}>
          {record.type === 'Nạp tiền' ? '+' : '-'}{formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
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
      title: 'Phương thức rút',
      dataIndex: 'withdrawalMethod',
      key: 'withdrawalMethod',
      render: (method: any) => {
        if (!method) return '-';
        if (typeof method === 'object') {
          return method.name || method._id;
        }
        return method;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('vi-VN'),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/wallets')}
          style={{ marginBottom: 16 }}
        >
          Quay lại danh sách ví
        </Button>
        
        <Alert
          message="Chi tiết giao dịch ví"
          description={`Hiển thị tất cả giao dịch thực của ví ID: ${walletId} từ backend. Nếu không có dữ liệu, có thể ví này chưa có giao dịch nào.`}
          type="info"
          icon={<InfoCircleOutlined />}
          style={{ marginBottom: 16 }}
          showIcon
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <h1>Lịch sử giao dịch ví</h1>
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
        scroll={{ x: 1000 }}
      />
    </div>
  );
};

export default WalletTransactions;