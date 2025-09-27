import api from '@/config/axios.customize';
import { Button, Col, DatePicker, Form, Input, message, Row, Select } from 'antd'
import { IDiscounts } from '../../types/discounts.ts'
import { useNavigate } from 'react-router';

const DiscountsAdd = () => {
  const nav = useNavigate()
  const { RangePicker } = DatePicker
  const [form] = Form.useForm()
  const onFinish = async (values: IDiscounts) => {
    try {
      const payload = {
        ...values,
        date: Array.isArray(values.date)
          ? values.date.map((d: any) => d.toISOString())
          : values.date
      }
      await api.post('api/discounts/add', payload)
      message.success('Thêm khuyến mại thành công!')
      nav('/discounts')
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        if (
          error.response.data.message.toLowerCase().includes('đã tồn tại') ||
        error.response.data.message.toLowerCase().includes('duplicate')
        ) {
          message.error('Sản phẩm đã tồn tại!')
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
          <Form.Item label="Mã sản phẩm" name="productID" rules={[{ required: true, message: 'Vui lòng chọn mã sản phẩm' }]}>
            <Input placeholder="VD: 101"/>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Mã biến thể" name="variantID" rules={[{ required: true, message: 'Vui lòng chọn mã biến thể' }]}>
            <Input placeholder="VD: 1001"/>
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Phân loại" name='discount_type' rules={[{ required:true, message:'Vui lòng chọn phân loại' }]}>
            <Select placeholder="-- Chọn --">
              <Select.Option value="%">Phần trăm</Select.Option>
              <Select.Option value="VNĐ">Tiền mặt</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Giá trị"
            name="discount_value"
            rules={[{ required: true, message: 'Vui lòng nhập giá trị' }]}>
              <Input placeholder="VD: 15 hoặc 100000"/>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Trạng thái" name='status' rules={[{ required:true, message:'Vui lòng chọn trạng thái' }]}>
        <Select placeholder="-- Chọn --">
          <Select.Option value="Mở">Mở</Select.Option>
          <Select.Option value="Khoá">Khoá</Select.Option>
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