import { Button, Divider, Form, Input, message, Select, Col, Row } from 'antd'
import { IRegister } from '@/types/auth'
import { Link, useNavigate } from 'react-router';
import api from '@/config/axios.customize';
const Register = () => {
  const nav = useNavigate()
  const [form] = Form.useForm()
  const { Option } = Select
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 }
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 }
    }
  }

  const onFinish = async (values: IRegister) => {
    try {
      await api.post('api/register', values)
      message.success('Đăng ký thành công!')
      const userData = {
        ...values,
        password: btoa(values.password)
      }
      console.log(userData)
      nav('/login')
    } catch (error:any) {
      if (error.response && error.response.data && error.response.data.message) {
        message.error(error.response.data.message)
        console.log('Lỗi đăng ký:', error.response.data.message)
      } else {
        message.error('Đăng ký thất bại!')
        console.log(error)
      }
    }
  }
  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select style={{ width: 70 }}>
        <Option value="86">+ 84</Option>
      </Select>
    </Form.Item>
  )
  return (
    <div
      style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #e0f2fe, #f3f4f6)',
      padding: '20px',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
        padding: '40px',
        maxWidth: '600px',
        width: '100%',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}>
        <h2 style={{ textAlign:'center', marginBottom: 32, fontSize: '28px', fontWeight: '600', color: '#1f2937', letterSpacing: '0.5px' }}>ĐĂNG KÝ THÀNH VIÊN</h2>
        
        <Form
          {...formItemLayout}
          form={form}
          onFinish={onFinish}
          initialValues={{ residence: ['zhejiang', 'hangzhou', 'xihu'], prefix: '86' }}
          style={{ maxWidth: '100%' }}
          scrollToFirstError
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fullname"
                style={{ marginLeft: 88, width: '100%' }}
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên!', whitespace: true }]}
              >
                <Input placeholder="Họ và tên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                style={{ width: '100%' }}
                rules={[
                  {
                    type: 'email',
                    message: 'Không đúng định dạng Email!'
                  },
                  {
                    required: true,
                    message: 'Vui lòng nhập Email!'
                  }
                ]}
              >
                <Input placeholder="Email" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="password"
                style={{ marginLeft: 88, width: '100%' }}
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập mật khẩu!'
                  }
                ]}
                hasFeedback
              >
                <Input.Password placeholder="Mật khẩu" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phoneNumber"
                style={{ width: '100%' }}
                rules={[{ required: true, message: 'Vui lòng nhập SĐT!' }]}
              >
                <Input addonBefore={prefixSelector} style={{ width: '100%' }} placeholder="xxx.xxx.xxx" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="address"
                style={{ marginLeft: 88, width: '100%' }}
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
              >
                <Input placeholder="Địa chỉ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="gender"
                style={{ width: '100%' }}
                rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
              >
                <Select placeholder="Giới tính">
                  <Option value="male">Nam</Option>
                  <Option value="female">Nữ</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ textAlign: 'center' }}>
            <Button
              htmlType="submit"
              style={{
                background: '#006a94',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #d9d9d9',
                borderRadius: '6px',
                padding: '6px 16px',
                width: '100%',
                marginLeft: 88,
                fontWeight: 500,
              }}
            >
              Xác nhận
            </Button>
          </Form.Item>
        </Form>

        <div style={{ width: '66%', margin: '0 auto' }}>
          <Divider plain>hoặc</Divider>
        </div>

        <Form.Item style={{ textAlign: 'center' }}>
            <Button
              onClick={() => alert('Chưa tích hợp Google!')}
              icon={<img src="https://cdn-icons-png.flaticon.com/512/281/281764.png" style={{ width: 18, height: 18, marginRight: 8 }} />}
              className="flex items-center justify-center border border-gray-300 rounded px-4 py-2 w-full"
            >
              Tiếp tục với Google
            </Button>
        </Form.Item>

        <Form.Item wrapperCol={{ span: 24 }} style={{ textAlign: 'center' }}>
          Bạn đã có tài khoản?{" "}
          <Link to="/login" style={{ color: '#1D4ED8' }} >
            Đăng nhập
          </Link>{" "}ngay
        </Form.Item>
      </div>
    </div>
  )
}

export default Register;