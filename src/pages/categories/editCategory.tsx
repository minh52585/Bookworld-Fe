import { getCategoryById, updateCategory, ICategory } from '@/apis/categories';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, message, Select } from 'antd';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';

const EditCategory = () => {
  const { id } = useParams();
  const { TextArea } = Input;
  const nav = useNavigate();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Lấy dữ liệu category
  const { data, isLoading } = useQuery({
    queryKey: ['categories', id],
    queryFn: () => getCategoryById(id!),
    enabled: !!id,
  });

  // Mutation để cập nhật category
  const updateMutation = useMutation({
    mutationFn: (values: Partial<ICategory>) => updateCategory(id!, values),
    onSuccess: () => {
      message.success('Cập nhật danh mục thành công!');
      // Invalidate cache để refresh danh sách categories
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      nav('/categories');
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      message.error(error?.response?.data?.message || 'Cập nhật thất bại');
    },
  });

  useEffect(() => {
    if (data?.data?.category) {
      // Backend trả về { category: {...}, products: [...] }
      form.setFieldsValue({
        name: data.data.category.name,
        description: data.data.category.description,
        status: data.data.category.status,
      });
    }
  }, [data, form]);

  const onFinish = (values: ICategory) => {
    // Chỉ gửi name, description, status - backend sẽ tự tạo slug
    const { name, description, status } = values;
    updateMutation.mutate({ name, description, status });
  };

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: 600, margin: '0 auto' }}
      >
        <Form.Item
          label="Tên"
          name="name"
          rules={[
            { required: true, message: 'Vui lòng nhập tên danh mục' },
            { min: 3, message: 'Ít nhất 3 ký tự' }
          ]}
        >
          <Input placeholder="VD: Tiểu thuyết" disabled={isLoading} />
        </Form.Item>
        
        {/* <Form.Item
          label="Trạng thái"
          name="status"
          initialValue="active"
        >
          <Select disabled={isLoading}>
            <Select.Option value="active">Mở</Select.Option>
            <Select.Option value="inactive">Khoá</Select.Option>
          </Select>
        </Form.Item> */}
        
        <Form.Item
          label="Mô tả"
          name="description"
          rules={[
            { required: true, message: 'Vui lòng nhập mô tả' },
            { min: 10, message: 'Mô tả ít nhất 10 ký tự' }
          ]}
        >
          <TextArea rows={3} placeholder="Mô tả hiển thị" disabled={isLoading} />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            block
            loading={updateMutation.isPending || isLoading}
            disabled={isLoading}
          >
            {updateMutation.isPending ? 'Đang cập nhật...' : isLoading ? 'Đang tải...' : 'Xác nhận'}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default EditCategory;