# 直接部署到 perceptive-mosquito-232

## 问题说明

Convex CLI 默认会将 `lovable-wildebeest-703` 识别为生产环境，但你想使用 `perceptive-mosquito-232` 作为生产环境。

## 解决方案：直接部署到指定部署

### 方法 1：使用环境变量强制部署到指定部署（推荐）

```bash
cd "/Users/martinachain/Desktop/money record/money-record"

# 临时设置环境变量，强制部署到 perceptive-mosquito-232
CONVEX_DEPLOYMENT=prod:perceptive-mosquito-232 npx convex deploy
```

### 方法 2：先设置环境变量，再部署

```bash
cd "/Users/martinachain/Desktop/money record/money-record"

# 设置环境变量
export CONVEX_DEPLOYMENT=prod:perceptive-mosquito-232

# 然后部署
npx convex deploy
```

### 方法 3：更新 .env.local 文件

编辑 `.env.local` 文件，将：

```bash
CONVEX_DEPLOYMENT=dev:perceptive-mosquito-232
```

改为：

```bash
CONVEX_DEPLOYMENT=prod:perceptive-mosquito-232
```

然后运行：

```bash
npx convex deploy
```

## 如果仍然提示部署到 lovable-wildebeest-703

如果 CLI 仍然询问是否部署到 `lovable-wildebeest-703`，选择 `n`（否），然后：

1. **检查 Convex Dashboard**
   - 访问 https://dashboard.convex.dev
   - 确认 `perceptive-mosquito-232` 项目存在
   - 查看项目设置，确认部署配置

2. **或者直接使用部署 URL**
   - 如果 `perceptive-mosquito-232` 已经存在并且可以访问
   - 直接在 Vercel 中设置 `VITE_CONVEX_URL=https://perceptive-mosquito-232.convex.cloud`
   - 然后手动在 Convex Dashboard 中部署函数

## 最简单的方法

如果你确定要使用 `perceptive-mosquito-232`，最简单的方法是：

1. **在终端选择 `n`**（不部署到 `lovable-wildebeest-703`）

2. **更新 `.env.local`**：
   ```bash
   CONVEX_DEPLOYMENT=prod:perceptive-mosquito-232
   VITE_CONVEX_URL=https://perceptive-mosquito-232.convex.cloud
   ```

3. **重新运行部署**：
   ```bash
   npx convex deploy
   ```

4. **如果还是提示部署到 `lovable-wildebeest-703`，选择 `n`**

5. **在 Convex Dashboard 中手动部署**：
   - 访问 https://dashboard.convex.dev
   - 选择 `perceptive-mosquito-232` 项目
   - 在 Functions 页面手动触发部署

## 重要提示

- `perceptive-mosquito-232` 是新项目，数据库是空的
- 部署后，应用会自动初始化类别数据（通过 `seed:initializeCategories`）
- 确保 Vercel 的 `VITE_CONVEX_URL` 设置为 `https://perceptive-mosquito-232.convex.cloud`
