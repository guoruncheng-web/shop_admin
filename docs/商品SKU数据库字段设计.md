# 商品SKU数据库字段详细设计

## 1. 商品表 (products)

### 表名：`products`
### 表注释：商品基础信息表

| 字段名 | 类型 | 长度 | 是否必填 | 默认值 | 索引 | 说明 |
|--------|------|------|---------|--------|------|------|
| id | BIGINT | - | 是 | AUTO_INCREMENT | PRIMARY | 商品ID |
| merchant_id | BIGINT | - | 是 | - | INDEX | 商户ID |
| brand_id | BIGINT | - | 否 | NULL | INDEX | 品牌ID |
| category_id | BIGINT | - | 是 | - | INDEX | 分类ID |
| product_name | VARCHAR | 200 | 是 | - | - | 商品名称 |
| product_no | VARCHAR | 100 | 是 | - | UNIQUE | 商品编号 |
| subtitle | VARCHAR | 500 | 否 | NULL | - | 副标题/卖点 |
| keywords | VARCHAR | 500 | 否 | NULL | - | 关键词（用于搜索） |
| main_image | VARCHAR | 500 | 否 | NULL | - | 商品主图URL |
| images | JSON | - | 否 | NULL | - | 商品图片列表 ["url1", "url2"] |
| video_url | VARCHAR | 500 | 否 | NULL | - | 商品视频URL |
| description | TEXT | - | 否 | NULL | - | 商品详情HTML |
| original_price | DECIMAL | 10,2 | 否 | 0.00 | - | 市场价/划线价 |
| price | DECIMAL | 10,2 | 是 | - | INDEX | 售价（最低SKU价格） |
| cost_price | DECIMAL | 10,2 | 否 | 0.00 | - | 成本价 |
| stock | INT | - | 否 | 0 | INDEX | 总库存（所有SKU之和） |
| sales | INT | - | 否 | 0 | INDEX | 真实销量 |
| virtual_sales | INT | - | 否 | 0 | - | 虚拟销量（显示用） |
| weight | DECIMAL | 10,2 | 否 | 0.00 | - | 重量(kg) |
| volume | DECIMAL | 10,2 | 否 | 0.00 | - | 体积(m³) |
| unit | VARCHAR | 20 | 否 | '件' | - | 计量单位 |
| has_sku | TINYINT | - | 否 | 0 | INDEX | 是否多规格 0-单规格 1-多规格 |
| status | TINYINT | - | 否 | 1 | INDEX | 商品状态 0-已下架 1-已上架 2-待审核 |
| is_hot | TINYINT | - | 否 | 0 | INDEX | 是否热销 0-否 1-是 |
| is_new | TINYINT | - | 否 | 0 | INDEX | 是否新品 0-否 1-是 |
| is_recommend | TINYINT | - | 否 | 0 | INDEX | 是否推荐 0-否 1-是 |
| is_discount | TINYINT | - | 否 | 0 | INDEX | 是否折扣 0-否 1-是 |
| sort | INT | - | 否 | 0 | INDEX | 排序（数字越大越靠前） |
| view_count | INT | - | 否 | 0 | - | 浏览次数 |
| favorite_count | INT | - | 否 | 0 | - | 收藏次数 |
| share_count | INT | - | 否 | 0 | - | 分享次数 |
| comment_count | INT | - | 否 | 0 | - | 评论数量 |
| delivery_template_id | BIGINT | - | 否 | NULL | INDEX | 运费模板ID |
| return_days | INT | - | 否 | 7 | - | 退货天数 |
| service_guarantee | JSON | - | 否 | NULL | - | 服务保障 ["7天无理由", "假一赔十"] |
| created_at | TIMESTAMP | - | 否 | CURRENT_TIMESTAMP | INDEX | 创建时间 |
| updated_at | TIMESTAMP | - | 否 | CURRENT_TIMESTAMP | - | 更新时间 |
| created_by | BIGINT | - | 否 | NULL | INDEX | 创建人ID |
| updated_by | BIGINT | - | 否 | NULL | - | 更新人ID |
| deleted_at | TIMESTAMP | - | 否 | NULL | INDEX | 软删除时间 |

### 复合索引
```sql
INDEX `idx_merchant_status` (`merchant_id`, `status`)
INDEX `idx_merchant_category` (`merchant_id`, `category_id`)
INDEX `idx_status_sort` (`status`, `sort`)
INDEX `idx_sales` (`sales` DESC)
```

---

## 2. SKU规格名称表 (sku_spec_names)

### 表名：`sku_spec_names`
### 表注释：商品SKU规格名称表（三级规格）

| 字段名 | 类型 | 长度 | 是否必填 | 默认值 | 索引 | 说明 |
|--------|------|------|---------|--------|------|------|
| id | BIGINT | - | 是 | AUTO_INCREMENT | PRIMARY | 规格名称ID |
| merchant_id | BIGINT | - | 是 | - | INDEX | 商户ID（新增） |
| product_id | BIGINT | - | 是 | - | INDEX | 商品ID |
| spec_name | VARCHAR | 50 | 是 | - | - | 规格名称（颜色、尺寸、材质等） |
| spec_level | TINYINT | - | 是 | - | INDEX | 规格级别 1-一级 2-二级 3-三级 |
| parent_id | BIGINT | - | 否 | NULL | INDEX | 父规格ID（二三级需要） |
| sort | INT | - | 否 | 0 | INDEX | 排序 |
| is_required | TINYINT | - | 否 | 1 | - | 是否必选 0-否 1-是 |
| created_at | TIMESTAMP | - | 否 | CURRENT_TIMESTAMP | - | 创建时间 |
| updated_at | TIMESTAMP | - | 否 | CURRENT_TIMESTAMP | - | 更新时间 |

### 复合索引
```sql
INDEX `idx_merchant_product` (`merchant_id`, `product_id`)
INDEX `idx_product_level` (`product_id`, `spec_level`)
UNIQUE KEY `uniq_product_name_level` (`product_id`, `spec_name`, `spec_level`)
```

---

## 3. SKU规格值表 (sku_spec_values)

### 表名：`sku_spec_values`
### 表注释：SKU规格值表

| 字段名 | 类型 | 长度 | 是否必填 | 默认值 | 索引 | 说明 |
|--------|------|------|---------|--------|------|------|
| id | BIGINT | - | 是 | AUTO_INCREMENT | PRIMARY | 规格值ID |
| merchant_id | BIGINT | - | 是 | - | INDEX | 商户ID（新增） |
| product_id | BIGINT | - | 是 | - | INDEX | 商品ID |
| spec_name_id | BIGINT | - | 是 | - | INDEX | 规格名称ID |
| spec_value | VARCHAR | 100 | 是 | - | - | 规格值（红色、XL、纯棉等） |
| image | VARCHAR | 500 | 否 | NULL | - | 规格图片（如颜色图） |
| color_hex | VARCHAR | 20 | 否 | NULL | - | 颜色值（#FF0000） |
| extra_price | DECIMAL | 10,2 | 否 | 0.00 | - | 额外加价 |
| sort | INT | - | 否 | 0 | INDEX | 排序 |
| is_default | TINYINT | - | 否 | 0 | - | 是否默认 0-否 1-是 |
| created_at | TIMESTAMP | - | 否 | CURRENT_TIMESTAMP | - | 创建时间 |
| updated_at | TIMESTAMP | - | 否 | CURRENT_TIMESTAMP | - | 更新时间 |

### 复合索引
```sql
INDEX `idx_merchant_product` (`merchant_id`, `product_id`)
INDEX `idx_spec_name` (`spec_name_id`)
UNIQUE KEY `uniq_spec_name_value` (`spec_name_id`, `spec_value`)
```

---

## 4. 商品SKU表 (product_skus)

### 表名：`product_skus`
### 表注释：商品SKU表（存储具体的SKU组合）

| 字段名 | 类型 | 长度 | 是否必填 | 默认值 | 索引 | 说明 |
|--------|------|------|---------|--------|------|------|
| id | BIGINT | - | 是 | AUTO_INCREMENT | PRIMARY | SKU ID |
| merchant_id | BIGINT | - | 是 | - | INDEX | 商户ID（新增） |
| product_id | BIGINT | - | 是 | - | INDEX | 商品ID |
| sku_no | VARCHAR | 100 | 是 | - | UNIQUE | SKU编号 |
| sku_name | VARCHAR | 200 | 否 | NULL | - | SKU名称 |
| spec_value_id_1 | BIGINT | - | 否 | NULL | INDEX | 一级规格值ID |
| spec_value_id_2 | BIGINT | - | 否 | NULL | INDEX | 二级规格值ID |
| spec_value_id_3 | BIGINT | - | 否 | NULL | INDEX | 三级规格值ID |
| spec_text | VARCHAR | 500 | 否 | NULL | - | 规格文本（红色-XL-纯棉） |
| spec_json | JSON | - | 否 | NULL | - | 规格JSON {"颜色":"红色","尺寸":"XL"} |
| image | VARCHAR | 500 | 否 | NULL | - | SKU主图 |
| images | JSON | - | 否 | NULL | - | SKU图片列表 |
| original_price | DECIMAL | 10,2 | 否 | 0.00 | - | 原价 |
| price | DECIMAL | 10,2 | 是 | - | INDEX | 售价 |
| cost_price | DECIMAL | 10,2 | 否 | 0.00 | - | 成本价 |
| stock | INT | - | 否 | 0 | INDEX | 库存 |
| warning_stock | INT | - | 否 | 10 | - | 预警库存 |
| sales | INT | - | 否 | 0 | INDEX | 销量 |
| lock_stock | INT | - | 否 | 0 | - | 锁定库存（订单未支付） |
| weight | DECIMAL | 10,2 | 否 | 0.00 | - | 重量(kg) |
| volume | DECIMAL | 10,2 | 否 | 0.00 | - | 体积(m³) |
| barcode | VARCHAR | 100 | 否 | NULL | INDEX | 条形码 |
| qr_code | VARCHAR | 500 | 否 | NULL | - | 二维码URL |
| status | TINYINT | - | 否 | 1 | INDEX | 状态 0-禁用 1-启用 |
| created_at | TIMESTAMP | - | 否 | CURRENT_TIMESTAMP | - | 创建时间 |
| updated_at | TIMESTAMP | - | 否 | CURRENT_TIMESTAMP | - | 更新时间 |
| deleted_at | TIMESTAMP | - | 否 | NULL | - | 软删除时间 |

### 复合索引
```sql
INDEX `idx_merchant_product` (`merchant_id`, `product_id`)
INDEX `idx_product_status` (`product_id`, `status`)
INDEX `idx_stock` (`stock`)
UNIQUE KEY `uniq_product_specs` (`product_id`, `spec_value_id_1`, `spec_value_id_2`, `spec_value_id_3`)
```

---

## 5. 商品分类表 (categories)

### 表名：`categories`
### 表注释：商品分类表（树形结构）

| 字段名 | 类型 | 长度 | 是否必填 | 默认值 | 索引 | 说明 |
|--------|------|------|---------|--------|------|------|
| id | BIGINT | - | 是 | AUTO_INCREMENT | PRIMARY | 分类ID |
| merchant_id | BIGINT | - | 是 | - | INDEX | 商户ID |
| parent_id | BIGINT | - | 否 | 0 | INDEX | 父分类ID（0为顶级） |
| category_name | VARCHAR | 100 | 是 | - | INDEX | 分类名称 |
| category_code | VARCHAR | 50 | 否 | NULL | INDEX | 分类编码 |
| icon | VARCHAR | 500 | 否 | NULL | - | 分类图标URL |
| image | VARCHAR | 500 | 否 | NULL | - | 分类图片URL |
| banner | VARCHAR | 500 | 否 | NULL | - | 分类横幅图 |
| description | TEXT | - | 否 | NULL | - | 分类描述 |
| level | TINYINT | - | 否 | 1 | INDEX | 分类层级 1/2/3 |
| path_ids | VARCHAR | 500 | 否 | NULL | INDEX | 路径ID（1,2,3） |
| path_names | VARCHAR | 500 | 否 | NULL | - | 路径名称（服装,男装,T恤） |
| sort | INT | - | 否 | 0 | INDEX | 排序 |
| is_show | TINYINT | - | 否 | 1 | INDEX | 是否显示 0-否 1-是 |
| is_recommend | TINYINT | - | 否 | 0 | INDEX | 是否推荐 0-否 1-是 |
| product_count | INT | - | 否 | 0 | - | 商品数量（冗余字段） |
| template_id | BIGINT | - | 否 | NULL | - | 详情模板ID |
| status | TINYINT | - | 否 | 1 | INDEX | 状态 0-禁用 1-启用 |
| created_at | TIMESTAMP | - | 否 | CURRENT_TIMESTAMP | - | 创建时间 |
| updated_at | TIMESTAMP | - | 否 | CURRENT_TIMESTAMP | - | 更新时间 |
| created_by | BIGINT | - | 否 | NULL | - | 创建人ID |
| updated_by | BIGINT | - | 否 | NULL | - | 更新人ID |

### 复合索引
```sql
INDEX `idx_merchant_parent` (`merchant_id`, `parent_id`)
INDEX `idx_merchant_level` (`merchant_id`, `level`)
INDEX `idx_status_sort` (`status`, `sort`)
```

---

## 6. 商品参数表 (product_params) - 可选扩展

### 表名：`product_params`
### 表注释：商品参数表（产品规格参数，非SKU规格）

| 字段名 | 类型 | 长度 | 是否必填 | 默认值 | 索引 | 说明 |
|--------|------|------|---------|--------|------|------|
| id | BIGINT | - | 是 | AUTO_INCREMENT | PRIMARY | 参数ID |
| merchant_id | BIGINT | - | 是 | - | INDEX | 商户ID |
| product_id | BIGINT | - | 是 | - | INDEX | 商品ID |
| param_name | VARCHAR | 100 | 是 | - | - | 参数名（品牌、型号、产地） |
| param_value | VARCHAR | 500 | 是 | - | - | 参数值 |
| param_group | VARCHAR | 50 | 否 | '基本参数' | - | 参数分组 |
| sort | INT | - | 否 | 0 | - | 排序 |
| created_at | TIMESTAMP | - | 否 | CURRENT_TIMESTAMP | - | 创建时间 |

---

## 7. SKU库存记录表 (sku_stock_logs) - 可选扩展

### 表名：`sku_stock_logs`
### 表注释：SKU库存变动记录表

| 字段名 | 类型 | 长度 | 是否必填 | 默认值 | 索引 | 说明 |
|--------|------|------|---------|--------|------|------|
| id | BIGINT | - | 是 | AUTO_INCREMENT | PRIMARY | 记录ID |
| merchant_id | BIGINT | - | 是 | - | INDEX | 商户ID |
| sku_id | BIGINT | - | 是 | - | INDEX | SKU ID |
| change_type | TINYINT | - | 是 | - | INDEX | 变动类型 1-入库 2-出库 3-调整 |
| change_quantity | INT | - | 是 | - | - | 变动数量（正数增加，负数减少） |
| before_stock | INT | - | 是 | - | - | 变动前库存 |
| after_stock | INT | - | 是 | - | - | 变动后库存 |
| reason | VARCHAR | 200 | 否 | NULL | - | 变动原因 |
| related_no | VARCHAR | 100 | 否 | NULL | INDEX | 关联单号（订单号等） |
| operator_id | BIGINT | - | 否 | NULL | - | 操作人ID |
| operator_name | VARCHAR | 50 | 否 | NULL | - | 操作人姓名 |
| remark | VARCHAR | 500 | 否 | NULL | - | 备注 |
| created_at | TIMESTAMP | - | 否 | CURRENT_TIMESTAMP | INDEX | 创建时间 |

---

## 数据字典补充说明

### 商品状态 (status)
- `0`: 已下架
- `1`: 已上架（正常销售）
- `2`: 待审核（商户提交，平台审核中）
- `3`: 审核拒绝

### SKU规格级别 (spec_level)
- `1`: 一级规格（主要分类，如颜色、款式）
- `2`: 二级规格（依赖一级，如尺寸、容量）
- `3`: 三级规格（依赖二级，如材质、工艺）

### 库存变动类型 (change_type)
- `1`: 入库（采购入库）
- `2`: 出库（订单出库）
- `3`: 调整（盘点调整）
- `4`: 锁定（下单锁定）
- `5`: 解锁（取消订单释放）

### JSON字段说明

#### images (商品图片列表)
```json
[
  "https://example.com/image1.jpg",
  "https://example.com/image2.jpg",
  "https://example.com/image3.jpg"
]
```

#### service_guarantee (服务保障)
```json
[
  "7天无理由退换",
  "假一赔十",
  "极速退款",
  "免费上门退换货"
]
```

#### spec_json (规格JSON)
```json
{
  "颜色": "黑色",
  "尺寸": "XL",
  "材质": "纯棉"
}
```

---

## 商户隔离设计

### 关键点
1. **所有核心表都包含 `merchant_id` 字段**
2. **复合索引优先包含 `merchant_id`**
3. **查询时必须带上商户条件**

### 示例SQL
```sql
-- 查询商户的商品
SELECT * FROM products
WHERE merchant_id = ?
  AND status = 1;

-- 查询商户的SKU
SELECT * FROM product_skus
WHERE merchant_id = ?
  AND product_id = ?;

-- 查询商户的分类
SELECT * FROM categories
WHERE merchant_id = ?
  AND parent_id = 0;
```

---

## 性能优化建议

### 1. 分表策略
```sql
-- 订单量大时，可按月份分表
product_skus_202501
product_skus_202502
...
```

### 2. 缓存策略
- 商品基础信息：30分钟
- SKU规格选项：1小时
- SKU价格库存：5分钟
- 分类树：1小时

### 3. 读写分离
- 商品详情、列表 -> 读库
- 库存扣减、订单创建 -> 写库

### 4. 字段优化
- 使用TINYINT代替CHAR(1)
- 价格使用DECIMAL(10,2)而非FLOAT
- 状态字段使用TINYINT而非VARCHAR
- 大文本使用TEXT而非VARCHAR

---

## 完整建表SQL示例

请查看: `/Users/mac/test/cursor1/cursor_shop/database/migrations/create_product_sku_tables.sql`
