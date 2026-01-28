# Clerk 路径配置填写指南

## 📝 根据你的项目配置填写

你的前端应用运行在：**http://localhost:5173**

---

## 🔧 具体填写方法

### 1. Development host（开发主机）

**Fallback development host（后备开发主机）：**

```
http://localhost:5173
```

**说明：** 这是你的 Vite 开发服务器地址。

---

### 2. Application paths（应用程序路径）

#### Home URL（主页URL）

**左侧（$DEVHOST）：** 保持默认，不要修改

**右侧输入框：**

```
/
```

或者**留空**（如果应用在根目录）

**说明：** 因为你的应用在 `http://localhost:5173/`，所以填写 `/` 或留空都可以。

---

#### Unauthorized sign in URL（未经授权登录URL）

**左侧（$DEVHOST）：** 保持默认，不要修改

**右侧输入框：**

```
/
```

或者**留空**

**说明：** 当用户从未识别的设备登录时，重定向到主页。

---

### 3. Component paths（组件路径）

这部分通常包含 SignIn、SignUp、SignOut 等组件的路径。

#### Sign-in redirect URL（登录后重定向URL）

**左侧（$DEVHOST）：** 保持默认

**右侧输入框：**

```
/
```

**说明：** 用户登录成功后跳转到主页。

---

#### Sign-up redirect URL（注册后重定向URL）

**左侧（$DEVHOST）：** 保持默认

**右侧输入框：**

```
/
```

**说明：** 用户注册成功后跳转到主页。

---

#### After sign-out URL（登出后URL）

**左侧（$DEVHOST）：** 保持默认

**右侧输入框：**

```
/
```

**说明：** 用户登出后跳转到主页（会显示登录界面）。

---

## ✅ 完整配置示例

如果你的页面显示的是完整路径输入框（不是组合输入框），则填写：

- **Fallback development host:** `http://localhost:5173`
- **Home URL:** `http://localhost:5173` 或 `http://localhost:5173/`
- **Unauthorized sign in URL:** `http://localhost:5173` 或 `http://localhost:5173/`
- **Sign-in redirect URL:** `http://localhost:5173` 或 `http://localhost:5173/`
- **Sign-up redirect URL:** `http://localhost:5173` 或 `http://localhost:5173/`
- **After sign-out URL:** `http://localhost:5173` 或 `http://localhost:5173/`

---

## 🎯 简化配置（推荐）

如果页面支持，最简单的方式是：

1. **Fallback development host:** `http://localhost:5173`
2. **其他所有路径字段：** 留空或填写 `/`

这样 Clerk 会自动使用开发主机 + 路径。

---

## 💡 重要提示

1. **不要填写生产环境 URL**（除非你已经部署）
2. **所有路径都使用 `http://localhost:5173`**（开发环境）
3. **保存后需要重启开发服务器**才能生效
4. **如果将来部署到生产环境**，需要添加生产环境的 URL（如 `https://yourdomain.com`）

---

## 🔄 保存后测试

配置完成后：

1. 点击页面底部的 **"Save"** 或 **"Apply"** 按钮
2. 重启你的开发服务器：
   ```bash
   # 停止服务器（Ctrl+C）
   npm run dev
   ```
3. 访问 http://localhost:5173 测试登录功能
