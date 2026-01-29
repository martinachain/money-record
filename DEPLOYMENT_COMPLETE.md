# 部署完成后的配置步骤

## ✅ 部署状态

Convex 函数已成功部署到：`https://lovable-wildebeest-703.convex.cloud`

## 📝 需要更新的配置

### 步骤 1：更新 Vercel 环境变量（最重要）

1. **打开 Vercel Dashboard**
   - 访问 https://vercel.com/dashboard
   - 选择你的项目

2. **进入环境变量设置**
   - 点击项目 → **Settings** → **Environment Variables**

3. **更新 `VITE_CONVEX_URL`**
   - 找到 `VITE_CONVEX_URL` 环境变量
   - 点击 **Edit**（编辑）
   - 将值更新为：`https://lovable-wildebeest-703.convex.cloud`
   - 确保选择了正确的环境（Production、Preview、Development - 全选）
   - 点击 **Save**

4. **确认其他环境变量**
   - `VITE_CLERK_PUBLISHABLE_KEY` = `pk_test_d29ya2FibGUtcGlyYW5oYS03Mi5jbGVyay5hY2NvdW50cy5kZXYk`
   - `VITE_CONVEX_URL` = `https://lovable-wildebeest-703.convex.cloud`

### 步骤 2：触发 Vercel 重新部署

更新环境变量后，Vercel 会自动触发重新部署。如果没有自动部署：

1. 进入 **Deployments** 标签页
2. 找到最新的部署
3. 点击 **"..."** → **"Redeploy"**
4. 确认重新部署

### 步骤 3：验证部署

部署完成后：

1. **访问 Vercel 部署的 URL**
2. **打开浏览器开发者工具**（F12）
3. **检查控制台**：
   - ✅ 不应该有 `categories:list` 找不到的错误
   - ✅ 不应该有 `/api/...` 的 500 错误
   - ✅ 应该看到 Convex WebSocket 连接成功

4. **检查网络请求**（Network 标签页）：
   - ✅ 应该看到对 `lovable-wildebeest-703.convex.cloud` 的 WebSocket 连接
   - ✅ 不应该有对旧 Convex URL 的请求

5. **测试功能**：
   - ✅ 类别列表正常显示
   - ✅ 可以添加交易记录
   - ✅ 预算设置页面正常显示

## 📋 快速检查清单

- [ ] 在 Vercel Dashboard 更新 `VITE_CONVEX_URL` 为 `https://lovable-wildebeest-703.convex.cloud`
- [ ] 确认 `VITE_CLERK_PUBLISHABLE_KEY` 也已配置
- [ ] 触发 Vercel 重新部署
- [ ] 清除浏览器缓存并测试
- [ ] 验证所有功能正常工作

## ⚠️ 注意事项

- 如果之前配置的是 `perceptive-mosquito-232.convex.cloud`，现在需要改为 `lovable-wildebeest-703.convex.cloud`
- 部署完成后，应用会自动初始化类别数据（通过 `seed:initializeCategories`）
- 如果类别数据没有自动初始化，可以在 Convex Dashboard 中手动运行该函数

## 🔗 相关链接

- Convex Dashboard: https://dashboard.convex.dev
- Vercel Dashboard: https://vercel.com/dashboard
- Convex 文档: https://docs.convex.dev/hosting
