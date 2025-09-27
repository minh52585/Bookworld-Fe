import { ConfigProvider, theme as antTheme } from 'antd'
import Routers from '@/routers/routers'
import { useAppSelector } from '../store/redux/hooks'

const Providers = () => {
  const themeMode = useAppSelector(state => state.app.themeMode)

  return (
    <div>
      <ConfigProvider theme={{ algorithm: themeMode === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm }}>
        <Routers />
      </ConfigProvider>
    </div>
  )
}

export default Providers
