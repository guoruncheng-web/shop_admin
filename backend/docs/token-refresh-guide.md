# Token自动刷新机制使用指南

## 概述

本系统实现了JWT Token的自动刷新机制，确保用户在活跃期间不会因为Token过期而被强制登出。

## 功能特性

### 1. 自动刷新机制
- **触发条件**：Token在24小时内即将过期
- **刷新方式**：通过响应头自动返回新Token
- **无感知刷新**：用户无需手动操作

### 2. 手动刷新接口
- **接口地址**：`POST /api/v1/auth/refresh`
- **请求头**：`Authorization: Bearer <current_token>`
- **响应格式**：
```json
{
  "code": 200,
  "data": {
    "accessToken": "new_token_here",
    "expiresIn": "7d"
  },
  "msg": "令牌刷新成功"
}
```

## 实现原理

### 1. 拦截器自动刷新
```typescript
// TokenRefreshInterceptor
- 检查请求头中的Authorization
- 解码JWT Token获取过期时间
- 如果24小时内过期，自动生成新Token
- 在响应头中返回新Token
```

### 2. 响应头信息
- `X-New-Token`: 新的访问令牌
- `X-Token-Refreshed`: 是否已刷新（true/false）

## 前端集成

### 1. 请求拦截器
```javascript
// 请求拦截器
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 2. 响应拦截器
```javascript
// 响应拦截器
axios.interceptors.response.use(
  response => {
    // 检查是否有新Token
    const newToken = response.headers['x-new-token'];
    const isRefreshed = response.headers['x-token-refreshed'];
    
    if (newToken && isRefreshed === 'true') {
      // 更新本地存储的Token
      localStorage.setItem('token', newToken);
      console.log('Token已自动刷新');
    }
    
    return response;
  },
  error => {
    if (error.response?.status === 401) {
      // Token过期，跳转到登录页
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 3. 手动刷新Token
```javascript
// 手动刷新Token
async function refreshToken() {
  try {
    const response = await axios.post('/api/v1/auth/refresh', {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.data.code === 200) {
      localStorage.setItem('token', response.data.data.accessToken);
      return response.data.data.accessToken;
    }
  } catch (error) {
    console.error('Token刷新失败:', error);
    // 跳转到登录页
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
}
```

## 配置说明

### 1. 环境变量配置
```env
# JWT配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# 刷新阈值（可选，默认24小时）
TOKEN_REFRESH_THRESHOLD=86400
```

### 2. 刷新阈值说明
- **默认值**：24小时（86400秒）
- **含义**：Token在过期前多少秒开始自动刷新
- **建议值**：
  - 开发环境：1小时（3600秒）
  - 生产环境：24小时（86400秒）

## 安全考虑

### 1. Token安全
- Token存储在HttpOnly Cookie中（推荐）
- 或存储在localStorage中（需要额外安全措施）
- 定期轮换JWT密钥

### 2. 刷新限制
- 只有即将过期的Token才会被刷新
- 防止无限刷新攻击
- 记录刷新日志用于审计

### 3. 异常处理
- Token解析失败时继续处理请求
- 刷新失败时返回401状态码
- 提供降级方案

## 测试方法

### 1. 测试自动刷新
```bash
# 1. 登录获取Token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456","captchaId":"xxx","captcha":"xxx"}'

# 2. 使用Token访问受保护接口
curl -X GET http://localhost:3000/api/v1/menus \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. 检查响应头是否包含新Token
```

### 2. 测试手动刷新
```bash
# 手动刷新Token
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 故障排除

### 1. 常见问题
- **Token不刷新**：检查Token是否真的即将过期
- **刷新失败**：检查JWT密钥配置
- **响应头缺失**：检查拦截器是否正确注册

### 2. 调试方法
```javascript
// 在拦截器中添加调试日志
console.log('Token refresh check:', {
  tokenExp: tokenExp,
  now: now,
  timeLeft: tokenExp - now,
  shouldRefresh: tokenExp - now < refreshThreshold
});
```

## 最佳实践

1. **前端实现**：使用axios拦截器自动处理Token刷新
2. **错误处理**：提供友好的错误提示和自动跳转
3. **用户体验**：确保刷新过程对用户透明
4. **监控告警**：监控Token刷新频率和失败率
5. **安全审计**：记录Token刷新日志用于安全分析
