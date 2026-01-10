import { useState, useEffect } from 'react';
import { Card, Statistic, Tag, Spin, Alert, Row, Col } from 'antd';
import { WalletOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Wallet } from '@/types/wallet';
import { getMyWallet } from '@/apis/wallets';

const MyWallet = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy thông tin ví của user hiện tại
  const fetchMyWallet = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getMyWallet();
      
      if (response.success) {
        setWallet(response.data);
      } else {
        setError(response.message || 'Không thể lấy thông tin ví');
      }
    } catch (err: any) {
      console.error('Error fetching wallet:', err);
      setError(err.message || 'Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyWallet();
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Đang tải thông tin ví...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
        style={{ margin: '20px 0' }}
      />
    );
  }

  if (!wallet) {
    return (
      <Alert
        message="Thông báo"
        description="Bạn chưa có ví điện tử. Vui lòng liên hệ admin để tạo ví."
        type="info"
        showIcon
        style={{ margin: '20px 0' }}
      />
    );
  }

  const statusDisplay = getStatusDisplay(wallet.status);

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
        <WalletOutlined style={{ marginRight: 8 }} />
        Ví của tôi
      </h1>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Số dư hiện tại"
              value={wallet.balance}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Trạng thái ví</p>
              <Tag color={statusDisplay.color} style={{ fontSize: '16px', padding: '4px 12px', marginTop: 8 }}>
                {statusDisplay.text}
              </Tag>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Ngày tạo</p>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', marginTop: 8 }}>
                {new Date(wallet.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }} title={<><InfoCircleOutlined /> Thông tin chi tiết</>}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <p><strong>ID Ví:</strong> {wallet._id}</p>
          </Col>
          <Col xs={24} sm={12}>
            <p><strong>Cập nhật lần cuối:</strong> {new Date(wallet.updatedAt).toLocaleString('vi-VN')}</p>
          </Col>
        </Row>
      </Card>

      {wallet.status === 'locked' && (
        <Alert
          message="Ví bị khóa"
          description="Ví của bạn hiện đang bị khóa. Vui lòng liên hệ admin để được hỗ trợ."
          type="warning"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </div>
  );
};

export default MyWallet;