# Convex 数据库迁移完整指南

## 📋 已完成的工作

✅ 创建了 Convex schema (`convex/schema.ts`)  
✅ 创建了所有 Convex functions（替代 Express API）  
✅ 配置了 Clerk 认证集成

## 🚀 下一步操作

### 步骤 1：安装 Convex 依赖

由于网络问题，请手动运行：

```bash
cd "/Users/martinachain/Desktop/money record/money-record"
npm install convex @convex-dev/auth
```

### 步骤 2：初始化 Convex 项目

```bash
npx convex dev
```

这会：
1. 提示你登录 Convex（如果没有账号，会引导注册）
2. 创建 Convex 项目
3. 生成 `convex/_generated` 目录
4. 创建 `convex.json` 配置文件

### 步骤 3：配置 Clerk 集成

在 Convex Dashboard 或通过命令行配置 Clerk：

```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN "your-clerk-domain.clerk.accounts.dev"
```

或者使用 Convex 的 Clerk 集成包：

1. 安装 Clerk 集成：
```bash
npm install @convex-dev/auth-clerk
```

2. 在 `convex/auth.config.ts` 中配置（需要创建此文件）

### 步骤 4：推送 Schema 和 Functions

```bash
npx convex dev
```

这会自动：
- 推送 schema 到 Convex
- 部署所有 functions
- 启动开发模式（监听文件变化）

### 步骤 5：更新前端代码

需要更新前端代码以使用 Convex 客户端而不是 Express API。

## 📝 重要说明

### Convex vs Prisma 的主要区别

1. **数据库类型**：
   - Prisma: SQL (SQLite/PostgreSQL)
   - Convex: NoSQL (文档数据库)

2. **Schema 定义**：
   - Prisma: `.prisma` 文件
   - Convex: TypeScript schema (`convex/schema.ts`)

3. **API**：
   - Prisma: Express 路由
   - Convex: Convex functions (query/mutation)

4. **前端集成**：
   - Prisma: fetch API
   - Convex: Convex React hooks (`useQuery`, `useMutation`)

### 数据迁移

如果需要迁移现有数据：

1. 导出 Prisma 数据为 JSON
2. 使用 Convex 的导入工具导入数据
3. 或者编写迁移脚本

## 🔧 配置 Clerk 认证

Convex 支持 Clerk 认证，需要配置：

1. 在 Convex Dashboard 中启用 Clerk 认证
2. 设置 Clerk JWT issuer domain
3. 更新前端代码以使用 Convex 的认证 hooks

## 📚 参考文档

- [Convex 文档](https://docs.convex.dev)
- [Convex + Clerk 集成](https://docs.convex.dev/auth/clerk)
- [Convex React Hooks](https://docs.convex.dev/client/react)
