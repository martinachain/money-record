# ⚠️ 重要项目规则

## 项目信息

- **项目名称**: `money-manager-backend-04f8b`
- **项目类型**: 独立的 Convex 项目（资金管理）
- **项目路径**: `/Users/martinachain/Desktop/money record/money-record`

## 🚫 严禁操作

1. **严禁将本项目的代码部署到以下项目：**
   - ❌ `time-manager` 项目
   - ❌ `app` 项目
   - ❌ 任何其他项目

2. **严禁修改其他项目的文件：**
   - ❌ 不要修改 `time-manager` 项目的任何文件
   - ❌ 不要修改 `app` 项目的任何文件

## ✅ 允许操作

1. **Convex 函数修改：**
   - ✅ 只能修改本文件夹下的 `convex/schema.ts`
   - ✅ 只能修改本项目的 Convex 函数文件

2. **部署命令：**
   - ✅ 运行 `npx convex deploy` 前，必须确认使用本文件夹下的 `.env.local`
   - ✅ 确认 `CONVEX_DEPLOYMENT` 指向 `money-manager-backend-04f8b` 项目
   - ✅ 确认部署目标是 `lovable-wildebeest-703`（资金管理生产环境）

## 📋 部署前检查清单

运行任何 Convex 部署命令前，必须：

1. ✅ 确认当前目录是 `/Users/martinachain/Desktop/money record/money-record`
2. ✅ 检查 `.env.local` 中的 `CONVEX_DEPLOYMENT` 配置
3. ✅ 确认项目名称包含 `money-manager-backend-04f8b`
4. ✅ 确认部署目标不是 `time-manager` 或 `app` 项目
5. ✅ 运行 `npx convex deploy` 时，检查终端显示的部署目标

## 🔍 如何验证部署目标

运行 `npx convex deploy` 时，终端会显示：

```
You're currently developing against your dev deployment ...
Your prod deployment <部署名称> serves traffic at: VITE_CONVEX_URL=https://...
```

**必须确认：**
- 部署名称对应的是 `money-manager-backend-04f8b` 项目
- 不是 `time-manager` 或 `app` 项目

## 📝 当前正确配置

### `.env.local`

```bash
CONVEX_DEPLOYMENT=prod:lovable-wildebeest-703
VITE_CONVEX_URL=https://lovable-wildebeest-703.convex.cloud
```

### 项目对应关系

- **资金管理项目** (`money-manager-backend-04f8b`):
  - 生产环境: `lovable-wildebeest-703` ✅
  - URL: `https://lovable-wildebeest-703.convex.cloud` ✅

- **时间管理项目** (`time-manager`):
  - 生产环境: `scintillating-canary-269`
  - URL: `https://scintillating-canary-269.convex.cloud`
  - ⚠️ **不要部署到这个项目**

## 🎯 记住

- 这个项目是 **独立的** Convex 项目
- 必须与其他项目（`time-manager`、`app`）**完全分离**
- 所有操作必须在本项目目录下进行
- 部署前必须验证目标项目
