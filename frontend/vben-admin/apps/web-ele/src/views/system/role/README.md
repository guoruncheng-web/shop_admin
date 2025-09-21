# 角色管理模块

## 功能概述

角色管理模块提供了完整的角色管理功能，包括角色的增删改查、状态管理和权限分配。

## 主要功能

### 1. 角色列表管理
- ✅ 角色列表展示（支持分页）
- ✅ 角色搜索（按名称、状态筛选）
- ✅ 角色状态切换（启用/禁用）
- ✅ 角色删除（支持确认提示）

### 2. 角色表单操作
- ✅ 新增角色
- ✅ 编辑角色
- ✅ 表单验证（角色名称、编码格式验证）
- ✅ 角色编码唯一性（编辑时禁用编码修改）

### 3. 权限分配
- ✅ 权限树形展示
- ✅ 权限类型标识（菜单、按钮、接口）
- ✅ 批量权限操作（全选、取消全选、展开/收起）
- ✅ 权限分配保存

## 文件结构

```
src/views/system/role/
├── index.vue                           # 角色管理主页面
├── components/
│   ├── PermissionTree.vue              # 权限树组件
│   └── RolePermissionDialog.vue        # 权限分配弹窗
└── README.md                           # 说明文档
```

## API 接口

### 角色相关接口
- `GET /roles` - 获取角色列表
- `GET /roles/all` - 获取所有角色（不分页）
- `GET /roles/:id` - 获取角色详情
- `POST /roles` - 创建角色
- `PUT /roles/:id` - 更新角色
- `DELETE /roles/:id` - 删除角色
- `POST /roles/batch-delete` - 批量删除角色
- `PUT /roles/:id/toggle-status` - 切换角色状态

### 权限相关接口
- `GET /permissions/tree` - 获取权限树形结构
- `GET /roles/:id/permissions` - 获取角色权限
- `POST /roles/:id/permissions` - 分配角色权限

## 使用示例

### 1. 基本使用

```vue
<template>
  <div>
    <!-- 直接使用角色管理页面 -->
    <SystemRole />
  </div>
</template>

<script setup>
import SystemRole from '@/views/system/role/index.vue'
</script>
```

### 2. 权限树组件单独使用

```vue
<template>
  <PermissionTree
    :permissions="permissions"
    :checked-permissions="checkedPermissions"
    @change="handlePermissionChange"
  />
</template>

<script setup>
import PermissionTree from '@/views/system/role/components/PermissionTree.vue'

const permissions = ref([])
const checkedPermissions = ref([])

function handlePermissionChange(checkedKeys, checkedNodes) {
  console.log('选中的权限:', checkedKeys)
}
</script>
```

### 3. 权限分配弹窗使用

```vue
<template>
  <RolePermissionDialog
    v-model:visible="dialogVisible"
    :role-id="currentRoleId"
    :role-name="currentRoleName"
    @success="handleSuccess"
  />
</template>

<script setup>
import RolePermissionDialog from '@/views/system/role/components/RolePermissionDialog.vue'

const dialogVisible = ref(false)
const currentRoleId = ref()
const currentRoleName = ref('')

function handleSuccess() {
  console.log('权限分配成功')
}
</script>
```

## 数据格式

### 角色数据格式

```typescript
interface Role {
  id: number
  name: string          // 角色名称
  code: string          // 角色编码
  description?: string  // 角色描述
  status: number        // 状态：1-启用，0-禁用
  createdAt: string     // 创建时间
  updatedAt: string     // 更新时间
  permissions?: Permission[]  // 关联的权限
}
```

### 权限数据格式

```typescript
interface Permission {
  id: number
  name: string                    // 权限名称
  code: string                    // 权限编码
  type: 'menu' | 'button' | 'api' // 权限类型
  parentId?: number               // 父权限ID
  children?: Permission[]         // 子权限
}
```

## 样式定制

组件使用了 Element Plus 的主题样式，可以通过 CSS 变量进行定制：

```scss
.role-management {
  // 自定义表格样式
  .el-table {
    --el-table-border-color: #e5e7eb;
  }
  
  // 自定义按钮样式
  .header-actions {
    .el-button {
      --el-button-border-radius: 6px;
    }
  }
}
```

## 注意事项

1. **权限验证**：确保用户有相应的权限才能访问角色管理功能
2. **数据验证**：角色编码必须唯一，建议在后端进行验证
3. **级联删除**：删除角色时需要考虑关联的用户和权限
4. **状态管理**：禁用角色时，关联用户的权限也会受到影响

## 扩展功能

可以根据业务需求扩展以下功能：

- 角色复制功能
- 角色导入/导出
- 权限模板管理
- 角色使用统计
- 操作日志记录