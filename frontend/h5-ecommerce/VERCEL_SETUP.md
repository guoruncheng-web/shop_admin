# Vercel 快速部署指南

## 📦 一键部署（Mock 模式）

### 最简单的方式 - 零配置部署

1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 点击 **Deploy** 按钮
4. 等待部署完成
5. ✅ 完成！网站已经可以使用了

**不需要任何环境变量配置**，系统会自动启用 Mock 模式。

## 🎯 验证部署

部署完成后：

1. 访问你的 Vercel 网站
2. 进入登录页面
3. 你会看到提示：`💡 演示模式：输入任意手机号和密码即可登录`
4. 输入任意内容，例如：
   - 手机号: `13800138000`
   - 密码: `123456`
5. 点击登录，成功！

## 🔍 查看 Mock 日志

打开浏览器开发者工具（F12），在 Console 中可以看到：

```
[mock] enabled
🚀 发送请求: POST /auth/login
✅ 响应成功: 200 /auth/login
```

这表示 Mock 已经成功拦截并处理了登录请求。

## ⚙️ 可选配置

### 场景 1: 强制启用 Mock

如果你想确保在所有环境都使用 Mock：

在 Vercel 项目设置 → Environment Variables 添加：
```
NEXT_PUBLIC_ENABLE_MOCK=true
```

### 场景 2: 连接真实后端

如果你有自己的后端 API：

在 Vercel 项目设置 → Environment Variables 添加：
```
NEXT_PUBLIC_API_BASE_URL=https://your-api.com/api
```

此时 Mock 会自动禁用，所有请求发送到真实后端。

### 场景 3: 同时使用后端和 Mock

如果你想在配置了后端的情况下仍然使用 Mock（用于测试）：

```
NEXT_PUBLIC_API_BASE_URL=https://your-api.com/api
NEXT_PUBLIC_ENABLE_MOCK=true
```

这样 Mock 会继续拦截请求，不会发送到后端。

## 📊 环境变量优先级

系统按以下顺序判断是否启用 Mock：

1. ❌ `NEXT_PUBLIC_ENABLE_MOCK=false` → 强制禁用
2. ✅ `NEXT_PUBLIC_ENABLE_MOCK=true` → 强制启用
3. ✅ 开发环境 (`NODE_ENV=development`) → 自动启用
4. ✅ 未配置 `NEXT_PUBLIC_API_BASE_URL` → 自动启用
5. ❌ 已配置 `NEXT_PUBLIC_API_BASE_URL` → 自动禁用

## 🚀 重新部署

修改环境变量后，需要重新部署才能生效：

1. 进入 Vercel 项目 Dashboard
2. 点击 **Deployments** 标签
3. 找到最新的部署
4. 点击右侧的 **...** 菜单
5. 选择 **Redeploy**

或者，推送新的代码到 GitHub 也会触发重新部署。

## ❓ 常见问题

### Q: 登录没有反应？
A: 打开浏览器开发者工具，查看 Console 是否有 `[mock] enabled` 日志。如果没有，检查是否需要重新部署。

### Q: 看到网络错误？
A: 这说明 Mock 没有启用。检查是否配置了 `NEXT_PUBLIC_API_BASE_URL` 但后端不可用。解决方法：
- 删除 `NEXT_PUBLIC_API_BASE_URL` 环境变量
- 或添加 `NEXT_PUBLIC_ENABLE_MOCK=true`

### Q: 想要使用真实数据？
A: 需要搭建后端服务，或者修改 `src/mocks/index.ts` 中的 Mock 数据。

### Q: Mock 数据能修改吗？
A: 可以！编辑 `src/mocks/index.ts` 文件，修改 Mock 返回的数据，然后重新部署。

## 📝 总结

- ✅ **推荐做法**: 不配置任何环境变量，直接部署，自动使用 Mock
- ⚠️ **注意**: Vercel 上的环境变量修改后需要重新部署
- 🎉 **优势**: 无需后端即可完整展示前端功能