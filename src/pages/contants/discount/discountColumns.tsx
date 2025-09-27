import { Button, message, Popconfirm, Space, Switch } from 'antd'
import { Link } from 'react-router'
import { IDiscounts } from '../../../types/discounts.ts'
import api from '@/config/axios.customize.ts'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

export const getDiscountsColumns = (queryClient: any, Del: (id: string) => void) => [
  {
    title: 'ID',
    key: 'id',
    render: (_: any, __: any, index: number) => index + 1
  },
  {
    title: 'Mã sản phẩm',
    dataIndex: 'productID',
    key: 'productID'
  },
  {
    title: 'Mã biến thể',
    dataIndex: 'variantID',
    key: 'variantID'
  },
  {
    title: 'Phân loại',
    dataIndex: 'discount_type',
    key: 'discount_type'
  },
  {
    title: 'Giá trị',
    dataIndex: 'discount_value',
    key: 'discount_value'
  },
  {
    title: 'Thời gian áp dụng',
    key: 'date',
    render: (_: any, record: IDiscounts) => {
      if (Array.isArray(record.date) && record.date.length > 0) {
        const start = record.date[0] ? new Date(record.date[0]).toLocaleDateString() : '--'
        const end = record.date[1] ? new Date(record.date[1]).toLocaleDateString() : '--'
        return (
          <span>
            {start} - {end}
          </span>
        )
      }
      return <span>--</span>
    }
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (status: string, record: IDiscounts) => (
      <Switch
        checked={status === 'Mở'}
        checkedChildren='Mở'
        unCheckedChildren='Khoá'
        onChange={async (checked) => {
          try {
            await api.put(`api/discounts/${record._id}`, {
              status: checked ? 'Mở' : 'Khoá'
            })
            message.success('Cập nhật trạng thái thành công!')
            queryClient.invalidateQueries({ queryKey: ['discounts'] })
          } catch (error) {
            console.log(error)
          }
        }}
      />
    )
  },
  {
    title: 'Hành động',
    dataIndex: 'id',
    key: 'id',
    render: (_: any, record: IDiscounts) => (
      <Space>
        <Popconfirm
          title="Xoá khuyến mại này?"
          okText="Xoá"
          cancelText="Huỷ"
          onConfirm={() => Del(record._id)}
        >
          <Button icon={<DeleteOutlined />} size="small" style={{ backgroundColor: "white", color: "red", borderColor: "red" }}></Button>
        </Popconfirm>
        <Link to={`/discounts/update/${record._id}`}>
          <Button icon={<EditOutlined />} size="small" style={{ backgroundColor: "white", color: "green", borderColor: "green" }}></Button>
        </Link>
      </Space>
    )
  }
]