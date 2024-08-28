import React from 'react'
import { ConfigProvider } from 'antd'
import { createRoot } from 'react-dom/client'
import App from './pages/App'
import { HashRouter } from 'react-router-dom'
import './style.css'
import { setupWindowEventBus } from './Utils/eventBus'

setupWindowEventBus()

const container = document.getElementById('root')
const root = createRoot(container)
root.render(
  <HashRouter>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#b21d21',
          borderRadius: 2,
        },
      }}
    >
      <App />
    </ConfigProvider>
  </HashRouter>,
)
