# 权限模块使用说明

## 概述

本权限模块实现了基于角色的权限控制系统，支持菜单权限验证和操作日志记录功能。

## 核心组件

### 1. 权限装饰器 (`@Types`)

用于验证用户权限并记录操作日志的装饰器。

```typescript
import { Types } from '../auth/decorators/types.decorator';

@Types('system:menu:create', { 
  name: '创建菜单', 
  module: 'menu',
  operation: 'create',
  includeParams: true 
})
async createMenu() {
  // 业务逻辑
}
```

#### 参数说明

- `permission`: 权限标识符，必须全局唯一
- `name`: 操作描述，用于日志记录
- `module`: 模块名称（可选）
- `operation`: 操作类型（可选）
- `includeParams`: 是否记录请求参数（可选，默认true）
- `includeResponse`: 是否记录响应数据（可选）

### 2. 权限守卫 (`TypesGuard`)

验证用户是否有访问特定接口的权限。

```typescript
import { TypesGuard } from '../auth/guards/types.guard';

@Controller('menus')
@UseGuards(JwtAuthGuard, TypesGuard)
export class MenusController {
  // 控制器方法
}
```

### 3. 操作日志拦截器 (`OperationLogInterceptor`)

自动记录带有 `@Types` 装饰器的接口的操作日志。

```typescript
import { OperationLogInterceptor } from '../common/interceptors/operation-log.interceptor';

// 在 app.module.ts 中注册
{
  provide: APP_INTERCEPTOR,
  useClass: OperationLogInterceptor,
}
```

## 使用步骤

### 1. 在控制器方法上添加权限装饰器

```typescript
import { Types } from '../auth/decorators/types.decorator';
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TypesGuard } from '../auth/guards/types.guard';

@Controller('menus')
@UseGuards(JwtAuthGuard, TypesGuard)
export class MenusController {
  
  @Get()
  @Types('system:menu:view', { 
    name: '查看菜单列表', 
    module: 'menu',
    operation: 'view' 
  })
  findAll() {
    // 查询菜单列表
  }
  
  @Post()
  @Types('system:menu:create', { 
    name: '创建菜单', 
    module: 'menu',
    operation: 'create',
    includeParams: true 
  })
  create() {
    // 创建菜单
  }
  
  @Put(':id')
  @Types('system:menu:update', { 
    name: '更新菜单', 
    module: 'menu',
    operation: 'update' 
  })
  update() {
    // 更新菜单
  }
  
  @Delete(':id')
  @Types('system:menu:delete', { 
    name: '删除菜单', 
    module: 'menu',
    operation: 'delete' 
  })
  remove() {
    // 删除菜单
  }
}
```

### 2. 确保用户有相应的权限

用户权限通过角色分配，在用户登录时会获取用户的权限列表。

### 3. 权限验证流程

1. 用户请求带有JWT token的接口
2. `JwtAuthGuard` 验证token有效性
3. `TypesGuard` 检查用户是否有相应权限
4. 权限验证通过后，`OperationLogInterceptor` 记录操作日志
5. 执行业务逻辑

## 权限标识规范

权限标识采用 `模块:操作:子操作` 的格式，例如：

- `system:menu:view` - 查看菜单
- `system:menu:create` - 创建菜单
- `system:menu:update` - 更新菜单
- `system:menu:delete` - 删除菜单
- `user:manage:create` - 创建用户
- `user:manage:update` - 更新用户

## 操作日志

操作日志会自动记录以下信息：

- 用户ID和用户名
- 操作模块和类型
- 操作描述
- 请求方法和路径
- 请求参数（可选）
- 响应数据（可选）
- IP地址和用户代理
- 执行时间和状态
- 错误信息（如果有）

## 多商户支持

数据库表已添加 `merchant_id` 字段，支持多商户数据隔离：

- `menus` - 菜单表
- `roles` - 角色表
- `users` - 用户表
- `resource_categories` - 资源分类表
- `resources` - 资源表
- `operation_logs` - 操作日志表

## 测试

运行测试脚本验证权限模块功能：

```bash
# 运行TypeScript版本
npm run test:permission

# 或直接运行
node dist/scripts/test-permission-module.js
```

## 注意事项

1. 权限标识必须全局唯一
2. 装饰器应该在 `@UseGuards` 之前使用
3. 操作日志会异步记录，不会影响接口响应时间
4. 敏感参数（如密码、token）会自动过滤
5. 响应数据过大时会自动截断

## 示例权限配置

```typescript
// 系统管理权限
const SYSTEM_PERMISSIONS = [
  'system:menu:view',
  'system:menu:create',
  'system:menu:update',
  'system:menu:delete',
  'system:role:view',
  'system:role:create',
  'system:role:update',
  'system:role:delete',
  'system:user:view',
  'system:user:create',
  'system:user:update',
  'system:user:delete'
];

// 商品管理权限
const PRODUCT_PERMISSIONS = [
  'product:view',
  'product:create',
  'product:update',
  'product:delete',
  'category:view',
  'category:create',
  'category:update',
  'category:delete'
];
```

## 错误处理

当用户没有相应权限时，会返回403状态码和错误信息：

```json
{
  "statusCode": 403,
  "message": "你当前没有操作权限"
}
```

当用户未登录或token无效时，会返回401状态码：

```json
{
  "statusCode": 401,
  "message": "无效的访问令牌"
}