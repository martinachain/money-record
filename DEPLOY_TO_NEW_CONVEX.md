# 部署到新的 Convex 项目 (perceptive-mosquito-232)

## 目标

将代码部署到新创建的 Convex 项目 `perceptive-mosquito-232`，并将其用作生产环境。

## 当前状态

- **开发环境**: `perceptive-mosquito-232` (dev deployment)
- **旧生产环境**: `lovable-wildebeest-703` (prod deployment)
- **目标**: 将 `perceptive-mosquito-232` 设置为生产环境

## 操作步骤

### 步骤 1：在终端选择 `n`（不部署到旧的 prod）

当 Convex 询问是否部署到 `lovable-wildebeest-703` 时，选择：
```
n
```

### 步骤 2：配置 Convex 将 `perceptive-mosquito-232` 作为生产环境

有两种方式：

#### 方式 A：通过 Convex Dashboard（推荐）

1. 访问 [Convex Dashboard](https://dashboard.convex.dev)
2. 选择项目 `perceptive-mosquito-232`
3. 进入 **Settings** → **Deployments**
4. 将 `perceptive-mosquito-232` 设置为 **Production** 部署

#### 方式 B：通过命令行设置环境变量

```bash
cd "/Users/martinachain/Desktop/money record/money-record"

# 设置生产部署为 perceptive-mosquito-232
npx convex env set CONVEX_DEPLOYMENT prod:perceptive-mosquito-232
```

### 步骤 3：部署到新的生产环境

配置完成后，运行：

```bash
npx convex deploy
```

这次应该会部署到 `perceptive-mosquito-232`。

### 步骤 4：更新本地环境变量（可选）

如果你想在本地开发时也使用这个部署，更新 `.env.local`：

```bash
# .env.local
CONVEX_DEPLOYMENT=prod:perceptive-mosquito-232
VITE_CONVEX_URL=https://perceptive-mosquito-232.convex.cloud
```

### 步骤 5：更新 Vercel 环境变量

在 Vercel Dashboard：

1. 进入 **Settings** → **Environment Variables**
2. 更新 `VITE_CONVEX_URL` 为：
   ```
   https://perceptive-mosquito-232.convex.cloud
   ```
3. 保存并触发重新部署

## 验证部署

部署完成后：

1. 访问 Convex Dashboard，确认 `perceptive-mosquito-232` 中已部署所有函数
2. 访问 Vercel 部署的 URL，检查应用是否正常工作
3. 打开浏览器控制台，确认连接到 `perceptive-mosquito-232.convex.cloud`

## 注意事项

- `perceptive-mosquito-232` 是新项目，数据库是空的
- 如果需要初始化类别数据，应用会自动调用 `seed:initializeCategories` 函数
- 或者可以在 Convex Dashboard 中手动运行初始化函数
