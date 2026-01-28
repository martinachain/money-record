import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import './index.css'
import App from './App.tsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || ''
const CONVEX_URL = import.meta.env.VITE_CONVEX_URL || ''

// 更友好的错误提示
if (!PUBLISHABLE_KEY) {
  console.error('❌ 错误：缺少 VITE_CLERK_PUBLISHABLE_KEY 环境变量')
  console.error('请在 .env 文件中添加：VITE_CLERK_PUBLISHABLE_KEY=pk_test_...')
}

if (!CONVEX_URL) {
  console.error('❌ 错误：缺少 VITE_CONVEX_URL 环境变量')
  console.error('请在 .env 文件中添加：VITE_CONVEX_URL=https://...')
}

if (!PUBLISHABLE_KEY || !CONVEX_URL) {
  // 显示友好的错误页面而不是直接崩溃
  document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui;">
      <div style="text-align: center; padding: 2rem; max-width: 600px;">
        <h1 style="color: #ef4444; margin-bottom: 1rem;">⚠️ 配置错误</h1>
        <p style="color: #666; margin-bottom: 1rem;">缺少必要的环境变量配置</p>
        <div style="background: #f3f4f6; padding: 1rem; border-radius: 8px; text-align: left; margin-top: 1rem;">
          <p style="margin: 0.5rem 0;"><strong>请检查：</strong></p>
          <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
            <li>${!PUBLISHABLE_KEY ? '❌ VITE_CLERK_PUBLISHABLE_KEY 未配置' : '✅ VITE_CLERK_PUBLISHABLE_KEY 已配置'}</li>
            <li>${!CONVEX_URL ? '❌ VITE_CONVEX_URL 未配置' : '✅ VITE_CONVEX_URL 已配置'}</li>
          </ul>
          <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">
            请检查 .env 文件，然后重启开发服务器（npm run dev）
          </p>
        </div>
      </div>
    </div>
  `
  throw new Error('环境变量配置错误')
}

const convex = new ConvexReactClient(CONVEX_URL)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    </ClerkProvider>
  </StrictMode>,
)
