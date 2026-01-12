import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Popconfirm, Space, Table, message, Select, Switch } from "antd";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/config/axios.customize";
import axios from 'axios';

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
  image_url?: string;
}

const Variants = () => {
  const queryClient = useQueryClient();
  const [variants, setVariants] = useState<Variant[]>([]);
  const [filteredVariants, setFilteredVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Lấy token dùng chung cho các hàm
  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        setLoading(true);
        // THÊM TOKEN KHI LẤY DANH SÁCH
        const res = await api.get("variants/admin/variants", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const items: Variant[] = res.data?.data?.items ?? res.data?.data ?? [];
        setVariants(items);
        setFilteredVariants(items);
      } catch (err) {
        console.error("Fetch variants error:", err);
        message.error("Lấy danh sách biến thể thất bại");
        setVariants([]);
        setFilteredVariants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVariants();
  }, [token]);

  // 🔹 Apply filters
  useEffect(() => {
    let temp = [...variants];
    if (typeFilter) temp = temp.filter((v) => v.type === typeFilter);
    if (statusFilter) temp = temp.filter((v) => v.status === statusFilter);
    setFilteredVariants(temp);
  }, [typeFilter, statusFilter, variants]);

  const onDelete = async (_id: string) => {
    try {
      // THÊM TOKEN KHI XOÁ
      await api.delete(`/variants/${_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newVariants = variants.filter((v) => v._id !== _id);
      setVariants(newVariants);
      message.success("Xoá biến thể thành công");
    } catch (err: any) {
      console.error(err);
      message.error(err.response?.data?.message || "Xoá biến thể thất bại");
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
      render: (product: any) =>
        product && typeof product !== "string" ? product.name : "-",
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
           title: 'Trạng thái', 
           dataIndex: 'status', 
           key: 'status', 
           width: 100, 
           render: (status: string, record: Variant) => (
            <Switch
              loading={loadingId === record._id}
              checked={status === "active"}
              style={{ minWidth: 50 }}
              checkedChildren="ON"
              unCheckedChildren="OFF"
              onChange={async (checked) => {
                setLoadingId(record._id);

                try {
                  const newStatus = checked ? "active" : "inactive";

                  await api.put(
                    `/variants/${record._id}`,
                    { status: newStatus },
                    {
                      headers: { Authorization: `Bearer ${token}` },
                    }
                  );

                  // ✅ UPDATE STATE NGAY LẬP TỨC
                  setVariants((prev) =>
                    prev.map((v) =>
                      v._id === record._id ? { ...v, status: newStatus } : v
                    )
                  );

                  message.success("Cập nhật trạng thái của biến thể thành công!");
                } catch (error) {
                  console.error(error);
                  if (axios.isAxiosError(error)) {
              message.error(
              error.response?.data?.message || "Cập nhật trạng thái thất bại!"
            );
          } else {
            message.error("Cập nhật trạng thái thất bại!");
          }
                } finally {
                  setLoadingId(null);
                }
              }}
            />
           )
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
      {/* Header + Filters */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Danh sách biến thể</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <Select
            placeholder="Lọc theo loại"
            style={{ width: 150 }}
            allowClear
            value={typeFilter || undefined}
            onChange={(val) => setTypeFilter(val || null)}
            options={[
              { label: "Bìa mềm", value: "Bìa mềm" },
              { label: "Bìa cứng", value: "Bìa cứng" },
            ]}
          />
        
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
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredVariants}
        rowKey={(record) => record._id}
        pagination={{ pageSize: 5 }}
        loading={loading}
      />
    </div>
  );
};

export default Variants;