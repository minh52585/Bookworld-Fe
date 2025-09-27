import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, Table } from "antd";
import { Link } from "react-router";

interface Variant {
  id: number;
  product_id: number;
  variant_name: string;
  price: number;
  stock_quantity: number;
  image_url: string;
  created_at: string;
  update_at: string;
}

const onDelete = (id: number) => {
  console.log("Xoá biến thể", id);
};

const data: Variant[] = [
  {
    id: 1,
    product_id: 101,
    variant_name: "Sách bìa mềm",
    price: 100000,
    stock_quantity: 100,
    image_url: "https://byvn.net/We5W",
    created_at: "2025-05-19T00:00:00Z",
    update_at: "2025-05-19T00:00:00Z",
  },
  {
    id: 2,
    product_id: 101,
    variant_name: "Sách bìa cứng",
    price: 125000,
    stock_quantity: 50,
    image_url: "https://byvn.net/b2qe",
    created_at: "2025-05-19T00:00:00Z",
    update_at: "2025-05-19T00:00:00Z",
  },
];

const columns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Tên",
    dataIndex: "variant_name",
    key: "variant_name",
  },
  {
    title: "Giá tiền",
    dataIndex: "price",
    key: "price",
    render: (price: number) => `${price.toLocaleString()}₫`,
  },
  {
    title: "Tồn kho",
    dataIndex: "stock_quantity",
    key: "stock_quantity",
  },
  {
    title: "Hình ảnh",
    dataIndex: "image_url",
    key: "image_url",
    render: (image_url: string) => (
      <img
        src={image_url}
        alt="variant"
        style={{ width: 40, height: 60, objectFit: "cover" }}
      />
    ),
  },
  {
    title: "Hành động",
    key: "action",
    render: (_: any, record: Variant) => (
      <Space>
        <Popconfirm
          title="Xoá biến thể này?"
          onConfirm={() => onDelete(record.id)}
          okText="Xoá"
          cancelText="Huỷ"
        >
          <Button
            icon={<DeleteOutlined />}
            size="small"
            style={{
              backgroundColor: "white",
              color: "red",
              borderColor: "red",
            }}
          />
        </Popconfirm>
        <Link to={`/variants/edit/${record.id}`}>
          <Button
            icon={<EditOutlined />}
            size="small"
            style={{
              backgroundColor: "white",
              color: "green",
              borderColor: "green",
            }}
          />
        </Link>
      </Space>
    ),
  },
];

const Variants = () => {
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 11,
        }}
      >
        <h1>Danh sách biến thể</h1>
        <Link to={`/variants/add`}>
          <Button
            icon={<PlusOutlined />}
            size="small"
            style={{
              backgroundColor: "white",
              color: "dodgerblue",
              borderColor: "dodgerblue",
            }}
          >
          </Button>
        </Link>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </>
  );
};

export default Variants;
