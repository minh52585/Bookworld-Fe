import { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, App, Alert } from 'antd';
import { EyeOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Wallet } from '@/types/wallet';
import { walletAPI } from '@/apis/wallets';

const WalletManagement = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch wallets data - Lấy từ API users thật
  const fetchWallets = async () => {
    setLoading(true);
    try {
      const response = await walletAPI.getAllWallets();
      console.log('📊 Wallet Response:', response);
      
      if (response.success) {
        setWallets(response.data);
        
        // Hiển thị thông báo phù hợp
        if (response.message?.includes('Cần đăng nhập')) {
          message.warning({
            content: 'Cần đăng nhập với tài khoản admin để xem danh sách ví.',
            duration: 5,
          });
        } else if (response.message?.includes('Tạo') && response.message?.includes('users')) {
          message.success({
            content: response.message,
            duration: 4,
          });
        } else {
          message.info({
            content: response.message || 'Hiển thị dữ liệu ví',
            duration: 3,
          });
        }
      } else {
        message.error('Không thể lấy danh sách ví');
        setWallets([]);
      }
    } catch (error: any) {
      console.error('❌ Error:', error);
      message.error('Lỗi không xác định');
      setWallets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

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
      case 'active':
        return 'green';
      case 'locked':
        return 'red';
      default:
        return 'default';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Hoạt động';
      case 'locked':
        return 'Bị khóa';
      default:
        return status;
    }
  };

  // Wallet columns
  const columns = [
    {
      title: 'STT',
      dataIndex: 'stt',
      key: 'stt',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Người dùng',
      key: 'user',
      render: (record: Wallet) => (
        <div>
          <div><strong>{record.user?.name || record.user?.email?.split('@')[0] || 'N/A'}</strong></div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.user?.email}
          </div>
        </div>
      ),
    },
    {
      title: 'Số dư',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance: number) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          {formatCurrency(balance)}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (record: Wallet) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/wallets/${record._id}/transactions`)}
          >
            Xem giao dịch
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Quản lý ví</h1>

     

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: 0 }}>Danh sách ví người dùng</h3>
          <p style={{ margin: 0, color: '#666' }}>Tổng số ví: {wallets.length}</p>
        </div>
      </div>

     

      <Table
        columns={columns}
        dataSource={wallets}
        loading={loading}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} ví`,
        }}
        locale={{
          emptyText: 'Chưa có ví nào trong hệ thống.'
        }}
      />
    </div>
  );
};

export default WalletManagement;