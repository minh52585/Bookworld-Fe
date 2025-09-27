import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, message, Table } from 'antd'
import { Link } from 'react-router'
import { IDiscounts } from '../../types/discounts.ts'
import api from '@/config/axios.customize.ts'
import { PlusOutlined } from '@ant-design/icons'
import { getDiscountsColumns } from '../contants/discount/discountColumns.tsx'

const Discounts = () => {
  const { data } = useQuery<IDiscounts[]>({
    queryKey:['discounts'],
    queryFn: async() => {
      try {
        const { data } = await api.get('api/discounts')
        console.log('DATA', data)
        return Array.isArray(data.data) ? data.data : [data.data]
      } catch (error) {
        console.log(error)
      }
    }
  })
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn:async(id:string)=>{
      try {
        await api.delete(`api/discounts/${id}`)
      } catch (error) {
        console.log(error);
      }
    },
    onSuccess:( ) => {
      queryClient.invalidateQueries({ queryKey:['discounts'] })
      message.success('Delete discounts successfully')
    }
  })
  const Del = (id:string) => {
    mutation.mutate(id)
  }

  const columns = getDiscountsColumns(queryClient, Del)

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 }}>
        <h1>Danh sách khuyến mại</h1>
        <Link to={'/discounts/add'}>
          <Button icon={<PlusOutlined />} size="small" style={{ backgroundColor: "white", color: "dodgerblue", borderColor: "dodgerblue" }}></Button>
        </Link>
      </div>
      <Table
        dataSource={Array.isArray(data) ? data : []}
        columns={columns}
        rowKey={record => record._id}
      />
    </>
  )
}

export default Discounts