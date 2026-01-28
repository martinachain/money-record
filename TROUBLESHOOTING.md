# 🔧 故障排查指南

## 当前问题：React Hooks 错误

### 已修复的问题

1. ✅ **修复了所有 useQuery 调用**
   - 使用 `Array.isArray()` 检查而不是 `|| []`
   - 正确处理 `undefined` 情况

2. ✅ **添加了错误边界**
   - 捕获并显示错误信息
   - 提供重新加载选项

3. ✅ **修复了导入路径**
   - 所有 Convex 导入添加了 `.js` 扩展名
   - 使用 `import type` 导入类型

### 如果问题仍然存在

#### 步骤 1：清除缓存并重启

1. **停止所有服务器**（两个终端都按 Ctrl+C）

2. **清除缓存**：
```bash
cd "/Users/martinachain/Desktop/money record/money-record"
rm -rf node_modules/.vite
rm -rf dist
```

3. **重新启动**：
   - 终端 1：`npx convex dev`
   - 终端 2：`npm run dev`

4. **清除浏览器缓存**：
   - 按 `Cmd+Shift+R` 强制刷新
   - 或打开无痕模式测试

#### 步骤 2：检查依赖

```bash
npm install
```

#### 步骤 3：检查 Convex 连接

确认左终端显示：
```
✓ Convex functions ready!
```

#### 步骤 4：检查环境变量

确认 `.env` 文件中有：
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_CONVEX_URL=https://clever-ibex-897.convex.cloud
```

### 常见错误及解决方法

#### 错误：Invalid hook call

**原因：**
- React 版本不匹配
- Hooks 在组件外部调用
- 多个 React 实例

**解决方法：**
1. 检查 `package.json` 中的 React 版本
2. 确保所有 hooks 都在组件顶层调用
3. 运行 `npm install` 重新安装依赖

#### 错误：WebSocket 连接失败

**原因：**
- Vite HMR 连接问题
- 端口冲突

**解决方法：**
1. 重启前端服务器
2. 检查端口是否被占用
3. 尝试使用不同的端口：`npm run dev -- --port 5175`

#### 错误：500 Internal Server Error

**原因：**
- Convex functions 有错误
- 导入路径错误

**解决方法：**
1. 检查 Convex 终端是否有错误
2. 确认所有 functions 已正确部署
3. 检查导入路径是否正确

### 调试步骤

1. **打开浏览器控制台**（F12）
2. **查看错误信息**
3. **检查网络标签** - 查看哪些请求失败
4. **检查终端输出** - 查看服务器日志

### 如果仍然无法解决

请提供：
1. 浏览器控制台的完整错误信息
2. Convex 终端的输出
3. 前端终端的输出
4. 访问的 URL
