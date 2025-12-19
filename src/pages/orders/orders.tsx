import { InfoCircleOutlined } from "@ant-design/icons";
import { Button, Table, message } from "antd";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
// Thay đổi import axios thành api từ config của bạn
import api from "@/config/axios.customize";

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
    // SỬA: Lấy đúng key "admin_token"
    const token = localStorage.getItem("admin_token");

    if (!token) {
      msgApi.warning("Bạn chưa đăng nhập");
      return;
    }

    try {
      setLoading(true);
      // SỬA: Dùng instance 'api' và URL tương đối
      const res = await api.get("/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Axios instance thường trả về data trực tiếp hoặc qua res.data
      // Tùy vào cấu hình BE của bạn, nếu res.data.data mới là array thì sửa lại nhé
      const ordersData = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setData(ordersData);
      
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
    { title: "Tổng tiền", dataIndex: "total", key: "total", render: (val: number) => val ? val.toLocaleString() + "₫" : "0₫" },
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
      <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Danh sách đơn hàng</h1>
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="_id" 
        loading={loading} 
        pagination={{ pageSize: 5 }} 
      />
    </>
  );
};

export default Orders;