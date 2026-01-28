# ✅ Convex 数据库迁移完成

## 📋 已完成的工作

1. ✅ **创建了 Convex Schema** (`convex/schema.ts`)
   - 定义了 categories、transactions、budgets 三个表
   - 配置了所有必要的索引

2. ✅ **创建了所有 Convex Functions**
   - `convex/categories.ts` - 类别管理
   - `convex/transactions.ts` - 交易记录管理
   - `convex/budgets.ts` - 预算管理
   - `convex/analytics.ts` - 数据分析

3. ✅ **配置了认证辅助函数**
   - `convex/authHelper.ts` - 统一的认证处理
   - 当前版本需要从客户端传递 userId（临时方案）
   - 配置 Convex 认证后可以改为自动获取

## 🚀 下一步操作

### 步骤 1：安装 Convex 依赖

```bash
cd "/Users/martinachain/Desktop/money record/money-record"
npm install convex
```

### 步骤 2：初始化 Convex 项目

```bash
npx convex dev
```

这会：
1. 提示登录/注册 Convex 账号
2. 创建 Convex 项目
3. 生成 `convex/_generated` 目录
4. 创建 `convex.json` 配置文件
5. 推送 schema 和 functions 到 Convex

### 步骤 3：配置 Clerk 集成（可选，但推荐）

Convex 支持 Clerk 认证，有两种方式：

#### 方式 A：使用 Convex 内置认证（推荐）

1. 在 Convex Dashboard 中配置 Clerk
2. 安装 Clerk 集成包：
```bash
npm install @convex-dev/auth-clerk
```

3. 更新 functions 以使用 `ctx.auth.getUserIdentity()`

#### 方式 B：临时方案（当前实现）

- 所有 functions 都接受 `userId` 参数
- 前端从 Clerk 获取 userId 后传递给 Convex
- 配置认证后可以移除这些参数

### 步骤 4：更新前端代码

需要将前端代码从 Express API 调用改为 Convex hooks：

1. 安装 Convex React 客户端：
```bash
npm install convex
```

2. 在 `src/main.tsx` 中添加 ConvexProvider：
```typescript
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

// 在 ClerkProvider 内包裹 ConvexProvider
<ClerkProvider publishableKey={PUBLISHABLE_KEY}>
  <ConvexProvider client={convex}>
    <App />
  </ConvexProvider>
</ClerkProvider>
```

3. 更新组件使用 Convex hooks：
   - `useQuery` 替代 `fetch` 获取数据
   - `useMutation` 替代 `fetch` 修改数据

### 步骤 5：环境变量配置

在 `.env` 文件中添加：

```env
VITE_CONVEX_URL=https://your-project.convex.cloud
```

这个 URL 会在运行 `npx convex dev` 后自动生成。

## 📝 重要说明

### 当前实现特点

1. **认证方式**：临时使用客户端传递 userId
   - 所有 functions 都接受 `userId` 参数
   - 前端需要从 Clerk 获取 userId 后传递

2. **数据格式**：
   - 日期使用时间戳（毫秒）存储
   - ID 使用 Convex 的 `Id<"tableName">` 类型

3. **查询方式**：
   - 使用 Convex 的索引进行查询
   - 支持实时更新（使用 `useQuery`）

### 配置认证后的改进

配置 Convex 认证后，可以：

1. 移除所有 `userId` 参数
2. 使用 `ctx.auth.getUserIdentity()` 自动获取用户
3. 更安全的认证机制

## 🔧 文件结构

```
convex/
├── schema.ts          # 数据库 schema
├── categories.ts      # 类别相关 functions
├── transactions.ts    # 交易记录相关 functions
├── budgets.ts         # 预算相关 functions
├── analytics.ts       # 数据分析相关 functions
├── auth.ts            # 认证相关（待配置）
└── authHelper.ts      # 认证辅助函数
```

## 📚 参考文档

- [Convex 文档](https://docs.convex.dev)
- [Convex + Clerk 集成](https://docs.convex.dev/auth/clerk)
- [Convex React Hooks](https://docs.convex.dev/client/react)
- [Convex 查询文档](https://docs.convex.dev/database/queries)

## ⚠️ 注意事项

1. **数据迁移**：如果需要迁移现有 Prisma 数据，需要编写迁移脚本
2. **类型安全**：Convex 会自动生成类型，使用 `convex/_generated` 中的类型
3. **实时更新**：使用 `useQuery` 时，数据会自动实时更新
4. **开发模式**：`npx convex dev` 会监听文件变化并自动部署

## 🎯 完成检查清单

- [ ] 安装 Convex 依赖
- [ ] 运行 `npx convex dev` 初始化项目
- [ ] 确认 schema 已推送
- [ ] 确认 functions 已部署
- [ ] 配置环境变量 `VITE_CONVEX_URL`
- [ ] 更新前端代码使用 Convex hooks
- [ ] 测试所有功能
- [ ] （可选）配置 Convex 认证

完成以上步骤后，你的应用就完全迁移到 Convex 了！
