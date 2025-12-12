import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, message, Table } from 'antd';
import { Link } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import api from '@/config/axios.customize.ts';
import { getProductColumns } from '../contants/product/productColumns.tsx';
import { IProducts } from '../../types/product.ts';

const ProductsPage = () => {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState(''); // trạng thái tìm kiếm

  // Lấy danh sách sản phẩm từ API
  const { data, isLoading } = useQuery<IProducts[]>({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const res = await api.get('/products'); 

        // Log để debug dữ liệu backend
        console.log("Products API response:", res.data);

        // Backend trả về { success: true, data: { items: [...] } }
        const items = res.data?.data?.items || [];

        return items.map((item: any, index: number) => ({
          ...item,
          stt: index + 1,
          category: item.category?.name || 'Chưa phân loại',
          namxuatban: item.namxuatban,
          nhaxuatban: item.nhaxuatban,
          sotrang: item.sotrang,
          weight: item.weight,
          size: item.size,
          sku: item.sku,
          price: item.price,
          quantity: item.quantity,
        }));
      } catch (error) {
        console.error("Error fetching products:", error);
        return [];
      }
    }
  });

  // Xoá sản phẩm
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      message.success('Xoá sản phẩm thành công!');
    },
    onError: (err) => {
      console.error("Error deleting product:", err);
      message.error('Xoá sản phẩm thất bại!');
    }
  });

  const DelProduct = (id: string) => {
    mutation.mutate(id);
  };

  const filteredData = Array.isArray(data)
    ? data.filter(item => item.name?.toLowerCase().includes(searchText.toLowerCase()))
    : [];

  // Lấy cột với width cố định
  const columns = getProductColumns(queryClient, DelProduct).map(col => ({
    ...col,
    width: col.width || 120,
  }));

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Danh sách sản phẩm</h1>

        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sản phẩm..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded"
          />
          <Link to={'/products/add'}>
            <Button
              icon={<PlusOutlined />}
              size="small"
              style={{ backgroundColor: 'white', color: 'dodgerblue', borderColor: 'dodgerblue' }}
            />
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey={record => record._id}
          pagination={{ pageSize: 5 }}
          scroll={{ x: 1500 }}
          loading={isLoading}
        />
      </div>
    </div>
  );
};

export default ProductsPage;
