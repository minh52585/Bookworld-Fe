import { Button, Form, Input, message, Select, Row, Col, InputNumber, Upload } from 'antd'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { IProducts } from '../../types/product'
import { useQuery } from '@tanstack/react-query'
import api from '@/config/axios.customize'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'

const ProductsUpdate = () => {
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 }
    }
  }
  const { id } = useParams()
  const { data } = useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      try {
        const res = await api.get(`/products/${id}`)
        return res.data?.data ?? res.data
      } catch (error) {
        console.log(error)
        return null
      }
    }
  })

  const [form] = Form.useForm()

  // ================== FIX QUAN TRỌNG: load product vào form ==================
  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        ...data
      })

      // load ảnh có sẵn trong product
      if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        setImage(data.images[0])
      }
    }
  }, [data])
  // ===========================================================================

  const nav = useNavigate()
  const { TextArea } = Input
  const [image, setImage] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [cats, setCats] = useState<any[]>([])
  const [loadingCats, setLoadingCats] = useState<boolean>(false)

  // Load categories
  useEffect(() => {
    const fetchCats = async () => {
      setLoadingCats(true)
      try {
        const res = await api.get('/categories')
        const list = res.data?.data?.items || res.data?.data || res.data || []
        setCats(Array.isArray(list) ? list : [])
      } catch (err) {
        console.error('Fetch categories error', err)
        setCats([])
      } finally {
        setLoadingCats(false)
      }
    }
    fetchCats()
  }, [])

  const uploadImage = async (file: File) => {
    if (!file) return
    setLoading(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'reacttest')

    try {
      const { data } = await axios.post(
        'https://api.cloudinary.com/v1_1/dkpfaleot/image/upload',
        formData
      )
      const url = data.secure_url || data.url
      setImage(url)

      // update field images
      form.setFieldsValue({ images: [url] })

      setLoading(false)
    } catch (error) {
      console.error('Tải hình ảnh lên thất bại:', error)
      setLoading(false)
    }
  }

  const onFinish = async (values: IProducts) => {
    try {
      // Chuẩn hoá payload trước khi gửi: đảm bảo number/array đúng kiểu
      const payload: any = { ...values }
      if (payload.price !== undefined) payload.price = Number(payload.price)
      if (payload.quantity !== undefined) payload.quantity = Number(payload.quantity)

      // images có thể là string hoặc array
      if (payload.images) {
        if (typeof payload.images === 'string') payload.images = [payload.images]
        else if (!Array.isArray(payload.images)) payload.images = [payload.images]
      } else if (image) {
        // nếu form không có images nhưng có ảnh preview, thêm vào
        payload.images = [image]
      }

      // Log payload để debug (xem Network và Console)
      console.log('PUT payload:', payload)

      await api.put(`/products/${id}`, payload)
      message.success('Cập nhật sản phẩm thành công!')
      nav('/products')
    } catch (err: any) {
      console.error('Update product error:', err)
      const resp = err?.response
      // Hiển thị thông báo lỗi có chi tiết từ server nếu có
      if (resp && resp.data) {
        const serverMsg = resp.data.message || JSON.stringify(resp.data)
        message.error(`Cập nhật sản phẩm thất bại: ${serverMsg}`)
        console.error('Server response data:', resp.data)
      } else {
        message.error('Cập nhật sản phẩm thất bại: Lỗi mạng hoặc server')
      }
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
            {loadingCats ? (
              <Select placeholder="-- Chọn --" loading />
            ) : (
              <Select placeholder="-- Chọn --">
                {cats.length ? (
                  cats.map((c) => (
                    <Select.Option key={c._id || c.id} value={c._id || c.id}>
                      {c.name}
                    </Select.Option>
                  ))
                ) : (
                  <Select.Option value="" disabled>
                    Không có danh mục
                  </Select.Option>
                )}
              </Select>
            )}
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

      <Form.Item label="Trạng thái" name='status' initialValue="active">
        <Select>
          <Select.Option value="active">Sẵn</Select.Option>
          <Select.Option value="inactive">Hết</Select.Option>
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

export default ProductsUpdate
