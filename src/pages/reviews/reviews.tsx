import {
  Button,
  Table,
  Select,
  Space,
  Tag,
  Rate,
  Image,
  message,
  Modal,
  Card,
  Input,
  DatePicker,
  Row,
  Col,
  Statistic,
} from "antd";
import { useEffect, useState } from "react";
import { reviewsAPI } from "../../apis/reviews";
import { IReview, IReviewFilters } from "../../types/review";
import { CheckOutlined, CloseOutlined, EyeOutlined, SearchOutlined, StarOutlined } from "@ant-design/icons";

const { Search } = Input;
const { RangePicker } = DatePicker;

const Reviews = () => {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState<IReview | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [filters, setFilters] = useState<IReviewFilters>({
    rating: undefined,
    page: 1,
    limit: 10,
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    avgRating: 0,
  });

  // ================= FETCH API =================
  const fetchReviews = async () => {
    try {
      setLoading(true);

      const params: any = {
        page: filters.page,
        limit: filters.limit,
      };

      if (filters.rating !== undefined) {
        params.rating = filters.rating;
      }

      const res = await reviewsAPI.getAllReviews(params);
      const data = res.data.data;

      setReviews(data.items);
      setPagination({
        current: data.page,
        pageSize: data.limit,
        total: data.total,
      });

      // Tính toán thống kê
      calculateStats(data.items);
    } catch (err: any) {
      message.error(err.response?.data?.message || "Lỗi tải review");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewList: IReview[]) => {
    const total = reviewList.length;
    const pending = reviewList.filter(r => r.status === 'pending').length;
    const approved = reviewList.filter(r => r.status === 'approved').length;
    const rejected = reviewList.filter(r => r.status === 'rejected').length;
    const avgRating = reviewList.length > 0 
      ? reviewList.reduce((sum, r) => sum + r.rating, 0) / reviewList.length 
      : 0;

    setStats({
      total,
      pending,
      approved,
      rejected,
      avgRating: Math.round(avgRating * 10) / 10,
    });
  };

  useEffect(() => {
    fetchReviews();
  }, [filters]);

  // ================= ACTIONS =================
  const approveReview = async (id: string) => {
    try {
      await reviewsAPI.approveReview(id);
      message.success("Đã duyệt review");
      fetchReviews();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Duyệt thất bại");
    }
  };

  

  // ================= FILTER FUNCTIONS =================
  const handleRatingFilter = (rating: number | undefined) => {
    setFilters({
      ...filters,
      rating,
      page: 1,
    });
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  // Lọc dữ liệu local
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = searchText === "" || 
      review.user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      review.product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || review.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // ================= UI =================
  const renderStatus = (status: string) => {
    const map: any = {
      pending: { color: "orange", text: "Chờ duyệt" },
      approved: { color: "green", text: "Đã duyệt" },
      rejected: { color: "red", text: "Từ chối" },
    };
    return <Tag color={map[status].color}>{map[status].text}</Tag>;
  };

  const columns = [
    {
      title: "STT",
      width: 60,
      render: (_: any, __: any, index: number) => 
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Người dùng",
      dataIndex: ["user", "name"],
      width: 150,
      ellipsis: true,
    },
    {
      title: "Sản phẩm",
      dataIndex: ["product", "name"],
      width: 200,
      ellipsis: true,
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      width: 120,
      render: (r: number) => (
        <Space>
          <Rate disabled value={r} style={{ fontSize: '14px' }} />
          <span>({r})</span>
        </Space>
      ),
      sorter: (a: IReview, b: IReview) => a.rating - b.rating,
    },
    {
      title: "Nội dung",
      dataIndex: "comment",
      ellipsis: true,
      render: (text: string) => (
        <span title={text}>
          {text.length > 50 ? `${text.substring(0, 50)}...` : text}
        </span>
      ),
    },
    {
      title: "Ảnh",
      dataIndex: "images",
      width: 100,
      render: (imgs: string[]) =>
        imgs?.length ? (
          <Image.PreviewGroup>
            <Image 
              width={40} 
              height={40} 
              src={imgs[0]} 
              style={{ objectFit: 'cover', borderRadius: '4px' }}
            />
            {imgs.length > 1 && (
              <span style={{ marginLeft: 4, fontSize: '12px', color: '#666' }}>
                +{imgs.length - 1}
              </span>
            )}
          </Image.PreviewGroup>
        ) : (
          <span style={{ color: '#999' }}>Không có</span>
        ),
    },
    
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      width: 120,
      render: (d: string) => new Date(d).toLocaleDateString("vi-VN"),
      sorter: (a: IReview, b: IReview) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Hành động",
      width: 200,
      render: (_: any, r: IReview) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedReview(r);
              setDetailModalVisible(true);
            }}
          >
            Xem
          </Button>

      
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Thống kê */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng đánh giá"
              value={stats.total}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Chờ duyệt"
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
       
        <Col span={6}>
          <Card>
            <Statistic
              title="Điểm trung bình"
              value={stats.avgRating}
              precision={1}
              suffix="⭐"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* ===== FILTER ===== */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Search
              placeholder="Tìm kiếm người dùng, sản phẩm, nội dung..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col span={4}>
            <Select
              allowClear
              placeholder="Lọc theo rating"
              style={{ width: '100%' }}
              value={filters.rating}
              onChange={handleRatingFilter}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <Select.Option key={n} value={n}>
                  <Space>
                    <Rate disabled value={n} style={{ fontSize: '12px' }} />
                    <span>({n} sao)</span>
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            
          </Col>
          <Col span={10}>
            <Space>
              <span style={{ color: '#666' }}>
                Hiển thị: {filteredReviews.length}/{reviews.length} đánh giá
              </span>
            </Space>
          </Col>
        </Row>

        {/* ===== TABLE ===== */}
        <Table
          rowKey="_id"
          loading={loading}
          columns={columns}
          dataSource={filteredReviews}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} đánh giá`,
            onChange: (p, ps) =>
              setFilters({ ...filters, page: p, limit: ps || 10 }),
          }}
          scroll={{ x: 1200 }}
        />

        {/* ===== MODAL DETAIL ===== */}
        <Modal
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              Đóng
            </Button>,
          
          ]}
          title="Chi tiết đánh giá"
          width={600}
        >
          {selectedReview && (
            <div>
              <Row gutter={16}>
                <Col span={12}>
                  <p><strong>Người dùng:</strong> {selectedReview.user.name}</p>
                  <p><strong>Email:</strong> {selectedReview.user.email || 'Không có'}</p>
                </Col>
                <Col span={12}>
                  <p><strong>Sản phẩm:</strong> {selectedReview.product.name}</p>
                </Col>
              </Row>

              <div style={{ margin: '16px 0' }}>
                <strong>Đánh giá:</strong>
                <div style={{ marginTop: 8 }}>
                  <Rate disabled value={selectedReview.rating} />
                  <span style={{ marginLeft: 8 }}>({selectedReview.rating}/5 sao)</span>
                </div>
              </div>

              <div style={{ margin: '16px 0' }}>
                <strong>Nội dung:</strong>
                <p style={{ 
                  marginTop: 8, 
                  padding: '12px', 
                  backgroundColor: '#f5f5f5', 
                  borderRadius: '6px',
                  minHeight: '60px'
                }}>
                  {selectedReview.comment || 'Không có nội dung'}
                </p>
              </div>

              {selectedReview.images?.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <strong>Ảnh đánh giá:</strong>
                  <Image.PreviewGroup>
                    <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
                      {selectedReview.images.map((img, i) => (
                        <Col key={i}>
                          <Image
                            src={img}
                            width={80}
                            height={80}
                            style={{ objectFit: "cover", borderRadius: 6 }}
                          />
                        </Col>
                      ))}
                    </Row>
                  </Image.PreviewGroup>
                </div>
              )}

              <div style={{ marginTop: 16, fontSize: '12px', color: '#666' }}>
                <p><strong>Ngày tạo:</strong> {new Date(selectedReview.createdAt).toLocaleString('vi-VN')}</p>
                <p><strong>Cập nhật:</strong> {new Date(selectedReview.updatedAt).toLocaleString('vi-VN')}</p>
              </div>
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default Reviews;
