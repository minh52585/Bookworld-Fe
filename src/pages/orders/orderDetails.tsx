import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, Table, message, Spin } from "antd";
import axios from "axios";

interface OrderItem {
  product_id: { name?: string };
  variant_id?: { name?: string };
  quantity: number;
}

interface OrderDetail {
  _id: string;
  user_id: { name?: string; email?: string };
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  discount?: { code?: string };
  total: number;
  status: string;
  note: string;
  payment?: { method: string; status: string; transaction_id?: string };
  shipping_address?: any;
  createdAt: string;
  updatedAt: string;
}

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [msgApi, contextHolder] = message.useMessage();

  const fetchOrder = async () => {
    // ✅ Đọc token chính xác từ localStorage
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");

    if (!token) {
      msgApi.warning("Bạn chưa đăng nhập");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5004/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(res.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        msgApi.warning("Phiên đăng nhập hết hạn");
      } else if (error.response?.status === 403) {
        msgApi.error("Bạn không có quyền truy cập");
      } else {
        msgApi.error("Lỗi tải chi tiết đơn hàng");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) return <Spin size="large" />;

  if (!order) return <p>Không tìm thấy đơn hàng</p>;

  return (
    <>
      {contextHolder}
      <Card title={`Chi tiết đơn hàng #${order._id}`} style={{ marginTop: 20 }}>
        <p><b>Người dùng:</b> {order.user_id?.name || order.user_id?.email}</p>
        <p><b>Trạng thái:</b> {order.status}</p>
        <p><b>Subtotal:</b> {order.subtotal.toLocaleString()}₫</p>
        <p><b>Shipping fee:</b> {order.shipping_fee.toLocaleString()}₫</p>
        <p><b>Discount:</b> {order.discount?.code || "—"}</p>
        <p><b>Total:</b> {order.total.toLocaleString()}₫</p>
        <p><b>Note:</b> {order.note || "—"}</p>
        <p><b>Payment:</b> {order.payment?.method || "—"} - {order.payment?.status || "—"}</p>
        <p><b>Shipping address:</b> {JSON.stringify(order.shipping_address || {})}</p>
        <p><b>Created At:</b> {new Date(order.createdAt).toLocaleString()}</p>
        <p><b>Updated At:</b> {new Date(order.updatedAt).toLocaleString()}</p>

        <Table
          columns={[
            { title: "Sản phẩm", dataIndex: ["product_id", "name"], key: "product" },
            { title: "Variant", dataIndex: ["variant_id", "name"], key: "variant" },
            { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
          ]}
          dataSource={order.items}
          rowKey={(item: any) => item.product_id.name + Math.random()}
          pagination={false}
        />
      </Card>
    </>
  );
};

export default OrderDetails;
