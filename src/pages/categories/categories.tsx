import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Table } from 'antd';
import { getCategoryColumns } from '../contants/category/categoryColumns';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/config/axios.customize';
import { Link } from 'react-router';

const Category = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
  queryKey: ['category'],
  queryFn: async () => {
    try {
      const res = await api.get('/categories');
      console.log('API categories:', res.data); 
      return Array.isArray(res.data.data?.items) ? res.data.data.items : [];
    } catch (error) {
      console.error(error);
      return [];
    }
  },
});


  const mutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category'] });
      message.success('Xoá danh mục thành công!');
    },
  });

  const DelCategory = (id: string) => {
    mutation.mutate(id);
  };

  const columns = getCategoryColumns(queryClient, DelCategory);

  if (isLoading) return <p>Đang tải danh mục...</p>;
  if (error) return <p>Lỗi khi tải danh mục.</p>;

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 11,
        }}
      >
        <h1>Danh mục sách</h1>
        <Link to="/categories/add">
          <Button
            icon={<PlusOutlined />}
            size="small"
            style={{ backgroundColor: 'white', color: 'dodgerblue', borderColor: 'dodgerblue' }}
          />
        </Link>
      </div>

      <Table
        dataSource={data ?? []}
        columns={columns}
        rowKey={(record) => record._id} // MongoDB _id
      />
    </>
  );
};

export default Category;
