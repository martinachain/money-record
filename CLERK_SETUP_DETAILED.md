# Clerk 登录功能 - 详细操作步骤

## 📋 操作清单

按照以下步骤逐一完成：

- [ ] 步骤 1：安装 Clerk 依赖包
- [ ] 步骤 2：注册 Clerk 账号并创建应用
- [ ] 步骤 3：获取 Clerk 密钥
- [ ] 步骤 4：创建并配置 .env 文件
- [ ] 步骤 5：配置 Clerk 回调 URL
- [ ] 步骤 6：运行数据库迁移
- [ ] 步骤 7：测试登录功能

---

## 步骤 1：安装 Clerk 依赖包

打开终端，进入项目目录，运行：

```bash
cd "/Users/martinachain/Desktop/money record/money-record"
npm install @clerk/clerk-react @clerk/express
```

**预期结果**：看到类似 `added 2 packages` 的提示，表示安装成功。

**如果遇到网络问题**：
- 可以尝试使用国内镜像：`npm install --registry=https://registry.npmmirror.com @clerk/clerk-react @clerk/express`
- 或者使用 yarn：`yarn add @clerk/clerk-react @clerk/express`

---

## 步骤 2：注册 Clerk 账号并创建应用

### 2.1 注册账号

1. 打开浏览器，访问：https://dashboard.clerk.com
2. 点击右上角的 **"Sign Up"** 或 **"Sign In"**
3. 可以使用以下方式注册：
   - Google 账号
   - GitHub 账号
   - 邮箱注册

### 2.2 创建应用

1. 登录后，点击 **"Create Application"** 或 **"New Application"** 按钮
2. 填写应用信息：
   - **Application name**：输入 `money-record` 或任意名称
   - **Authentication options**：选择你需要的登录方式
     - ✅ Email（邮箱登录）- 推荐选择
     - ✅ Google（可选）
     - ✅ GitHub（可选）
   - 其他选项保持默认即可
3. 点击 **"Create"** 创建应用

---

## 步骤 3：获取 Clerk 密钥

创建应用后，你会自动进入应用的控制面板。

### 3.1 找到 API Keys

在左侧菜单中找到 **"API Keys"** 或 **"Configure"** → **"API Keys"**

### 3.2 复制密钥

你会看到两个密钥：

1. **Publishable Key**（公开密钥）
   - 格式：`pk_test_xxxxxxxxxxxxxxxxxxxxx`
   - 这个密钥可以安全地暴露在前端代码中
   - 点击右侧的复制按钮复制

2. **Secret Key**（秘密密钥）
   - 格式：`sk_test_xxxxxxxxxxxxxxxxxxxxx`
   - ⚠️ **重要**：这个密钥必须保密，只能在后端使用
   - 点击右侧的 **"Reveal"** 或 **"Show"** 按钮显示，然后复制

**保存这两个密钥**，下一步会用到。

---

## 步骤 4：创建并配置 .env 文件

### 4.1 检查是否已有 .env 文件

在项目根目录 `money-record` 下，检查是否存在 `.env` 文件：

```bash
cd "/Users/martinachain/Desktop/money record/money-record"
ls -la | grep .env
```

### 4.2 创建或编辑 .env 文件

**如果不存在 `.env` 文件**，创建它：

```bash
touch .env
```

**如果已存在 `.env` 文件**，直接编辑即可。

### 4.3 添加 Clerk 配置

打开 `.env` 文件，添加以下内容（**将 `你的密钥` 替换为步骤 3 中复制的实际密钥**）：

```env
# Clerk 认证配置
# 后端使用的密钥
CLERK_SECRET_KEY=sk_test_你的secret_key

# 前端使用的密钥（Vite 需要 VITE_ 前缀）
VITE_CLERK_PUBLISHABLE_KEY=pk_test_你的publishable_key
```

**示例**（不要直接复制，使用你自己的密钥）：

```env
CLERK_SECRET_KEY=sk_test_abcdefghijklmnopqrstuvwxyz1234567890
VITE_CLERK_PUBLISHABLE_KEY=pk_test_abcdefghijklmnopqrstuvwxyz1234567890
```

### 4.4 检查 .gitignore

确保 `.env` 文件在 `.gitignore` 中，避免将密钥提交到 Git：

```bash
cat .gitignore | grep .env
```

如果 `.env` 不在 `.gitignore` 中，添加它：

```bash
echo ".env" >> .gitignore
```

---

## 步骤 5：配置 Clerk 回调 URL

### 5.1 进入 Clerk 应用设置

在 Clerk Dashboard 中，点击左侧菜单的 **"Paths"** 或 **"Configure"** → **"Paths"**

### 5.2 配置开发环境回调 URL

找到以下字段并填写：

- **Sign-in redirect URL**：
  ```
  http://localhost:5173
  ```

- **Sign-up redirect URL**：
  ```
  http://localhost:5173
  ```

- **After sign-out URL**（可选）：
  ```
  http://localhost:5173
  ```

### 5.3 保存设置

点击页面底部的 **"Save"** 或 **"Apply"** 按钮保存。

**注意**：如果将来部署到生产环境，还需要添加生产环境的 URL（如 `https://yourdomain.com`）。

---

## 步骤 6：运行数据库迁移

### 6.1 检查当前数据库状态

首先检查是否有现有数据：

```bash
# 如果使用 SQLite
ls -la prisma/*.db 2>/dev/null || echo "数据库文件不存在"

# 如果使用 PostgreSQL，检查连接
# 查看 .env 中的 DATABASE_URL
```

### 6.2 备份现有数据（如果有）

**如果数据库中已有交易记录**，建议先备份：

```bash
# SQLite 备份
cp prisma/dev.db prisma/dev.db.backup 2>/dev/null || echo "无需备份"
```

### 6.3 生成 Prisma Client

```bash
npx prisma generate
```

**预期结果**：看到 `✔ Generated Prisma Client` 提示。

### 6.4 运行数据库迁移

**如果使用 SQLite**：

```bash
npx prisma migrate dev --name add_user_id
```

**如果使用 PostgreSQL**：

```bash
npx prisma migrate deploy
```

**预期结果**：看到迁移成功的提示。

### 6.5 处理迁移错误（如果遇到）

如果迁移失败，可能是因为现有数据没有 `userId`。有两个选择：

**选择 A：清空现有数据（开发环境推荐）**

```bash
# SQLite
rm prisma/dev.db
npx prisma migrate dev --name add_user_id
```

**选择 B：保留数据（需要手动处理）**

需要先让 `userId` 字段可选，迁移后再更新数据。如果需要，我可以帮你处理。

---

## 步骤 7：测试登录功能

### 7.1 启动后端服务器

打开第一个终端窗口：

```bash
cd "/Users/martinachain/Desktop/money record/money-record"
npm run server
```

**预期结果**：看到 `API server running at http://localhost:3001`

### 7.2 启动前端开发服务器

打开第二个终端窗口：

```bash
cd "/Users/martinachain/Desktop/money record/money-record"
npm run dev
```

**预期结果**：看到类似 `Local: http://localhost:5173` 的提示

### 7.3 访问应用

1. 打开浏览器，访问：http://localhost:5173

2. **预期看到**：
   - 一个登录界面
   - 有 "Sign in" 或 "Sign up" 按钮

3. **测试注册**：
   - 点击 "Sign up" 或 "Create account"
   - 输入邮箱和密码（或使用 Google/GitHub 登录）
   - 完成注册

4. **预期结果**：
   - 注册成功后自动登录
   - 看到记账应用的主界面
   - 右上角有用户头像/菜单（可以登出）

5. **测试功能**：
   - 尝试添加一条交易记录
   - 查看交易列表
   - 设置预算
   - 查看分析页面

### 7.4 测试登出

1. 点击右上角的用户头像
2. 点击 "Sign out" 或 "登出"
3. **预期结果**：回到登录界面

---

## ✅ 完成检查清单

完成以上步骤后，确认以下功能正常：

- [ ] 可以访问应用并看到登录界面
- [ ] 可以注册新账号
- [ ] 注册后自动登录并看到应用主界面
- [ ] 可以添加交易记录
- [ ] 可以查看交易列表
- [ ] 可以设置预算
- [ ] 可以查看分析数据
- [ ] 可以登出
- [ ] 登出后重新登录可以正常使用

---

## 🐛 常见问题排查

### 问题 1：启动时提示找不到模块

**错误信息**：`Cannot find module '@clerk/clerk-react'`

**解决方法**：
```bash
npm install @clerk/clerk-react @clerk/express
```

### 问题 2：登录界面不显示

**检查**：
1. 浏览器控制台（F12）是否有错误
2. `.env` 文件中的 `VITE_CLERK_PUBLISHABLE_KEY` 是否正确
3. 是否重启了开发服务器（修改 `.env` 后需要重启）

**解决方法**：
```bash
# 停止开发服务器（Ctrl+C）
# 重新启动
npm run dev
```

### 问题 3：API 请求返回 401 未授权

**检查**：
1. `.env` 文件中的 `CLERK_SECRET_KEY` 是否正确
2. 后端服务器是否正在运行
3. 浏览器控制台网络请求中是否包含 `Authorization` header

**解决方法**：
- 检查后端服务器日志
- 确认环境变量已正确加载

### 问题 4：数据库迁移失败

**错误信息**：`Field "userId" is required but missing`

**解决方法**：
- 如果是开发环境，可以删除数据库重新迁移
- 如果是生产环境，需要先处理现有数据

---

## 📞 需要帮助？

如果遇到问题：
1. 检查浏览器控制台（F12）的错误信息
2. 检查后端服务器的日志输出
3. 确认所有步骤都已正确完成
4. 查看 Clerk Dashboard 中的应用日志

---

## 🎉 完成！

完成以上所有步骤后，你的记账应用就已经集成了 Clerk 登录功能！

每个用户现在都有自己独立的：
- 交易记录
- 预算设置
- 分析数据

数据完全隔离，安全可靠！
