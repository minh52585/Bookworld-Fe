import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, message, Table, Popconfirm, Switch, Space } from 'antd';
import { Link } from 'react-router-dom';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useState } from 'react';
import api from '@/config/axios.customize';
import { IProducts } from '@/types/product';

//type category
interface ICategory {
  _id: string;
  name: string;
}

interface IProductWithCategory extends IProducts {
  stt: number;
  category?: ICategory;
}

const ProductsPage = () => {
  const queryClient = useQueryClient();

  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  //lấy danh mục
  const { data: categories = [] } = useQuery<ICategory[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data?.data?.items ?? [];
    },
  });

  // danh sách sản phẩm
  const { data: products = [], isLoading } = useQuery<IProductWithCategory[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get('/products');
      const items = res.data?.data?.items ?? [];

      return items.map((item: any, index: number) => ({
        ...item,
        stt: index + 1,
        images: Array.isArray(item.images) ? item.images : [],
        status: Boolean(item.status),
      }));
    },
  });

  // xóa sp
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('admin_token');
      return api.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      message.success('Xoá sản phẩm thành công');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
  const filteredData = products.filter((item) => {
    const matchName = item.name
      ?.toLowerCase()
      .includes(searchText.toLowerCase());

    const matchCategory =
      selectedCategory === 'all'
        ? true
        : item.category?._id === selectedCategory;

    return matchName && matchCategory;
  });

  const columns = [
    { title: 'STT', dataIndex: 'stt', width: 60 },
    { title: 'Tên', dataIndex: 'name', width: 200 },
    { title: 'Tác giả', dataIndex: 'author', width: 150 },
    {
      title: 'Danh mục',
      width: 160,
      render: (_: any, record: IProductWithCategory) =>
        record.category?.name || 'Chưa phân loại',
    },
    { title: 'Năm XB', dataIndex: 'namxuatban', width: 100 },
    { title: 'NXB', dataIndex: 'nhaxuatban', width: 140 },
    { title: 'Số trang', dataIndex: 'sotrang', width: 100 },
    { title: 'Khối lượng (g)', dataIndex: 'weight', width: 120 },
    { title: 'Kích thước', dataIndex: 'size', width: 120 },
    { title: 'SKU', dataIndex: 'sku', width: 120 },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      width: 220,
      render: (text: string) =>
        text && text.length > 50 ? `${text.slice(0, 50)}...` : text,
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'images',
      width: 100,
      render: (images: string[]) =>
        images?.[0] ? (
          <img
            src={images[0]}
            alt=""
            width={50}
            height={50}
            style={{ objectFit: 'cover', borderRadius: 4 }}
          />
        ) : (
          <div
            style={{
              width: 50,
              height: 50,
              background: '#f0f0f0',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              color: '#999',
            }}
          >
            Chưa có
          </div>
        ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 100,
      render: (status: boolean, record: IProductWithCategory) => (
        <Switch
          checked={status}
          onChange={async (checked) => {
            const token = localStorage.getItem('admin_token');
            await api.put(
              `/products/${record._id}`,
              { status: checked },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            message.success('Cập nhật trạng thái thành công');
            queryClient.invalidateQueries({ queryKey: ['products'] });
          }}
        />
      ),
    },
    {
      title: 'Hành động',
      width: 120,
      render: (_: any, record: IProductWithCategory) => (
        <Space>
          <Popconfirm
            title="Xoá sản phẩm này?"
            onConfirm={() => deleteMutation.mutate(record._id)}
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
          <Link to={`/products/update/${record._id}`}>
            <Button icon={<EditOutlined />} size="small" />
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Danh sách sản phẩm</h1>

        <div className="flex gap-2 items-center">
          <input
            placeholder="Tìm theo tên..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="px-2 py-1 border rounded"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2 py-1 border rounded"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <Link to="/products/add">
            <Button icon={<PlusOutlined />} />
          </Link>
        </div>
      </div>

      <Table
        rowKey="_id"
        loading={isLoading}
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 5 }}
        scroll={{ x: 1800 }}
      />
    </div>
  );
};

export default ProductsPage;
