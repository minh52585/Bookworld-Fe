import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, Table, message } from "antd";
import { Link } from "react-router";
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import api from '@/config/axios.customize'

const Coupons = () => {
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: ['discounts'],
    queryFn: async () => {
      try {
        const res = await api.get('/discounts')
        return Array.isArray(res.data.data) ? res.data.data : [res.data.data]
      } catch (error) {
        console.log(error)
        return []
      }
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        await api.delete('/discounts', { data: { id } })
      } catch (error) {
        throw error
      }
    },
    onSuccess: () => {
      message.success('Xoá mã giảm giá thành công')
      queryClient.invalidateQueries({ queryKey: ['discounts'] })
    },
    onError: (err) => {
      console.log(err)
      message.error('Xoá thất bại')
    }
  })

  const onDelete = (id: string) => {
    deleteMutation.mutate(id)
  }

  const columns = [
    {
      title: "ID",
      key: "id",
      render: (_: any, __: any, index: number) => index + 1
    },
    {
      title: "Mã giảm giá",
      dataIndex: "code",
      key: "code"
    },

    {
      title: "Phân loại",
      dataIndex: "type",
      key: "type",
      render: (type: string) => type === "percent" ? "Phần trăm" : "Tiền mặt"
    },
    {
      title: "Giá trị giảm",
      dataIndex: "value",
      key: "value",
      render: (value: number, record: any) =>
        record.type === "percent" ? `${value}%` : `${Number(value).toLocaleString()}₫`
    },
    {
      title: "Tối thiểu",
      dataIndex: "minOrderValue",
      key: "minOrderValue",
      render: (value: number) => `${Number(value || 0).toLocaleString()}₫`
    },
    {
      title: "Thời gian áp dụng",
      key: "time_range",
      render: (_: any, record: any) =>
        `${record.startsAt ? new Date(record.startsAt).toLocaleDateString() : '--'} - ${record.endsAt ? new Date(record.endsAt).toLocaleDateString() : '--'}`
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const isOn = status === "active";
        const backgroundColor = isOn ? "#e6ffe6" : "#ffe6e6";
        const textColor = isOn ? "limegreen" : "tomato";
        return (
          <span style={{
            backgroundColor,
            color: textColor,
            fontWeight: 600,
            padding: "3px 6px",
            borderRadius: "17px",
            display: "inline-block"
          }}>
            {isOn ? 'ON' : 'OFF'}
          </span>
        );
      }
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: any) => (
        <Space>
          <Popconfirm
            title="Xoá mã giảm giá này?"
            onConfirm={() => onDelete(record._id)}
            okText="Xoá"
            cancelText="Huỷ"
          >
            <Button
              icon={<DeleteOutlined />}
              size="small"
              style={{ backgroundColor: "white", color: "red", borderColor: "red" }}
            />
          </Popconfirm>
          <Link to={`/coupons/edit/${record._id}`}>
            <Button
              icon={<EditOutlined />}
              size="small"
              style={{ backgroundColor: "white", color: "green", borderColor: "green" }}
            />
          </Link>
        </Space>
      )
    }
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 }}>
        <h1>Quản lý mã giảm giá</h1>
        <Link to={`/coupons/add`}>
          <Button
            icon={<PlusOutlined />}
            size="small"
            style={{ backgroundColor: "white", color: "dodgerblue", borderColor: "dodgerblue" }}
          >
          </Button>
        </Link>
      </div>
      <Table
        columns={columns}
        dataSource={Array.isArray(data) ? data : []}
        rowKey={record => record._id}
        pagination={{ pageSize: 10 }}
      />
    </>
  );
};

export default Coupons;
