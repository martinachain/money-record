# Vercel 部署配置指南

## 问题说明

Vercel 上部署的版本出现 500 错误，原因是：
1. 旧的 `api/` 目录被配置为 Serverless Functions
2. 这些 API 依赖 Prisma 数据库，但在 Vercel 上未正确配置
3. 现在已迁移到 Convex，不再需要这些 API 路由

## 已修复的配置

### 1. vercel.json
- ✅ 移除了 `api/**/*.ts` 的 Serverless Functions 配置
- ✅ 移除了 Prisma 生成步骤
- ✅ 添加了 SPA 路由重写规则

### 2. package.json
- ✅ 移除了 build 命令中的 `prisma generate`

## Vercel 环境变量配置

在 Vercel Dashboard 中配置以下环境变量：

### 必需的环境变量

1. **VITE_CLERK_PUBLISHABLE_KEY**
   - 从 Clerk Dashboard 获取
   - 格式：`pk_test_...` 或 `pk_live_...`

2. **VITE_CONVEX_URL**
   - 从 Convex Dashboard 获取
   - 格式：`https://your-project.convex.cloud`
   - 运行 `npx convex dev` 后会在 `.env.local` 中生成

### 可选的环境变量（如果后端仍在使用）

- `CLERK_SECRET_KEY` - 仅当需要后端验证时使用

## 部署步骤

1. **确保代码已提交**
   ```bash
   git add .
   git commit -m "fix: update Vercel config for Convex migration"
   git push origin main
   ```

2. **在 Vercel Dashboard 配置环境变量**
   - 进入项目设置 → Environment Variables
   - 添加 `VITE_CLERK_PUBLISHABLE_KEY`
   - 添加 `VITE_CONVEX_URL`

3. **重新部署**
   - Vercel 会自动检测到新的推送并重新部署
   - 或手动点击 "Redeploy"

## 验证部署

部署成功后，检查：

1. ✅ 浏览器控制台没有 `/api/...` 的 500 错误
2. ✅ 类别数据正常加载
3. ✅ 交易记录可以正常添加和查看
4. ✅ 预算设置页面正常显示

## 注意事项

- `api/` 目录仍然保留在代码库中，但不会被 Vercel 部署为 Serverless Functions
- 如果需要完全移除旧 API，可以删除 `api/` 目录（但建议先备份）
- Convex 的 API 调用是通过前端直接调用，不需要 Serverless Functions
