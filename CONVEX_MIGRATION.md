# 迁移到 Convex 数据库指南

## 📋 迁移概述

将项目从 Prisma + Express 迁移到 Convex，Convex 提供：
- ✅ 实时数据库
- ✅ 自动生成的 API
- ✅ 内置认证集成（支持 Clerk）
- ✅ 类型安全的查询
- ✅ 无需管理服务器

## 🎯 迁移步骤

1. 安装 Convex 依赖
2. 初始化 Convex 项目
3. 创建 Convex schema
4. 创建 Convex functions（API）
5. 更新前端代码
6. 配置 Clerk 集成

## 📝 注意事项

- Convex 使用自己的数据库系统，不是 SQL
- Schema 定义方式不同（使用 Convex 的 v.* 类型）
- API 通过 Convex functions 实现，不是 Express 路由
- 前端使用 Convex React hooks 进行数据查询和更新
