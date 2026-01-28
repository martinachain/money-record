# Clerk 登录功能集成说明

> 📖 **详细操作步骤请查看：`CLERK_SETUP_DETAILED.md`**

## 已完成的工作

1. ✅ 更新了 Prisma schema，添加了 `userId` 字段到 `Transaction` 和 `Budget` 模型
2. ✅ 在前端集成了 ClerkProvider 和登录/登出 UI
3. ✅ 在后端添加了 Clerk 认证中间件
4. ✅ 更新了所有 API 路由以根据用户 ID 过滤数据
5. ✅ 更新了前端组件以在 API 请求中包含认证 token

## 快速开始（简要步骤）

### 1. 安装依赖

由于网络问题，请手动运行以下命令安装 Clerk 依赖：

```bash
cd money-record
npm install @clerk/clerk-react @clerk/express
```

### 2. 创建 Clerk 应用

1. 访问 [Clerk Dashboard](https://dashboard.clerk.com)
2. 创建一个新应用（如果还没有）
3. 在应用设置中获取以下密钥：
   - **Publishable Key** (以 `pk_` 开头)
   - **Secret Key** (以 `sk_` 开头)

### 3. 配置环境变量

#### 开发环境

在项目根目录创建 `.env` 文件（如果不存在），添加以下内容：

```env
# Clerk 认证配置
CLERK_PUBLISHABLE_KEY=pk_test_你的publishable_key
CLERK_SECRET_KEY=sk_test_你的secret_key

# 前端环境变量（Vite）
VITE_CLERK_PUBLISHABLE_KEY=pk_test_你的publishable_key
```

#### 生产环境

在部署平台（如 Vercel、Zeabur）的环境变量设置中添加：
- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `VITE_CLERK_PUBLISHABLE_KEY`

### 4. 运行数据库迁移

由于更新了 Prisma schema，需要运行迁移：

```bash
# 生成 Prisma Client
npx prisma generate

# 如果是 SQLite，运行迁移
npx prisma migrate dev --name add_user_id

# 如果是 PostgreSQL，运行迁移
npx prisma migrate deploy
```

**注意**：如果数据库中已有数据，迁移可能会失败，因为 `userId` 字段是必需的。你需要：
1. 先备份数据
2. 或者先让 `userId` 字段可选，迁移后再更新数据

### 5. 配置 Clerk 回调 URL

在 Clerk Dashboard 中配置以下回调 URL：

- **开发环境**：
  - Sign-in redirect URL: `http://localhost:5173`
  - Sign-up redirect URL: `http://localhost:5173`
  
- **生产环境**：
  - Sign-in redirect URL: `https://你的域名`
  - Sign-up redirect URL: `https://你的域名`

### 6. 测试

1. 启动开发服务器：
   ```bash
   npm run dev
   ```

2. 启动后端服务器：
   ```bash
   npm run server
   ```

3. 访问应用，应该会看到登录界面
4. 注册/登录后，应该能看到记账功能

## 注意事项

1. **数据隔离**：每个用户只能看到和操作自己的交易记录和预算
2. **类别共享**：类别（Category）是所有用户共享的，不需要用户过滤
3. **认证要求**：除了获取类别列表外，所有其他 API 都需要认证
4. **Token 传递**：前端所有 API 请求都会自动包含认证 token

## 故障排除

### 问题：登录后仍然显示登录界面

- 检查 `VITE_CLERK_PUBLISHABLE_KEY` 是否正确设置
- 检查浏览器控制台是否有错误

### 问题：API 请求返回 401 未授权

- 检查后端 `CLERK_SECRET_KEY` 是否正确设置
- 检查前端是否正确传递了 Authorization header

### 问题：数据库迁移失败

- 如果已有数据，需要先处理现有数据
- 可以考虑先让 `userId` 字段可选，迁移后再更新

## 下一步

集成完成后，你可以：
1. 自定义 Clerk 的登录界面样式
2. 添加更多用户信息字段
3. 实现用户设置页面
4. 添加数据导出功能
