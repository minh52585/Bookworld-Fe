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
} from "antd";
import { useEffect, useState } from "react";
import { reviewsAPI } from "../../apis/reviews";
import { IReview, IReviewFilters } from "../../types/review";
import { CheckOutlined, CloseOutlined, EyeOutlined } from "@ant-design/icons";

const Reviews = () => {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState<IReview | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

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
    } catch (err: any) {
      message.error(err.response?.data?.message || "Lỗi tải review");
    } finally {
      setLoading(false);
    }
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

  const rejectReview = async (id: string) => {
    try {
      await reviewsAPI.rejectReview(id);
      message.success("Đã từ chối review");
      fetchReviews();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Từ chối thất bại");
    }
  };

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
      title: "Người dùng",
      dataIndex: ["user", "name"],
      width: 150,
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
      render: (r: number) => <Rate disabled value={r} />,
    },
    {
      title: "Nội dung",
      dataIndex: "comment",
      ellipsis: true,
    },
    {
      title: "Ảnh",
      dataIndex: "images",
      width: 120,
      render: (imgs: string[]) =>
        imgs?.length ? (
          <Image.PreviewGroup>
            <Image width={40} height={40} src={imgs[0]} />
            {imgs.length > 1 && (
              <span style={{ marginLeft: 4 }}>+{imgs.length - 1}</span>
            )}
          </Image.PreviewGroup>
        ) : (
          "Không có"
        ),
    },
    {
      title: "Ngày",
      dataIndex: "createdAt",
      render: (d: string) => new Date(d).toLocaleDateString("vi-VN"),
    },
    {
      title: "Hành động",
      render: (_: any, r: IReview) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedReview(r);
              setDetailModalVisible(true);
            }}
          >
            Xem
          </Button>

          {r.status === "pending" && (
            <>
              <Button
                icon={<CheckOutlined />}
                type="primary"
                onClick={() => approveReview(r._id)}
              >
                Duyệt
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => rejectReview(r._id)}
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
    <Card>
      {/* ===== FILTER ===== */}
      <Space style={{ marginBottom: 16 }}>
        <Select<number>
          allowClear
          placeholder="Đánh giá"
          style={{ width: 150 }}
          value={filters.rating}
          onChange={(value) =>
            setFilters({
              ...filters,
              rating: value,
              page: 1,
            })
          }
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <Select.Option key={n} value={n}>
              {n} sao
            </Select.Option>
          ))}
        </Select>
      </Space>

      {/* ===== TABLE ===== */}
      <Table
        rowKey="_id"
        loading={loading}
        columns={columns}
        dataSource={reviews}
        pagination={{
          ...pagination,
          onChange: (p, ps) =>
            setFilters({ ...filters, page: p, limit: ps }),
        }}
      />

      {/* ===== MODAL DETAIL ===== */}
      <Modal
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        title="Chi tiết review"
      >
        {selectedReview && (
          <>
            <p>
              <b>User:</b> {selectedReview.user.name}
            </p>
            <p>
              <b>Product:</b> {selectedReview.product.name}
            </p>

            <Rate disabled value={selectedReview.rating} />

            <p style={{ marginTop: 8 }}>{selectedReview.comment}</p>

            {selectedReview.images?.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <b>Ảnh đánh giá:</b>
                <Image.PreviewGroup>
                  <Space wrap style={{ marginTop: 8 }}>
                    {selectedReview.images.map((img, i) => (
                      <Image
                        key={i}
                        src={img}
                        width={80}
                        height={80}
                        style={{ objectFit: "cover", borderRadius: 6 }}
                      />
                    ))}
                  </Space>
                </Image.PreviewGroup>
              </div>
            )}

            
          </>
        )}
      </Modal>
    </Card>
  );
};

export default Reviews;
