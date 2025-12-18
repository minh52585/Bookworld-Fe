import { InfoCircleOutlined } from "@ant-design/icons";
import { Button, Table, message } from "antd";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

interface Order {
  _id: string;
  user_id: { name?: string; email?: string };
  subtotal: number;
  shipping_fee: number;
  discount?: { code?: string };
  total: number;
  status: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

const Orders = () => {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [msgApi, contextHolder] = message.useMessage();

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      msgApi.warning("Bạn chưa đăng nhập");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5004/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        msgApi.warning("Phiên đăng nhập hết hạn");
      } else if (error.response?.status === 403) {
        msgApi.error("Bạn không có quyền truy cập");
      } else {
        msgApi.error("Lỗi tải danh sách đơn hàng");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const columns = [
    { title: "ID", dataIndex: "_id", key: "_id" },
    { title: "Người dùng", dataIndex: "user_id", key: "user_id", render: (user: any) => user?.name || user?.email || "Ẩn danh" },
    { title: "Trạng thái", dataIndex: "status", key: "status" },
    { title: "Tổng tiền", dataIndex: "total", key: "total", render: (val: number) => val.toLocaleString() + "₫" },
    { title: "Mã giảm giá", dataIndex: "discount", key: "discount", render: (val: any) => val?.code || "—" },
    { title: "Ghi chú", dataIndex: "note", key: "note" },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Order) => (
        <Link to={`/orders/${record._id}`}>
          <Button icon={<InfoCircleOutlined />} size="small" style={{ backgroundColor: "white", color: "dodgerblue", borderColor: "dodgerblue" }} />
        </Link>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <h1>Danh sách đơn hàng</h1>
      <Table columns={columns} dataSource={data} rowKey="_id" loading={loading} pagination={{ pageSize: 5 }} />
    </>
  );
};

export default Orders;
