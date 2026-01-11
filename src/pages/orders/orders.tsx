import { InfoCircleOutlined } from "@ant-design/icons";
import { Button, Table, message, Tag, Card } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Popconfirm, Select } from "antd";
import { Modal, Input, Image, Radio } from "antd";

const ORDER_TYPES_OPTIONS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Đã hủy', value: 'Đã hủy' },
  { label: 'Chờ xử lý', value: 'Chờ xử lý' },
  { label: 'Giao hàng không thành công', value: '"Giao hàng không thành công' },
  { label: 'Giao hàng thành công', value: 'Giao hàng thành công' },
  { label: 'Đang yêu cầu Trả hàng/Hoàn tiền', value: 'Đang yêu cầu Trả hàng/Hoàn tiền' },
  { label: 'Trả hàng/Hoàn tiền thành công', value: 'Trả hàng/Hoàn tiền thành công' }
];

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

const REJECT_REASONS = [
  "Sản phẩm đã qua sử dụng / không còn nguyên vẹn",
  "Quá thời hạn cho phép Trả hàng / Hoàn tiền",
  "Lý do cung cấp không hợp lệ",
  "Hình ảnh / bằng chứng không đủ rõ ràng",
  "Sản phẩm không thuộc diện được Trả hàng / Hoàn tiền",
  "Đơn hàng đã được sử dụng khuyến mãi không hoàn tiền",
  "Khác",
];

const CANCEL_REASONS = [
  "Không liên hệ được với khách hàng",
  "Sản phẩm hết hàng",
  "Sai thông tin đơn hàng",
  "Phát hiện gian lận / đơn hàng bất thường",
  "Khác",
];

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
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRejectReason, setSelectedRejectReason] = useState<string>("");
  const [customRejectReason, setCustomRejectReason] = useState(""); 
  const [selectedCancelReason, setSelectedCancelReason] = useState("");
  const [customCancelReason, setCustomCancelReason] = useState("");
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [selectedOrderType, setSelectedOrderType] =  useState<string>('all');
  
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

   const filteredOrders = data.filter((item) => {
  if (selectedOrderType === 'all') return true;
  return item.status === selectedOrderType;
});


  const openCancelModal = (orderId: string) => {
    setCancelOrderId(orderId);
    setCancelNote("");
    setCancelModalOpen(true);
  };

  const confirmCancelOrder = async (reason: string) => {
    if (!cancelOrderId) return;

    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      setLoading(true);

      await axios.put(
        `http://localhost:5004/api/orders/${cancelOrderId}`,
        { note: reason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      msgApi.success("Đã hủy đơn hàng");

      // 🔥 đóng sạch modal
      setCancelModalOpen(false);
      setSelectedCancelReason("");
      setCustomCancelReason("");

      fetchOrders();
    } catch (error: any) {
      msgApi.error(error.response?.data?.message || "Hủy đơn hàng thất bại");
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
      fetchOrders();
    } catch (error: any) {
      msgApi.error(
        error.response?.data?.message || "Duyệt trả hàng hoàn tiền thất bại"
      );
    } finally {
      setModalLoading(false);
    }
  };

  const rejectReturnRequest = async (orderId: string, reason: string) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      setRejectLoading(true);

      await axios.put(
        `http://localhost:5004/api/orders/rejectReturnOrder/${orderId}`,
        { note: reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      msgApi.success("Đã từ chối yêu cầu Trả hàng / Hoàn tiền");


      setRejectModalOpen(false);
      setReturnModalOpen(false);
      setSelectedReturnOrder(null);
      setSelectedRejectReason("");
      setCustomRejectReason("");

      fetchOrders();
    } catch (err: any) {
      msgApi.error(err.response?.data?.message || "Từ chối yêu cầu thất bại");
    } finally {
      setRejectLoading(false);
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

        if (typeof user === "string") {
          return `User #${user.slice(-6)}`;
        }

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

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}
      
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1>Quản lý đơn hàng</h1>
            <p>Có {data.length} đơn hàng</p>
          </div>
          <Select
                value={selectedOrderType}
                placeholder="-- Chọn trạng thái --"
                allowClear
                style={{ width: 220 }}
                onChange={(value) => setSelectedOrderType(value)}
                options={ORDER_TYPES_OPTIONS}
              />
          <Button onClick={fetchOrders} type="primary" loading={loading}>
            Làm mới
          </Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredOrders} 
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: "Chưa có đơn hàng nào" }}
        />
      </Card>

      {/* Modal hủy đơn hàng */}
      <Modal
        title="Hủy đơn hàng"
        open={cancelModalOpen}
        onCancel={() => {
          setCancelModalOpen(false);
          setSelectedCancelReason("");
          setCustomCancelReason("");
        }}
        okText="Xác nhận hủy"
        cancelText="Đóng"
        confirmLoading={loading}
        onOk={() => {
          if (!selectedCancelReason) {
            msgApi.warning("Vui lòng chọn lý do hủy đơn");
            return;
          }

          if (selectedCancelReason === "Khác" && !customCancelReason.trim()) {
            msgApi.warning("Vui lòng nhập lý do cụ thể");
            return;
          }

          const finalReason =
            selectedCancelReason === "Khác"
              ? customCancelReason
              : selectedCancelReason;

          confirmCancelOrder(finalReason);
        }}
      >
        <p>Vui lòng chọn lý do hủy đơn:</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {CANCEL_REASONS.map((reason) => (
            <label key={reason} style={{ cursor: "pointer" }}>
              <input
                type="radio"
                name="cancelReason"
                value={reason}
                checked={selectedCancelReason === reason}
                onChange={() => setSelectedCancelReason(reason)}
                style={{ marginRight: 8 }}
              />
              {reason}
            </label>
          ))}
        </div>
        {selectedCancelReason === "Khác" && (
          <Input.TextArea
            rows={3}
            placeholder="Nhập lý do hủy đơn..."
            style={{ marginTop: 12 }}
            value={customCancelReason}
            onChange={(e) => setCustomCancelReason(e.target.value)}
          />
        )}
      </Modal>

      {/* Modal xem yêu cầu trả hàng */}
      <Modal
        open={returnModalOpen}
        title="Yêu cầu Trả hàng / Hoàn tiền"
        destroyOnClose
        onCancel={() => setReturnModalOpen(false)}
        footer={[
          <Button
            key="reject"
            danger
            onClick={() => {
              setSelectedRejectReason("");
              setCustomRejectReason("");
              setRejectModalOpen(true);
            }}
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

      {/* Modal từ chối yêu cầu trả hàng */}
      <Modal
        title="Lý do không chấp nhận Trả hàng / Hoàn tiền"
        open={rejectModalOpen}
        destroyOnClose
        confirmLoading={rejectLoading}
        okText="Xác nhận từ chối"
        cancelText="Hủy"
        onCancel={() => {
          setRejectModalOpen(false);
          setSelectedRejectReason("");
          setCustomRejectReason("");
        }}
        onOk={async () => {
          if (!selectedRejectReason) {
            msgApi.warning("Vui lòng chọn lý do");
            return;
          }

          if (selectedRejectReason === "Khác" && !customRejectReason.trim()) {
            msgApi.warning("Vui lòng nhập lý do cụ thể");
            return;
          }

          const finalReason =
            selectedRejectReason === "Khác"
              ? customRejectReason
              : selectedRejectReason;

          if (selectedReturnOrder) {
            await rejectReturnRequest(selectedReturnOrder._id, finalReason);
          }
        }}
      >
        <Radio.Group
          value={selectedRejectReason}
          onChange={(e) => setSelectedRejectReason(e.target.value)}
          style={{ display: "flex", flexDirection: "column", gap: 8 }}
        >
          {REJECT_REASONS.map((reason) => (
            <Radio key={reason} value={reason}>
              {reason}
            </Radio>
          ))}
        </Radio.Group>

        {selectedRejectReason === "Khác" && (
          <Input.TextArea
            rows={3}
            style={{ marginTop: 12 }}
            placeholder="Nhập lý do cụ thể..."
            value={customRejectReason}
            onChange={(e) => setCustomRejectReason(e.target.value)}
          />
        )}
      </Modal>
    </div>
  );
};

export default OrdersAdmin;