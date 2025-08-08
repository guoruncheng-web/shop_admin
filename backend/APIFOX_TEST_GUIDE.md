# ApiFox 测试指南

## 🎯 验证码和登录接口测试

### 接口概览

| 接口 | 方法 | 路径 | 描述 |
|------|------|------|------|
| 获取验证码 | GET | `/api/v1/auth/captcha` | 获取图形验证码 |
| 管理员登录 | POST | `/api/v1/auth/login` | 使用验证码登录 |
| 退出登录 | POST | `/api/v1/auth/logout` | 清除用户会话 |

## 📋 测试步骤

### 1. 获取验证码

**请求信息：**
- **方法**: GET
- **URL**: `http://localhost:3000/api/v1/auth/captcha`
- **Headers**: 无特殊要求

**响应示例：**
```json
{
  "success": true,
  "code": 200,
  "message": "success",
  "data": {
    "captchaId": "c24d05a4-cd17-4842-ac17-8c1cc9934609",
    "captchaImage": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAsMCwxMjAsNDAiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmMGYwZjAiLz48dGV4dCB4PSI2MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+MTIzNDwvdGV4dD48L3N2Zz4=",
    "expiresIn": 300
  },
  "timestamp": "2025-08-08T05:49:16.286Z"
}
```

**重要信息：**
- `captchaId`: 验证码唯一标识，登录时需要提供
- `captchaImage`: Base64格式的验证码图片
- `expiresIn`: 验证码过期时间（秒）

### 2. 管理员登录

**请求信息：**
- **方法**: POST
- **URL**: `http://localhost:3000/api/v1/auth/login`
- **Headers**: 
  ```
  Content-Type: application/json
  ```

**请求体：**
```json
{
  "username": "admin",
  "password": "123456",
  "captcha": "1234",
  "captchaId": "c24d05a4-cd17-4842-ac17-8c1cc9934609"
}
```

**字段说明：**
- `username`: 用户名
- `password`: 密码
- `captcha`: 验证码（从图片中识别）
- `captchaId`: 验证码ID（从获取验证码接口获得）

**响应示例：**
```json
{
  "success": true,
  "code": 200,
  "message": "success",
  "data": {
    "success": true,
    "accessToken": "jwt_1_1733658556123",
    "user": {
      "id": 1,
      "username": "admin",
      "realName": "超级管理员",
      "roles": ["super_admin"]
    }
  },
  "timestamp": "2025-08-08T05:49:16.286Z"
}
```

### 3. 退出登录

**请求信息：**
- **方法**: POST
- **URL**: `http://localhost:3000/api/v1/auth/logout`
- **Headers**: 无特殊要求

**响应示例：**
```json
{
  "success": true,
  "code": 200,
  "message": "success",
  "data": {
    "success": true,
    "message": "退出成功"
  },
  "timestamp": "2025-08-08T05:49:16.286Z"
}
```

## 🔧 ApiFox 配置

### 1. 环境变量设置

在ApiFox中创建环境变量：

| 变量名 | 值 | 描述 |
|--------|----|------|
| `baseUrl` | `http://localhost:3000` | 基础URL |
| `apiPrefix` | `/api/v1` | API前缀 |

### 2. 全局Headers

```
Content-Type: application/json
```

### 3. 测试账号

| 用户名 | 密码 | 角色 |
|--------|----|------|
| `admin` | `123456` | 超级管理员 |
| `product_admin` | `123456` | 商品管理员 |

## 🎯 测试流程

### 完整登录测试流程

1. **获取验证码**
   - 调用 `GET /api/v1/auth/captcha`
   - 保存返回的 `captchaId`
   - 从 `captchaImage` 中识别验证码

2. **执行登录**
   - 调用 `POST /api/v1/auth/login`
   - 使用上一步的 `captchaId` 和识别的验证码
   - 保存返回的 `accessToken`

3. **验证登录结果**
   - 检查返回的用户信息
   - 验证 `accessToken` 是否存在

### 错误测试场景

1. **验证码错误**
   ```json
   {
     "username": "admin",
     "password": "123456",
     "captcha": "0000",
     "captchaId": "valid-captcha-id"
   }
   ```

2. **用户名密码错误**
   ```json
   {
     "username": "wrong_user",
     "password": "wrong_password",
     "captcha": "1234",
     "captchaId": "valid-captcha-id"
   }
   ```

3. **验证码过期**
   - 等待5分钟后使用旧的 `captchaId`

## 📊 响应状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 认证失败 |
| 500 | 服务器内部错误 |

## 🔍 调试技巧

### 1. 验证码识别
- 验证码图片是SVG格式，清晰度较高
- 验证码不区分大小写
- 验证码有效期为5分钟

### 2. 错误处理
- 验证码错误：`验证码错误或已过期`
- 用户名密码错误：`用户名或密码错误`

### 3. 日志查看
- 服务器控制台会显示详细的请求日志
- 包含请求参数、响应结果等信息

## 🚀 快速测试

### 使用curl测试

```bash
# 1. 获取验证码
curl -X GET "http://localhost:3000/api/v1/auth/captcha"

# 2. 登录（需要替换captchaId和captcha）
curl -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "123456",
    "captcha": "1234",
    "captchaId": "your-captcha-id"
  }'
```

---

**现在您可以在ApiFox中测试完整的登录流程了！**
