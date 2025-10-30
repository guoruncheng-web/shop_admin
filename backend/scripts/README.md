# 脚本工具 (Scripts)

## 1. 为角色分配所有菜单权限

### 功能说明
`assign-all-menus-to-role-simple.ts` - 为指定角色分配该角色所属商户的所有菜单权限（使用原生SQL，性能更优）

### 使用方法

```bash
cd backend
npm run script:assign-menus <角色ID>
```

### 使用示例

```bash
# 为角色ID=1（平台超级管理员）分配所有菜单
npm run script:assign-menus 1

# 为角色ID=2分配所有菜单
npm run script:assign-menus 2
```

### 脚本功能

1. **查询角色信息**：根据角色ID查询角色基本信息和所属商户
2. **查询商户菜单**：获取该角色所属商户的所有菜单
3. **删除现有权限**：清空该角色现有的所有菜单权限关联
4. **批量分配权限**：将商户的所有菜单权限批量分配给该角色
5. **显示详细信息**：显示分配的菜单列表和操作结果

### 输出示例

```
✅ 数据库连接成功

📋 角色信息:
   角色ID: 1
   角色名称: 平台超级管理员
   商户ID: 1
   商户名称: 平台超级商户

📁 找到 67 个菜单

🗑️  删除了 67 条现有权限关联

✅ 成功为角色 "平台超级管理员" 分配了 67 个菜单权限

📝 已分配的菜单列表:
   1. 📂 系统管理 (ID: 1)
   2. 📂 商品管理 (ID: 2)
   3. 📄 角色管理 (ID: 3)
   4. 📄 用户管理 (ID: 4)
   ...

✨ 操作完成！

🔌 数据库连接已关闭
```

### 注意事项

1. 脚本会删除角色现有的所有菜单权限，然后重新分配
2. 确保数据库连接配置正确（读取 `.env.development` 文件）
3. 只会分配该角色所属商户的菜单，不会跨商户分配
4. 如果角色不存在或商户没有菜单，脚本会给出相应提示

### 图标说明

- 📂 目录级别菜单 (type=1)
- 📄 菜单级别 (type=2)
- 🔘 按钮级别 (type=3)

### 技术实现

- 使用原生SQL直接操作数据库，性能更优
- 自动处理角色-菜单关联关系
- 提供详细的操作日志和错误提示

---

## 2. SKU数据库表搭建

### 功能说明
`setup-sku-tables.ts` - 自动搭建完整的商品SKU数据库表结构，支持三级规格

### 使用方法

```bash
cd backend
npm run script:setup-sku
```

### 脚本功能

1. **检查商品分类表**：创建或验证 `categories` 表
2. **更新商品表**：为 `products` 表添加必要的SKU相关字段
   - merchant_id（商户ID）
   - product_no（商品编号）
   - original_price（原价）
   - sales（销量）
   - virtual_sales（虚拟销量）
   - unit（单位）
   - has_sku（是否有SKU）
   - sort（排序）
   - created_by、updated_by（创建人、更新人）
3. **创建SKU规格名称表**：`sku_spec_names` - 支持三级规格（颜色、尺寸、材质等）
4. **创建SKU规格值表**：`sku_spec_values` - 存储规格的具体值
5. **创建商品SKU表**：`product_skus` - 存储具体的SKU组合和库存信息

### 数据库表结构

#### 1. products（商品表）
- 存储商品基本信息
- 支持多商户隔离（merchant_id）
- 关联品牌和分类

#### 2. categories（商品分类表）
- 支持多级分类
- 商户独立管理分类

#### 3. sku_spec_names（SKU规格名称表）
- 支持三级规格层级
  - 一级规格：如颜色
  - 二级规格：如尺寸
  - 三级规格：如材质
- 通过 parent_id 建立规格层级关系

#### 4. sku_spec_values（SKU规格值表）
- 存储每个规格名称下的具体值
- 支持规格图片（如颜色图片）
- 支持颜色值（color_hex）
- 支持额外加价（extra_price）

#### 5. product_skus（商品SKU表）
- 存储具体的SKU组合
- 支持三级规格值组合（spec_value_id_1/2/3）
- 完整的库存管理（库存、锁定库存、预警库存）
- 价格管理（原价、售价、成本价）
- 支持条形码和二维码
- 软删除支持（deleted_at）

### 外键关系

```
merchants (商户表)
    ↓
products (商品表)
    ↓
sku_spec_names (规格名称表)
    ↓
sku_spec_values (规格值表)
    ↓
product_skus (SKU表)
```

所有表都通过 merchant_id 关联商户，实现多租户数据隔离。

### 输出示例

```
========================================
   SKU数据库表搭建脚本
========================================

✅ 数据库连接成功

📋 步骤 1: 检查商品分类表...
✅ 商品分类表检查完成

📋 步骤 2: 检查商品表字段...
  ✓ 添加 product_no 字段并生成编号
  ✓ 添加 original_price 字段
  ✓ 添加 sales 字段
  ✓ 添加 virtual_sales 字段
  ✓ 添加 unit 字段
  ✓ 添加 has_sku 字段
  ✓ 添加 sort 字段
  ✓ 添加 created_by 字段
  ✓ 添加 updated_by 字段
✅ 商品表字段检查完成

📋 步骤 3: 创建SKU规格名称表...
✅ SKU规格名称表创建完成

📋 步骤 4: 创建SKU规格值表...
✅ SKU规格值表创建完成

📋 步骤 5: 重新创建商品SKU表...
✅ 商品SKU表创建完成

📋 步骤 6: 验证表结构...
✅ 已创建的表:
   ✓ categories
   ✓ product_skus
   ✓ products
   ✓ sku_spec_names
   ✓ sku_spec_values

✨ SKU数据库表搭建完成！

📊 表结构总结:
   1. products - 商品表（已更新字段）
   2. categories - 商品分类表
   3. sku_spec_names - SKU规格名称表（三级规格）
   4. sku_spec_values - SKU规格值表
   5. product_skus - 商品SKU表（完整版）

🔌 数据库连接已关闭
```

### 注意事项

1. **数据安全**：脚本会重新创建 `product_skus` 表，请确保没有重要数据
2. **外键约束**：所有表都设置了外键约束，确保数据完整性
3. **多商户支持**：所有SKU相关表都关联 merchant_id，实现数据隔离
4. **级联删除**：删除商品时会自动删除相关的规格和SKU数据
5. **现有数据处理**：
   - 现有商品会自动生成 product_no（格式：PROD-00000001）
   - merchant_id 默认设置为 1（平台超级商户）

### 使用场景示例

#### 示例1：T恤商品的三级SKU
```
商品：经典款纯棉T恤
├─ 一级规格：颜色
│  ├─ 黑色
│  ├─ 白色
│  └─ 红色
├─ 二级规格：尺寸
│  ├─ S
│  ├─ M
│  ├─ L
│  └─ XL
└─ 三级规格：材质
   ├─ 纯棉
   └─ 棉麻

SKU组合示例：
- 黑色-M-纯棉（spec_value_id_1=1, spec_value_id_2=5, spec_value_id_3=8）
- 白色-L-棉麻（spec_value_id_1=2, spec_value_id_2=6, spec_value_id_3=9）
```

### 相关文档

- 详细字段设计：`/docs/商品SKU数据库字段设计.md`
- 数据库设计文档：`/docs/商品SKU数据库设计.md`
- SQL脚本：`/database/migrations/create_product_sku_tables.sql`

### 技术实现

- 使用原生SQL确保最佳性能
- 智能检测现有表结构，只添加缺失字段
- 自动为现有数据生成必要的默认值
- 完整的外键约束和索引优化
- 支持多租户数据隔离
