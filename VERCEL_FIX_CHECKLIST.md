# Vercel 部署问题修复清单

## 问题诊断

从错误信息来看，Vercel 上部署的版本仍然在调用 `/api/...` 端点，这说明：

1. **Vercel 可能部署了旧版本的代码**（还没有包含 Convex 迁移）
2. **浏览器/Service Worker 缓存了旧的 JavaScript 文件**
3. **Vercel 环境变量可能未正确配置**

## 修复步骤

### ✅ 步骤 1：确保代码已提交并推送

```bash
cd "/Users/martinachain/Desktop/money record/money-record"
git add .
git commit -m "fix: update Service Worker cache version for Convex migration"
git push origin main
```

### ✅ 步骤 2：在 Vercel Dashboard 配置环境变量

1. 进入 Vercel Dashboard → 你的项目 → **Settings** → **Environment Variables**

2. **添加以下环境变量**（如果还没有）：

   - **`VITE_CLERK_PUBLISHABLE_KEY`**
     - Value: `pk_test_d29ya2FibGUtcGlyYW5oYS03Mi5jbGVyay5hY2NvdW50cy5kZXYk`
     - Environment: Production, Preview, Development（全选）

   - **`VITE_CONVEX_URL`**
     - Value: `https://clever-ibex-897.convex.cloud`
     - Environment: Production, Preview, Development（全选）

3. **保存**环境变量

### ✅ 步骤 3：触发 Vercel 重新部署

有两种方式：

**方式 A：自动重新部署（推荐）**
- 推送代码到 GitHub 后，Vercel 会自动检测并重新部署
- 等待部署完成（通常 1-3 分钟）

**方式 B：手动重新部署**
- 在 Vercel Dashboard → **Deployments** 标签页
- 找到最新的部署，点击 **"..."** → **"Redeploy"**
- 确认重新部署

### ✅ 步骤 4：清除浏览器缓存

部署完成后，在浏览器中：

1. **打开开发者工具**（F12 或 Cmd+Option+I）
2. **Application 标签页** → **Service Workers**
   - 点击 **"Unregister"** 注销所有 Service Workers
3. **Application 标签页** → **Storage** → **Clear site data**
   - 勾选所有选项
   - 点击 **"Clear site data"**
4. **或者使用硬刷新**：
   - Mac: `Cmd + Shift + R`
   - Windows/Linux: `Ctrl + Shift + R`

### ✅ 步骤 5：验证修复

重新加载页面后，检查：

1. **浏览器控制台**（F12 → Console）
   - ✅ 不应该有 `/api/...` 的 500 错误
   - ✅ 不应该有 `SyntaxError: Unexpected token 'A'` 错误
   - ✅ 应该看到 Convex 相关的日志（如果有）

2. **网络请求**（F12 → Network）
   - ✅ 不应该有对 `/api/categories`、`/api/transactions` 等的请求
   - ✅ 应该看到对 Convex 的 WebSocket 连接

3. **页面功能**
   - ✅ 类别列表正常显示
   - ✅ 可以添加交易记录
   - ✅ 预算设置页面正常显示

## 如果问题仍然存在

### 检查 1：确认 Vercel 部署的代码版本

1. 在 Vercel Dashboard → **Deployments**
2. 查看最新部署的 **Commit** 信息
3. 确认是否包含最新的 Convex 迁移代码

### 检查 2：查看 Vercel 构建日志

1. 在 Vercel Dashboard → **Deployments** → 点击最新部署
2. 查看 **Build Logs**
3. 确认构建是否成功，是否有错误

### 检查 3：检查环境变量

1. 在 Vercel Dashboard → **Settings** → **Environment Variables**
2. 确认 `VITE_CONVEX_URL` 和 `VITE_CLERK_PUBLISHABLE_KEY` 都已正确配置
3. 确认环境变量应用到了正确的环境（Production/Preview/Development）

### 检查 4：本地测试

在本地运行：

```bash
npm run build
npm run preview
```

访问 `http://localhost:4173`，确认本地构建版本是否正常工作。

## 常见问题

### Q: 为什么 Vercel 还在调用 `/api/...`？

A: 可能的原因：
1. Vercel 部署了旧版本的代码（还没有重新部署）
2. 浏览器缓存了旧的 JavaScript 文件
3. Service Worker 缓存了旧的文件

### Q: 如何确认 Vercel 部署的是最新代码？

A: 
1. 检查 Vercel Dashboard → Deployments → 最新部署的 Commit SHA
2. 与 GitHub 上的最新 commit 对比
3. 如果不一致，手动触发重新部署

### Q: 环境变量配置后需要重新部署吗？

A: 是的，修改环境变量后，Vercel 会自动触发重新部署。如果没有自动部署，可以手动触发。

## 联系支持

如果按照以上步骤操作后问题仍然存在，请提供：
1. Vercel 构建日志截图
2. 浏览器控制台错误截图
3. Vercel 环境变量配置截图
