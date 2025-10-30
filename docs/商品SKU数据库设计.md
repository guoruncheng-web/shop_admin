# 商品SKU数据库设计文档 (三级规格)

## 目录
1. [概述](#概述)
2. [数据库表设计](#数据库表设计)
3. [三级SKU规格说明](#三级sku规格说明)
4. [业务场景示例](#业务场景示例)
5. [查询示例](#查询示例)
6. [最佳实践](#最佳实践)

---

## 概述

本设计支持**三级SKU规格**的电商商品管理系统，适用于服装、鞋类、家居等需要多维度规格的商品。

### 设计特点
- ✅ 支持三级规格嵌套（如：颜色 > 尺寸 > 材质）
- ✅ 灵活的规格配置，每个商品可以有不同的规格组合
- ✅ 支持规格图片（如颜色可以有预览图）
- ✅ 独立的SKU库存、价格管理
- ✅ 多商户隔离
- ✅ 完整的约束和索引优化

---

## 数据库表设计

### 1. 商品表 (products)

商品基础信息表，存储商品的公共属性。

```sql
CREATE TABLE `products` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `merchant_id` BIGINT NOT NULL COMMENT '商户ID',
  `brand_id` BIGINT NULL COMMENT '品牌ID',
  `category_id` BIGINT NOT NULL COMMENT '分类ID',
  `product_name` VARCHAR(200) NOT NULL COMMENT '商品名称',
  `product_no` VARCHAR(100) UNIQUE NOT NULL COMMENT '商品编号',
  `subtitle` VARCHAR(500) NULL COMMENT '副标题',
  `main_image` VARCHAR(500) NULL COMMENT '主图',
  `images` JSON NULL COMMENT '商品图片列表',
  `description` TEXT NULL COMMENT '商品详情',
  `price` DECIMAL(10,2) NOT NULL COMMENT '售价（最低SKU价格）',
  `stock` INT DEFAULT 0 COMMENT '总库存（所有SKU库存之和）',
  `has_sku` TINYINT DEFAULT 0 COMMENT '是否有SKU (0-否 1-是)',
  `status` TINYINT DEFAULT 1 COMMENT '状态 (0-下架 1-上架)',
  ...
);
```

**关键字段说明：**
- `has_sku`: 标识商品是否有SKU，0表示单规格商品，1表示多规格商品
- `price`: 存储最低SKU价格，用于列表页展示
- `stock`: 所有SKU库存之和

### 2. SKU规格名称表 (sku_spec_names)

存储规格名称及其层级关系。

```sql
CREATE TABLE `sku_spec_names` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `merchant_id` BIGINT NOT NULL,
  `product_id` BIGINT NOT NULL,
  `spec_name` VARCHAR(50) NOT NULL COMMENT '规格名称',
  `spec_level` TINYINT NOT NULL COMMENT '规格级别 (1-一级 2-二级 3-三级)',
  `parent_id` BIGINT NULL COMMENT '父规格ID',
  `sort` INT DEFAULT 0,
  ...
);
```

**三级规格层级：**
- **一级规格** (`spec_level=1`): 主要规格，如颜色、款式
- **二级规格** (`spec_level=2`): 依赖一级规格，如尺寸、容量
- **三级规格** (`spec_level=3`): 依赖二级规格，如材质、工艺

**示例：**
```
颜色 (一级)
├── 黑色
├── 白色
└── 红色

尺寸 (二级, parent_id指向"颜色")
├── S
├── M
├── L
└── XL

材质 (三级, parent_id指向"尺寸")
├── 纯棉
└── 棉麻
```

### 3. SKU规格值表 (sku_spec_values)

存储每个规格名称下的具体值。

```sql
CREATE TABLE `sku_spec_values` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `spec_name_id` BIGINT NOT NULL COMMENT '规格名称ID',
  `product_id` BIGINT NOT NULL,
  `spec_value` VARCHAR(100) NOT NULL COMMENT '规格值',
  `image` VARCHAR(500) NULL COMMENT '规格图片',
  `sort` INT DEFAULT 0,
  ...
);
```

**示例数据：**
| id | spec_name_id | spec_value | image |
|----|--------------|------------|-------|
| 1  | 1 (颜色)     | 黑色       | black.jpg |
| 2  | 1 (颜色)     | 白色       | white.jpg |
| 3  | 2 (尺寸)     | S          | NULL |
| 4  | 2 (尺寸)     | M          | NULL |

### 4. 商品SKU表 (product_skus)

存储具体的SKU组合及其价格、库存等信息。

```sql
CREATE TABLE `product_skus` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `merchant_id` BIGINT NOT NULL,
  `product_id` BIGINT NOT NULL,
  `sku_no` VARCHAR(100) UNIQUE NOT NULL COMMENT 'SKU编号',
  `spec_value_id_1` BIGINT NULL COMMENT '一级规格值ID',
  `spec_value_id_2` BIGINT NULL COMMENT '二级规格值ID',
  `spec_value_id_3` BIGINT NULL COMMENT '三级规格值ID',
  `spec_text` VARCHAR(500) NULL COMMENT 'SKU规格文本',
  `price` DECIMAL(10,2) NOT NULL,
  `stock` INT DEFAULT 0,
  `status` TINYINT DEFAULT 1,
  ...
  UNIQUE KEY `uniq_product_specs` (
    `product_id`,
    `spec_value_id_1`,
    `spec_value_id_2`,
    `spec_value_id_3`
  )
);
```

**关键设计：**
- 使用 `spec_value_id_1/2/3` 存储三级规格值ID
- `spec_text` 存储规格文本，方便展示和搜索（如："黑色-M-纯棉"）
- 唯一约束防止重复的规格组合

---

## 三级SKU规格说明

### 规格层级关系

```
商品: 经典款T恤
│
├─ 一级规格: 颜色
│  ├─ 黑色
│  ├─ 白色
│  └─ 红色
│
├─ 二级规格: 尺寸 (依赖颜色)
│  ├─ S
│  ├─ M
│  ├─ L
│  └─ XL
│
└─ 三级规格: 材质 (依赖尺寸)
   ├─ 纯棉
   └─ 棉麻
```

### SKU组合示例

最终生成的SKU组合：
- 黑色-S-纯棉 (SKU-001)
- 黑色-S-棉麻 (SKU-002)
- 黑色-M-纯棉 (SKU-003)
- 黑色-M-棉麻 (SKU-004)
- ...
- 红色-XL-棉麻 (SKU-N)

**总SKU数量** = 颜色数 × 尺寸数 × 材质数 = 3 × 4 × 2 = 24个SKU

---

## 业务场景示例

### 场景1: 服装商品（三级规格）

**商品**: 秋季外套

**规格配置**:
```
一级: 颜色 (黑色、蓝色、卡其)
二级: 尺寸 (S、M、L、XL、XXL)
三级: 内衬 (加绒、不加绒)
```

**SKU示例**:
- 黑色-M-加绒: ¥299, 库存50
- 蓝色-L-不加绒: ¥239, 库存80

### 场景2: 鞋类商品（三级规格）

**商品**: 运动鞋

**规格配置**:
```
一级: 颜色 (白色、黑色、蓝色)
二级: 尺码 (36、37、38、39、40、41、42、43)
三级: 版本 (标准版、限量版)
```

### 场景3: 食品商品（两级规格）

**商品**: 坚果礼盒

**规格配置**:
```
一级: 规格 (500g、1000g、2000g)
二级: 包装 (礼盒装、简装)
三级: 不使用
```

**注意**: `spec_value_id_3` 可以为 NULL

### 场景4: 单规格商品

**商品**: 数字产品、虚拟商品

**配置**:
- `has_sku = 0`
- 不创建规格，直接在 `products` 表记录价格和库存
- 或创建一个默认SKU

---

## 查询示例

### 1. 查询商品的所有规格选项

```sql
-- 获取商品的三级规格树
SELECT
  sn.id as spec_name_id,
  sn.spec_name,
  sn.spec_level,
  sn.parent_id,
  sv.id as spec_value_id,
  sv.spec_value,
  sv.image
FROM sku_spec_names sn
JOIN sku_spec_values sv ON sn.id = sv.spec_name_id
WHERE sn.product_id = 1
ORDER BY sn.spec_level, sn.sort, sv.sort;
```

**返回结果**:
```
spec_name_id | spec_name | spec_level | spec_value_id | spec_value | image
-------------|-----------|------------|---------------|------------|-------
1            | 颜色      | 1          | 1             | 黑色       | black.jpg
1            | 颜色      | 1          | 2             | 白色       | white.jpg
2            | 尺寸      | 2          | 3             | S          | NULL
2            | 尺寸      | 2          | 4             | M          | NULL
3            | 材质      | 3          | 5             | 纯棉       | NULL
3            | 材质      | 3          | 6             | 棉麻       | NULL
```

### 2. 查询商品的所有SKU

```sql
SELECT
  ps.id,
  ps.sku_no,
  ps.spec_text,
  ps.price,
  ps.original_price,
  ps.stock,
  ps.sales,
  sv1.spec_value as color,
  sv2.spec_value as size,
  sv3.spec_value as material
FROM product_skus ps
LEFT JOIN sku_spec_values sv1 ON ps.spec_value_id_1 = sv1.id
LEFT JOIN sku_spec_values sv2 ON ps.spec_value_id_2 = sv2.id
LEFT JOIN sku_spec_values sv3 ON ps.spec_value_id_3 = sv3.id
WHERE ps.product_id = 1
  AND ps.status = 1
ORDER BY ps.id;
```

### 3. 查询特定规格组合的SKU

```sql
-- 查询：黑色-M-纯棉
SELECT * FROM product_skus
WHERE product_id = 1
  AND spec_value_id_1 = 1  -- 黑色
  AND spec_value_id_2 = 4  -- M
  AND spec_value_id_3 = 5  -- 纯棉
  AND status = 1;
```

### 4. 获取商品价格区间

```sql
SELECT
  p.product_name,
  MIN(ps.price) as min_price,
  MAX(ps.price) as max_price,
  SUM(ps.stock) as total_stock
FROM products p
JOIN product_skus ps ON p.id = ps.product_id
WHERE p.id = 1
  AND ps.status = 1
GROUP BY p.id, p.product_name;
```

### 5. 查询库存不足的SKU

```sql
SELECT
  p.product_name,
  ps.sku_no,
  ps.spec_text,
  ps.stock,
  ps.warning_stock
FROM product_skus ps
JOIN products p ON ps.product_id = p.id
WHERE ps.stock <= ps.warning_stock
  AND ps.status = 1
ORDER BY ps.stock ASC;
```

### 6. 按一级规格分组统计

```sql
-- 统计每个颜色的库存和销量
SELECT
  sv1.spec_value as color,
  SUM(ps.stock) as total_stock,
  SUM(ps.sales) as total_sales,
  COUNT(*) as sku_count
FROM product_skus ps
JOIN sku_spec_values sv1 ON ps.spec_value_id_1 = sv1.id
WHERE ps.product_id = 1
GROUP BY sv1.spec_value;
```

---

## 最佳实践

### 1. SKU编号规则

建议使用有意义的编号规则：
```
SKU-{商品编号}-{序号}
例: SKU-20250001-001
```

或更详细的：
```
{品牌代码}{分类代码}{商品序号}-{规格序号}
例: NKE-TSH-0001-001
```

### 2. 规格文本生成

自动生成 `spec_text` 字段：
```javascript
// JavaScript 示例
const specText = [
  specValue1,  // 黑色
  specValue2,  // M
  specValue3   // 纯棉
].filter(Boolean).join('-');
// 结果: "黑色-M-纯棉"
```

### 3. 库存同步

更新SKU库存时，同步更新商品总库存：
```sql
-- 触发器或应用层逻辑
UPDATE products
SET stock = (
  SELECT SUM(stock)
  FROM product_skus
  WHERE product_id = ? AND status = 1
)
WHERE id = ?;
```

### 4. 价格显示策略

- **列表页**: 显示最低价 `FROM ¥99`
- **详情页**: 显示价格区间 `¥99 - ¥299`
- **选择规格后**: 显示当前SKU具体价格

### 5. 规格选择交互

前端实现级联选择：
1. 用户先选择一级规格（颜色）
2. 根据选择动态加载二级规格（尺寸）
3. 根据前两级选择加载三级规格（材质）
4. 每次选择后查询可用库存

### 6. 性能优化

**索引优化**:
```sql
-- 商品SKU查询优化
INDEX `idx_product_spec` (
  `product_id`,
  `spec_value_id_1`,
  `spec_value_id_2`,
  `spec_value_id_3`
);

-- 商户隔离查询优化
INDEX `idx_merchant_status` (`merchant_id`, `status`);
```

**缓存策略**:
- 商品规格选项缓存 (1小时)
- SKU价格库存缓存 (5分钟)
- 商品详情缓存 (30分钟)

### 7. 数据一致性

**约束检查**:
- SKU的规格值必须属于对应的商品
- 规格层级关系必须正确
- SKU组合不能重复

**事务处理**:
```sql
-- 创建商品和SKU应使用事务
START TRANSACTION;
  INSERT INTO products ...;
  INSERT INTO sku_spec_names ...;
  INSERT INTO sku_spec_values ...;
  INSERT INTO product_skus ...;
COMMIT;
```

### 8. 扩展性考虑

**如果需要更多级别规格**:
```sql
-- 添加四级、五级规格字段
ALTER TABLE product_skus ADD COLUMN spec_value_id_4 BIGINT NULL;
ALTER TABLE product_skus ADD COLUMN spec_value_id_5 BIGINT NULL;
```

**如果需要SKU属性（非规格）**:
```sql
-- 创建SKU属性表
CREATE TABLE sku_attributes (
  id BIGINT PRIMARY KEY,
  sku_id BIGINT,
  attr_name VARCHAR(50),  -- 如: 保质期、产地
  attr_value VARCHAR(200)
);
```

---

## 数据流程图

```
┌─────────────┐
│   创建商品   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 配置规格名称 │ (一级、二级、三级)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 添加规格值   │ (黑色、S、纯棉...)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 生成SKU组合  │ (笛卡尔积)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│设置SKU价格库存│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   上架商品   │
└─────────────┘
```

---

## 总结

本设计方案具有以下优势：

1. **灵活性**: 支持1-3级任意组合，也可以只用1级或2级
2. **可扩展**: 易于扩展到4级、5级或添加更多属性
3. **性能**: 合理的索引设计保证查询效率
4. **数据一致性**: 通过外键和唯一约束保证数据完整性
5. **多商户**: 完整的商户隔离支持
6. **易维护**: 清晰的表结构和字段命名

适用于各类电商场景，特别是服装、鞋类、家居等需要复杂规格管理的行业。
