# 确认并修复项目部署

## 当前情况

从 `.env.local` 看，配置的是：
- `CONVEX_DEPLOYMENT=prod:perceptive-mosquito-232`
- 项目：`money-manager-backend-04f8b`（资金管理）

但实际部署到了 `lovable-wildebeest-703`，这可能是时间管理项目的生产环境。

## 需要确认的信息

### 在 Convex Dashboard 中确认

1. **访问 Convex Dashboard**：https://dashboard.convex.dev

2. **检查 `money-manager-backend-04f8b` 项目**：
   - 点击项目进入详情
   - 查看 **Settings** → **Deployments**
   - 确认生产环境的部署名称是什么
   - 确认生产环境的 URL 是什么

3. **检查 `time-manager` 项目**：
   - 点击项目进入详情
   - 查看 **Settings** → **Deployments**
   - 确认生产环境的部署名称是什么
   - 确认是否是 `lovable-wildebeest-703`

## 修复步骤

### 方案 A：如果 `perceptive-mosquito-232` 是正确的资金管理项目

1. **更新 `.env.local`**：
   ```bash
   CONVEX_DEPLOYMENT=prod:perceptive-mosquito-232
   VITE_CONVEX_URL=https://perceptive-mosquito-232.convex.cloud
   ```

2. **重新部署**：
   ```bash
   cd "/Users/martinachain/Desktop/money record/money-record"
   npx convex deploy
   ```

3. **确认部署目标**：
   - 部署时，终端会显示要部署到哪个项目
   - 确认显示的是 `money-manager-backend-04f8b` 而不是 `time-manager`

### 方案 B：如果资金管理项目有其他的生产环境名称

1. **在 Convex Dashboard 中找到正确的部署名称**

2. **更新 `.env.local`**：
   ```bash
   CONVEX_DEPLOYMENT=prod:<正确的部署名称>
   VITE_CONVEX_URL=https://<正确的部署名称>.convex.cloud
   ```

3. **重新部署**

## 如何避免混淆

### 1. 检查部署前的提示

运行 `npx convex deploy` 时，终端会显示：
```
You're currently developing against your dev deployment perceptive-mosquito-232 (set in CONVEX_DEPLOYMENT)
Your prod deployment <部署名称> serves traffic at: VITE_CONVEX_URL=https://...
```

**确认这个部署名称对应的是 `money-manager-backend-04f8b` 项目**

### 2. 在 Convex Dashboard 中验证

部署后，在 Convex Dashboard 中：
1. 进入 `money-manager-backend-04f8b` 项目
2. 查看 **Functions** 标签页
3. 确认所有函数都已部署（categories、transactions、budgets、analytics 等）

### 3. 确认 time-manager 项目没有被更新

1. 进入 `time-manager` 项目
2. 查看 **Functions** 标签页
3. 确认没有资金管理相关的函数（categories、transactions 等）

## 下一步操作

请先：
1. 在 Convex Dashboard 中确认 `money-manager-backend-04f8b` 项目的生产环境部署名称
2. 告诉我正确的部署名称
3. 我会帮你更新配置并重新部署
