# 品牌管理模块 (Brand Management Module)

## 概述

品牌管理模块实现了多租户电商系统中的品牌管理功能，支持品牌的创建、查询、更新、删除以及批量操作。每个商户可以创建多个品牌，品牌需要经过认证后才能在客户端应用中显示。

## 功能特性

### 核心功能
- ✅ 品牌创建与管理
- ✅ 品牌认证状态管理
- ✅ 品牌热门状态管理
- ✅ 品牌标签系统
- ✅ 批量操作支持
- ✅ 分页查询与搜索
- ✅ 品牌统计分析

### 多租户支持
- 🏢 商户隔离：每个商户只能管理自己的品牌
- 🔒 权限控制：基于角色的细粒度权限管理
- 📊 数据隔离：确保跨商户数据安全

### 业务规则
- 🏷️ 品牌名称在商户范围内必须唯一
- 📋 品牌更新后需要重新认证
- 🔥 支持热门品牌标识
- 🏷️ 灵活的标签系统支持业务扩展

## 数据库结构

### 品牌表 (brands)

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | INT | 主键ID | AUTO_INCREMENT, PRIMARY KEY |
| merchantId | INT | 商户ID | FOREIGN KEY, NOT NULL |
| name | VARCHAR(255) | 品牌名称 | UNIQUE(merchantId, name), NOT NULL |
| iconUrl | TEXT | 品牌图标URL | NOT NULL |
| creator | INT | 创建者ID | FOREIGN KEY, NOT NULL |
| createTime | DATETIME | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| updateTime | DATETIME | 更新时间 | DEFAULT CURRENT_TIMESTAMP ON UPDATE |
| status | TINYINT | 状态 | DEFAULT 1 (0-禁用, 1-启用) |
| isAuth | TINYINT | 认证状态 | DEFAULT 0 (0-未认证, 1-已认证) |
| isHot | TINYINT | 热门状态 | DEFAULT 0 (0-普通, 1-热门) |
| label | JSON | 标签数组 | DEFAULT NULL |

### 索引设计
- PRIMARY KEY (`id`)
- UNIQUE KEY `uniq_merchant_brand` (`merchantId`, `name`)
- INDEX `idx_merchant_status` (`merchantId`, `status`)
- INDEX `idx_merchant_auth` (`merchantId`, `isAuth`)
- INDEX `idx_merchant_hot` (`merchantId`, `isHot`)
- INDEX `idx_creator` (`creator`)

## API 接口

### 基础 CRUD 操作

#### 1. 获取品牌列表 (分页)
```
GET /brands
```
**权限标识**: `system:brands:view`

**查询参数**:
- `page` (number): 页码，默认 1
- `limit` (number): 每页数量，默认 10
- `name` (string): 品牌名称模糊搜索
- `status` (number): 状态过滤 (0-禁用, 1-启用)
- `isAuth` (number): 认证状态过滤 (0-未认证, 1-已认证)
- `isHot` (number): 热门状态过滤 (0-普通, 1-热门)
- `label` (string): 标签过滤

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "items": [...],
    "meta": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
}
```

#### 2. 获取所有品牌 (不分页)
```
GET /brands/all
```
**权限标识**: `system:brands:viewAll`

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "id": 1,
      "name": "苹果",
      "iconUrl": "https://...",
      "status": 1,
      "isAuth": 1,
      "isHot": 1,
      "label": ["premium", "popular"]
    }
  ]
}
```

#### 3. 获取品牌详情
```
GET /brands/:id
```
**权限标识**: `system:brands:detail`

#### 4. 创建品牌
```
POST /brands
```
**权限标识**: `system:brands:add`

**请求体**:
```json
{
  "name": "新品牌",
  "iconUrl": "https://example.com/icon.png",
  "label": ["new", "featured"]
}
```

#### 5. 更新品牌
```
PUT /brands/:id
```
**权限标识**: `system:brands:edit`

**请求体**:
```json
{
  "name": "更新后的品牌名",
  "iconUrl": "https://example.com/new-icon.png",
  "label": ["updated", "featured"]
}
```

#### 6. 删除品牌
```
DELETE /brands/:id
```
**权限标识**: `system:brands:delete`

### 批量操作

#### 7. 批量更新状态
```
PUT /brands/batch/status
```
**权限标识**: `system:brands:batchStatus`

**请求体**:
```json
{
  "ids": [1, 2, 3],
  "status": 1
}
```

#### 8. 批量更新认证状态
```
PUT /brands/batch/auth
```
**权限标识**: `system:brands:batchAuth`

**请求体**:
```json
{
  "ids": [1, 2, 3],
  "isAuth": 1
}
```

### 统计分析

#### 9. 获取品牌统计
```
GET /brands/statistics
```
**权限标识**: `system:brands:statistics`

**响应示例**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "total": 100,
    "enabled": 80,
    "disabled": 20,
    "authenticated": 60,
    "unauthenticated": 40,
    "hot": 10,
    "normal": 90
  }
}
```

## 权限标识说明

| 权限标识 | 说明 | 操作 |
|----------|------|------|
| `system:brands:view` | 查看品牌列表 | 分页查询、搜索 |
| `system:brands:viewAll` | 查看所有品牌 | 获取所有品牌（不分页） |
| `system:brands:detail` | 查看品牌详情 | 获取单个品牌信息 |
| `system:brands:add` | 创建品牌 | 新增品牌 |
| `system:brands:edit` | 编辑品牌 | 更新品牌信息 |
| `system:brands:delete` | 删除品牌 | 删除品牌 |
| `system:brands:batchStatus` | 批量更新状态 | 批量启用/禁用 |
| `system:brands:batchAuth` | 批量认证 | 批量认证操作 |
| `system:brands:statistics` | 查看统计 | 品牌统计分析 |

## 业务逻辑

### 品牌创建
1. 验证品牌名称在商户范围内的唯一性
2. 自动设置创建者为当前登录用户
3. 自动设置创建时间和更新时间
4. 默认状态为启用，认证状态为未认证
5. 记录操作日志

### 品牌更新
1. 验证品牌属于当前商户
2. 更新时自动重置认证状态为未认证
3. 自动更新更新时间
4. 记录操作日志

### 品牌删除
1. 验证品牌属于当前商户
2. **检查品牌是否被商品引用**（外键约束检查）
   - 查询 `products` 表中是否有商品使用该品牌
   - 如果存在关联商品，返回 400 错误并提示商品数量
   - 必须先删除或转移关联商品才能删除品牌
3. 物理删除品牌记录
4. 记录操作日志

**删除失败示例**：
```json
{
  "code": 400,
  "message": "该品牌下还有 5 个商品，无法删除。请先删除或转移这些商品。"
}
```

### 批量操作
1. 验证所有品牌ID都属于当前商户
2. 批量更新状态或认证状态
3. 记录批量操作日志

## 错误处理

### 常见错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 400 | 请求参数错误 | 检查请求参数格式和必填字段 |
| 401 | 未授权 | 检查登录状态和Token有效性 |
| 403 | 权限不足 | 检查用户权限配置 |
| 404 | 资源不存在 | 确认品牌ID是否正确 |
| 409 | 名称重复 | 更换品牌名称后重试 |
| 500 | 服务器内部错误 | 检查服务器日志 |

### 错误响应格式
```json
{
  "code": 400,
  "message": "品牌名称已存在",
  "data": null,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 使用示例

### 创建品牌
```javascript
// 请求
POST /api/brands
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "小米",
  "iconUrl": "https://example.com/mi-logo.png",
  "label": ["chinese", "tech"]
}

// 响应
{
  "code": 200,
  "message": "品牌创建成功",
  "data": {
    "id": 1,
    "name": "小米",
    "iconUrl": "https://example.com/mi-logo.png",
    "status": 1,
    "isAuth": 0,
    "isHot": 0,
    "label": ["chinese", "tech"],
    "merchantId": 1,
    "creator": 1,
    "createTime": "2024-01-01T00:00:00.000Z",
    "updateTime": "2024-01-01T00:00:00.000Z"
  }
}
```

### 搜索品牌
```javascript
// 请求
GET /api/brands?name=小米&status=1&page=1&limit=10
Authorization: Bearer <token>

// 响应
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "小米",
        "iconUrl": "https://example.com/mi-logo.png",
        "status": 1,
        "isAuth": 0,
        "isHot": 0,
        "label": ["chinese", "tech"]
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

## 测试

### 运行测试
```bash
# 运行所有测试
npm run test:brands

# 或者使用测试脚本
node test-runner.js

# 或者直接运行API测试
chmod +x test-brands-api.sh
./test-brands-api.sh
```

### 测试覆盖
- ✅ 品牌创建测试
- ✅ 品牌查询测试
- ✅ 品牌更新测试
- ✅ 品牌删除测试
- ✅ 批量操作测试
- ✅ 权限验证测试
- ✅ 错误处理测试

## 部署说明

### 数据库迁移
```bash
# 运行迁移
npm run migration:run

# 回滚迁移
npm run migration:revert
```

### 环境变量
确保在 `.env` 文件中配置了必要的数据库连接信息。

### 权限配置
在角色管理系统中为相应的角色分配品牌管理权限。

## 更新日志

### v1.0.0 (2024-01-01)
- ✅ 初始版本发布
- ✅ 完整的CRUD功能
- ✅ 多租户支持
- ✅ 批量操作功能
- ✅ 统计分析功能
- ✅ 完整的权限控制

## 技术栈

- **框架**: NestJS
- **数据库**: MySQL
- **ORM**: TypeORM
- **语言**: TypeScript
- **验证**: class-validator
- **文档**: Swagger
- **测试**: Jest

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证。