import { Button, Form, Input, InputNumber, message, Select, Row, Col } from 'antd';
import { useNavigate } from 'react-router';
import api from '@/config/axios.customize';

interface IVariant {
  product_id: string;
  type: 'paperback' | 'hardcover';
  price: number;
  stock_quantity: number;
  image_url: string;
}

const AddVariant = () => {
  const nav = useNavigate();
  const [form] = Form.useForm();

  const productOptions = [
    { label: "Sách Tâm lý học", value: "650f1c5e0f1c2b1a3c456789" },
    { label: "Sách Phát triển bản thân", value: "650f1c5e0f1c2b1a3c456790" },
    { label: "Sách Lãng mạn", value: "650f1c5e0f1c2b1a3c456791" },
  ];

  const typeOptions = [
    { label: "Paperback", value: "paperback" },
    { label: "Hardcover", value: "hardcover" },
  ];

  const onFinish = async (values: IVariant) => {
    try {
      // Tạo variant_name tự động dựa trên product + type
      const productLabel = productOptions.find(p => p.value === values.product_id)?.label || "";
      const variantName = `${values.type === "hardcover" ? "Bìa cứng" : "Bìa mềm"} - ${productLabel}`;

      const payload = {
        product: values.product_id,
        type: values.type,                       // giá trị đã đúng: 'paperback' | 'hardcover'
        price: Number(values.price),
        stock: Number(values.stock_quantity),    // ✔ Đúng với backend
        images: values.image_url ? [values.image_url] : [], // ✔ Backend nhận list
        // ❌ Không gửi variant_name, backend không có field này
      };

      console.log("Payload sent to backend:", payload);
      console.log("Variant name (frontend only):", variantName);

      const res = await api.post('/variants', payload);
      console.log("Variant created:", res.data);

      message.success(`Thêm biến thể thành công: ${variantName}`);
      nav("/variants");
    } catch (err: any) {
      console.error("Add variant error:", err);
      const msg = err?.response?.data?.message || "Có lỗi xảy ra";
      message.error(msg);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      style={{ maxWidth: 600, margin: '0 auto' }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Sản phẩm"
            name="product_id"
            rules={[{ required: true, message: "Vui lòng chọn sản phẩm" }]}
          >
            <Select placeholder="Chọn sản phẩm" options={productOptions} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Loại sách"
            name="type"
            rules={[{ required: true, message: "Vui lòng chọn loại sách" }]}
          >
            <Select placeholder="Chọn loại" options={typeOptions} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="Giá tiền"
        name="price"
        rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
      >
        <InputNumber min={0} style={{ width: '100%' }} placeholder="VD: 150000" />
      </Form.Item>

      <Form.Item
        label="Tồn kho"
        name="stock_quantity"
        rules={[{ required: true, message: 'Vui lòng nhập số lượng tồn kho' }]}
      >
        <InputNumber min={0} style={{ width: '100%' }} placeholder="VD: 100" />
      </Form.Item>

      <Form.Item
        label="URL hình ảnh"
        name="image_url"
        rules={[{ required: true, message: 'Vui lòng nhập URL hình ảnh' }]}
      >
        <Input placeholder="VD: https://image.com/group8.jpg" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Xác nhận
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddVariant;
