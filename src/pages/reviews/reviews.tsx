import { Button, Table, Select, Space, Tag, Rate, Image, message, Modal, Card } from "antd";
import { useState, useEffect } from "react";
import { reviewsAPI } from "../../apis/reviews";
import { IReview, IReviewFilters } from "../../types/review";
import { CheckOutlined, CloseOutlined, EyeOutlined } from "@ant-design/icons";

const { Option } = Select;

const Reviews = () => {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState<IReviewFilters>({
    rating: undefined,
    page: 1,
    limit: 10,
  });
  const [selectedReview, setSelectedReview] = useState<IReview | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Fetch reviews từ API
  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      // Mock data dựa trên dữ liệu thực của bạn để test
      const mockReviews = [
        {
          _id: "6952ea9f7655c20378643642",
          user: {
            _id: "6952e80eed368e973b2b7e9f",
            name: "Nguyễn Văn A",
            email: "user@example.com"
          },
          product: {
            _id: "67c200000000000000000005",
            name: "Sách Tâm lý học"
          },
          order: "6952e85ded368e973b2b7f21",
          rating: 5,
          comment: "sách hay",
          images: [],
          status: "approved",
          admin: null,
          createdAt: "2025-12-29T20:54:55.367+00:00",
          updatedAt: "2025-12-29T20:54:55.367+00:00"
        },
        {
          _id: "6952ea9f7655c20378643643",
          user: {
            _id: "6952e80eed368e973b2b7e9g",
            name: "Trần Thị B",
            email: "user2@example.com"
          },
          product: {
            _id: "67c200000000000000000006",
            name: "Sách Phát triển bản thân"
          },
          order: "6952e85ded368e973b2b7f22",
          rating: 4,
          comment: "Nội dung hay, giao hàng nhanh",
          images: ["https://picsum.photos/200/300"],
          status: "pending",
          admin: null,
          createdAt: "2025-12-29T19:30:15.367+00:00",
          updatedAt: "2025-12-29T19:30:15.367+00:00"
        },
        {
          _id: "6952ea9f7655c20378643644",
          user: {
            _id: "6952e80eed368e973b2b7e9h",
            name: "Lê Văn C",
            email: "user3@example.com"
          },
          product: {
            _id: "67c200000000000000000007",
            name: "Sách Lãng mạn"
          },
          order: "6952e85ded368e973b2b7f23",
          rating: 2,
          comment: "Sách không như mong đợi, chất lượng kém",
          images: [],
          status: "rejected",
          admin: null,
          createdAt: "2025-12-29T18:15:30.367+00:00",
          updatedAt: "2025-12-29T18:15:30.367+00:00"
        }
      ];

      // Filter theo rating nếu có
      let filteredReviews = mockReviews;
      if (filters.rating) {
        filteredReviews = mockReviews.filter(review => review.rating === filters.rating);
      }

      // Simulate API response structure
      const mockResponse = {
        success: true,
        data: {
          items: filteredReviews,
          total: filteredReviews.length,
          page: 1,
          limit: 10
        }
      };

      setReviews(mockResponse.data.items);
      setPagination(prev => ({
        ...prev,
        current: mockResponse.data.page,
        total: mockResponse.data.total,
      }));

      // Uncomment dòng dưới khi muốn dùng API thật
      // const response = await reviewsAPI.getAllReviews(filters);
      // const backendResponse = response.data as any;
      // if (backendResponse.success && backendResponse.data) {
      //   const reviewsData = backendResponse.data;
      //   setReviews(reviewsData.items);
      //   setPagination(prev => ({
      //     ...prev,
      //     current: reviewsData.page,
      //     total: reviewsData.total,
      //   }));
      // }
      
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  };

  // Load data khi component mount hoặc filters thay đổi
  useEffect(() => {
    fetchReviews();
  }, [filters]);

  // Xử lý thay đổi filter
  const handleFilterChange = (key: keyof IReviewFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset về trang 1 khi filter
    }));
  };

  // Xử lý thay đổi pagination
  const handleTableChange = (pagination: any) => {
    setFilters(prev => ({
      ...prev,
      page: pagination.current,
      limit: pagination.pageSize,
    }));
  };

  // Duyệt review
  const handleApproveReview = async (reviewId: string) => {
    try {
      // Mock approve - trong thực tế sẽ gọi API
      message.success("Đã duyệt đánh giá thành công");
      
      // Cập nhật local state
      setReviews(prev => prev.map(review => 
        review._id === reviewId 
          ? { ...review, status: 'approved' as const }
          : review
      ));
      
      // Uncomment khi dùng API thật
      // await reviewsAPI.approveReview(reviewId);
      // fetchReviews(); // Reload data
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi duyệt đánh giá");
    }
  };

  // Từ chối review
  const handleRejectReview = async (reviewId: string) => {
    try {
      // Mock reject - trong thực tế sẽ gọi API
      message.success("Đã từ chối đánh giá thành công");
      
      // Cập nhật local state
      setReviews(prev => prev.map(review => 
        review._id === reviewId 
          ? { ...review, status: 'rejected' as const }
          : review
      ));
      
      // Uncomment khi dùng API thật
      // await reviewsAPI.rejectReview(reviewId);
      // fetchReviews(); // Reload data
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi từ chối đánh giá");
    }
  };

  // Hiển thị chi tiết review
  const showReviewDetail = (review: IReview) => {
    setSelectedReview(review);
    setDetailModalVisible(true);
  };

  // Render trạng thái
  const renderStatus = (status: string) => {
    const statusConfig = {
      pending: { color: 'orange', text: 'Chờ duyệt' },
      approved: { color: 'green', text: 'Đã duyệt' },
      rejected: { color: 'red', text: 'Từ chối' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Cấu hình columns cho table
  const columns = [
    {
      title: "Người dùng",
      dataIndex: ["user", "name"],
      key: "user",
      width: 150,
    },
    {
      title: "Sản phẩm",
      dataIndex: ["product", "name"],
      key: "product",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating",
      width: 120,
      render: (rating: number) => <Rate disabled value={rating} style={{ fontSize: 14 }} />,
    },
    {
      title: "Nội dung",
      dataIndex: "comment",
      key: "comment",
      width: 250,
      ellipsis: true,
      render: (text: string) => (
        <div style={{ maxWidth: 200 }}>
          {text || "Không có bình luận"}
        </div>
      ),
    },
    {
      title: "Ảnh",
      dataIndex: "images",
      key: "images",
      width: 80,
      render: (images: string[]) => (
        images && images.length > 0 ? (
          <Image.PreviewGroup>
            <Image
              width={40}
              height={40}
              src={images[0]}
              style={{ objectFit: "cover", borderRadius: 4 }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            />
            {images.length > 1 && (
              <span style={{ marginLeft: 4, fontSize: 12, color: '#666' }}>
                +{images.length - 1}
              </span>
            )}
          </Image.PreviewGroup>
        ) : (
          <span style={{ color: '#999' }}>Không có</span>
        )
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: renderStatus,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 150,
      render: (_: any, record: IReview) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showReviewDetail(record)}
            size="small"
          >
            Xem
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => handleApproveReview(record._id)}
                size="small"
                style={{ color: 'green' }}
              >
                Duyệt
              </Button>
              <Button
                type="link"
                icon={<CloseOutlined />}
                onClick={() => handleRejectReview(record._id)}
                size="small"
                danger
              >
                Từ chối
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>Quản lý đánh giá</h1>
          
          <Space>
            <Select
              placeholder="Lọc theo rating"
              style={{ width: 200 }}
              allowClear
              value={filters.rating}
              onChange={(value) => handleFilterChange('rating', value)}
            >
              <Option value={undefined}>Tất cả</Option>
              <Option value={5}>⭐⭐⭐⭐⭐ (5 sao)</Option>
              <Option value={4}>⭐⭐⭐⭐ (4 sao)</Option>
              <Option value={3}>⭐⭐⭐ (3 sao)</Option>
              <Option value={2}>⭐⭐ (2 sao)</Option>
              <Option value={1}>⭐ (1 sao)</Option>
            </Select>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={reviews}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} đánh giá`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modal chi tiết review */}
      <Modal
        title="Chi tiết đánh giá"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
          selectedReview?.status === 'pending' && (
            <Space key="actions">
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => {
                  handleApproveReview(selectedReview._id);
                  setDetailModalVisible(false);
                }}
              >
                Duyệt
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => {
                  handleRejectReview(selectedReview._id);
                  setDetailModalVisible(false);
                }}
              >
                Từ chối
              </Button>
            </Space>
          ),
        ]}
        width={600}
      >
        {selectedReview && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <strong>Người dùng:</strong> {selectedReview.user.name}
              {selectedReview.user.email && (
                <span style={{ color: '#666', marginLeft: 8 }}>
                  ({selectedReview.user.email})
                </span>
              )}
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <strong>Sản phẩm:</strong> {selectedReview.product.name}
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <strong>Đánh giá:</strong>
              <div style={{ marginTop: 4 }}>
                <Rate disabled value={selectedReview.rating} />
                <span style={{ marginLeft: 8 }}>
                  ({selectedReview.rating}/5 sao)
                </span>
              </div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <strong>Nội dung:</strong>
              <div style={{ 
                marginTop: 4, 
                padding: 12, 
                backgroundColor: '#f5f5f5', 
                borderRadius: 4,
                minHeight: 60
              }}>
                {selectedReview.comment || "Không có bình luận"}
              </div>
            </div>
            
            {selectedReview.images && selectedReview.images.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <strong>Hình ảnh:</strong>
                <div style={{ marginTop: 8 }}>
                  <Image.PreviewGroup>
                    {selectedReview.images.map((image, index) => (
                      <Image
                        key={index}
                        width={80}
                        height={80}
                        src={image}
                        style={{ 
                          objectFit: "cover", 
                          borderRadius: 4, 
                          marginRight: 8,
                          marginBottom: 8
                        }}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                      />
                    ))}
                  </Image.PreviewGroup>
                </div>
              </div>
            )}
            
            <div style={{ marginBottom: 16 }}>
              <strong>Trạng thái:</strong>
              <div style={{ marginTop: 4 }}>
                {renderStatus(selectedReview.status)}
              </div>
            </div>
            
            <div>
              <strong>Ngày tạo:</strong> {new Date(selectedReview.createdAt).toLocaleString('vi-VN')}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Reviews;