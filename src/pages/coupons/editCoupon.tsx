import { Button, DatePicker, Form, Input, InputNumber, message, Select, Row, Col } from 'antd';
import { useNavigate, useParams } from 'react-router';
import dayjs from 'dayjs';
import api from '@/config/axios.customize';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

const { RangePicker } = DatePicker;

const EditCoupon = () => {
  const nav = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();

  const { data } = useQuery({
    queryKey: ['discounts', id],
    queryFn: async () => {
      try {
        const res = await api.get(`/discounts/${id}`)
        return res.data.data
      } catch (err) {
        console.log(err)
        return null
      }
    }
  })

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        code: data.code || '',
        originalCode: data.code || '',
        discount_type: data.type,
        discount_value: data.value,
        min_order_value: data.minOrderValue,
        status: data.status === 'active' ? 'ON' : 'OFF',
        totalUsageLimit: data.totalUsageLimit,
        date_range: [data.startsAt ? dayjs(data.startsAt) : undefined, data.endsAt ? dayjs(data.endsAt) : undefined]
      })
    }
  }, [data])

  const onFinish = async (values: any) => {
    try {
      const [start_date, end_date] = values.date_range || [undefined, undefined];
      const codeNew = values.code ? String(values.code).trim().toUpperCase().replace(/^\$/,'') : undefined
      const payload: any = {
        ...(codeNew ? { code: codeNew } : {}),
        originalCode: values.originalCode,
        type: values.discount_type === 'percent' ? 'percent' : 'fixed',
        value: Number(values.discount_value),
        minOrderValue: Number(values.min_order_value) || 0,
        startsAt: start_date ? start_date.toISOString() : undefined,
        endsAt: end_date ? end_date.toISOString() : undefined,
        status: values.status === 'ON' ? 'active' : 'inactive',
        totalUsageLimit: values.totalUsageLimit ? Number(values.totalUsageLimit) : undefined
      }
      await api.put(`/discounts/update/${id}`, payload)
      message.success('Cập nhật mã giảm giá thành công!')
      nav('/coupons')
    } catch (error: any) {
      console.log(error)
      message.error('Cập nhật thất bại')
    }
  }

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
            <Form.Item label="Mã giảm giá" name="code" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="originalCode" hidden>
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
            <Form.Item label="Số lượng mã" name="totalUsageLimit">
              <InputNumber style={{ width: '100%' }} min={1} />
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
