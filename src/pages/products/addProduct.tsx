import { Button, Form, Input, message, Select, Row, Col, InputNumber, Upload } from 'antd'
import axios from 'axios'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { IProducts } from '../../types/product'
import api from '@/config/axios.customize'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'

const ProductsAdd = () => {
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 }
    }
  }
  const nav = useNavigate()
  const [form] = Form.useForm()
  const { TextArea } = Input
  const [image, setImage] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const onFinish = async (values: IProducts) => {
    try {
      await api.post('api/products/add', values)
      message.success('Thêm sản phẩm thành công!')
      nav('/products')
    } catch (err) {
      console.error(err)
      message.error('Thêm sản phẩm thất bại!')
    }
  }
  
  const uploadImage = async (file: File) => {
    if (!file) return
    setLoading(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'reacttest')

    try {
      const { data } = await axios.put(
        'https://api.cloudinary.com/v1_1/dkpfaleot/image/upload',
        formData
      )
      setImage(data.url)
      form.setFieldsValue({ images: data.url })
      setLoading(false)
    } catch (error) {
      console.error('Tải hình ảnh lên thất bại:', error)
      setLoading(false)
    }
  }

  return (
    <>
    <Form form={form} onFinish={onFinish} {...formItemLayout} layout='vertical' style={{ maxWidth: 800, margin: '0 auto' }}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Tên" name='name' rules={[
            { required: true, message: 'Vui lòng nhập tên sản phẩm' },
            { min: 3, message: 'Tên sản phẩm chứa ít nhất 3 ký tự' }
          ]}>
            <Input placeholder="VD: Đắc nhân tâm"/>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Danh mục" name='category' rules={[
            { required: true, message: 'Vui lòng chọn danh mục sản phẩm' }
          ]}>
            <Select placeholder="-- Chọn --">
              <Select.Option value="Lãng mạn">Lãng mạn</Select.Option>
              <Select.Option value="Trinh thám">Trinh thám</Select.Option>
              <Select.Option value="Tiểu thuyết">Tiểu thuyết</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Giá tiền" name='price' rules={[
            { required: true, message: 'Vui lòng nhập giá tiền' },
            { type: 'number', message: 'Giá sản phẩm phải là số' },
          ]}>
            <InputNumber placeholder="VD: 50000" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Số lượng" name='quantity' rules={[
            { required: true, message: 'Vui lòng nhập số lượng trong kho' },
            { type: 'number', message: 'Số lượng phải là số' }
          ]}>
            <InputNumber placeholder="VD: 50" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Trạng thái" name='status' initialValue="Sẵn">
        <Select>
          <Select.Option value="Sẵn">Sẵn</Select.Option>
          <Select.Option value="Hết">Hết</Select.Option>
        </Select>
      </Form.Item>

      <div style={{ display: 'flex', alignItems: 'start', gap: 20 }}>
        <Form.Item label="Ảnh">
          <Upload
                listType="picture-card"
                showUploadList={false}
                beforeUpload={(file) => {
                  const isImage = file.type.startsWith('image/')
                  if (!isImage) {
                    message.error('Chỉ được tải lên hình ảnh!')
                  }
                  return isImage || Upload.LIST_IGNORE
                }}
                customRequest={({ file, onSuccess }) => {
                    if (file instanceof File) {
              uploadImage(file);
            }
                  setTimeout(() => onSuccess?.("ok"), 0)
                }}
              >
                {loading ? (
                  <div>
                    <LoadingOutlined />
                    <div style={{ marginTop: 8 }}>Đang tải...</div>
                  </div>
                ) : image ? (
                  <img
                    src={image}
                    alt="Uploaded"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                  />
                ) : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải ảnh</div>
                  </div>
                )}
          </Upload>
          <Form.Item name="images" style={{ display: 'none' }}>
            <Input type="hidden" />
          </Form.Item>
        </Form.Item>
        <Form.Item label="Mô tả" name='description' style={{ flex: 1, marginBottom: 0 }} rules={[
          { required: true, message: 'Vui lòng nhập mô tả' },
          { min: 10, message: 'Mô tả chứa ít nhất 10 ký tự' }
        ]}>
          <TextArea rows={4} placeholder="Mô tả hiển thị" />
        </Form.Item>
      </div>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Xác nhận
        </Button>
      </Form.Item>
    </Form>
    </>
  )
}

export default ProductsAdd