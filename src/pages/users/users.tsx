import axios from "axios";
import { useEffect, useState } from "react";
import { Table, Tag, message, Avatar } from "antd";
import { UserOutlined, CrownOutlined } from "@ant-design/icons";

const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔐 chỉ dùng token admin
  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    if (!token) {
      message.error("Bạn chưa đăng nhập admin");
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          "http://localhost:5004/api/auth/allUser",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.success) {
          const formatted = res.data.data.map(
            (u: any, index: number) => ({
              key: u._id,
              stt: index + 1,
              name: u.name,
              status: u.status,
              email: u.email,
              role: u.role,
              createdAt: u.createdAt,
            })
          );

          setUsers(formatted);
        } else {
          message.error("Không lấy được danh sách user");
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          message.error("Token admin không hợp lệ hoặc hết hạn");
        } else if (err.response?.status === 403) {
          message.error("Bạn không có quyền admin");
        } else {
          message.error("Lỗi server");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      width: 60,
    },
    {
      title: "Người dùng",
      render: (_: any, record: any) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar
            icon={
              record.role === "admin" ? <CrownOutlined /> : <UserOutlined />
            }
            style={{
              backgroundColor:
                record.role === "admin" ? "#1677ff" : "#87d068",
            }}
          />
          <div>
            <div style={{ fontWeight: 600 }}>{record.name}</div>
            <div style={{ fontSize: 12, color: "#888" }}>
              {record.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Quyền",
      dataIndex: "role",
      width: 120,
      render: (role: string) =>
        role === "admin" ? (
          <Tag color="blue">ADMIN</Tag>
        ) : (
          <Tag color="green">USER</Tag>
        ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      width: 160,
      render: (date: string) =>
        new Date(date).toLocaleDateString("vi-VN"),
    },
   {
      title: "Trạng thái",
      dataIndex: "status",
      width: 140,
      render: (status: string, record: any) => {
        // Loại admin ra
        if (record.role === "admin") {
          return null;
        }

        return String(status).trim().toLowerCase() === "active" ? (
          <Tag color="blue">Đã xác thực</Tag>
        ) : (
          <Tag color="red">Chưa xác thực</Tag>
        );
      },
    }
  ];

  return (
    <>
      <h1 style={{ marginBottom: 16 }}>Quản lý người dùng</h1>

      <Table
        columns={columns}
        dataSource={users}
        loading={loading}
        pagination={{ pageSize: 5 }}
        bordered
      />
    </>
  );
};

export default Users;
