# Convex 生产环境部署指南

## 问题说明

应用在 Vercel 部署后显示空白，控制台报错找不到 `categories:list` 函数。这是因为：
1. Convex 函数还没有部署到生产环境
2. Vercel 环境变量中的 Convex URL 需要更新

## 重要提示

⚠️ **本项目使用 Vite，环境变量应该是 `VITE_CONVEX_URL`，不是 `NEXT_PUBLIC_CONVEX_URL`**

## 部署步骤

### 步骤 1：部署 Convex 函数到生产环境

在项目根目录运行：

```bash
cd "/Users/martinachain/Desktop/money record/money-record"
npx convex deploy
```

**说明**：
- `convex deploy` **默认就是部署到生产环境**（`perceptive-mosquito-232.convex.cloud`）
- 不需要 `--prod` 参数（该参数不存在）
- 只有在设置了 `CONVEX_DEPLOY_KEY` 环境变量（Preview Deploy Key）时，才会部署到预览环境
- 部署完成后，所有 Convex 函数（`categories:list`、`transactions:list` 等）都会在生产环境可用

**部署输出示例**：
```
Deploying to production...
✓ Deployed functions:
  - categories:list
  - categories:create
  - transactions:list
  - transactions:create
  - transactions:remove
  - budgets:list
  - budgets:upsert
  - budgets:usage
  - analytics:categoryBreakdown
  - analytics:incomeBreakdown
  - analytics:trend
  - analytics:topExpenses
  - analytics:topIncomes
  - seed:initializeCategories
✓ Deployment complete!
```

### 步骤 2：在 Vercel Dashboard 更新环境变量

1. **打开 Vercel Dashboard**
   - 访问 https://vercel.com/dashboard
   - 选择你的项目

2. **进入环境变量设置**
   - 点击项目 → **Settings** → **Environment Variables**

3. **更新 `VITE_CONVEX_URL`**
   - 找到现有的 `VITE_CONVEX_URL` 环境变量
   - 点击 **Edit**（编辑）
   - 将值更新为：`https://perceptive-mosquito-232.convex.cloud`
   - 确保选择了正确的环境（Production、Preview、Development）
   - 点击 **Save**

4. **如果没有 `VITE_CONVEX_URL`，添加它**
   - 点击 **Add New**
   - Key: `VITE_CONVEX_URL`
   - Value: `https://perceptive-mosquito-232.convex.cloud`
   - Environment: 选择 **Production**、**Preview**、**Development**（全选）
   - 点击 **Save**

5. **确认其他环境变量**
   - `VITE_CLERK_PUBLISHABLE_KEY` = `pk_test_d29ya2FibGUtcGlyYW5oYS03Mi5jbGVyay5hY2NvdW50cy5kZXYk`
   - `VITE_CONVEX_URL` = `https://perceptive-mosquito-232.convex.cloud`

### 步骤 3：触发 Vercel 重新部署

更新环境变量后，Vercel 会自动触发重新部署。如果没有自动部署：

1. 进入 **Deployments** 标签页
2. 找到最新的部署
3. 点击 **"..."** → **"Redeploy"**
4. 确认重新部署

### 步骤 4：验证部署

部署完成后：

1. **访问 Vercel 部署的 URL**
2. **打开浏览器开发者工具**（F12）
3. **检查控制台**：
   - ✅ 不应该有 `categories:list` 找不到的错误
   - ✅ 不应该有 `/api/...` 的 500 错误
   - ✅ 应该看到 Convex WebSocket 连接成功

4. **检查网络请求**（Network 标签页）：
   - ✅ 应该看到对 `perceptive-mosquito-232.convex.cloud` 的 WebSocket 连接
   - ✅ 不应该有对旧 Convex URL 的请求

5. **测试功能**：
   - ✅ 类别列表正常显示
   - ✅ 可以添加交易记录
   - ✅ 预算设置页面正常显示

## 常见问题

### Q1: 为什么找不到 `categories:list` 函数？

**A**: 可能的原因：
1. Convex 函数还没有部署到生产环境（需要运行 `npx convex deploy --prod`）
2. Vercel 环境变量中的 Convex URL 指向了错误的部署（开发环境而不是生产环境）

### Q2: 我需要运行 `npx convex deploy` 还是 `npx convex deploy --prod`？

**A**: 
- **`npx convex deploy`** ✅ - **默认部署到生产环境**（用于 Vercel 部署）
- **`npx convex deploy --prod`** ❌ - **这个参数不存在**，会报错

**重要**：`convex deploy` 命令默认就是部署到生产环境，不需要任何额外参数。

### Q3: 环境变量应该是 `VITE_CONVEX_URL` 还是 `NEXT_PUBLIC_CONVEX_URL`？

**A**: 
- **`VITE_CONVEX_URL`** ✅ - 这是正确的（项目使用 Vite）
- **`NEXT_PUBLIC_CONVEX_URL`** ❌ - 这是 Next.js 的格式，不适用于此项目

### Q4: 如何确认 Convex 函数已部署？

**A**: 
1. 访问 Convex Dashboard: https://dashboard.convex.dev
2. 选择你的项目
3. 查看 **Functions** 标签页，确认所有函数都已列出
4. 或者运行 `npx convex functions list --prod` 查看生产环境的函数列表

### Q5: 部署后仍然显示空白怎么办？

**A**: 检查清单：
1. ✅ 确认已运行 `npx convex deploy --prod`
2. ✅ 确认 Vercel 环境变量 `VITE_CONVEX_URL` 已更新
3. ✅ 确认 Vercel 已重新部署
4. ✅ 清除浏览器缓存并硬刷新（Cmd+Shift+R）
5. ✅ 检查浏览器控制台的错误信息

## 快速检查清单

- [ ] 运行 `npx convex deploy` 部署 Convex 函数到生产环境
- [ ] 在 Vercel Dashboard 更新 `VITE_CONVEX_URL` 环境变量
- [ ] 确认 `VITE_CLERK_PUBLISHABLE_KEY` 也已配置
- [ ] 触发 Vercel 重新部署
- [ ] 清除浏览器缓存并测试

## 相关文档

- [Convex 部署文档](https://docs.convex.dev/deployment)
- [Vercel 环境变量配置](https://vercel.com/docs/concepts/projects/environment-variables)
