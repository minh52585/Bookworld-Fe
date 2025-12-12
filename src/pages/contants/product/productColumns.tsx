import { Button, Space, Switch, message, Popconfirm } from 'antd';
import { Link } from 'react-router-dom';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import api from '@/config/axios.customize';
import { IProducts } from '../../../types/product';

export const getProductColumns = (queryClient: any, DelProduct: (id: string) => void) => [
  { title: 'STT', key: 'stt', dataIndex: 'stt', width: 60 },
  { title: 'Tên', dataIndex: 'name', key: 'name', width: 180 },
  { title: 'Tác giả', dataIndex: 'author', key: 'author', width: 140 },
  { title: 'Năm XB', dataIndex: 'namxuatban', key: 'namxuatban', width: 100 },
  { title: 'NXB', dataIndex: 'nhaxuatban', key: 'nhaxuatban', width: 140 },
  { title: 'Số trang', dataIndex: 'sotrang', key: 'sotrang', width: 100 },
  { title: 'Giá tiền', key: 'price', width: 120, render: (record: any) => record.price?.toLocaleString('vi-VN') + ' đ' },
  { title: 'Số lượng', key: 'quantity', width: 100, render: (record: any) => record.quantity ?? '' },
  { title: 'Khối lượng', dataIndex: 'weight', key: 'weight', width: 100 },
  { title: 'Kích thước', dataIndex: 'size', key: 'size', width: 120 },
  { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 120 },
  { title: 'Mô tả', dataIndex: 'description', key: 'description', width: 200, render: (text: string) => text || '' },
  { title: 'Danh mục', dataIndex: 'category', key: 'category', width: 140,   render: (cat: any) => cat?.name || 'Chưa phân loại',  },
  { 
    title: 'Hình ảnh', 
    dataIndex: 'images', 
    key: 'images', 
    width: 100, 
    render: (images: string[]) => images?.[0] ? (
      <img src={images[0]} width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} />
    ) : null,
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
        style={{ minWidth: 50 }}
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
    )
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
          <Button 
            icon={<DeleteOutlined />} 
            size="small" 
            style={{ backgroundColor: 'white', color: 'red', borderColor: 'red' }} 
          />
        </Popconfirm>
        <Link to={`/products/update/${record._id}`}>
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            style={{ backgroundColor: 'white', color: 'green', borderColor: 'green' }} 
          />
        </Link>
      </Space>
    )
  }
];
