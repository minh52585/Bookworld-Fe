import api from '@/config/axios.customize';
import { ICategory } from '@/types/category';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Space, Popconfirm, Button, Switch, message } from 'antd';
import { Link } from 'react-router';
import { useState } from 'react';


export const getCategoryColumns = (
  queryClient: any,
  DelCategory: (id: string) => void
) => {
const [loadingId, setLoadingId] = useState<string | null>(null);
  return [
  {
    title: 'ID',
    key: 'index',
    render: (_: any, __: any, index: number) => index + 1, 
  },
  {
    title: 'Tên',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Mô tả',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    width: 120,
    render: (status: string, record: ICategory) => (
      <Switch
        loading={loadingId === record._id}
        checked={status === "active"}
        checkedChildren="ON"
        unCheckedChildren="OFF"
        onChange={async (checked) => {
          setLoadingId(record._id);
          try {
            await api.put(`/categories/status/${record._id}`, {
              status: checked ? "active" : "inactive",
            });

            message.success("Cập nhật trạng thái thành công!");
            queryClient.invalidateQueries({ queryKey: ["categories"] });
          } catch (error) {
            console.error(error);
            message.error("Cập nhật trạng thái thất bại!");
          } finally {
            setLoadingId(null);
          }
        }}
      />
    ),
  },
  {
    title: 'Hành động',
    key: 'action',
    render: (_: any, record: ICategory) => (
      <Space>
        <Popconfirm
          title="Xoá danh mục này?"
          onConfirm={() => DelCategory(record._id)}
          okText="Xoá"
          cancelText="Huỷ"
        >
          <Button
            icon={<DeleteOutlined />}
            size="small"
            style={{ backgroundColor: 'white', color: 'red', borderColor: 'red' }}
          />
        </Popconfirm>

        <Link to={`/categories/edit/${record._id}`}>
          <Button
            icon={<EditOutlined />}
            size="small"
            style={{ backgroundColor: 'white', color: 'green', borderColor: 'green' }}
          />
        </Link>
      </Space>
    ),
  },
]};
