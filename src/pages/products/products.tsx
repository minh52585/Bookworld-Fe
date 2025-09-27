import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, message, Table } from 'antd'
import { Link } from 'react-router'
import { IProducts } from '../../types/product.ts'
import api from '@/config/axios.customize.ts'
import { PlusOutlined } from '@ant-design/icons'
import { getProductColumns } from '../contants/product/productColumns.tsx'

const ProductsPage = () => {
  const { data } = useQuery<IProducts[]>({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const { data } = await api.get('api/products')
        console.log('Data:', data)
        return Array.isArray(data.data) ? data.data : [data.data]
      } catch (error) {
        console.log(error)
        return []
      }
    }
  })
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        await api.delete(`api/products/${id}`)
      } catch (error) {
        console.log(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      message.success('Xoá sản phẩm thành công!')
    }
  })
  const DelProduct = (id: string) => {
    mutation.mutate(id)
  }

  const columns = getProductColumns(queryClient, DelProduct)
  
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 }}>
        <h1>Danh sách sản phẩm</h1>
        <Link to={'/products/add'}>
          <Button icon={<PlusOutlined />} size="small" style={{ backgroundColor: "white", color: "dodgerblue", borderColor: "dodgerblue" }}></Button>
        </Link>
      </div>
      <Table dataSource={Array.isArray(data) ? data : []} columns={columns} rowKey={record => record._id} pagination={{ pageSize: 3}} />
    </>
  )
}

export default ProductsPage