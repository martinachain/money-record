# 修复项目混淆问题

## 问题说明

资金管理的代码被错误地部署到了时间管理项目（time-manager）。需要确保：
- **资金管理** → 部署到 `money-manager-backend-0...` 项目
- **时间管理** → 部署到 `time-manager` 项目

## 解决方案

### 步骤 1：确认正确的项目

从 Convex Dashboard 可以看到：
- `money-manager-backend-0...` - 这是资金管理项目（1小时前创建）
- `time-manager` - 这是时间管理项目（3天前创建）

### 步骤 2：检查当前配置

当前 `.env.local` 中配置的是：
```
CONVEX_DEPLOYMENT=prod:perceptive-mosquito-232
```

需要确认 `perceptive-mosquito-232` 对应的是哪个项目。

### 步骤 3：在 Convex Dashboard 中确认项目

1. 访问 https://dashboard.convex.dev
2. 点击 `money-manager-backend-0...` 项目
3. 查看项目的部署 URL（应该在 Settings 或 Overview 页面）
4. 确认生产环境的 URL 是什么

### 步骤 4：更新配置并重新部署

根据 Convex Dashboard 中的信息，更新 `.env.local`：

```bash
# 如果 money-manager 项目的生产环境是 perceptive-mosquito-232
CONVEX_DEPLOYMENT=prod:perceptive-mosquito-232
VITE_CONVEX_URL=https://perceptive-mosquito-232.convex.cloud

# 或者如果是其他部署名称，使用对应的名称
```

### 步骤 5：重新部署到正确的项目

```bash
cd "/Users/martinachain/Desktop/money record/money-record"

# 确认配置正确后
npx convex deploy
```

### 步骤 6：验证部署

部署完成后，在 Convex Dashboard 中：
1. 确认 `money-manager-backend-0...` 项目中有所有函数
2. 确认 `time-manager` 项目没有被意外更新

## 重要提示

- 确保每个项目都有独立的 Convex 部署
- 资金管理和时间管理应该完全分离
- 在部署前，始终检查 `.env.local` 中的 `CONVEX_DEPLOYMENT` 配置

## 如何避免混淆

1. **使用不同的目录**：
   - 资金管理：`money-record` 目录
   - 时间管理：`time-manager` 目录（或其他目录）

2. **使用不同的 `.env.local` 文件**：
   - 每个项目有独立的 `.env.local`
   - 确保 `CONVEX_DEPLOYMENT` 指向正确的项目

3. **部署前检查**：
   - 运行 `npx convex deploy` 前，检查终端显示的部署目标
   - 确认是 `money-manager-backend-0...` 而不是 `time-manager`
