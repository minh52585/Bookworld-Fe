import api from '@/config/axios.customize';
import { ICategory } from '@/types/category';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Space, Popconfirm, Button, Switch, message } from 'antd';
import { Link } from 'react-router';

export const getCategoryColumns = ( queryClient:any, DelCategory: (id: string) => void) => [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    render: (_: any, __: any, index: number) => index + 1
  },
  {
    title: 'Tên',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'Tên đường dẫn',
    dataIndex: 'slug',
    key: 'slug'
  },
  {
    title: 'Mô tả',
    dataIndex: 'description',
    key: 'description'
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (status: string, record: any) => (
      <Switch
        checked={status === 'active'}
        checkedChildren="Mở"
        unCheckedChildren="Khoá"
        style={ { minWidth: 50 } }
        onChange={async (checked) => {
          try {
            await api.put(`api/categories/${record._id}`, {
              status: checked ? 'active' : 'inactive'
            });
            message.success('Cập nhật trạng thái thành công!')
            queryClient.invalidateQueries({ queryKey: ['category'] });

          }
          catch (error) {
            console.error('Cập nhật trạng thái thất bại:', error)
            message.error('Cập nhật trạng thái thất bại!')
          }
        }
        }
      />
    )
  },
  {
    title: 'Hành động',
    key: 'action',
    render: (_: any, record: ICategory) => (
      <Space>
        <Popconfirm title='Xoá danh mục này?' onConfirm={() => DelCategory(record._id)} okText='Xoá' cancelText='Huỷ'>
          <Button icon={<DeleteOutlined />} size='small' style={{ backgroundColor: 'white', color: 'red', borderColor: 'red' }}></Button>
        </Popconfirm>
        <Link to={`/categories/edit/${record._id}`}>
          <Button icon={<EditOutlined />} size='small' style={{ backgroundColor: 'white', color: 'green', borderColor: 'green' }}></Button>
        </Link>
      </Space>
    )
  }
];