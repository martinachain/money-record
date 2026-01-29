# 项目配置总结

## ✅ 正确的配置

### 资金管理项目 (`money-manager-backend`)

**开发环境：**
- 部署名称：`perceptive-mosquito-232`
- URL: `https://perceptive-mosquito-232.convex.cloud`

**生产环境：**
- 部署名称：`lovable-wildebeest-703` ✅
- URL: `https://lovable-wildebeest-703.convex.cloud` ✅

### 时间管理项目 (`time-manager`)

**开发环境：**
- 部署名称：`clever-ibex-897`
- URL: `https://clever-ibex-897.convex.cloud`

**生产环境：**
- 部署名称：`scintillating-canary-269` ✅
- URL: `https://scintillating-canary-269.convex.cloud` ✅

## 📝 当前配置

### `.env.local` (资金管理项目)

```bash
CONVEX_DEPLOYMENT=prod:lovable-wildebeest-703
VITE_CONVEX_URL=https://lovable-wildebeest-703.convex.cloud
```

### Vercel 环境变量（需要更新）

- `VITE_CLERK_PUBLISHABLE_KEY` = `pk_test_d29ya2FibGUtcGlyYW5oYS03Mi5jbGVyay5hY2NvdW50cy5kZXYk`
- `VITE_CONVEX_URL` = `https://lovable-wildebeest-703.convex.cloud` ✅

## 🚀 下一步操作

### 1. 重新部署到正确的生产环境

```bash
cd "/Users/martinachain/Desktop/money record/money-record"
npx convex deploy
```

这次应该会部署到 `lovable-wildebeest-703`（资金管理的生产环境）。

### 2. 在 Vercel Dashboard 更新环境变量

1. 进入 Vercel Dashboard → 你的项目 → Settings → Environment Variables
2. 更新 `VITE_CONVEX_URL` 为：`https://lovable-wildebeest-703.convex.cloud`
3. 保存并触发重新部署

### 3. 验证部署

部署完成后：
- ✅ 确认资金管理应用连接到 `lovable-wildebeest-703.convex.cloud`
- ✅ 确认时间管理应用连接到 `scintillating-canary-269.convex.cloud`
- ✅ 两个项目完全分离，互不影响

## ⚠️ 重要提示

- **资金管理项目**：使用 `lovable-wildebeest-703`（生产环境）
- **时间管理项目**：使用 `scintillating-canary-269`（生产环境）
- 确保每个项目的 `.env.local` 配置正确
- 确保 Vercel 的环境变量指向正确的 Convex URL
