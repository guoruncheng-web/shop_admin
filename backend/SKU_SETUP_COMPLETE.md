# SKU数据库表搭建完成报告

## ✅ 完成状态

SKU数据库表结构已成功搭建完成！所有表、字段、索引和外键约束均已正确创建。

## 📊 已创建的表

### 1. products（商品表）
**状态**: ✅ 已更新
- 新增字段：merchant_id, product_no, original_price, sales, virtual_sales, unit, has_sku, sort, created_by, updated_by
- 外键关联：merchants, brands, categories
- 现有数据已自动生成 product_no（格式：PROD-00000001）
- 所有现有商品默认归属平台超级商户（merchant_id=1）

### 2. categories（商品分类表）
**状态**: ✅ 已创建
- 支持多级分类树结构
- 每个商户独立管理分类
- 包含分类图标、图片、描述等完整信息

### 3. sku_spec_names（SKU规格名称表）
**状态**: ✅ 已创建
- 支持三级规格层级（spec_level: 1/2/3）
  - 一级规格：如颜色
  - 二级规格：如尺寸
  - 三级规格：如材质
- 通过 parent_id 建立父子关系
- 唯一约束：同一商品下规格名称+级别不能重复

### 4. sku_spec_values（SKU规格值表）
**状态**: ✅ 已创建
- 存储每个规格名称的具体值
- 支持规格图片（image）
- 支持颜色值（color_hex）
- 支持额外加价（extra_price）
- 支持默认值设置（is_default）
- 唯一约束：同一规格名称下值不能重复

### 5. product_skus（商品SKU表）
**状态**: ✅ 已重新创建
- 支持三级规格值组合（spec_value_id_1/2/3）
- 规格文本存储（spec_text: 如"红色-XL-纯棉"）
- 规格JSON存储（spec_json: {"颜色":"红色","尺寸":"XL"}）
- 完整的库存管理：
  - stock（可用库存）
  - lock_stock（锁定库存）
  - warning_stock（预警库存）
- 完整的价格管理：
  - original_price（原价）
  - price（售价）
  - cost_price（成本价）
- 支持条形码（barcode）和二维码（qr_code）
- 软删除支持（deleted_at）
- 唯一约束：同一商品下规格组合不能重复

## 🔗 外键关系

```
merchants（商户表）
    ↓
    ├─→ products（商品表）
    ├─→ categories（分类表）
    ├─→ sku_spec_names（规格名称表）
    ├─→ sku_spec_values（规格值表）
    └─→ product_skus（SKU表）

products（商品表）
    ↓
    ├─→ sku_spec_names（规格名称表）ON DELETE CASCADE
    ├─→ sku_spec_values（规格值表）ON DELETE CASCADE
    └─→ product_skus（SKU表）ON DELETE CASCADE

sku_spec_names（规格名称表）
    ↓
    └─→ sku_spec_values（规格值表）ON DELETE CASCADE

sku_spec_values（规格值表）
    ↓
    └─→ product_skus（SKU表）
        ├─ spec_value_id_1
        ├─ spec_value_id_2
        └─ spec_value_id_3
```

## 📋 外键约束验证

已验证的外键约束（共10条）：

### product_skus 表（5条外键）
1. ✅ merchant_id → merchants.id
2. ✅ product_id → products.id
3. ✅ spec_value_id_1 → sku_spec_values.id
4. ✅ spec_value_id_2 → sku_spec_values.id
5. ✅ spec_value_id_3 → sku_spec_values.id

### sku_spec_names 表（2条外键）
1. ✅ merchant_id → merchants.id
2. ✅ product_id → products.id (ON DELETE CASCADE)

### sku_spec_values 表（3条外键）
1. ✅ merchant_id → merchants.id
2. ✅ spec_name_id → sku_spec_names.id (ON DELETE CASCADE)
3. ✅ product_id → products.id (ON DELETE CASCADE)

## 🎯 核心特性

### 1. 多租户支持
- 所有表都包含 merchant_id 字段
- 通过外键关联到 merchants 表
- 实现完全的数据隔离

### 2. 三级规格系统
- 灵活的规格层级设计
- 支持任意规格组合
- 规格值可重复使用

### 3. 完整的库存管理
- 实时库存跟踪
- 锁定库存机制（订单未支付）
- 库存预警功能

### 4. 级联删除保护
- 删除商品时自动删除相关规格和SKU
- 防止脏数据残留

### 5. 数据完整性
- 唯一约束防止重复数据
- 外键约束保证数据一致性
- 索引优化查询性能

## 📝 使用示例

### 示例：创建一个T恤商品的SKU

```sql
-- 1. 创建商品
INSERT INTO products (merchant_id, brand_id, category_id, product_name, product_no, price, has_sku)
VALUES (1, 1, 1, '经典款纯棉T恤', 'PROD-20250001', 99.00, 1);
-- 假设 product_id = 1

-- 2. 创建一级规格：颜色
INSERT INTO sku_spec_names (merchant_id, product_id, spec_name, spec_level, sort)
VALUES (1, 1, '颜色', 1, 1);
-- 假设 spec_name_id = 1

INSERT INTO sku_spec_values (merchant_id, product_id, spec_name_id, spec_value, sort)
VALUES
  (1, 1, 1, '黑色', 1),
  (1, 1, 1, '白色', 2),
  (1, 1, 1, '红色', 3);
-- 假设 value_ids: 1-黑色, 2-白色, 3-红色

-- 3. 创建二级规格：尺寸
INSERT INTO sku_spec_names (merchant_id, product_id, spec_name, spec_level, parent_id, sort)
VALUES (1, 1, '尺寸', 2, 1, 2);
-- 假设 spec_name_id = 2

INSERT INTO sku_spec_values (merchant_id, product_id, spec_name_id, spec_value, sort)
VALUES
  (1, 1, 2, 'S', 1),
  (1, 1, 2, 'M', 2),
  (1, 1, 2, 'L', 3),
  (1, 1, 2, 'XL', 4);
-- 假设 value_ids: 4-S, 5-M, 6-L, 7-XL

-- 4. 创建三级规格：材质
INSERT INTO sku_spec_names (merchant_id, product_id, spec_name, spec_level, parent_id, sort)
VALUES (1, 1, '材质', 3, 2, 3);
-- 假设 spec_name_id = 3

INSERT INTO sku_spec_values (merchant_id, product_id, spec_name_id, spec_value, sort)
VALUES
  (1, 1, 3, '纯棉', 1),
  (1, 1, 3, '棉麻', 2);
-- 假设 value_ids: 8-纯棉, 9-棉麻

-- 5. 创建SKU组合
INSERT INTO product_skus (
  merchant_id, product_id, sku_no,
  spec_value_id_1, spec_value_id_2, spec_value_id_3,
  spec_text, spec_json,
  price, stock, status
) VALUES (
  1, 1, 'SKU-20250001-001',
  1, 5, 8,
  '黑色-M-纯棉', '{"颜色":"黑色","尺寸":"M","材质":"纯棉"}',
  99.00, 100, 1
);
```

### 常用查询示例

```sql
-- 查询商品的所有SKU规格
SELECT
  sn.spec_name,
  sn.spec_level,
  sv.spec_value,
  sv.image,
  sv.color_hex
FROM sku_spec_names sn
JOIN sku_spec_values sv ON sn.id = sv.spec_name_id
WHERE sn.product_id = 1
ORDER BY sn.spec_level, sn.sort, sv.sort;

-- 查询商品的所有SKU列表
SELECT
  ps.id,
  ps.sku_no,
  ps.spec_text,
  ps.price,
  ps.stock,
  ps.sales,
  sv1.spec_value as color,
  sv2.spec_value as size,
  sv3.spec_value as material
FROM product_skus ps
LEFT JOIN sku_spec_values sv1 ON ps.spec_value_id_1 = sv1.id
LEFT JOIN sku_spec_values sv2 ON ps.spec_value_id_2 = sv2.id
LEFT JOIN sku_spec_values sv3 ON ps.spec_value_id_3 = sv3.id
WHERE ps.product_id = 1 AND ps.deleted_at IS NULL
ORDER BY ps.id;

-- 查询特定规格组合的SKU
SELECT * FROM product_skus
WHERE product_id = 1
  AND spec_value_id_1 = 1  -- 黑色
  AND spec_value_id_2 = 5  -- M
  AND spec_value_id_3 = 8  -- 纯棉
  AND deleted_at IS NULL;

-- 统计商品总库存
SELECT SUM(stock) as total_stock
FROM product_skus
WHERE product_id = 1 AND status = 1 AND deleted_at IS NULL;
```

## 🛠️ 维护脚本

### 重新搭建SKU表
```bash
cd backend
npm run script:setup-sku
```

## 📚 相关文档

1. **数据库设计文档**
   - `/docs/商品SKU数据库设计.md` - 完整的设计说明
   - `/docs/商品SKU数据库字段设计.md` - 详细的字段说明

2. **SQL脚本**
   - `/database/migrations/create_product_sku_tables.sql` - 完整的创建脚本

3. **脚本工具**
   - `/backend/scripts/setup-sku-tables.ts` - 自动化搭建脚本
   - `/backend/scripts/README.md` - 脚本使用说明

## ⚠️ 注意事项

1. **数据安全**
   - product_skus 表在搭建时会被重新创建
   - 请在生产环境使用前备份数据

2. **外键约束**
   - 删除商品会级联删除所有相关的规格和SKU
   - 删除规格名称会级联删除相关的规格值
   - 请谨慎操作删除

3. **多商户隔离**
   - 所有查询都应该加上 merchant_id 条件
   - 确保不会跨商户查询数据

4. **库存管理**
   - 下单时需要锁定库存（lock_stock）
   - 支付成功后扣减实际库存
   - 订单取消后释放锁定库存

## 🎉 搭建完成时间

**完成时间**: 2025-10-31

**执行脚本**: `npm run script:setup-sku`

**执行结果**: ✅ 所有表创建成功，外键约束正确设置

---

## 下一步工作建议

1. ✅ 数据库表搭建完成
2. ⏭️ 创建 TypeORM Entity 实体类
3. ⏭️ 开发商品管理 API
4. ⏭️ 开发SKU规格管理 API
5. ⏭️ 开发库存管理 API
6. ⏭️ 前端页面开发
7. ⏭️ 测试用例编写

祝开发顺利！🚀
