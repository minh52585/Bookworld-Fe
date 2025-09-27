import { useSystemTheme } from '@/hooks/useSystemTheme'
import { useAppSelector, useAppDispatch } from '@/pages/store/redux/hooks'
import { setStateThemeMode } from '@/pages/store/redux/slices/app.slices'
import { Select } from 'antd'
import { useEffect } from 'react'

const ThemeSelect = () => {
  const themeMode = useAppSelector(state => state.app.themeMode)
  const dispatch = useAppDispatch()

  const systemTheme = useSystemTheme()
  const handleChange = (value: string) => {
    dispatch(setStateThemeMode(value))
  }

  useEffect(() => {
    if (themeMode === 'system') {
      dispatch(setStateThemeMode(systemTheme))
    }
  }, [systemTheme, themeMode, dispatch])

  return (
    <div>
      <Select
        defaultValue={themeMode}
        style={{ width: 120 }}
        onChange={handleChange}
        options={[
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'system', label: 'System' }
        ]}
      />
    </div>
  )
}

export default ThemeSelect
