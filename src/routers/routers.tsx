import { Route, Routes } from 'react-router'
import PrivateRouters from './private.routers'
import AdminLayout from '@/pages/AdminLayout'
import Dashboard from '@/pages/dashboard/dashboard'
import Users from '@/pages/users/users'
import Variants from '@/pages/variants/variants'
import Discounts from '@/pages/discounts/discounts'
import Categories from '@/pages/categories/categories'
import AddCategory from '@/pages/categories/addCategory'
import EditCategory from '@/pages/categories/editCategory'
import Orders from '@/pages/orders/orders'
import Coupons from '@/pages/coupons/coupons'
import Reviews from '@/pages/reviews/reviews'
import NotFound from '@/pages/NotFound'
import Analytics from '@/pages/analytics/analytics'
import Register from '@/pages/register/register'
import Login from '@/pages/login/login'
import ProductsAdd from '@/pages/products/addProduct'
import ProductsPage from '@/pages/products/products'
import ProductsUpdate from '@/pages/products/editProduct'
import DiscountsAdd from '@/pages/discounts/addDiscount'
import DiscountsUpdate from '@/pages/discounts/editDiscount'
import AddCoupon from '@/pages/coupons/addCoupon'
import EditCoupon from '@/pages/coupons/editCoupon'
import AddVariant from '@/pages/variants/addVariant'
import EditVariant from '@/pages/variants/editVariant'
import OrderDetails from '@/pages/orders/orderDetails'

const Routers = () => {
  const isAuthenticated = true

  return (
    <Routes>
      <Route element={<PrivateRouters isAllowed={isAuthenticated ? true : false} redirectTo='/signin' />}>
        <Route path='/' element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path='/analytics' element={<Analytics />} />
          <Route path='/users' element={<Users />} />
          <Route path='/products/add' element={<ProductsAdd />} />
          <Route path='/products' element={<ProductsPage />} />
          <Route path='/products/update/:id' element={<ProductsUpdate />} />
          <Route path='/variants' element={<Variants />} />
          <Route path='/variants/add' element={<AddVariant />} />
          <Route path='/variants/edit/:id' element={<EditVariant />} />
          <Route path='/discounts' element={<Discounts />} />
          <Route path='/discounts/add' element={<DiscountsAdd />} />
          <Route path='/discounts/update/:id' element={<DiscountsUpdate />} />
          <Route path='/categories' element={<Categories />} />
          <Route path='/categories/add' element={<AddCategory />} />
          <Route path='/categories/edit/:id' element={<EditCategory />} />         
          <Route path='/orders' element={<Orders />} />
          <Route path='/order/details/:id' element={<OrderDetails />} />
          <Route path='/coupons' element={<Coupons />} />
          <Route path='/coupons/add' element={<AddCoupon />} />
          <Route path='/coupons/edit/:id' element={<EditCoupon />} />
          <Route path='/reviews' element={<Reviews />} />
        </Route>
      </Route>
      <Route path='/register' element={<Register />} />
      <Route path='/login' element={<Login />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}

export default Routers
