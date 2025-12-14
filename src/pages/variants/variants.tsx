import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, Table, message } from "antd";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/config/axios.customize";

interface Variant {
  _id: string;
  product_id:
    | { _id: string; name: string; slug: string; images?: string[] }
    | string;
  variant_name: string;
  type: string;
  price: number;
  quantity: number;
  sku: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  image_url?: string; // optional nếu có trường ảnh
}

const Variants = () => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        setLoading(true);
        const res = await api.get("/variants");
        console.log("API response:", res.data);

        // Lấy mảng items từ API
        const items: Variant[] = res.data?.data?.items ?? [];
        setVariants(items);
      } catch (err) {
        console.error("Fetch variants error:", err);
        message.error("Lấy danh sách biến thể thất bại");
        setVariants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVariants();
  }, []);

  const onDelete = async (_id: string) => {
    try {
      await api.delete(`/variants/${_id}`);
      setVariants((prev) => prev.filter((v) => v._id !== _id));
      message.success("Xoá biến thể thành công");
    } catch (err) {
      console.error(err);
      message.error("Xoá biến thể thất bại");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "_id",
      key: "_id",
      render: (_id: string) => _id.slice(-6),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "product_id",
      key: "product_name",
      render: (product: any) => (product && typeof product !== "string" ? product.name : "-"),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Giá tiền",
      dataIndex: "price",
      key: "price",
      render: (price: number) =>
        price.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    {
      title: "Tồn kho",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Hình ảnh",
      dataIndex: "image_url",
      key: "image_url",
      render: (_: any, record: Variant) => {
        // Ưu tiên ảnh của variant, nếu không có thì lấy ảnh đầu tiên của product
        const url =
          record.image_url ||
          (record.product_id &&
          typeof record.product_id !== "string" &&
          record.product_id.images &&
          record.product_id.images.length > 0
            ? record.product_id.images[0]
            : null);

        return url ? (
          <img
            src={url}
            alt={record.variant_name || (record.product_id as any).name}
            style={{ width: 40, height: 60, objectFit: "cover", borderRadius: 4 }}
          />
        ) : (
          <div
            style={{
              width: 40,
              height: 60,
              backgroundColor: "#eee",
              borderRadius: 4,
            }}
          />
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Variant) => (
        <Space>
          <Popconfirm
            title="Xoá biến thể này?"
            onConfirm={() => onDelete(record._id)}
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
          <Link to={`/variants/edit/${record._id}`}>
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

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2>Danh sách biến thể</h2>
        <Link to={`/variants/add`}>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            Thêm biến thể
          </Button>
        </Link>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={variants}
        rowKey={(record) => record._id}
        pagination={{ pageSize: 5 }}
        loading={loading}
      />
    </div>
  );
};

export default Variants;
