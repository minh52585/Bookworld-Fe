import { Layout, theme } from 'antd'
import AppHeader from '@/components/common/app.header'
import AppSidebar from '@/components/common/app.sidebar'
import { Outlet } from 'react-router'
import AppBreadcrumb from '@/components/common/app.breadcrumb'

const { Content } = Layout

const AdminLayout = () => {
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken()
  return (
    <Layout >
      <AppSidebar />
      <Layout style={{
        minHeight: '100dvh'
      }}>
        <AppHeader />
        <Content style={{ margin: '0 16px' }}>
          <AppBreadcrumb />
          <div
            style={{
              padding: 24,
              background: colorBgContainer,
              borderRadius: borderRadiusLG
            }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout