import { Button, DatePicker, Form, Input, InputNumber, message, Select, Row, Col } from 'antd';
import { useNavigate } from 'react-router';

const { RangePicker } = DatePicker;
import api from '@/config/axios.customize';


const AddCoupon = () => {
  const nav = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      // Normalize code
      const code = String(values.coupons_code || '').trim().toUpperCase().replace(/^\$/,'');
      if (!/^[A-Z0-9]+$/.test(code)) {
        message.error('Mã giảm giá chỉ gồm chữ HOA và số, không khoảng trắng');
        return;
      }

      const [start_date, end_date] = values.date_range;
      const payload = {
        code,
        type: values.discount_type === 'percent' ? 'percent' : 'fixed',
        value: Number(values.discount_value),
        minOrderValue: Number(values.min_order_value) || 0,
        startsAt: start_date.toISOString(),
        endsAt: end_date.toISOString(),
        status: values.status === 'ON' ? 'active' : 'inactive',
        totalUsageLimit: values.totalUsageLimit ? Number(values.totalUsageLimit) : undefined
      };

      await api.post('/discounts', payload);
      message.success("Thêm mã giảm giá thành công!");
      nav("/coupons");
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message);
        console.log('Lỗi thêm mã giảm giá:', error.response.data.message);
      } else {
        message.error('Thêm mã giảm giá thất bại!');
        console.log(error);
      }
    }
  };

  return (
    <>
      <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 800, margin: '0 auto' }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Mã giảm giá"
              name="coupons_code"
              rules={[
                { required: true, message: 'Vui lòng nhập mã giảm giá' },
                { min: 3, message: 'Ít nhất 5 ký tự' }
              ]}>
                <Input placeholder="VD: SUMMER2025" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Loại giảm"
              name="discount_type"
              rules={[{ required: true, message: 'Chọn loại giảm' }]}>
                <Select placeholder="Chọn loại">
                  <Select.Option value="percent">Phần trăm</Select.Option>
                  <Select.Option value="amount">Tiền mặt</Select.Option>
                </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Giá trị giảm"
              name="discount_value"
              rules={[{ required: true, message: 'Nhập giá trị giảm' }]}>
                <InputNumber style={{ width: '100%' }} placeholder="VD: 10 hoặc 50000" min={1}/>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Giá trị đơn hàng tối thiểu"
              name="min_order_value"
              rules={[{ required: true, message: 'Nhập giá trị tối thiểu' }]}>
                <InputNumber style={{ width: '100%' }} placeholder="VD: 200000" min={0}/>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Trạng thái"
              name="status"
              initialValue="ON">
                <Select>
                  <Select.Option value="ON">Mở</Select.Option>
                  <Select.Option value="OFF">Khoá</Select.Option>
                </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
          <Form.Item
            label="Thời gian áp dụng"
            name="date_range"
            rules={[{ required: true, message: 'Chọn thời gian áp dụng' }]}>
              <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Số lượng mã" name="totalUsageLimit">
              <InputNumber style={{ width: '100%' }} min={1} placeholder="VD: 100" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>Xác nhận</Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default AddCoupon;