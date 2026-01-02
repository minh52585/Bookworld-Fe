import api from '@/config/axios.customize'
import dayjs from 'dayjs'
import { Button, DatePicker, Form, Input, message, Select, Row, Col } from 'antd'
import { useNavigate, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

const DiscountsUpdate = () => {
  const { id } = useParams()
  const { data } = useQuery({
    queryKey:['discounts', id],
    queryFn:async() => {
      try {
        const { data } = await api.get(`/discounts/${id}`)
        return Array.isArray(data.data) ? data.data : [data.data]

      } catch (error) {
        return [{}]
      }
    }
  })
  useEffect(() => {
    if (data && data[0]) {
      const src = data[0]
      form.setFieldsValue({
        code: src.code || src.coupons_code || '',
        originalCode: src.code || src.coupons_code || '',
        discount_type: src.type || src.discount_type,
        discount_value: src.value || src.discount_value,
        min_order_value: src.minOrderValue || src.min_order_value,
        status: src.status === 'active' ? 'ON' : (src.status === 'inactive' ? 'OFF' : src.status),
        totalUsageLimit: src.totalUsageLimit,
        perUserLimit: src.perUserLimit,
        productID: Array.isArray(src.applicableProducts) && src.applicableProducts.length > 0 ? src.applicableProducts[0] : undefined,
        date: src.startsAt || src.date ? [
          src.startsAt ? dayjs(src.startsAt) : (Array.isArray(src.date) && src.date[0] ? dayjs(src.date[0]) : undefined),
          src.endsAt ? dayjs(src.endsAt) : (Array.isArray(src.date) && src.date[1] ? dayjs(src.date[1]) : undefined)
        ] : []
      })
    }
  },  [ data ] )
  const nav = useNavigate()
  const { RangePicker } = DatePicker
  const [form] = Form.useForm()
  const onFinish = async (values: any) => {
    try {
      const [startsAt, endsAt] = Array.isArray(values.date) ? values.date : [undefined, undefined]

      // Build payload without changing the code unless explicitly modified (we keep code read-only in form)
      const payload: any = {
        // allow renaming: include new code and original for server-side checks/logs
        ...(values.code ? { code: String(values.code).trim().toUpperCase().replace(/^\$/,'') } : {}),
        originalCode: values.originalCode,
        type: values.discount_type,
        value: Number(values.discount_value || values.value),
        minOrderValue: Number(values.minOrderValue || values.min_order_value) || 0,
        startsAt: startsAt ? startsAt.toISOString() : undefined,
        endsAt: endsAt ? endsAt.toISOString() : undefined,
        status: values.status === 'ON' ? 'active' : (values.status === 'OFF' ? 'inactive' : values.status),
        totalUsageLimit: values.totalUsageLimit ? Number(values.totalUsageLimit) : undefined,
        perUserLimit: values.perUserLimit ? Number(values.perUserLimit) : undefined,
        applicableProducts: values.productID ? [values.productID] : undefined
      }

      await api.put(`/discounts/update/${id}`, payload)
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
          <Form.Item label="Mã giảm giá" name="code">
            <Input />
          </Form.Item>
          <Form.Item name="originalCode" hidden>
            <Input />
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