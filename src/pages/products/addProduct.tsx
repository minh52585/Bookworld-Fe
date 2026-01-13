import { Button, Form, Input, InputNumber, Select, Row, Col, Upload, Spin, message } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/config/axios.customize';
import axios from 'axios';

const ProductsAdd = () => {
  const [form] = Form.useForm();
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const { TextArea } = Input;

  const [cats, setCats] = useState<any[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // Lấy danh mục
  useEffect(() => {
    const fetchCats = async () => {
      setLoadingCats(true);
      try {
        const res = await api.get('/categories');
        setCats(res.data.data.items || []);
      } catch (err) {
        messageApi.error('Không lấy được danh mục');
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCats();
  }, []);

  // Upload ảnh lên Cloudinary
  const uploadImage = async (file: File) => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'reacttest');

    try {
      const { data } = await axios.post('https://api.cloudinary.com/v1_1/dkpfaleot/image/upload', formData);
      const url = data.secure_url || data.url;
      
      // Thêm ảnh mới vào danh sách thay vì thay thế
      const newImages = [...images, url];
      setImages(newImages);
      form.setFieldsValue({ images: newImages });
      setLoading(false);
      return url;
    } catch (err) {
      messageApi.error('Upload ảnh thất bại');
      setLoading(false);
      throw err;
    }
  };

  // Xóa ảnh
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    form.setFieldsValue({ images: newImages });
  };

  const customUpload = async ({ file, onSuccess, onError }: any) => {
    if (!(file instanceof File)) return;
    try {
      await uploadImage(file);
      onSuccess && onSuccess('ok');
    } catch (err) {
      onError && onError(err);
    }
  };

  // Submit form
  const onFinish = async (values: any) => {
    try {
      // Prepare payload to match backend schema
      const payload = { 
        name: values.name,
        author: values.author,
        namxuatban: values.namxuatban,
        nhaxuatban: values.nhaxuatban,
        sotrang: values.sotrang,
        description: values.description,
        images: images, // Backend expects array of strings
        category: values.category, // ObjectId from select
        weight: values.weight || 0,
        size: values.size || "",
        status: values.status === "inactive" ? "inactive" : "active",
        sku: values.sku || ""
      };

      console.log('Sending payload:', payload); // Debug log

      const token = localStorage.getItem("admin_token"); 

      const response = await api.post('/products', payload, {
        headers: {
          Authorization: `Bearer ${token}` 
        }
      });

      // Cập nhật cache để thêm sản phẩm mới vào cuối danh sách
      const newProduct = response.data.data;
      queryClient.setQueryData(['products'], (oldData: any) => {
        if (!oldData) return [newProduct];
        
        // Thêm sản phẩm mới vào cuối danh sách với STT
        const newProductWithStt = {
          ...newProduct,
          stt: oldData.length + 1,
          images: Array.isArray(newProduct.images) ? newProduct.images : []
        };
        
        return [...oldData, newProductWithStt];
      });

      messageApi.success('Thêm sản phẩm thành công!');
      nav('/products');
    } catch (err: any) {
      console.error('Error creating product:', err.response?.data);
      messageApi.error(err?.response?.data?.message || 'Thêm sản phẩm thất bại!');
    }
  };

  return (
    <>
      {contextHolder}
      <Form form={form} onFinish={onFinish} layout="vertical" style={{ maxWidth: 800, margin: '0 auto' }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tên"
              name="name"
              rules={[{ required: true, message: 'Vui lòng nhập tên' }, { min: 3, message: 'Ít nhất 3 ký tự' }]}
            >
              <Input placeholder="VD: Đắc nhân tâm" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Tác giả"
              name="author"
              rules={[{ required: true, message: 'Vui lòng nhập tác giả' }, { min: 2, message: 'Ít nhất 2 ký tự' }]}
            >
              <Input placeholder="VD: Dale Carnegie" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Danh mục" name="category" rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}>
              {loadingCats ? (
                <Spin />
              ) : (
                <Select placeholder="-- Chọn --">
                  {cats.map(c => (
                    <Select.Option key={c._id} value={c._id}>{c.name}</Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Năm XB" name="namxuatban" rules={[{ required: true, message: 'Vui lòng nhập năm xuất bản' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="VD: 2020" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Nhà xuất bản" name="nhaxuatban" rules={[{ required: true, message: 'Vui lòng nhập nhà xuất bản' }]}>
              <Input placeholder="VD: NXB Trẻ" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Số trang" name="sotrang" rules={[{ required: true, message: 'Vui lòng số trang năm xuất bản' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="VD: 350" />
            </Form.Item>
          </Col>
        </Row>

     

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Khối lượng (gram)" name="weight" rules={[{ required: true, message: 'Vui lòng nhập khối lượng' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="VD: 500" min={0} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Kích thước" name="size" rules={[{ required: true, message: 'Vui lòng nhập kích thước' }]}>
              <Input placeholder="VD: 20 x 13 x 2 cm" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="SKU" name="sku">
              <Input placeholder="VD: SP001" />
            </Form.Item>
          </Col>
        </Row>

     

        <Form.Item label="Ảnh sản phẩm">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-start' }}>
            {/* Hiển thị danh sách ảnh đã upload */}
            {images.map((img, index) => (
              <div key={index} style={{ position: 'relative', width: 100, height: 100 }}>
                <img 
                  src={img} 
                  alt={`Product ${index + 1}`} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover', 
                    borderRadius: 8,
                    border: '1px solid #d9d9d9'
                  }} 
                />
                <Button
                  type="text"
                  danger
                  size="small"
                  onClick={() => removeImage(index)}
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#ff4d4f',
                    color: 'white',
                    fontSize: 12
                  }}
                >
                  ×
                </Button>
              </div>
            ))}

            {/* Nút thêm ảnh - luôn hiển thị */}
            <Upload
              listType="picture-card"
              showUploadList={false}
              beforeUpload={file => file.type.startsWith('image/') || Upload.LIST_IGNORE}
              customRequest={customUpload}
              style={{ width: 100, height: 100 }}
            >
              {loading ? (
                <LoadingOutlined />
              ) : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8, fontSize: 12 }}>Thêm ảnh</div>
                </div>
              )}
            </Upload>
          </div>
          
          <Form.Item name="images" style={{ display: 'none' }}>
            <Input type="hidden" />
          </Form.Item>
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả' }, { min: 10, message: 'Ít nhất 10 ký tự' }]}
        >
          <TextArea rows={4} placeholder="Mô tả hiển thị" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Xác nhận
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default ProductsAdd;
