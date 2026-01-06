import { Button, Form, Input, InputNumber, Select, Row, Col, Upload, Switch, message } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import axios from 'axios';
import api from '@/config/axios.customize';

const ProductsUpdate = () => {
  const [form] = Form.useForm();
  const nav = useNavigate();
  const { id } = useParams();
  const { TextArea } = Input;

  const [cats, setCats] = useState<any[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // Load danh mục
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

  // Load dữ liệu sản phẩm
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const product = res.data?.data?.product;
        if (!product) throw new Error("Không có product");

        form.setFieldsValue({
          ...product,
          status: product.status ?? true,
          category: product.category?._id || product.category,
        });

        if (product.images && product.images.length > 0) {
          setImages(product.images);
          form.setFieldsValue({ images: product.images });
        }
      } catch (err) {
        console.error(err);
        messageApi.error('Không lấy được thông tin sản phẩm');
      }
    };
    fetchProduct();
  }, [id]);

  // Upload ảnh
  const uploadImage = async (file: File) => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'reacttest');

    try {
      const { data } = await axios.post(
        'https://api.cloudinary.com/v1_1/dkpfaleot/image/upload',
        formData
      );
      const url = data.secure_url || data.url;
      
      // Thêm ảnh mới vào danh sách thay vì thay thế
      const newImages = [...images, url];
      setImages(newImages);
      form.setFieldsValue({ images: newImages });
    } catch (err) {
      messageApi.error('Upload ảnh thất bại');
    } finally {
      setLoading(false);
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

  // Submit update
  const onFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        price: Number(values.price || 0),
        quantity: Number(values.quantity || 0),
        weight: Number(values.weight || 0),
        namxuatban: Number(values.namxuatban || 0),
        sotrang: Number(values.sotrang || 0),
        status: values.status ?? true,
        images: values.images || images,
      };

      // --- CHỈ THÊM TOKEN VÀO ĐOẠN NÀY ---
      const token = localStorage.getItem("admin_token");
      await api.put(`/products/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // ----------------------------------

      messageApi.success('Cập nhật sản phẩm thành công!');
      nav('/products');
    } catch (err: any) {
      console.error(err);
      messageApi.error(err?.response?.data?.message || 'Cập nhật thất bại!');
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
              rules={[{ required: true, message: 'Nhập tên' }, { min: 3, message: 'Ít nhất 3 ký tự' }]}
            >
              <Input placeholder="VD: Đắc nhân tâm" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Tác giả" name="author" rules={[{ required: true, message: 'Nhập tác giả' }]}>
              <Input placeholder="VD: Dale Carnegie" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Danh mục" name="category" rules={[{ required: true, message: 'Chọn danh mục' }]}>
              {loadingCats ? (
                <p>Loading...</p>
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
            <Form.Item label="Năm XB" name="namxuatban" rules={[{ required: true, message: 'Nhập năm xuất bản' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="VD: 2020" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Nhà xuất bản" name="nhaxuatban" rules={[{ required: true, message: 'Nhập nhà xuất bản' }]}>
              <Input placeholder="VD: NXB Trẻ" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Số trang" name="sotrang" rules={[{ required: true, message: 'Nhập số trang' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="VD: 350" />
            </Form.Item>
          </Col>
        </Row>

        {/* <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Trạng thái" name="status" valuePropName="checked">
              <Switch checkedChildren="Sẵn" unCheckedChildren="Hết" />
            </Form.Item>
          </Col>
        </Row> */}

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Khối lượng (gram)" name="weight">
              <InputNumber style={{ width: '100%' }} placeholder="VD: 500" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Kích thước" name="size">
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
          rules={[{ required: true, message: 'Nhập mô tả' }, { min: 10, message: 'Ít nhất 10 ký tự' }]}
        >
          <TextArea rows={4} placeholder="Mô tả hiển thị" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default ProductsUpdate;