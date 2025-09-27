import { Switch, Table } from "antd";
import { useState } from "react";

const data = [
  {
    id: 1,
    usersName: "pquynh",
    fullName: "Phạm Quỳnh",
    email: "pquynh@gmail.com",
    gender: "Nữ",
    avatar_url: "https://i.pravatar.cc/100",
    phone: "0977 907 877",
    address: "Hà Nội",
    role_id: "Admin",
    status: true,
    created_at: "2025-05-19T00:00:00Z",
    update_at: "2025-05-19T00:00:00Z",
  },
  {
    id: 2,
    usersName: "nminh",
    fullName: "Ngọc Minh",
    email: "nminh@gmail.com",
    gender: "Nữ",
    avatar_url: "https://i.pravatar.cc/200",
    phone: "0335 879 630",
    address: "Sơn La",
    role_id: "User",
    status: true,
    created_at: "2025-05-19T00:00:00Z",
    update_at: "2025-05-19T00:00:00Z",
  },
  {
    id: 3,
    usersName: "nduong",
    fullName: "Nguyễn Dương",
    email: "nduong@gmail.com",
    gender: "Nam",
    avatar_url: "https://i.pravatar.cc/300",
    phone: "0988 909 765",
    address: "Cà Mau",
    role_id: "User",
    status: false,
    created_at: "2025-05-19T00:00:00Z",
    update_at: "2025-05-19T00:00:00Z",
  }
];

const Users = () => {
  const [userData, setUserData] = useState(data);

  const toggleStatus = (id: number) => {
    const updatedData = userData.map(user =>
      user.id === id ? { ...user, status: !user.status } : user
    );
    setUserData(updatedData);
  };
  
  const columns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id"
  },
  {
    title: "Tên đăng nhập",
    dataIndex: "usersName",
    key: "usersName"
  },
  {
    title: "Tên đầy đủ",
    dataIndex: "fullName",
    key: "fullName"
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email"
  },
  {
    title: "Giới tính",
    dataIndex: "gender",
    key: "gender"
  },
  {
    title: "Ảnh đại diện",
    dataIndex: "avatar_url",
    key: "avatar_url",
    render: (avatar_url: string) => <img src={avatar_url} style={{ width: 40, height: 40, objectFit: "cover" }} />
  },
  {
    title: "Số điện thoại",
    dataIndex: "phone",
    key: "phone"
  },
  {
    title: "Địa chỉ",
    dataIndex: "address",
    key: "address"
  },
  {
    title: "Vai trò",
    dataIndex: "role_id",
    key: "role_id"
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    render: (status: boolean) => (
      <span style={{
        backgroundColor: status ? "#e6ffe6" : "#ffe6e6",
        color: status ? "limegreen" : "tomato",
        fontWeight: 600,
        padding: "3px 6px",
        borderRadius: "17px",
        display: "inline-block"
      }}>
        {status ? "ON" : "OFF"}
      </span>
    )
  },
  {
    title: "Hành động",
    dataIndex: "action",
    render: (_: any, record: { id: number; status: boolean }) => (
      <Switch 
        checked={record.status}
        onChange={() => toggleStatus(record.id)}
        style={{ minWidth: 30 }}
      />
    )
  },
]

  return (
    <>
      <h1 style={{ marginBottom: 24 }}>Danh sách khách hàng</h1>
      <Table columns={columns} dataSource={userData} rowKey="id" pagination={{pageSize: 4}}/>
    </>
  )
}

export default Users;