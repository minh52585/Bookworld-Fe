import { InfoCircleOutlined } from "@ant-design/icons";
import { Button, Table } from "antd"
import { Link } from "react-router";

const data = [
  {
    id: 1,
    users_id: "Nguyễn Dương",
    status: "completed",
    coupons_id: "SUMMER2025",
    total_amount: 255000,
    note: "Mua sách lập trình JavaScript + giao nhanh"
  },
  {
    id: 2,
    users_id: "Phạm Quỳnh",
    status: "pending",
    coupons_id: "FREESHIP50K",
    total_amount: 180000,
    note: "Mua combo sách IELTS + miễn phí ship"
  },
  {
    id: 3,
    users_id: "Ngọc Minh",
    status: "cancelled",
    coupons_id: "SUMMER2025",
    total_amount: 250000,
    note: "Bị hủy do không đủ hàng"
  }
];

const columns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id"
  },
  {
    title: "Người dùng",
    dataIndex: "users_id",
    key: "users_id"
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    render: (status: string) => {
      const statusMap: Record<string, { label: string; bg: string; color: string }> = {
        pending: { label: "Chờ xác nhận", bg: "#fff7e6", color: "#fa8c16" },
        processing: { label: "Đang xử lý", bg: "#e6f7ff", color: "#1890ff" },
        shipping: { label: "Đang giao hàng", bg: "#f0f5ff", color: "#2f54eb" },
        completed: { label: "Đã hoàn thành", bg: "#f6ffed", color: "#52c41a" },
        cancelled: { label: "Đã huỷ", bg: "#fff1f0", color: "#f5222d" },
        refunded: { label: "Đã hoàn tiền", bg: "#f9f0ff", color: "#722ed1" }
      };

      const { label, bg, color } = statusMap[status] || {
        label: "Không xác định",
        bg: "#f0f0f0",
        color: "#595959"
      };
      return (
        <span style={{
          backgroundColor: bg,
          color,
          fontWeight: 600,
          padding: "3px 8px",
          borderRadius: "17px",
          display: "inline-block"
        }}>
          {label}
        </span>
      );
    }
  },
  {
    title: "Mã giảm giá",
    dataIndex: "coupons_id",
    key: "coupons_id",
  },
  {
    title: "Tổng tiền",
    dataIndex: "total_amount",
    key: "total_amount",
    render: (total_amount: number) => `${total_amount.toLocaleString()}₫`
  },
  {
    title: "Ghi chú",
    dataIndex: "note",
    key: "note"
  },
  {
    title: "Hành động",
    key: "action",
    render: (_: any, record: any) => (
      <Link to={`/order/details/${record.id}`}>
        <Button icon={<InfoCircleOutlined />} size="small" style={{ backgroundColor: "white", color: "dodgerblue", borderColor: "dodgerblue" }} />
      </Link>
    )
  }
];

const Orders = () => {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 }}>
        <h1>Danh sách đơn hàng</h1>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{ pageSize: 3 }}
      />
    </>
  )
}

export default Orders