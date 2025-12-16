import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Providers from './pages/providers/providerRoute.tsx'
import 'antd/dist/reset.css'
import { ToastContainer } from 'react-toastify'
import { BrowserRouter } from 'react-router'
import { persistor, store } from './pages/store/redux/store.ts'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { App } from 'antd'   // 👈 Quan trọng: dùng App, không phải ConfigProvider

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <QueryClientProvider client={queryClient}>

            {/* 👇 ĐÚNG CHUẨN ANTD V5 */}
            <App>
              <Providers />
            </App>

            <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar={false}
            pauseOnHover
            theme="light"
          />
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </BrowserRouter>
  </StrictMode>
)
