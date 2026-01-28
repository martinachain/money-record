# 🔍 调试指南

## 网页无法显示 - 排查步骤

### 步骤 1：检查浏览器控制台

1. 打开浏览器开发者工具（F12 或 Cmd+Option+I）
2. 查看 **Console** 标签页
3. 查看是否有红色错误信息

**常见错误：**

- `缺少 VITE_CLERK_PUBLISHABLE_KEY` - 环境变量未加载
- `缺少 VITE_CONVEX_URL` - Convex URL 未配置
- `Cannot find module` - 导入路径错误
- `Convex functions ready` - Convex 未运行

### 步骤 2：检查终端输出

**左终端（Convex）：**
- 应该显示：`✓ Convex functions ready!`
- 如果有错误，会显示具体错误信息

**右终端（前端）：**
- 应该显示：`Local: http://localhost:5174/`
- 如果有编译错误，会显示在终端

### 步骤 3：检查环境变量

确认 `.env` 文件中有：
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_CONVEX_URL=https://clever-ibex-897.convex.cloud
```

### 步骤 4：重启服务器

如果修改了 `.env` 文件，需要重启前端服务器：

1. 在右终端按 `Ctrl+C` 停止服务器
2. 运行 `npm run dev` 重新启动

### 步骤 5：清除缓存

如果问题仍然存在：

1. 清除浏览器缓存（Cmd+Shift+R 强制刷新）
2. 或者在浏览器中打开无痕模式测试

## 🐛 常见问题

### 问题 1：白屏（没有任何内容）

**可能原因：**
- JavaScript 错误导致应用无法启动
- 检查浏览器控制台的错误信息

**解决方法：**
- 查看控制台错误
- 确认所有依赖已安装：`npm install`

### 问题 2：显示错误信息

**可能原因：**
- 环境变量缺失
- Convex 未运行
- 导入路径错误

**解决方法：**
- 检查 `.env` 文件
- 确认 Convex 正在运行
- 检查导入路径是否正确

### 问题 3：登录界面不显示

**可能原因：**
- Clerk 配置错误
- 环境变量未加载

**解决方法：**
- 检查 `VITE_CLERK_PUBLISHABLE_KEY` 是否正确
- 重启前端服务器

## 📝 需要的信息

如果问题仍然存在，请提供：

1. **浏览器控制台的错误信息**（截图或复制文本）
2. **终端输出的错误信息**（如果有）
3. **访问的 URL**（例如：http://localhost:5174）
4. **页面显示的内容**（白屏、错误信息等）
