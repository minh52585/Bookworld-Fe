import { useState, useEffect } from 'react';
import { Table, Button, Tag, Card, Statistic, Row, Col, App } from 'antd';
import { WalletOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { walletAPI } from '@/apis/wallets';
import { Wallet } from '@/types/wallet';

const WalletsPage = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch danh sách ví của người dùng
  const fetchWallets = async () => {
    setLoading(true);
    try {
      const response = await walletAPI.getAllWallets();
      if (response.success) {
        setWallets(response.data);
        message.success(response.message || 'Lấy danh sách ví thành công');
      } else {
        message.error(response.message || 'Lỗi khi lấy danh sách ví');
        setWallets([]);
      }
    } catch (error: any) {
      console.error('API Error:', error);
      message.error('Không thể lấy danh sách ví từ backend.');
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

  // Get status color and text
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'green', text: 'Hoạt động' };
      case 'locked':
        return { color: 'red', text: 'Bị khóa' };
      default:
        return { color: 'default', text: status };
    }
  };

  // Tính tổng số dư tất cả ví
  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

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
      render: (record: Wallet) => {
        // Nếu user là object (đã populate)
        if (typeof record.user === 'object' && record.user !== null) {
          return (
            <div>
              <div><strong>{record.user.name || record.user.email?.split('@')[0] || 'N/A'}</strong></div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {record.user.email}
              </div>
            </div>
          );
        }
        
        // Nếu user chỉ là ObjectId string
        return (
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              User ID: {record.user}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Số dư',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance: number) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff', fontSize: '16px' }}>
          {formatCurrency(balance)}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusDisplay = getStatusDisplay(status);
        return (
          <Tag color={statusDisplay.color}>
            {statusDisplay.text}
          </Tag>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Cập nhật cuối',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
  
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ display: 'flex', alignItems: 'center' }}>
          <WalletOutlined style={{ marginRight: 8 }} />
          Danh sách ví người dùng
        </h1>
      </div>

      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng số ví"
              value={wallets.length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
       
      </Row>

      {/* Bảng danh sách ví */}
      <Card>
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
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default WalletsPage;