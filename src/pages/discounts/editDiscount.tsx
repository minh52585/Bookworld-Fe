import api from '@/config/axios.customize'
import dayjs from 'dayjs'
import { Button, DatePicker, Form, Input, message, Select, Row, Col } from 'antd'
import { IDiscounts } from '../../types/discounts.ts'
import { useNavigate, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

const DiscountsUpdate = () => {
  const { id } = useParams()
  const { data } = useQuery({
    queryKey:['discounts', id],
    queryFn:async() => {
      try {
        const { data } = await api.get(`api/discounts/${id}`)
        return Array.isArray(data.data) ? data.data : [data.data]

      } catch (error) {
        return [{}]
      }
    }
  })
  useEffect(() => {
    if (data && data[0]) {
      form.setFieldsValue({
        ...data[0],
        date: Array.isArray(data[0].date)
          ? data[0].date.map((d: string) => dayjs(d))
          : []
      })
    }
  },  [ data ] )
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
      await api.put(`api/discounts/${id}`, payload)
      message.success('Sửa khuyến mại thành công!')
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
        message.error('Sửa khuyến mại thất bại!')
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

export default DiscountsUpdate