import { PlusOutlined } from '@ant-design/icons'
import { Button, message, Table } from 'antd'
import { getCategoryColumns } from '../contants/category/categoryColumns'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/config/axios.customize'
import { Link } from 'react-router'

const Category = () => {
  const { data } = useQuery({
    queryKey: ['category'],
    queryFn: async () => {
      try {
        const { data } = await api.get('api/categories/')
        console.log('DATA', data)
        return Array.isArray(data.data) ? data.data : [data.data]
      } catch (error) {
        console.log(error)
      }
    }
  })
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        await api.delete(`api/categories/${id}`)
      } catch (error) {
        console.log(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category'] })
      message.success('Xoá danh mục thành công!')
    }
  })
  const DelCategory = (id:string) => {
    mutation.mutate(id)
    console.log('Xoá danh mục', id)
  }
  const columns = getCategoryColumns(queryClient,DelCategory)

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 }}>
        <h1>Danh mục sách</h1>
        <Link to={'/categories/add'}>
          <Button icon={<PlusOutlined />} size="small" style={{ backgroundColor: 'white', color: 'dodgerblue', borderColor: 'dodgerblue' }}></Button>
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


export default Category