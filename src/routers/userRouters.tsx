import { Route, Routes } from 'react-router'
import { lazy, Suspense } from 'react'
import { Spin } from 'antd'

// Lazy load components
const Home = lazy(() => import('@/pages/user/Home'))
const Products = lazy(() => import('@/pages/user/Products'))
const ProductDetail = lazy(() => import('@/pages/user/ProductDetail'))
const Cart = lazy(() => import('@/pages/user/Cart'))
const Checkout = lazy(() => import('@/pages/user/Checkout'))
const Profile = lazy(() => import('@/pages/user/Profile'))
const Orders = lazy(() => import('@/pages/user/Orders'))
const Coupons = lazy(() => import('@/pages/user/Coupons'))
const Login = lazy(() => import('@/pages/user/Login'))
const Register = lazy(() => import('@/pages/user/Register'))
const NotFound = lazy(() => import('@/pages/NotFound'))

const UserRouters = () => {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>}>
      <Routes>
        {/* Trang chủ */}
        <Route path='/' element={<Home />} />
        
        {/* Sản phẩm */}
        <Route path='/products' element={<Products />} />
        <Route path='/products/:id' element={<ProductDetail />} />
        
        {/* Giỏ hàng & Thanh toán */}
        <Route path='/cart' element={<Cart />} />
        <Route path='/checkout' element={<Checkout />} />
        
        {/* Mã giảm giá - Route chính bạn yêu cầu */}
        <Route path='/coupons' element={<Coupons />} />
        
        {/* Tài khoản người dùng */}
        <Route path='/profile' element={<Profile />} />
        <Route path='/orders' element={<Orders />} />
        
        {/* Xác thực */}
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        
        {/* 404 */}
        <Route path='*' element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default UserRouters