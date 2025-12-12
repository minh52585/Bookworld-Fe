import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, message, Table, Popconfirm, Switch, Space } from 'antd';
import { Link } from 'react-router-dom';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useState } from 'react';
import api from '@/config/axios.customize';
import { IProducts } from '@/types/product';

const ProductsPage = () => {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');

  // Lấy danh sách sản phẩm
  const { data, isLoading } = useQuery<IProducts[]>({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const res = await api.get('/products');
        const items = res.data?.data?.items || [];

        return items.map((item: any, index: number) => ({
          ...item,
          stt: index + 1,
          quantity: item.quantity ?? 0, // 🔹 thêm số lượng
          images: item.images || [],
          status: item.status ?? true,
        }));
      } catch (error) {
        console.error('Error fetching products:', error);
        return [];
      }
    },
  });

  // Xoá sản phẩm
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      message.success('Xoá sản phẩm thành công!');
    },
    onError: (err) => {
      console.error(err);
      message.error('Xoá sản phẩm thất bại!');
    },
  });

  const DelProduct = (id: string) => mutation.mutate(id);

  const filteredData = Array.isArray(data)
    ? data.filter((item) => item.name?.toLowerCase().includes(searchText.toLowerCase()))
    : [];

  const columns = [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: 60 },
    { title: 'Tên', dataIndex: 'name', key: 'name', width: 180 },
    { title: 'Tác giả', dataIndex: 'author', key: 'author', width: 140 },
    { 
      title: 'Danh mục', 
      dataIndex: 'category', 
      key: 'category', 
      width: 140,
      render: (cat: any) => cat?.name || 'Chưa phân loại',
    },
    { title: 'Năm XB', dataIndex: 'namxuatban', key: 'namxuatban', width: 100 },
    { title: 'NXB', dataIndex: 'nhaxuatban', key: 'nhaxuatban', width: 140 },
    { title: 'Số trang', dataIndex: 'sotrang', key: 'sotrang', width: 100 },
    { title: 'Khối lượng (g)', dataIndex: 'weight', key: 'weight', width: 100 },
    { title: 'Kích thước', dataIndex: 'size', key: 'size', width: 120 },
    { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 120 },
    { 
      title: 'Giá', 
      dataIndex: 'price', 
      key: 'price', 
      width: 120,
      render: (value: number) => value?.toLocaleString('vi-VN') + ' ₫',
    },
    { 
      title: 'Số lượng', 
      dataIndex: 'quantity', 
      key: 'quantity', 
      width: 100,
      render: (value: number) => value ?? 0,
    },
    { 
      title: 'Mô tả', 
      dataIndex: 'description', 
      key: 'description', 
      width: 200,
      render: (text: string) => text ? (text.length > 50 ? text.slice(0,50)+'...' : text) : '',
    },
    { 
      title: 'Hình ảnh', 
      dataIndex: 'images', 
      key: 'images', 
      width: 100,
      render: (images: string[]) => images?.[0] ? (
        <img src={images[0]} width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} />
      ) : (
        <div style={{ width: 50, height: 50, backgroundColor: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#999' }}>Chưa có</div>
      ),
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status', 
      width: 100,
      render: (status: boolean, record: IProducts) => (
        <Switch
          checked={Boolean(status)}
          checkedChildren="Sẵn"
          unCheckedChildren="Hết"
          onChange={async (checked) => {
            try {
              await api.put(`/products/${record._id}`, { status: checked });
              message.success('Cập nhật trạng thái thành công!');
              queryClient.invalidateQueries({ queryKey: ['products'] });
            } catch (error) {
              console.error(error);
              message.error('Cập nhật trạng thái thất bại!');
            }
          }}
        />
      ),
    },
    { 
      title: 'Hành động', 
      key: 'action', 
      width: 120,
      render: (_: any, record: IProducts) => (
        <Space>
          <Popconfirm 
            title="Xoá sản phẩm này?" 
            okText="Xoá" 
            cancelText="Huỷ" 
            onConfirm={() => DelProduct(record._id)}
          >
            <Button icon={<DeleteOutlined />} size="small" style={{ backgroundColor: 'white', color: 'red', borderColor: 'red' }} />
          </Popconfirm>
          <Link to={`/products/update/${record._id}`}>
            <Button icon={<EditOutlined />} size="small" style={{ backgroundColor: 'white', color: 'green', borderColor: 'green' }} />
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
            type="text"
            placeholder="Tìm kiếm theo tên sản phẩm..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded"
          />
          <Link to="/products/add">
            <Button icon={<PlusOutlined />} size="small" style={{ backgroundColor: 'white', color: 'dodgerblue', borderColor: 'dodgerblue' }} />
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey={record => record._id}
          pagination={{ pageSize: 5 }}
          scroll={{ x: 1800 }}
          loading={isLoading}
        />
      </div>
    </div>
  );
};

export default ProductsPage;
