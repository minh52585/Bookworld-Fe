import axios from "axios";
import { useState, useEffect } from "react";
import { Switch, Table } from "antd";

const Users = () => {
  const [userData, setUserData] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token"); 
        const res = await axios.get("http://localhost:5004/api/auth/allUser", {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (res.data.success) {
          const formattedData = res.data.data.map((user: any, index: number) => ({
            id: user._id,
            stt: index + 1, 
            usersName: user.name,
            fullName: user.name,
            email: user.email,
            avatar_url: user.avatar_url || `https://i.pravatar.cc/${index + 100}`,
            role_id: user.role === "admin" ? "Admin" : "User",
            status: user.status ?? true,
            created_at: user.createdAt,
            update_at: user.updatedAt,
          }));

          setUserData(formattedData);
        } else {
          console.error(res.data.message);
        }
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu người dùng:", err);
      }
    };

    fetchUsers();
  }, []);

  const toggleStatus = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `http://localhost:5004/api/auth/users/${id}/status`,
        {},
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }
      );

      if (res.data.success) {
        const updatedData = userData.map(user =>
          user.id === id ? { ...user, status: res.data.data.status } : user
        );
        setUserData(updatedData);
      } else {
        console.error(res.data.message);
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
    }
  };

  const columns = [
    { title: "STT", dataIndex: "stt", key: "stt" },
    { title: "Tên đăng nhập", dataIndex: "usersName", key: "usersName" },
    { title: "Tên đầy đủ", dataIndex: "fullName", key: "fullName" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Ảnh đại diện",
      dataIndex: "avatar_url",
      key: "avatar_url",
      render: (avatar_url: string) => (
        <img
          src={avatar_url}
          style={{ width: 40, height: 40, objectFit: "cover", borderRadius: "50%" }}
          alt="avatar"
        />
      ),
    },
    { title: "Vai trò", dataIndex: "role_id", key: "role_id" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: boolean) => (
        <span
          style={{
            backgroundColor: status ? "#e6ffe6" : "#ffe6e6",
            color: status ? "limegreen" : "tomato",
            fontWeight: 600,
            padding: "3px 6px",
            borderRadius: "17px",
            display: "inline-block",
          }}
        >
          {status ? "ON" : "OFF"}
        </span>
      ),
    },
    {
      title: "Hành động",
      dataIndex: "action",
      render: (_: any, record: { id: string; status: boolean }) => (
        <Switch
          checked={record.status}
          onChange={() => toggleStatus(record.id)}
          style={{ minWidth: 30 }}
        />
      ),
    },
  ];

  return (
    <>
      <h1 style={{ marginBottom: 24 }}>Danh sách khách hàng</h1>
      <Table
        columns={columns}
        dataSource={userData}
        rowKey="id"
        pagination={{ pageSize: 4 }}
      />
    </>
  );
};

export default Users;
