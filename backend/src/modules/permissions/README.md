# 权限管理模块

## 功能概述

权限管理模块提供了完整的权限管理功能，包括权限的增删改查、权限树形结构展示和角色权限分配。

## API 接口

### 权限管理接口

#### 1. 获取权限树形结构
```
GET /api/permissions/tree
```

**响应示例：**
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "name": "系统管理",
      "code": "system",
      "type": "menu",
      "children": [
        {
          "id": 11,
          "name": "用户管理",
          "code": "system:user",
          "type": "menu",
          "parentId": 1,
          "children": [
            {
              "id": 111,
              "name": "查看用户",
              "code": "system:user:view",
              "type": "button",
              "parentId": 11
            }
          ]
        }
      ]
    }
  ],
  "msg": "获取成功"
}
```

#### 2. 分页查询权限列表
```
GET /api/permissions?page=1&pageSize=10&name=用户&status=1
```

#### 3. 获取权限详情
```
GET /api/permissions/:id
```

#### 4. 创建权限
```
POST /api/permissions
Content-Type: application/json

{
  "name": "权限名称",
  "code": "permission:code",
  "description": "权限描述",
  "type": "menu",
  "parentId": 1,
  "status": 1
}
```

#### 5. 更新权限
```
PUT /api/permissions/:id
Content-Type: application/json

{
  "name": "更新后的权限名称",
  "description": "更新后的权限描述"
}
```

#### 6. 删除权限
```
DELETE /api/permissions/:id
```

### 角色权限管理接口

#### 1. 获取角色权限列表
```
GET /api/roles/:id/permissions
```

**响应示例：**
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "name": "系统管理",
      "code": "system",
      "type": "menu"
    },
    {
      "id": 11,
      "name": "用户管理",
      "code": "system:user",
      "type": "menu"
    }
  ],
  "msg": "获取成功"
}
```

#### 2. 分配角色权限
```
POST /api/roles/:id/permissions
Content-Type: application/json

{
  "permissionIds": [1, 11, 111, 112, 113]
}
```

## 数据库结构

### 权限表 (permissions)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint | 权限ID |
| name | varchar(50) | 权限名称 |
| code | varchar(100) | 权限代码（唯一） |
| description | varchar(200) | 权限描述 |
| type | enum | 权限类型：menu-菜单，button-按钮，api-接口 |
| parent_id | bigint | 父权限ID |
| status | tinyint | 状态：0-禁用，1-启用 |
| created_at | timestamp | 创建时间 |
| updated_at | timestamp | 更新时间 |

### 角色权限关联表 (role_permissions)

| 字段 | 类型 | 说明 |
|------|------|------|
| role_id | bigint | 角色ID |
| permission_id | bigint | 权限ID |

## 权限类型说明

- **menu（菜单权限）**：控制用户可以访问的页面菜单
- **button（按钮权限）**：控制页面内的操作按钮显示
- **api（接口权限）**：控制后端API接口的访问权限

## 使用示例

### 1. 获取权限树
```typescript
const response = await fetch('/api/permissions/tree');
const { data } = await response.json();
console.log('权限树:', data);
```

### 2. 分配角色权限
```typescript
const roleId = 1;
const permissionIds = [1, 11, 111, 112];

const response = await fetch(`/api/roles/${roleId}/permissions`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ permissionIds }),
});

const result = await response.json();
console.log('分配结果:', result);
```

## 注意事项

1. **权限代码唯一性**：权限代码必须全局唯一
2. **层级关系**：权限支持多级层级结构
3. **级联删除**：删除权限时需要考虑子权限和关联角色
4. **权限验证**：建议在前端和后端都进行权限验证

## 初始化数据

运行以下 SQL 脚本来初始化权限数据：

```sql
-- 执行迁移脚本
source database/migrations/20250920_add_permission_fields.sql
```

这将创建完整的权限体系，包括：
- 系统管理权限
- 商品管理权限  
- 订单管理权限
- 超级管理员角色