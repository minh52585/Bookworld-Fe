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
  const [image, setImage] = useState('');
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
        const product = res.data?.data?.product; // ✅ Lấy đúng product
        if (!product) throw new Error("Không có product");

        form.setFieldsValue({
          ...product,
          status: product.status ?? true,
          category: product.category?._id || product.category,
        });

        if (product.images && product.images.length > 0) setImage(product.images[0]);
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
      setImage(url);
      form.setFieldsValue({ images: [url] });
    } catch (err) {
      messageApi.error('Upload ảnh thất bại');
    } finally {
      setLoading(false);
    }
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
        images: values.images || (image ? [image] : []),
      };

      await api.put(`/products/${id}`, payload);
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

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Giá tiền" name="price" rules={[{ required: true, message: 'Nhập giá' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="VD: 50000" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Số lượng" name="quantity" rules={[{ required: true, message: 'Nhập số lượng' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="VD: 50" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Trạng thái" name="status" valuePropName="checked">
              <Switch checkedChildren="Sẵn" unCheckedChildren="Hết" />
            </Form.Item>
          </Col>
        </Row>

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

        <div style={{ display: 'flex', gap: 20 }}>
          <Form.Item label="Ảnh">
            <Upload
              listType="picture-card"
              showUploadList={false}
              beforeUpload={file => file.type.startsWith('image/') || Upload.LIST_IGNORE}
              customRequest={customUpload}
            >
              {loading ? (
                <LoadingOutlined />
              ) : image ? (
                <img src={image} alt="Uploaded" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
              ) : (
                <div>
                  <PlusOutlined />
                  <div>Tải ảnh</div>
                </div>
              )}
            </Upload>
            <Form.Item name="images" style={{ display: 'none' }}>
              <Input type="hidden" />
            </Form.Item>
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            style={{ flex: 1, marginBottom: 0 }}
            rules={[{ required: true, message: 'Nhập mô tả' }, { min: 10, message: 'Ít nhất 10 ký tự' }]}
          >
            <TextArea rows={4} placeholder="Mô tả hiển thị" />
          </Form.Item>
        </div>

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
