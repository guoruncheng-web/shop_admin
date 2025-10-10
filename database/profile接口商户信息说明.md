# `/auth/profile` 接口返回商户信息

## 修改说明

已更新 `/auth/profile` 接口，现在返回当前登录用户所属的商户完整信息。

## API 响应结构

### 请求
```http
GET /api/auth/profile
Authorization: Bearer <access_token>
```

### 响应示例
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "username": "admin",
    "realName": "管理员",
    "email": "admin@example.com",
    "phone": "13800138000",
    "avatar": "https://example.com/avatar.jpg",
    "merchantId": 1,
    "merchant": {
      "id": 1,
      "merchantCode": "SUPER_MERCHANT",
      "merchantName": "平台超级商户",
      "merchantType": 1,
      "status": 1,
      "logo": null,
      "description": "平台超级商户，拥有最高权限",
      "certificationStatus": 2,
      "maxProducts": 999999,
      "maxAdmins": 999,
      "maxStorage": 107374182400,
      "createdAt": "2025-10-09 17:18:30",
      "updatedAt": "2025-10-09 17:18:30"
    },
    "roles": ["super_admin"],
    "permissions": ["system:*", "product:*"],
    "roleInfo": [
      {
        "id": 1,
        "name": "超级管理员",
        "code": "super_admin",
        "description": "拥有所有权限"
      }
    ],
    "menus": [...]
  },
  "msg": "获取成功"
}
```

## 新增字段说明

### merchantId
- **类型**: `number`
- **说明**: 用户所属商户ID
- **示例**: `1`

### merchant
- **类型**: `object | null`
- **说明**: 商户详细信息对象

#### merchant 对象字段

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `id` | number | 商户ID | `1` |
| `merchantCode` | string | 商户编码 | `"SUPER_MERCHANT"` |
| `merchantName` | string | 商户名称 | `"平台超级商户"` |
| `merchantType` | number | 商户类型<br>1-超级商户(平台)<br>2-普通商户 | `1` |
| `status` | number | 状态<br>0-禁用<br>1-启用<br>2-冻结 | `1` |
| `logo` | string\|null | 商户Logo URL | `null` |
| `description` | string\|null | 商户描述 | `"平台超级商户，拥有最高权限"` |
| `certificationStatus` | number | 认证状态<br>0-未认证<br>1-审核中<br>2-已认证<br>3-认证失败 | `2` |
| `maxProducts` | number | 最大商品数量配额 | `999999` |
| `maxAdmins` | number | 最大管理员数量配额 | `999` |
| `maxStorage` | number | 最大存储空间(字节) | `107374182400` |
| `createdAt` | string | 商户创建时间 | `"2025-10-09 17:18:30"` |
| `updatedAt` | string | 商户更新时间 | `"2025-10-09 17:18:30"` |

## 代码修改位置

### 1. Backend Service 层
**文件**: `/backend/src/modules/menus/services/menus.service.ts`

```typescript
async getFullUserProfile(userId: number): Promise<any> {
  // 查询用户及其角色、权限、商户信息
  const user = await this.adminRepository.findOne({
    where: { id: userId },
    relations: ['roles', 'roles.permissions', 'merchant'], // 新增 'merchant' 关联
  });

  // ...

  // 组装商户信息
  const merchant = user.merchant ? {
    id: user.merchant.id,
    merchantCode: user.merchant.merchantCode,
    merchantName: user.merchant.merchantName,
    merchantType: user.merchant.merchantType,
    status: user.merchant.status,
    logo: user.merchant.logo,
    description: user.merchant.description, // 新增
    certificationStatus: user.merchant.certificationStatus,
    maxProducts: user.merchant.maxProducts,
    maxAdmins: user.merchant.maxAdmins,
    maxStorage: user.merchant.maxStorage,
    createdAt: user.merchant.createdAt, // 新增
    updatedAt: user.merchant.updatedAt, // 新增
  } : null;

  return {
    // ... 其他字段
    merchantId: user.merchantId, // 新增
    merchant, // 新增
    // ...
  };
}
```

### 2. API Controller 层
**文件**: `/backend/src/auth/auth.controller.ts`

更新了 Swagger API 文档，添加了 `merchantId` 和 `merchant` 字段的描述。

## 使用场景

### 1. 前端获取商户信息

```typescript
// stores/merchant.ts
import { defineStore } from 'pinia';
import { getUserProfile } from '@/api/auth';

export const useMerchantStore = defineStore('merchant', {
  state: () => ({
    merchantId: null as number | null,
    merchantInfo: null as any,
    isSuperMerchant: false,
  }),

  actions: {
    async loadMerchantInfo() {
      const { data } = await getUserProfile();

      this.merchantId = data.merchantId;
      this.merchantInfo = data.merchant;
      this.isSuperMerchant = data.merchant?.merchantType === 1;
    },

    canCreateProducts() {
      // 检查商品配额
      return this.merchantInfo?.maxProducts > 0;
    },

    getStorageLimit() {
      // 获取存储空间限制
      return this.merchantInfo?.maxStorage || 0;
    }
  }
});
```

### 2. 权限判断

```typescript
// 判断是否为超级商户管理员
const isSuperMerchant = computed(() => {
  return userStore.merchant?.merchantType === 1;
});

// 根据商户类型显示不同功能
if (isSuperMerchant.value) {
  // 显示商户管理菜单
  showMerchantManagement();
}
```

### 3. 配额提示

```vue
<template>
  <div class="quota-info">
    <div>商品配额: {{ usedProducts }} / {{ merchant?.maxProducts }}</div>
    <div>管理员配额: {{ usedAdmins }} / {{ merchant?.maxAdmins }}</div>
    <div>存储空间: {{ formatBytes(usedStorage) }} / {{ formatBytes(merchant?.maxStorage) }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const merchant = computed(() => userStore.merchant);

const formatBytes = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
};
</script>
```

## 数据库验证

### 验证 admin-merchant 关联

```sql
SELECT
    a.id,
    a.username,
    a.merchant_id,
    m.merchant_name,
    m.merchant_type,
    m.merchant_code
FROM admins a
LEFT JOIN merchants m ON a.merchant_id = m.id;
```

### 结果示例
```
id | username | merchant_id | merchant_name  | merchant_type | merchant_code
---|----------|-------------|----------------|---------------|---------------
1  | admin    | 1           | 平台超级商户   | 1             | SUPER_MERCHANT
2  | test     | 1           | 平台超级商户   | 1             | SUPER_MERCHANT
```

## 注意事项

1. **商户信息为空的情况**
   - 如果用户未关联商户，`merchant` 字段将为 `null`
   - `merchantId` 仍会返回，值为数据库中的默认值

2. **超级商户特权**
   - `merchantType = 1` 表示超级商户（平台）
   - 超级商户拥有跨商户查询和管理权限
   - 普通商户 `merchantType = 2`，只能管理自己的数据

3. **配额限制**
   - `maxProducts`: 商品数量上限
   - `maxAdmins`: 管理员数量上限
   - `maxStorage`: 存储空间上限(字节)
   - 超级商户通常设置为极大值(999999, 999, 100GB等)

4. **前端缓存建议**
   - 登录后立即获取并缓存商户信息
   - 存储在 Pinia/Vuex 等状态管理中
   - 在需要时可以直接使用，避免重复请求

## 相关文档

- [多商户平台设计文档](/database/多商户平台设计文档.md)
- [Entity 关系说明](/backend/src/modules/merchants/entities/merchant.entity.ts)
- [API 文档](http://localhost:3000/api/docs)

## 测试

### cURL 测试
```bash
# 1. 获取验证码
CAPTCHA=$(curl -s http://localhost:3000/api/auth/captcha)
CAPTCHA_ID=$(echo $CAPTCHA | jq -r '.data.captchaId')

# 2. 获取验证码文本（调试用）
DEBUG=$(curl -s http://localhost:3000/api/auth/captcha/debug)
CAPTCHA_TEXT=$(echo $DEBUG | jq -r ".data[] | select(.id==\"$CAPTCHA_ID\") | .text")

# 3. 登录
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"admin\",
    \"password\": \"admin123\",
    \"captchaId\": \"$CAPTCHA_ID\",
    \"captcha\": \"$CAPTCHA_TEXT\"
  }" | jq -r '.data.accessToken')

# 4. 获取用户信息（包含商户）
curl -s http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN" | jq
```

## 更新日志

- **2025-10-10 v2**: 完善商户信息字段
  - merchant对象新增 `description` 字段（商户描述）
  - merchant对象新增 `createdAt` 字段（创建时间）
  - merchant对象新增 `updatedAt` 字段（更新时间）
  - 更新 API 文档和示例代码

- **2025-10-10 v1**: 初始版本，添加商户信息返回
  - 新增 `merchantId` 字段
  - 新增 `merchant` 对象，包含商户详细信息
  - 更新 API 文档
