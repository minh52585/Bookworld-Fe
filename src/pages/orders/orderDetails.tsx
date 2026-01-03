import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import {
  Card,
  Table,
  message,
  Spin,
  Descriptions,
  Tag,
  Divider,
  Button,
  Select,
  Modal,
  Input,
  Space,
  Timeline
} from "antd";
import {
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  TruckOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import axios from "axios";


const { Item } = Descriptions;

/* =========================
   TYPES
========================= */
interface OrderItem {
  product_id: any;
  variant_id?: any;
  quantity: number;
  price?: number;
}

interface OrderDetail {
  _id: string;
  user_id: any;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  discount?: {
    code: string;
    amount: number;
  };
  total: number;
  status: string;
  payment?: {
    method: string;
    status: string;
  };
  status_logs?: [];
  shipping_address?: any;
  note: string;
  createdAt: string;
  updatedAt: string;
}

/* =========================
   STATUS CONFIG
========================= */
const STATUS_CONFIG: Record<string, { color: string; icon?: React.ReactNode }> = {
  "Chờ xử lý": { color: "orange", icon: <ShoppingOutlined /> },
  "Đã xác nhận": { color: "blue", icon: <CheckOutlined /> },
  "Đang chuẩn bị hàng": { color: "cyan", icon: <ShoppingOutlined /> },
  "Đang giao hàng": { color: "purple", icon: <TruckOutlined /> },
  "Giao hàng không thành công": { color: "red", icon: <CloseOutlined /> },
  "Giao hàng thành công": { color: "green", icon: <CheckOutlined /> },
};

/* =========================
   COMPONENT
========================= */
const OrderDetailsAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [msgApi, contextHolder] = message.useMessage();

  /* =========================
     WORKFLOW
  ========================= */
  const getAvailableStatuses = (current: string) => {
  const flow = [
    "Chờ xử lý",
    "Đã xác nhận",
    "Đang chuẩn bị hàng",
    "Đang giao hàng",
    "Giao hàng không thành công",
    "Giao hàng thành công",
  ];

  const index = flow.indexOf(current);
  if (index === -1) return [];

  // case đặc biệt
  if (current === "Giao hàng không thành công") {
    return ["Đang giao hàng", "Giao hàng thành công"];
  }

  // mặc định: chỉ đi lên
  return flow.slice(index + 1);
};



  /* =========================
     FETCH ORDER
  ========================= */
  const fetchOrder = useCallback(async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      msgApi.error("Chưa đăng nhập admin");
      setLoading(false);
      navigate("/admin/login");
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5004/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success && res.data?.data) {
        setOrder(res.data.data);
      } else if (res.data && res.data._id) {
        setOrder(res.data);
      } else {
        msgApi.error("Không thể tải đơn hàng");
      }
    } catch (err: any) {
      console.error("Fetch order error:", err);

      if (err.response?.status === 401) {
        msgApi.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        localStorage.removeItem("admin_token");
        navigate("/admin/login");
      } else if (err.response?.status === 404) {
        msgApi.error("Không tìm thấy đơn hàng");
      } else if (err.response?.status === 403) {
        msgApi.error("Không có quyền truy cập");
      } else {
        msgApi.error("Lỗi khi tải đơn hàng");
      }
    } finally {
      setLoading(false);
    }
  }, [id, msgApi, navigate]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  /* =========================
     UPDATE STATUS
  ========================= */
  const updateOrderStatus = async () => {
    if (!selectedStatus) {
      msgApi.warning("Vui lòng chọn trạng thái");
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem("admin_token");
      console.log("🔄 Updating status to:", selectedStatus);
      
      const res = await axios.put(
        `http://localhost:5004/api/orders/${id}/status`,
        { status: selectedStatus, note: statusNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("📝 Update response:", res.data);

      if (res.data?.success) {
        msgApi.success(res.data.message || "Cập nhật trạng thái thành công");
        setStatusModalVisible(false);
        setSelectedStatus();
        setStatusNote("");
        fetchOrder(); // Reload order data
      } else {
        msgApi.error("Không thể cập nhật trạng thái");
      }
    } catch (err: any) {
      console.error("Update status error:", err);
      console.error("Error response:", err.response?.data);
      
      if (err.response?.status === 404) {
        msgApi.error("Endpoint không tồn tại - Kiểm tra backend routes");
      } else if (err.response?.status === 401) {
        msgApi.error("Chưa đăng nhập admin");
      } else if (err.response?.status === 403) {
        msgApi.error("Không có quyền admin");
      } else {
        msgApi.error(err.response?.data?.message || "Không cập nhật được trạng thái");
      }
    } finally {
      setUpdating(false);
    }
  };

  /* =========================
     RENDER
  ========================= */
  if (loading) return <Spin style={{ marginTop: 100 }} />;

  if (!order) return <Card>Không tìm thấy đơn hàng</Card>;

  return (
    <>
      {contextHolder}

      <Card title={`Đơn hàng #${order._id.slice(-8)}`}>
        <Descriptions bordered column={2}>
          <Item label="Trạng thái">
            <Space>
              <Tag color={STATUS_CONFIG[order.status]?.color} icon={STATUS_CONFIG[order.status]?.icon}>
                {order?.status}
              </Tag>
                {getAvailableStatuses(order.status).length > 0 && (
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => setStatusModalVisible(true)}
                >
                  Cập nhật
                </Button>
          )}
            </Space>
          </Item>

          <Item label="Thanh toán">
            <Tag color={order.payment?.status === "Đã thanh toán" ? "green" : "orange"}>
              {order.payment?.method || "COD"} - {order.payment?.status || "Chưa thanh toán"}
            </Tag>
          </Item>

          <Item label="Người Gửi">
            <div>
              <strong>{order.user_id?.name || `User ${order.user_id?.slice?.(-6) || "Unknown"}`}</strong>
              <br />
              <small>{order.user_id?.email || "—"}</small>
            </div>
          </Item>

          <Item label="Tổng tiền">
            <Space direction="vertical" size="small">
              <div>
                <strong style={{ fontSize: "16px", color: "#1890ff" }}>
                  {order.total?.toLocaleString()} ₫
                </strong>
              </div>
              <small>
                Tạm tính: {order.subtotal?.toLocaleString()} ₫
                {order.shipping_fee > 0 && ` + Phí ship: ${order.shipping_fee?.toLocaleString()} ₫`}
                {order.discount?.amount && order.discount.amount > 0 && ` - Giảm: ${order.discount.amount?.toLocaleString()} ₫`}
              </small>
            </Space>
          </Item>

          <Item label="Ngày tạo">{new Date(order.createdAt).toLocaleString("vi-VN")}</Item>
          <Item label="Cập nhật cuối">{new Date(order.updatedAt).toLocaleString("vi-VN")}</Item>

          {order.shipping_address && (
            <Item label="Địa chỉ giao hàng" span={2}>
              <div>
                <strong>Họ và tên: {order.shipping_address.name}</strong> <br></br>
                <strong>Số điện thoại: {order.shipping_address.phone}</strong> <br></br>
                <strong>Địa chỉ: {order.shipping_address.address}</strong> 
             
              </div>
            </Item>
          )}

          {order.note && <Item label="Ghi chú" span={2}>{order.note}</Item>}
        </Descriptions>

        <Divider />

       <Table
          dataSource={order.items}
          rowKey={(record) =>
            // Ưu tiên variant_id._id > product_id._id > product_id (string)
            (typeof record.variant_id === 'object' && record.variant_id?._id) ||
            (typeof record.product_id === 'object' && record.product_id?._id) ||
            record.product_id ||
            Math.random().toString(36).substring(2, 9) // fallback nếu không có id
          }
          pagination={false}
          title={() => <strong>Chi tiết sản phẩm</strong>}
          columns={[
            {
              title: "Sản phẩm",
              render: (_, r) => (
                <div>
                  <strong>
                    {typeof r.product_id === 'object' && r.product_id?.name 
                      ? r.product_id.name 
                      : `Product ID: ${typeof r.product_id === 'string' ? r.product_id.slice(-6) : 'Unknown'}`}
                  </strong>
                  {r.variant_id && (
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Biến thể: {
                        typeof r.variant_id === 'object' 
                          ? (r.variant_id.type || r.variant_id.name || "—")
                          : `Variant ID: ${typeof r.variant_id === 'string' ? r.variant_id.slice(-6) : 'Unknown'}`
                      }
                    </div>
                  )}
                </div>
              )
            },
            {
              title: "Số lượng",
              dataIndex: "quantity",
              align: "center",
              render: (qty) => <Tag color="blue">{qty}</Tag>
            },
            {
              title: "Đơn giá",
              render: (_, r) => {
                let price = 0;
                if (typeof r.variant_id === 'object' && r.variant_id?.price) price = r.variant_id.price;
                else if (typeof r.product_id === 'object' && r.product_id?.price) price = r.product_id.price;
                else if (r.price) price = r.price;

                return <span style={{ fontWeight: 500 }}>{price.toLocaleString()} ₫</span>;
              },
              align: "right"
            },
            {
              title: "Thành tiền",
              render: (_, r) => {
                let price = 0;
                if (typeof r.variant_id === 'object' && r.variant_id?.price) price = r.variant_id.price;
                else if (typeof r.product_id === 'object' && r.product_id?.price) price = r.product_id.price;
                else if (r.price) price = r.price;

                return <strong style={{ color: '#1890ff' }}>{(price * r.quantity).toLocaleString()} ₫</strong>;
              },
              align: "right"
            }
          ]}
        />

      </Card>

      <Divider orientation="left">Lịch sử trạng thái</Divider>

      <Timeline
        items={order.status_logs?.map((log: any) => ({
          color: STATUS_CONFIG[log.status]?.color || "blue",
          children: (
            <>
              <strong>{log.status}</strong>
              {log.note && <div>{log.note}</div>}
              <small>
                {new Date(log.createdAt).toLocaleString("vi-VN")}
              </small>
            </>
          ),
        }))}
      />


      {/* MODAL */}
      <Modal
        open={statusModalVisible}
        onOk={updateOrderStatus}
        onCancel={() => setStatusModalVisible(false)}
        confirmLoading={updating}
        title="Cập nhật trạng thái"
        width={500}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div>
            <strong>Trạng thái hiện tại:</strong>{" "}
            <Tag color={STATUS_CONFIG[order.status]?.color} style={{ marginLeft: 8 }}>
              {order.status}
            </Tag>
          </div>

          <Select
            style={{ width: "100%" }}
            placeholder="Chọn trạng thái mới"
            value={selectedStatus || order.status}
            onChange={setSelectedStatus}
          >
            {getAvailableStatuses(order.status).map((st) => (
              <Select.Option key={st} value={st}>
                <Tag color={STATUS_CONFIG[st]?.color} style={{ marginRight: 8 }}>
                  {st}
                </Tag>
              </Select.Option>
            ))}
          </Select>

          <Input.TextArea
            placeholder="Ghi chú (tùy chọn)"
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            rows={3}
          />
        </Space>
      </Modal>
    </>
  );
};

export default OrderDetailsAdmin;
