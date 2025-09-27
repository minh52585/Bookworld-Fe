import { Button, Form, Input, InputNumber, message, Select, Row, Col } from 'antd';
import { useNavigate } from 'react-router';

interface IVariant {
  product_id: number;
  variant_name: string;
  price: number;
  stock_quantity: number;
  image_url: string;
}

const AddVariant = () => {
  const nav = useNavigate();
  const [form] = Form.useForm();
  const productOptions = [
    { label: "Sách Tâm lý học", value: 101 },
    { label: "Sách Phát triển bản thân", value: 102 },
    { label: "Sách Lãng mạn", value: 103 },
  ];

  const onFinish = (values: IVariant) => {
    console.log("Variant:", values);
    message.success("Thêm biến thể thành công");
    nav("/variants");
  };

  return (
    <>
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
                    <Select
                        placeholder="Chọn sản phẩm"
                        options={productOptions}
                    />
                </Form.Item>
            </Col>

            <Col span={12}>
                <Form.Item
                label="Tên biến thể"
                name="variant_name"
                rules={[
                    { required: true, message: 'Vui lòng nhập tên biến thể' },
                    { min: 3, message: 'Ít nhất 3 ký tự' }
                ]}
                >
                <Input placeholder="VD: Sách bìa mềm" />
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
    </>
  );
};

export default AddVariant;