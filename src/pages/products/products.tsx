import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  message,
  Table,
  Popconfirm,
  Switch,
  Space,
  Card,
  Input,
  Select,
  Tag,
  Image,
} from 'antd';
import { Link } from 'react-router-dom';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import api from '@/config/axios.customize';
import { IProducts } from '@/types/product';

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

  //danh sách sản phẩm
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

  //xóa sp
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
    {
      title: 'STT',
      width: 60,
      align: 'center',
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Tên sách',
      dataIndex: 'name',
      width: 220,
      ellipsis: true,
    },
    {
      title: 'Tác giả',
      dataIndex: 'author',
      width: 160,
    },
    {
      title: 'Danh mục',
      width: 160,
      render: (_: any, record: IProductWithCategory) =>
        record.category?.name ? (
          <Tag color="blue">{record.category.name}</Tag>
        ) : (
          <Tag>Chưa phân loại</Tag>
        ),
    },
    {
      title: 'Năm XB',
      dataIndex: 'namxuatban',
      width: 100,
      align: 'center',
    },
    {
      title: 'NXB',
      dataIndex: 'nhaxuatban',
      width: 140,
    },
    {
      title: 'Số trang',
      dataIndex: 'sotrang',
      width: 100,
      align: 'right',
    },
    {
      title: 'Khối lượng (g)',
      dataIndex: 'weight',
      width: 120,
      align: 'right',
    },
    {
      title: 'Kích thước',
      dataIndex: 'size',
      width: 120,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      width: 120,
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'images',
      width: 100,
      render: (images: string[]) =>
        images?.[0] ? (
          <Image
            src={images[0]}
            width={50}
            height={50}
            style={{ objectFit: 'cover', borderRadius: 6 }}
          />
        ) : (
          <Tag>Chưa có</Tag>
        ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 110,
      align: 'center',
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
      width: 130,
      fixed: 'right' as const,
      render: (_: any, record: IProductWithCategory) => (
        <Space>
          <Link to={`/products/update/${record._id}`}>
            <Button size="small" icon={<EditOutlined />} />
          </Link>
          <Popconfirm
            title="Xoá sản phẩm này?"
            onConfirm={() => deleteMutation.mutate(record._id)}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={deleteMutation.isLoading}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Danh sách sản phẩm"
      extra={
        <Link to="/products/add">
          <Button type="primary" icon={<PlusOutlined />}>
            Thêm sản phẩm
          </Button>
        </Link>
      }
    >
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm theo tên sản phẩm"
          allowClear
          style={{ width: 260 }}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <Select
          value={selectedCategory}
          style={{ width: 200 }}
          onChange={(value) => setSelectedCategory(value)}
          options={[
            { label: 'Tất cả danh mục', value: 'all' },
            ...categories.map((c) => ({
              label: c.name,
              value: c._id,
            })),
          ]}
        />
      </Space>

      <Table
        rowKey="_id"
        loading={isLoading}
        columns={columns}
        dataSource={filteredData}
        bordered
        pagination={{ pageSize: 5 }}
        scroll={{ x: 1800 }}
      />
    </Card>
  );
};

export default ProductsPage;
