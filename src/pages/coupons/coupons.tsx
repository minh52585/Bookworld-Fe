import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, Table } from "antd";
import { Link } from "react-router";

const onDelete = (id: number) => {
  console.log("Xoá mã giảm giá", id);
};

const data = [
  {
    id: 1,
    coupons_code: "SUMMER2025",
    title: "Giảm giá mùa hè",
    discount_type: "percent",
    discount_value: 15,
    min_order_value: 200000,
    start_date: "2025-05-20T00:00:00Z",
    end_date: "2025-06-30T00:00:00Z",
    desciption: "Áp dụng cho đơn hàng mùa hè.",
    created_at: "2025-05-19T00:00:00Z",
    status: "ON",
  },
  {
    id: 2,
    coupons_code: "FREESHIP50K",
    title: "Miễn phí vận chuyển",
    discount_type: "amount",
    discount_value: 50000,
    min_order_value: 150000,
    start_date: "2025-05-21T00:00:00Z",
    end_date: "2025-06-21T00:00:00Z",
    desciption: "Miễn phí ship cho đơn từ 150K.",
    created_at: "2025-05-20T00:00:00Z",
    status: "OFF",
  },
];

const columns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id"
  },
  {
    title: "Mã giảm giá",
    dataIndex: "coupons_code",
    key: "coupons_code"
  },
  {
    title: "Tiêu đề",
    dataIndex: "title",
    key: "title"
  },
  {
    title: "Phân loại",
    dataIndex: "discount_type",
    key: "discount_type",
    render: (type: string) => type === "percent" ? "Phần trăm" : "Tiền mặt"
  },
  {
    title: "Giá trị giảm",
    dataIndex: "discount_value",
    key: "discount_value",
    render: (value: number, record: any) =>
      record.discount_type === "percent" ? `${value}%` : `${value.toLocaleString()}₫`
  },
  {
    title: "Tối thiểu",
    dataIndex: "min_order_value",
    key: "min_order_value",
    render: (value: number) => `${value.toLocaleString()}₫`
  },
  {
    title: "Thời gian áp dụng",
    key: "time_range",
    render: (_: any, record: any) =>
      `${new Date(record.start_date).toLocaleDateString()} - ${new Date(record.end_date).toLocaleDateString()}`
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    render: (status: string) => {
      const isOn = status === "ON";
      const backgroundColor = isOn ? "#e6ffe6" : "#ffe6e6";
      const textColor = isOn ? "limegreen" : "tomato";
      return (
        <span style={{
          backgroundColor,
          color: textColor,
          fontWeight: 600,
          padding: "3px 6px",
          borderRadius: "17px",
          display: "inline-block"
        }}>
          {status}
        </span>
      );
    }
  },
  {
    title: "Hành động",
    key: "action",
    render: (_: any, record: any) => (
      <Space>
        <Popconfirm
          title="Xoá mã giảm giá này?"
          onConfirm={() => onDelete(record.id)}
          okText="Xoá"
          cancelText="Huỷ"
        >
          <Button
            icon={<DeleteOutlined />}
            size="small"
            style={{ backgroundColor: "white", color: "red", borderColor: "red" }}
          />
        </Popconfirm>
        <Link to={`/coupons/edit/${record.id}`}>
          <Button
            icon={<EditOutlined />}
            size="small"
            style={{ backgroundColor: "white", color: "green", borderColor: "green" }}
          />
        </Link>
      </Space>
    )
  }
];

const Coupons = () => {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 }}>
        <h1>Quản lý mã giảm giá</h1>
        <Link to={`/coupons/add`}>
          <Button
            icon={<PlusOutlined />}
            size="small"
            style={{ backgroundColor: "white", color: "dodgerblue", borderColor: "dodgerblue" }}
          >
          </Button>
        </Link>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{ pageSize: 3 }}
      />
    </>
  );
};

export default Coupons;
