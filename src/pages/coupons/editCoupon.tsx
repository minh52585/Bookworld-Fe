import { Button, DatePicker, Form, Input, InputNumber, message, Select, Row, Col } from 'antd';
import { useNavigate } from 'react-router';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface ICoupon {
  _id: string;
  coupons_code: string;
  title: string;
  discount_type: 'percent' | 'amount';
  discount_value: number;
  min_order_value: number;
  start_date: string;
  end_date: string;
  desciption: string;
  status: 'ON' | 'OFF';
}

const EditCoupon = () => {
  const nav = useNavigate();
  const [form] = Form.useForm();
  const couponData: ICoupon = {
    _id: '123',
    coupons_code: 'SUMMER2025',
    title: 'Giảm giá hè 2025',
    discount_type: 'percent',
    discount_value: 10,
    min_order_value: 200000,
    start_date: '2025-06-01T00:00:00Z',
    end_date: '2025-06-30T00:00:00Z',
    desciption: 'Áp dụng cho đơn hàng từ 200.000 trở lên.',
    status: 'ON',
  };

  const initialValues = {
    ...couponData,
    date_range: [dayjs(couponData.start_date), dayjs(couponData.end_date)],
  };

  const onFinish = (values: any) => {
    const [start_date, end_date] = values.date_range;
    const updatedCoupon: ICoupon = {
      ...couponData,
      ...values,
      start_date: start_date.toISOString(),
      end_date: end_date.toISOString()
    };

    console.log('Cập nhật:', updatedCoupon);
    message.success('Cập nhật mã giảm giá thành công!');
    nav('/coupons');
  };

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={onFinish}
        style={{ maxWidth: 600, margin: '0 auto' }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Mã giảm giá" name="coupons_code" rules={[{ required: true }]}>
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Tiêu đề" name="title" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Loại giảm" name="discount_type" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="percent">Phần trăm</Select.Option>
                <Select.Option value="amount">Tiền mặt</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Giá trị giảm" name="discount_value" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={1} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Giá trị đơn hàng tối thiểu" name="min_order_value" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Trạng thái" name="status">
              <Select>
                <Select.Option value="ON">Mở</Select.Option>
                <Select.Option value="OFF">Khoá</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Thời gian áp dụng" name="date_range" rules={[{ required: true }]}>
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Mô tả" name="desciption" rules={[{ required: true }]}>
              <TextArea rows={3} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Xác nhận
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default EditCoupon;
