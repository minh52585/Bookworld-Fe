import { InfoCircleOutlined } from "@ant-design/icons";
import { Button, Table, message, Tag, Card } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

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
}

const OrdersAdmin = () => {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [msgApi, contextHolder] = message.useMessage();
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
      render: (user: any) => typeof user === 'string' ? `User ${user.slice(-6)}` : user?.name || "—"
    },
    { 
      title: "Trạng thái", 
      dataIndex: "status", 
      key: "status",
      render: (status: string) => <Tag color="blue">{status}</Tag>
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
        <Link to={`/orders/details/${record._id}`}>
          <Button icon={<InfoCircleOutlined />} size="small" type="primary">
            Chi tiết
          </Button>
        </Link>
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
    </div>
  );
};

export default OrdersAdmin;