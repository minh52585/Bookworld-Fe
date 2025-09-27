import { useAppDispatch, useAppSelector } from '@/pages/store/redux/hooks'
import { setStateDrawer } from '@/pages/store/redux/slices/app.slices'
import ThemeSelect from '@/theme/theme.select'
import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Button, Dropdown, MenuProps, Space, theme } from 'antd'
import { Header } from 'antd/es/layout/layout'
import { Link } from 'react-router'

const items: MenuProps['items'] = [
  {
    key: '1',
    label: (
      <Link rel="noopener noreferrer" to="/">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SettingOutlined />
          Tài khoản
        </div>
      </Link>
    )
  },
  {
    key: '2',
    label: (
      <Link rel="noopener noreferrer" to="/">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LogoutOutlined />
          Đăng xuất
        </div>
      </Link>
    )
  }
]

const AppHeader = () => {
  const dispatch = useAppDispatch()
  const isOpenDrawer = useAppSelector((state) => state.app.isOpenDrawer)

  const { token: { colorBgContainer } } = theme.useToken()

  const themeMode = useAppSelector(state => state.app.themeMode)

  return (
    <Header style={{
      background: colorBgContainer,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 20px 0 0'
    }}>
      <Button
        type='text'
        icon={isOpenDrawer ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => dispatch(setStateDrawer())}
        style={{
          fontSize: '16px',
          width: 64,
          height: 64
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <ThemeSelect />
        <Dropdown menu={{ items }} trigger={['click']}>
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              <Avatar
              size={'default'}
              icon={<UserOutlined />}
              style={{
                backgroundColor: themeMode === 'dark' ? '#1f1f1f' : '#ffffff',
                color: themeMode === 'dark' ? '#ffffff' : '#000000',
                border: '1px solid',
                borderColor: themeMode === 'dark' ? '#444' : '#d9d9d9' }} />
            </Space>
          </a>
        </Dropdown>
      </div>
    </Header>
  )
}

export default AppHeader
