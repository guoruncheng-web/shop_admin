# 部署指南

## Vercel 部署配置

### 1. Mock 模式部署（推荐，无需后端）

项目已集成 **axios-mock-adapter** 来模拟后端 API，无需真实后端即可运行。

#### 自动启用 Mock

在 Vercel 上部署时：

1. **不需要**配置任何环境变量
2. 系统会自动检测到没有后端配置，启用 Mock 模式
3. Mock 会拦截所有 API 请求并返回模拟数据
4. 用户可以输入任意手机号和密码登录

#### Mock 功能说明

Mock 提供以下 API 模拟：
- `POST /auth/login` - 登录接口（任意账号密码均可登录）
- `GET /auth/me` - 获取当前用户信息
- `GET /products` - 商品列表

所有数据都是前端模拟的，不会发送到真实服务器。

### 2. 连接真实后端

如果你有后端 API 服务：

#### 步骤 1：配置后端 API 地址

在 Vercel 项目设置中添加环境变量：
```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-api.com/api
```

#### 步骤 2：禁用 Mock（可选）

如果你想完全禁用 Mock，确保只使用真实后端：
```
NEXT_PUBLIC_ENABLE_MOCK=false
```

#### 步骤 3：后端要求

后端 API 需要：
1. 支持 CORS，允许来自 Vercel 域名的请求
2. 实现以下接口：
   - `POST /auth/login` - 登录接口
   - `GET /auth/me` - 获取当前用户信息
   - 其他业务接口...

### 3. 配置步骤

#### Vercel Dashboard 配置

1. 进入你的 Vercel 项目
2. 点击 "Settings" (设置)
3. 点击 "Environment Variables" (环境变量)
4. 添加新变量：
   - Key: `NEXT_PUBLIC_API_BASE_URL`
   - Value: 你的后端 API 地址
   - Environments: 选择 Production, Preview, Development

5. 重新部署项目

### 4. 本地开发配置

创建 `.env.local` 文件：

```bash
# 连接本地后端
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api

# 或者连接测试服务器
NEXT_PUBLIC_API_BASE_URL=https://test-api.example.com/api
```

### 5. Mock 启用逻辑

系统会按以下优先级决定是否启用 Mock：

1. **显式禁用**: `NEXT_PUBLIC_ENABLE_MOCK=false` → Mock 关闭
2. **显式启用**: `NEXT_PUBLIC_ENABLE_MOCK=true` → Mock 开启
3. **开发环境**: `NODE_ENV=development` → Mock 开启
4. **无后端配置**: 未设置 `NEXT_PUBLIC_API_BASE_URL` → Mock 开启
5. **有后端配置**: 设置了 `NEXT_PUBLIC_API_BASE_URL` → Mock 关闭

### 6. 演示登录功能

点击 "演示登录" 链接（位于登录按钮下方的注册提示中），可以直接使用演示模式登录，无需填写表单。

### 7. 故障排查

如果登录没有反应：

1. 打开浏览器开发者工具 (F12)
2. 查看 Console 标签页的错误信息
3. 查看 Network 标签页，检查 API 请求状态
4. 确认环境变量配置是否正确

常见问题：

- **CORS 错误**: 后端需要配置允许跨域请求
- **404 错误**: 检查 API 地址是否正确
- **超时错误**: 检查后端服务是否正常运行
- **无反应**: 检查是否在 Vercel 上配置了环境变量，或清除浏览器缓存重试