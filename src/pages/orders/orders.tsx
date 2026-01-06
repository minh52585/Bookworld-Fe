import { InfoCircleOutlined } from "@ant-design/icons";
import { Button, Table, message, Tag, Card } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Popconfirm } from "antd";
import { Modal, Input, Image } from "antd";

interface Order {
  _id: string;
  user_id: any;
  items: any[];
  subtotal: number;
  shipping_fee: number;
  discount?: { code?: string; amount?: number };
  total: number;
  status: string;
  payment?: { method?: string; status?: string };
  note: string;
  createdAt: string;
  updatedAt: string;
  images_return?: string[];
}

const OrdersAdmin = () => {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [msgApi, contextHolder] = message.useMessage();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelNote, setCancelNote] = useState("");
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState<Order | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    console.log("🚀 Starting fetchOrders...");
    
    const token = localStorage.getItem("admin_token");
    console.log("Token exists:", !!token);
    
    if (!token) {
      msgApi.error("Chưa đăng nhập admin");
      navigate("/admin/login");
      return;
    }

    try {
      setLoading(true);
      console.log("📡 Making API call...");
      
      const res = await axios.get("http://localhost:5004/api/orders/admin/list", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Response received:", res.status);
      console.log("📦 Response data:", res.data);
      
      if (res.data?.success && res.data?.data) {
        console.log("📋 Orders found:", res.data.data.length);
        setData(res.data.data);
        msgApi.success(`Tải thành công ${res.data.data.length} đơn hàng`);
      } else {
        console.log("❌ Unexpected response format");
        msgApi.error("Không thể tải đơn hàng");
      }
      
    } catch (error: any) {
      console.log("💥 Error occurred:", error);
      console.log("Status:", error.response?.status);
      console.log("Data:", error.response?.data);
      
      if (error.response?.status === 401) {
        msgApi.error("Đăng nhập hết hạn");
        navigate("/admin/login");
      } else if (error.response?.status === 403) {
        msgApi.error("Không có quyền admin");
      } else {
        msgApi.error("Lỗi: " + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
      console.log("🏁 fetchOrders completed");
    }
  };

  useEffect(() => {
    console.log("🎯 Component mounted, calling fetchOrders");
    fetchOrders();
  }, []);


  const openCancelModal = (orderId: string) => {
  setCancelOrderId(orderId);
  setCancelNote("");
  setCancelModalOpen(true);
};

  const confirmCancelOrder = async () => {
  if (!cancelOrderId) return;

  const token = localStorage.getItem("admin_token");
  if (!token) {
    msgApi.error("Chưa đăng nhập admin");
    return;
  }

  if (!cancelNote.trim()) {
    msgApi.warning("Vui lòng nhập lý do hủy đơn");
    return;
  }

  try {
    setLoading(true);

    await axios.put(
      `http://localhost:5004/api/orders/${cancelOrderId}`,
      { note: cancelNote }, // ✅ gửi note cho backend
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    msgApi.success("Đã hủy đơn hàng");
    setCancelModalOpen(false);
    fetchOrders();
  } catch (error: any) {
    msgApi.error(
      error.response?.data?.message || "Hủy đơn hàng thất bại"
    );
  } finally {
    setLoading(false);
  }
};

  const openReturnRequestModal = (order: Order) => {
  setSelectedReturnOrder(order);
  setReturnModalOpen(true);
};



  const approveReturnRequest = async (orderId: string) => {
  const token = localStorage.getItem("admin_token");
  if (!token) {
    msgApi.error("Chưa đăng nhập admin");
    return;
  }

  try {
    setModalLoading(true);

    await axios.put(
      `http://localhost:5004/api/orders/approveReturnOrder/${orderId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    msgApi.success("Đã duyệt yêu cầu Trả hàng / Hoàn tiền");
    setReturnModalOpen(false);
    setSelectedReturnOrder(null);
    fetchOrders(); // reload list
  } catch (error: any) {
    msgApi.error(
      error.response?.data?.message || "Duyệt trả hàng hoàn tiền thất bại"
    );
  } finally {
    setModalLoading(false);
  }
};

const rejectReturnRequest = async (orderId: string) => {
  if (!selectedReturnOrder) return;

  const token = localStorage.getItem("admin_token");
  try {
    setModalLoading(true);
    await axios.put(
      `http://localhost:5004/api/orders/rejectReturnOrder/${orderId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    msgApi.success("Đã từ chối yêu cầu Trả hàng / Hoàn tiền. Đơn hàng sẽ tự động trở về trạng thái cũ");
    setSelectedReturnOrder(null);
    fetchOrders();
  } catch (err: any) {
    msgApi.error(err.response?.data?.message || "Từ chối yêu cầu thất bại");
  } finally {
    setModalLoading(false);
  }
};

  const statusColor = (status: string) => {
  switch (status) {
    case "Đang yêu cầu Trả hàng/Hoàn tiền":
      return "orange";
    case "Trả hàng/Hoàn tiền thành công":
      return "green";
    default:
      return "blue";
  }
};


  const columns = [
    { 
      title: "Mã đơn", 
      dataIndex: "_id", 
      key: "_id",
      render: (id: string) => `#${id?.slice(-8)}`
    },
   { 
  title: "Khách hàng", 
  dataIndex: "user_id", 
  key: "user_id", 
  render: (user: any) => {
    if (!user) return "—";

    // Nếu backend trả về string (chưa populate)
    if (typeof user === "string") {
      return `User #${user.slice(-6)}`;
    }

    // Nếu đã populate
    return (
      user.name ||
      user.email ||
      `User #${user._id?.slice(-6)}` ||
      "—"
    );
  }
},

    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={statusColor(status)}>{status}</Tag>
      ),
    },
    { 
      title: "Tổng tiền", 
      dataIndex: "total", 
      key: "total",
      render: (val: number) => `${val?.toLocaleString()} ₫`
    },
    { 
      title: "Ngày tạo", 
      dataIndex: "createdAt", 
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
  title: "Hành động",
  key: "action",
  render: (_: any, record: Order) => (
    <div style={{ display: "flex", gap: 8 }}>
      <Link to={`/orders/details/${record._id}`}>
        <Button icon={<InfoCircleOutlined />} size="small" type="primary">
          Chi tiết
        </Button>
      </Link>
      {record.status === "Chờ xử lý" && (
      <Button
        size="small"
        danger
        onClick={() => openCancelModal(record._id)}
      >
        Hủy đơn
      </Button>
    )}

      {record.status === "Đang yêu cầu Trả hàng/Hoàn tiền" && (
        
          <Button size="small" type="primary" 
          onClick={() => openReturnRequestModal(record)}
          >
            Xem yêu cầu
          </Button>

      )}
    </div>
  ),
},
  ];

  console.log("🎨 Rendering component, data length:", data.length);

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}
      
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1>Quản lý đơn hàng</h1>
            <p>Có {data.length} đơn hàng</p>
          </div>
          <Button onClick={fetchOrders} type="primary" loading={loading}>
            Làm mới
          </Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: "Chưa có đơn hàng nào" }}
        />
      </Card>

      <Modal
          title="Hủy đơn hàng"
          open={cancelModalOpen}
          onOk={confirmCancelOrder}
          onCancel={() => setCancelModalOpen(false)}
          okText="Xác nhận hủy"
          cancelText="Đóng"
          confirmLoading={loading}
        >
          <p>Vui lòng nhập lý do hủy đơn:</p>
          <Input.TextArea
            rows={4}
            placeholder="Nhập lý do hủy đơn..."
            value={cancelNote}
            onChange={(e) => setCancelNote(e.target.value)}
          />
        </Modal>

      {selectedReturnOrder && (
       <Modal
          open={returnModalOpen}
          title="Yêu cầu Trả hàng / Hoàn tiền"
          onCancel={() => setReturnModalOpen(false)}
          footer={[
            <Button
              key="reject"
              danger
              onClick={() => {
                if (selectedReturnOrder) {
                  rejectReturnRequest(selectedReturnOrder._id);
                }
              }}
              loading={modalLoading}
            >
              Từ chối
            </Button>,
            <Button
              key="approve"
              type="primary"
              loading={modalLoading}
              onClick={() => {
                if (selectedReturnOrder) {
                  approveReturnRequest(selectedReturnOrder._id);
                }
              }}
            >
              Xác nhận
            </Button>,
          ]}
          width={600}
        >
          {selectedReturnOrder ? (
            <>
              <p>
                <strong>Lý do:</strong>
              </p>
              <p style={{ whiteSpace: "pre-wrap" }}>
                {selectedReturnOrder.note}
              </p>

              {selectedReturnOrder.images_return &&
                selectedReturnOrder.images_return.length > 0 && (
                  <>
                    <p style={{ marginTop: 16 }}>
                      <strong>Ảnh đính kèm:</strong>
                    </p>

                    <Image.PreviewGroup>
                      {selectedReturnOrder.images_return.map(
                        (img: string, idx: number) => (
                          <Image
                            key={idx}
                            src={img}
                            width={100}
                            style={{ marginRight: 8, borderRadius: 6 }}
                          />
                        )
                      )}
                    </Image.PreviewGroup>
                  </>
                )}
            </>
          ) : (
            <p>Không tìm thấy thông tin yêu cầu</p>
          )}
        </Modal>
      )}
    </div>
  );
};

export default OrdersAdmin;