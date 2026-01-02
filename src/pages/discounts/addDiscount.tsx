import api from '@/config/axios.customize';
import { Button, Col, DatePicker, Form, Input, message, Row, Select } from 'antd'
import { useNavigate } from 'react-router';

const DiscountsAdd = () => {
  const nav = useNavigate()
  const { RangePicker } = DatePicker
  const [form] = Form.useForm()
  const onFinish = async (values: any) => {
    try {
      // Normalize and validate coupon code (client-side check)
      const normalizedCode = String(values.code || '').trim().toUpperCase().replace(/^\$/,'');
      if (!/^[A-Z0-9]+$/.test(normalizedCode)) {
        message.error("Mã giảm giá chỉ gồm chữ HOA và số, không khoảng trắng");
        return;
      }

      const [startsAt, endsAt] = Array.isArray(values.date) ? values.date : [undefined, undefined];
      const payload = {
        code: normalizedCode,
        type: values.discount_type,
        value: Number(values.value),
        minOrderValue: Number(values.minOrderValue) || 0,
        startsAt: startsAt ? startsAt.toISOString() : undefined,
        endsAt: endsAt ? endsAt.toISOString() : undefined,
        status: values.status,
        totalUsageLimit: values.totalUsageLimit ? Number(values.totalUsageLimit) : undefined,
        perUserLimit: values.perUserLimit ? Number(values.perUserLimit) : 1,
        applicableProducts: values.productID ? [values.productID] : []
      }
      await api.post('/discounts', payload)
      message.success('Thêm khuyến mại thành công!')
      nav('/discounts')
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        if (
          error.response.data.message.toLowerCase().includes('đã tồn tại') ||
        error.response.data.message.toLowerCase().includes('duplicate')
        ) {
          message.error('Mã giảm giá đã tồn tại!')
        } else {
          message.error(error.response.data.message)
        }
        console.log('Lỗi thêm khuyến mãi:', error.response.data.message)
      } else {
        message.error('Thêm khuyến mại thất bại!')
        console.log(error)
      }
    }
  }
  return (
    <Form
      form={form}
      layout="vertical"
      style={{ maxWidth: 800, margin: '0 auto' }}
      onFinish={onFinish}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Mã giảm giá" name="code" rules={[{ required: true, message: 'Vui lòng nhập mã giảm giá' }]}>
            <Input placeholder="VD: SUMMER2025"/>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Mã sản phẩm" name="productID" rules={[{ required: false }]}>
            <Input placeholder="VD: 101"/>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Mã biến thể" name="variantID" rules={[{ required: false }]}>
            <Input placeholder="VD: 1001"/>
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Phân loại" name='discount_type' rules={[{ required:true, message:'Vui lòng chọn phân loại' }]}>
            <Select placeholder="-- Chọn --">
              <Select.Option value="percent">Phần trăm</Select.Option>
              <Select.Option value="fixed">Tiền mặt</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Giá trị"
            name="value"
            rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}>
              <Input placeholder="VD: 15 hoặc 100000"/>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Giá trị đơn hàng tối thiểu" name="minOrderValue" rules={[{ required: false }]}>
        <Input placeholder="VD: 200000" />
      </Form.Item>

      <Form.Item label="Trạng thái" name='status' rules={[{ required:true, message:'Vui lòng chọn trạng thái' }]}>
        <Select placeholder="-- Chọn --">
          <Select.Option value="active">Mở</Select.Option>
          <Select.Option value="inactive">Khoá</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item label="Thời gian áp dụng" name="date" rules={[{ required: true, message: 'Chọn thời gian áp dụng' }]}>
        <RangePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Xác nhận
        </Button>
      </Form.Item>
    </Form>
  )
}

export default DiscountsAdd