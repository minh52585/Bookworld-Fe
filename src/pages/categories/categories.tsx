import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Table } from 'antd';
import { getCategoryColumns } from '../contants/category/categoryColumns';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/config/axios.customize';
import { Link } from 'react-router';

const Category = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const res = await api.get('/categories');
        console.log('API categories:', res.data);
        const d = res.data;
        if (Array.isArray(d)) return d;
        if (Array.isArray(d?.data)) return d.data;
        if (Array.isArray(d?.data?.items)) return d.data.items;
        if (Array.isArray(d?.items)) return d.items;
        return [];
      } catch (error) {
        console.error(error);
        return [];
      }
    },
  });

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      // --- THÊM TOKEN VÀO ĐÂY ĐỂ VƯỢT QUA KIỂM TRA ADMIN ---
      const token = localStorage.getItem("admin_token");
      await api.delete(`/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // -------------------------------------------------
    },
    onSuccess: () => {
      // Sửa lại queryKey cho khớp với useQuery bên trên (categories có s)
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      message.success('Xoá danh mục thành công!');
    },
    onError: (err: any) => {
      console.error(err);
      message.error(err.response?.data?.message || 'Xoá danh mục thất bại!');
    }
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
        rowKey={(record) => record._id} 
      />
    </>
  );
};

export default Category;