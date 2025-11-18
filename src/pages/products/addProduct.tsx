import { Button, Form, Input, message, Select, Row, Col, InputNumber, Upload, Spin } from 'antd'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { IProducts } from '../../types/product'
import api from '@/config/axios.customize'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'

const ProductsAdd = () => {
  const formItemLayout = {
    labelCol: { xs: { span: 24 }, sm: { span: 8 } }
  }
  const nav = useNavigate()
  const [form] = Form.useForm()
  const { TextArea } = Input

  const [image, setImage] = useState<string>('') // preview single image
  const [loading, setLoading] = useState<boolean>(false)
  const [cats, setCats] = useState<any[]>([])
  const [loadingCats, setLoadingCats] = useState<boolean>(false)

  // Lấy category từ BE (trả về [{_id, name}, ...])
  useEffect(() => {
    const fetchCats = async () => {
      setLoadingCats(true)
      try {
        const { data } = await api.get('/categories') // sửa nếu route khác
        // giả sử data.success/data.data hoặc data.data; điều chỉnh nếu khác
        const list = data.data || data // try both
        setCats(Array.isArray(list) ? list : [])
      } catch (err) {
        console.error('Fetch categories error', err)
        message.error('Không lấy được danh mục. Bạn có thể dùng ObjectId tạm thời để test.')
      } finally {
        setLoadingCats(false)
      }
    }
    fetchCats()
  }, [])

  // upload lên Cloudinary (POST)
  const uploadImage = async (file: File) => {
    if (!file) return
    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'reacttest') // giữ preset của bạn

    try {
      const { data } = await axios.post(
        'https://api.cloudinary.com/v1_1/dkpfaleot/image/upload',
        formData
      )
      // Cloudinary trả về data.secure_url hoặc data.url, tùy
      const url = data.secure_url || data.url
      setImage(url)
      // LƯU DẠNG MẢNG vì BE yêu cầu images: [String]
      form.setFieldsValue({ images: [url] })
      setLoading(false)
      return url
    } catch (error: any) {
      console.error('Upload error', error)
      message.error('Upload ảnh thất bại')
      setLoading(false)
      throw error
    }
  }

  // xử lý customRequest của antd Upload
  const customUpload = async ({ file, onSuccess, onError }: any) => {
    if (!(file instanceof File)) return
    try {
      await uploadImage(file)
      onSuccess && onSuccess('ok')
    } catch (err) {
      onError && onError(err)
    }
  }

  const onFinish = async (values: any) => {
    try {
      // Debug: log client-side trước khi gửi
      console.log('Will send payload:', values)

      // ép kiểu an toàn
      const payload: any = { ...values }
      if (payload.price !== undefined) payload.price = Number(payload.price)
      if (payload.quantity !== undefined) payload.quantity = Number(payload.quantity)

      // đảm bảo images là array
      if (!payload.images) payload.images = []
      if (typeof payload.images === 'string') payload.images = [payload.images]

      // category phải là ObjectId string; nếu bạn tạm dùng tên thì BE sẽ 400
      // status phải là "active" hoặc "inactive"
      // gửi
      const res = await api.post('/products', payload)
      message.success('Thêm sản phẩm thành công!')
      nav('/products')
    } catch (err: any) {
      console.error('API error', err)
      // show lỗi server nếu có
      const serverMsg = err?.response?.data?.message || err?.response?.data || err.message
      message.error(`Thất bại: ${serverMsg}`)
    }
  }

  return (
    <>
      <Form
        form={form}
        onFinish={onFinish}
        {...formItemLayout}
        layout='vertical'
        style={{ maxWidth: 800, margin: '0 auto' }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Tên"
              name='name'
              rules={[
                { required: true, message: 'Vui lòng nhập tên sản phẩm' },
                { min: 3, message: 'Tên sản phẩm chứa ít nhất 3 ký tự' }
              ]}
            >
              <Input placeholder="VD: Đắc nhân tâm" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Danh mục"
              name='category'
              rules={[{ required: true, message: 'Vui lòng chọn danh mục sản phẩm' }]}
            >
              {loadingCats ? (
                <Spin />
              ) : (
                <Select placeholder="-- Chọn --">
                  {cats.length ? (
                    cats.map((c) => (
                      <Select.Option key={c._id || c.id} value={c._id || c.id}>
                        {c.name}
                      </Select.Option>
                    ))
                  ) : (
                    // fallback: ví dụ ObjectId tạm
                    <>
                      <Select.Option value="6746d865cdafb8c3b0deafa1">Lãng mạn</Select.Option>
                      <Select.Option value="6746d875cdafb8c3b0deafb2">Trinh thám</Select.Option>
                      <Select.Option value="6746d892cdafb8c3b0deafc3">Tiểu thuyết</Select.Option>
                    </>
                  )}
                </Select>
              )}
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Giá tiền"
              name='price'
              rules={[
                { required: true, message: 'Vui lòng nhập giá tiền' },
                { type: 'number', message: 'Giá sản phẩm phải là số' }
              ]}
            >
              <InputNumber placeholder="VD: 50000" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Số lượng"
              name='quantity'
              rules={[
                { required: true, message: 'Vui lòng nhập số lượng trong kho' },
                { type: 'number', message: 'Số lượng phải là số' }
              ]}
            >
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
                if (!isImage) message.error('Chỉ được tải lên hình ảnh!')
                return isImage || Upload.LIST_IGNORE
              }}
              customRequest={customUpload}
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

          <Form.Item
            label="Mô tả"
            name='description'
            style={{ flex: 1, marginBottom: 0 }}
            rules={[
              { required: true, message: 'Vui lòng nhập mô tả' },
              { min: 10, message: 'Mô tả chứa ít nhất 10 ký tự' }
            ]}
          >
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
