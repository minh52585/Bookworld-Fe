import { useAppSelector } from '@/pages/store/redux/hooks'
import { ReadOutlined } from '@ant-design/icons'
import { Menu } from 'antd'
import { Link, useLocation } from 'react-router'
import { itemsRoute } from './const/menuRoute'
import Sider from 'antd/es/layout/Sider'

const AppSidebar = () => {
  const isOpenDrawer = useAppSelector((state) => state.app.isOpenDrawer)

  const location = useLocation()

  return (
    <Sider trigger={null} collapsible collapsed={!isOpenDrawer}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        padding: '0 0 20px 0'
      }}>
        <section>
          <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 'bold', color: 'white', textTransform: 'uppercase', letterSpacing: 1 }}>
            <Link to={'/'} style={{ color: 'white' }}>
              <ReadOutlined />
            </Link>
          </div>

          <Menu
            theme='dark'
            mode='inline'
            selectedKeys={[location.pathname]}
            defaultSelectedKeys={['/']}
            items={itemsRoute}
          />
        </section>
      </div>
    </Sider>
  )
}

export default AppSidebar
