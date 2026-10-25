import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'antd/dist/antd.css';
import { ConfigProvider } from 'antd';
import { store } from './redux/store'
import { Provider } from 'react-redux'

const siteFontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ConfigProvider theme={{ token: { fontFamily: siteFontFamily } }}>
        <App />
      </ConfigProvider>
    </Provider>
  </StrictMode>,
)
