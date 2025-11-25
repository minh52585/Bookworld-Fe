import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, message, Table } from 'antd'
import { Link } from 'react-router'
import { IProducts } from '../../types/product.ts'
import api from '@/config/axios.customize.ts'
import { PlusOutlined } from '@ant-design/icons'
import { getProductColumns } from '../contants/product/productColumns.tsx'

const ProductsPage = () => {
  const queryClient = useQueryClient()

  // Lấy danh sách sản phẩm
  const { data } = useQuery<IProducts[]>({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const res = await api.get('/products')
        console.log('Data:', res.data)
        // Lấy mảng items từ response
        return Array.isArray(res.data.data.items) ? res.data.data.items : []
      } catch (error) {
        console.error(error)
        return []
      }
    }
  })

  // Xoá sản phẩm
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        await api.delete(`/products/${id}`)
      } catch (error) {
        console.error(error)
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
          <Button
            icon={<PlusOutlined />}
            size="small"
            style={{ backgroundColor: 'white', color: 'dodgerblue', borderColor: 'dodgerblue' }}
          ></Button>
        </Link>
      </div>

      <Table
        dataSource={Array.isArray(data) ? data : []}
        columns={columns}
        rowKey={record => record._id} 
        pagination={{ pageSize: 3 }}
      />
    </>
  )
}

export default ProductsPage
