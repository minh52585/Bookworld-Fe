import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Tag, 
  message, 
  Input, 
  Select, 
  Empty,
  Spin,
  Modal,
  Typography
} from 'antd';
import { 
  GiftOutlined, 
  CopyOutlined, 
  SearchOutlined,
  CalendarOutlined,
  PercentageOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Search } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

interface ICoupon {
  _id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
}

const Coupons: React.FC = () => {
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedCoupon, setSelectedCoupon] = useState<ICoupon | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5004/api/coupons/active');
      if (response.data.success) {
        setCoupons(response.data.data);
      } else {
        message.error('Không thể tải danh sách mã giảm giá');
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      message.error('Lỗi khi tải mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    message.success(`Đã sao chép mã: ${code}`);
  };

  const applyCoupon = async (couponId: string, code: string) => {
    try {
      // Lưu mã giảm giá vào localStorage hoặc context
      localStorage.setItem('selectedCoupon', JSON.stringify({ id: couponId, code }));
      message.success(`Đã áp dụng mã giảm giá: ${code}`);
    } catch (error) {
      message.error('Không thể áp dụng mã giảm giá');
    }
  };

  const showCouponDetail = (coupon: ICoupon) => {
    setSelectedCoupon(coupon);
    setIsModalVisible(true);
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const isAvailable = (coupon: ICoupon) => {
    return coupon.usedCount < coupon.usageLimit && !isExpired(coupon.endDate) && coupon.isActive;
  };

  const formatDiscount = (coupon: ICoupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}%`;
    } else {
      return `${coupon.discountValue.toLocaleString('vi-VN')}đ`;
    }
  };

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         coupon.code.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'available' && isAvailable(coupon)) ||
                         (filterType === 'expired' && isExpired(coupon.endDate)) ||
                         (filterType === 'percentage' && coupon.discountType === 'percentage') ||
                         (filterType === 'fixed' && coupon.discountType === 'fixed');
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
          <GiftOutlined style={{ marginRight: '8px' }} />
          Mã Giảm Giá
        </Title>

        {/* Bộ lọc */}
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={16} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Tìm kiếm mã giảm giá..."
                allowClear
                enterButton={<SearchOutlined />}
                onSearch={setSearchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                style={{ width: '100%' }}
                placeholder="Lọc theo loại"
                value={filterType}
                onChange={setFilterType}
              >
                <Option value="all">Tất cả</Option>
                <Option value="available">Còn hiệu lực</Option>
                <Option value="expired">Hết hạn</Option>
                <Option value="percentage">Giảm theo %</Option>
                <Option value="fixed">Giảm cố định</Option>
              </Select>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <Text type="secondary">
                Hiển thị: {filteredCoupons.length}/{coupons.length} mã giảm giá
              </Text>
            </Col>
          </Row>
        </Card>

        {/* Danh sách mã giảm giá */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : filteredCoupons.length === 0 ? (
          <Empty 
            description="Không có mã giảm giá nào"
            style={{ padding: '50px' }}
          />
        ) : (
          <Row gutter={[16, 16]}>
            {filteredCoupons.map((coupon) => (
              <Col xs={24} sm={12} lg={8} key={coupon._id}>
                <Card
                  hoverable
                  style={{
                    height: '100%',
                    opacity: isAvailable(coupon) ? 1 : 0.6,
                    border: isAvailable(coupon) ? '2px solid #1890ff' : '1px solid #d9d9d9'
                  }}
                  actions={[
                    <Button
                      type="link"
                      icon={<CopyOutlined />}
                      onClick={() => copyCouponCode(coupon.code)}
                    >
                      Sao chép
                    </Button>,
                    <Button
                      type="primary"
                      disabled={!isAvailable(coupon)}
                      onClick={() => applyCoupon(coupon._id, coupon.code)}
                    >
                      Áp dụng
                    </Button>,
                    <Button
                      type="link"
                      onClick={() => showCouponDetail(coupon)}
                    >
                      Chi tiết
                    </Button>
                  ]}
                >
                  <div style={{ textAlign: 'center' }}>
                    {/* Icon và loại giảm giá */}
                    <div style={{ marginBottom: '16px' }}>
                      {coupon.discountType === 'percentage' ? (
                        <PercentageOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
                      ) : (
                        <GiftOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                      )}
                    </div>

                    {/* Tên và mã */}
                    <Title level={4} style={{ marginBottom: '8px' }}>
                      {coupon.name}
                    </Title>
                    <Text code style={{ fontSize: '16px', fontWeight: 'bold' }}>
                      {coupon.code}
                    </Text>

                    {/* Giá trị giảm */}
                    <div style={{ margin: '16px 0' }}>
                      <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#f5222d' }}>
                        Giảm {formatDiscount(coupon)}
                      </Text>
                    </div>

                    {/* Điều kiện */}
                    <div style={{ marginBottom: '16px' }}>
                      <Text type="secondary">
                        Đơn tối thiểu: {coupon.minOrderValue.toLocaleString('vi-VN')}đ
                      </Text>
                      {coupon.maxDiscountAmount && (
                        <div>
                          <Text type="secondary">
                            Giảm tối đa: {coupon.maxDiscountAmount.toLocaleString('vi-VN')}đ
                          </Text>
                        </div>
                      )}
                    </div>

                    {/* Trạng thái */}
                    <div style={{ marginBottom: '16px' }}>
                      {isExpired(coupon.endDate) ? (
                        <Tag color="red">Hết hạn</Tag>
                      ) : isAvailable(coupon) ? (
                        <Tag color="green">Còn hiệu lực</Tag>
                      ) : (
                        <Tag color="orange">Hết lượt sử dụng</Tag>
                      )}
                    </div>

                    {/* Thời hạn */}
                    <div>
                      <CalendarOutlined style={{ marginRight: '4px' }} />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        HSD: {new Date(coupon.endDate).toLocaleDateString('vi-VN')}
                      </Text>
                    </div>

                    {/* Số lượt sử dụng */}
                    <div style={{ marginTop: '8px' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Đã dùng: {coupon.usedCount}/{coupon.usageLimit}
                      </Text>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Modal chi tiết */}
        <Modal
          title="Chi tiết mã giảm giá"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsModalVisible(false)}>
              Đóng
            </Button>,
            selectedCoupon && isAvailable(selectedCoupon) && (
              <Button
                key="apply"
                type="primary"
                onClick={() => {
                  applyCoupon(selectedCoupon._id, selectedCoupon.code);
                  setIsModalVisible(false);
                }}
              >
                Áp dụng mã
              </Button>
            )
          ]}
        >
          {selectedCoupon && (
            <div>
              <Row gutter={16}>
                <Col span={24}>
                  <div style={{ marginBottom: '16px' }}>
                    <Text strong>Tên: </Text>
                    <Text>{selectedCoupon.name}</Text>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <Text strong>Mã: </Text>
                    <Text code>{selectedCoupon.code}</Text>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <Text strong>Mô tả: </Text>
                    <Text>{selectedCoupon.description}</Text>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <Text strong>Loại giảm giá: </Text>
                    <Tag color={selectedCoupon.discountType === 'percentage' ? 'green' : 'blue'}>
                      {selectedCoupon.discountType === 'percentage' ? 'Theo phần trăm' : 'Cố định'}
                    </Tag>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <Text strong>Giá trị: </Text>
                    <Text style={{ color: '#f5222d', fontWeight: 'bold' }}>
                      {formatDiscount(selectedCoupon)}
                    </Text>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <Text strong>Đơn hàng tối thiểu: </Text>
                    <Text>{selectedCoupon.minOrderValue.toLocaleString('vi-VN')}đ</Text>
                  </div>
                  {selectedCoupon.maxDiscountAmount && (
                    <div style={{ marginBottom: '16px' }}>
                      <Text strong>Giảm tối đa: </Text>
                      <Text>{selectedCoupon.maxDiscountAmount.toLocaleString('vi-VN')}đ</Text>
                    </div>
                  )}
                  <div style={{ marginBottom: '16px' }}>
                    <Text strong>Thời gian: </Text>
                    <Text>
                      {new Date(selectedCoupon.startDate).toLocaleDateString('vi-VN')} - {' '}
                      {new Date(selectedCoupon.endDate).toLocaleDateString('vi-VN')}
                    </Text>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <Text strong>Lượt sử dụng: </Text>
                    <Text>{selectedCoupon.usedCount}/{selectedCoupon.usageLimit}</Text>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Coupons;