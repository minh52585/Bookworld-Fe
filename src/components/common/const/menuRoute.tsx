import { BarChartOutlined, BranchesOutlined, DashboardOutlined, DatabaseOutlined, FormOutlined, GiftOutlined, ShoppingCartOutlined, ShoppingOutlined, TagOutlined, TeamOutlined } from '@ant-design/icons'
import { MenuProps } from 'antd'
import { Link } from 'react-router'

export const itemsRoute: MenuProps['items'] = [
  {
    key: 'overview',
    type: 'group',
    label: 'Tổng quan',
    children: [
      {
        key: '/',
        icon: <DashboardOutlined />,
        label: <Link to={'/'}>Dashboard</Link>
      },
      {
        key: '/analytics',
        icon: <BarChartOutlined />,
        label: <Link to={'/analytics'}>Thống kê</Link>
      }
    ]
  },
  {
    key: 'management',
    type: 'group',
    label: 'Quản lý',
    children: [
      {
        key: '/users',
        icon: <TeamOutlined />,
        label: <Link to={'/users'}>Khách hàng</Link>
      },
      {
        key: '/products',
        icon: <ShoppingOutlined />,
        label: <Link to={'/products'}>Sản phẩm</Link>
      },
      {
        key: '/variants',
        icon: <BranchesOutlined />,
        label: <Link to={'/variants'}>Biến thể</Link>
      },
      {
        key: '/discounts',
        icon: <TagOutlined />,
        label: <Link to={'/discounts'}>Khuyến mại</Link>
      },
      {
        key: '/categories',
        icon: <DatabaseOutlined />,
        label: <Link to={'/categories'}>Danh mục</Link>
      },
      {
        key: '/orders',
        icon: <ShoppingCartOutlined />,
        label: <Link to={'/orders'}>Đơn hàng</Link>
      },
      {
        key: '/coupons',
        icon: <GiftOutlined />,
        label: <Link to={'/coupons'}>Mã giảm giá</Link>
      },
      {
        key: '/reviews',
        icon: <FormOutlined />,
        label: <Link to={'/reviews'}>Đánh giá</Link>
      },
    ]
  }
]