import { EditOutlined } from "@ant-design/icons";
import { Button, Descriptions, Select, Table } from "antd";
import { useState } from "react";

const orderInfo = {
  id: 1,
  users_id: "Nguyễn Dương",
  status: "completed",
  coupons_id: "SUMMER2025",
  total_amount: 255000,
  note: "Mua sách lập trình JavaScript + giao nhanh"
};

const orderDetails = [
  {
    id: 1,
    order_id: 1,
    product_id: 101,
    variant_id: "Sách bản mềm",
    product_name: "Sách JavaScript",
    quantity: 1,
    unit_price: 300000,
    total_price: 255000,
    discount: "15%",
    status: "completed"
  }
];

const statusOptions = [
  { label: "Chờ xác nhận", value: "pending" },
  { label: "Đang xử lý", value: "processing" },
  { label: "Đang giao hàng", value: "shipping" },
  { label: "Đã hoàn thành", value: "completed" },
  { label: "Đã huỷ", value: "cancelled" },
  { label: "Đã hoàn tiền", value: "refunded" }
];

const OrderDetails = () => {
  const [dataSource, setDataSource] = useState(orderDetails);
  const [editingKey, setEditingKey] = useState<number | null>(null);

  const handleStatusChange = (id: number, newStatus: string) => {
    const newData = dataSource.map((item) =>
      item.id === id ? { ...item, status: newStatus } : item
    );
    setDataSource(newData);
    setEditingKey(null);
  };

  const columns = [
    { title: "Tên sản phẩm", dataIndex: "product_name", key: "product_name" },
    { title: "Biến thể", dataIndex: "variant_id", key: "variant_id" },
    { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
    {
      title: "Đơn giá",
      dataIndex: "unit_price",
      key: "unit_price",
      render: (val: number) => `${val.toLocaleString()}₫`
    },
    {
      title: "Tổng",
      dataIndex: "total_price",
      key: "total_price",
      render: (val: number) => `${val.toLocaleString()}₫`
    },
    { title: "Giảm giá", dataIndex: "discount", key: "discount" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: any) =>
        editingKey === record.id ? (
          <Select
            defaultValue={status}
            style={{ width: 130 }}
            options={statusOptions}
            onChange={(val) => handleStatusChange(record.id, val)}
          />
        ) : (
          statusOptions.find((opt) => opt.value === status)?.label || status
        )
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: any) =>
        editingKey === record.id ? (
          <Button onClick={() => setEditingKey(null)}>Huỷ</Button>
        ) : (
          <Button icon={<EditOutlined />} size="small" style={{ backgroundColor: "white", color: "green", borderColor: "green" }} type="link" onClick={() => setEditingKey(record.id)}>
            Sửa
          </Button>
        )
    }
  ];

  return (
    <div>
      <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
        <Descriptions.Item label="Người dùng">{orderInfo.users_id}</Descriptions.Item>
        <Descriptions.Item label="Mã giảm giá">{orderInfo.coupons_id}</Descriptions.Item>
        <Descriptions.Item label="Tổng tiền">{orderInfo.total_amount.toLocaleString()}₫</Descriptions.Item>
        <Descriptions.Item label="Ghi chú">{orderInfo.note}</Descriptions.Item>
      </Descriptions>
      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey="id"
        pagination={false}
      />
    </div>
  );
};

export default OrderDetails;
