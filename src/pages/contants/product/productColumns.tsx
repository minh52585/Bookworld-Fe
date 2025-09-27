import { Button, message, Popconfirm, Space, Switch } from 'antd'
import { Link } from 'react-router'
import { IProducts } from '../../../types/product.ts'
import api from '@/config/axios.customize.ts'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

export const getProductColumns = (queryClient: any, DelProduct: (id: string) => void) => [
  {
    title: 'ID',
    key: 'id',
    render: (_: any, __: any, index: number) => index + 1
  },
  {
    title: 'Tên',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'Mô tả',
    key: 'description',
    render: (record: any) => record.description || record.descriptions || ''
  },
  {
    title: 'Giá tiền',
    dataIndex: 'price',
    key: 'price'
  },
  {
    title: 'Số lượng',
    dataIndex: 'quantity',
    key: 'quantity'
  },
  {
    title: 'Danh mục',
    dataIndex: 'category',
    key: 'category'
  },
  {
    title: 'Hình ảnh',
    dataIndex: 'images',
    key: 'images',
    render: (images: string) => <img src={images} width={50} height={50} />,
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (status: string, record: IProducts) => (
      <Switch
        checked={status === 'Sẵn'}
        checkedChildren="Sẵn"
        unCheckedChildren="Hết"
        style={{ minWidth: 50 }}
        onChange={async (checked) => {
          try {
            await api.put(`api/products/${record._id}`, {
              status: checked ? 'Sẵn' : 'Hết'
            })
            message.success('Cập nhật trạng thái thành công!');
            queryClient.invalidateQueries({ queryKey: ['products'] });
          } catch (error) {
            console.log(error)
            message.error('Cập nhật trạng thái thất bại!');
          }
        }}
      />
    )
  },
  {
    title: 'Hành động',
    key: 'action',
    render: (_: any, record: IProducts) =>
      <Space>
        <Popconfirm
          title="Xoá sản phẩm này?"
          okText="Xoá"
          cancelText="Huỷ"
          onConfirm={() => DelProduct(record._id)}
        >
          <Button icon={<DeleteOutlined />} size="small" style={{ backgroundColor: "white", color: "red", borderColor: "red" }}></Button>
        </Popconfirm>
        <Link to={`/products/update/${record._id}`}>
          <Button icon={<EditOutlined />} size="small" style={{ backgroundColor: "white", color: "green", borderColor: "green" }}></Button>
        </Link>
      </Space>
  }
]