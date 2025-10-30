-- =========================================
-- 商品SKU数据库设计 (三级规格)
-- =========================================

-- 1. 商品表 (products)
CREATE TABLE IF NOT EXISTS `products` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '商品ID',
  `merchant_id` BIGINT NOT NULL COMMENT '商户ID',
  `brand_id` BIGINT NULL COMMENT '品牌ID',
  `category_id` BIGINT NOT NULL COMMENT '分类ID',
  `product_name` VARCHAR(200) NOT NULL COMMENT '商品名称',
  `product_no` VARCHAR(100) UNIQUE NOT NULL COMMENT '商品编号',
  `subtitle` VARCHAR(500) NULL COMMENT '副标题',
  `main_image` VARCHAR(500) NULL COMMENT '主图',
  `images` JSON NULL COMMENT '商品图片列表',
  `video_url` VARCHAR(500) NULL COMMENT '商品视频',
  `description` TEXT NULL COMMENT '商品详情',
  `original_price` DECIMAL(10,2) DEFAULT 0.00 COMMENT '原价',
  `price` DECIMAL(10,2) NOT NULL COMMENT '售价（最低SKU价格）',
  `stock` INT DEFAULT 0 COMMENT '总库存（所有SKU库存之和）',
  `sales` INT DEFAULT 0 COMMENT '销量',
  `virtual_sales` INT DEFAULT 0 COMMENT '虚拟销量',
  `weight` DECIMAL(10,2) DEFAULT 0.00 COMMENT '重量(kg)',
  `unit` VARCHAR(20) DEFAULT '件' COMMENT '单位',
  `has_sku` TINYINT DEFAULT 0 COMMENT '是否有SKU (0-否 1-是)',
  `status` TINYINT DEFAULT 1 COMMENT '状态 (0-下架 1-上架)',
  `is_hot` TINYINT DEFAULT 0 COMMENT '是否热销 (0-否 1-是)',
  `is_new` TINYINT DEFAULT 0 COMMENT '是否新品 (0-否 1-是)',
  `is_recommend` TINYINT DEFAULT 0 COMMENT '是否推荐 (0-否 1-是)',
  `sort` INT DEFAULT 0 COMMENT '排序',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` BIGINT NULL COMMENT '创建人ID',
  `updated_by` BIGINT NULL COMMENT '更新人ID',
  INDEX `idx_merchant` (`merchant_id`),
  INDEX `idx_brand` (`brand_id`),
  INDEX `idx_category` (`category_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_sort` (`sort`),
  FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`),
  FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`),
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';

-- 2. SKU规格名称表 (sku_spec_names)
-- 三级规格：一级规格 > 二级规格 > 三级规格
CREATE TABLE IF NOT EXISTS `sku_spec_names` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '规格名称ID',
  `merchant_id` BIGINT NOT NULL COMMENT '商户ID',
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `spec_name` VARCHAR(50) NOT NULL COMMENT '规格名称（如：颜色、尺寸、材质）',
  `spec_level` TINYINT NOT NULL COMMENT '规格级别 (1-一级 2-二级 3-三级)',
  `parent_id` BIGINT NULL COMMENT '父规格ID（二级和三级需要关联父规格）',
  `sort` INT DEFAULT 0 COMMENT '排序',
  `is_required` TINYINT DEFAULT 1 COMMENT '是否必选 (0-否 1-是)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_merchant_product` (`merchant_id`, `product_id`),
  INDEX `idx_product` (`product_id`),
  INDEX `idx_level` (`spec_level`),
  INDEX `idx_parent` (`parent_id`),
  INDEX `idx_sort` (`sort`),
  UNIQUE KEY `uniq_product_name_level` (`product_id`, `spec_name`, `spec_level`),
  FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SKU规格名称表';

-- 3. SKU规格值表 (sku_spec_values)
CREATE TABLE IF NOT EXISTS `sku_spec_values` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '规格值ID',
  `merchant_id` BIGINT NOT NULL COMMENT '商户ID',
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `spec_name_id` BIGINT NOT NULL COMMENT '规格名称ID',
  `spec_value` VARCHAR(100) NOT NULL COMMENT '规格值（如：红色、XL、纯棉）',
  `image` VARCHAR(500) NULL COMMENT '规格图片（如颜色可以有图片）',
  `color_hex` VARCHAR(20) NULL COMMENT '颜色值（#FF0000）',
  `extra_price` DECIMAL(10,2) DEFAULT 0.00 COMMENT '额外加价',
  `sort` INT DEFAULT 0 COMMENT '排序',
  `is_default` TINYINT DEFAULT 0 COMMENT '是否默认 (0-否 1-是)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_merchant_product` (`merchant_id`, `product_id`),
  INDEX `idx_spec_name` (`spec_name_id`),
  INDEX `idx_product` (`product_id`),
  INDEX `idx_sort` (`sort`),
  UNIQUE KEY `uniq_spec_name_value` (`spec_name_id`, `spec_value`),
  FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`),
  FOREIGN KEY (`spec_name_id`) REFERENCES `sku_spec_names`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SKU规格值表';

-- 4. 商品SKU表 (product_skus)
CREATE TABLE IF NOT EXISTS `product_skus` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'SKU ID',
  `merchant_id` BIGINT NOT NULL COMMENT '商户ID',
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `sku_no` VARCHAR(100) UNIQUE NOT NULL COMMENT 'SKU编号',
  `sku_name` VARCHAR(200) NULL COMMENT 'SKU名称',
  `spec_value_id_1` BIGINT NULL COMMENT '一级规格值ID',
  `spec_value_id_2` BIGINT NULL COMMENT '二级规格值ID',
  `spec_value_id_3` BIGINT NULL COMMENT '三级规格值ID',
  `spec_text` VARCHAR(500) NULL COMMENT 'SKU规格文本（如：红色-XL-纯棉）',
  `spec_json` JSON NULL COMMENT '规格JSON {"颜色":"红色","尺寸":"XL"}',
  `image` VARCHAR(500) NULL COMMENT 'SKU主图',
  `images` JSON NULL COMMENT 'SKU图片列表',
  `original_price` DECIMAL(10,2) DEFAULT 0.00 COMMENT '原价',
  `price` DECIMAL(10,2) NOT NULL COMMENT '售价',
  `cost_price` DECIMAL(10,2) DEFAULT 0.00 COMMENT '成本价',
  `stock` INT DEFAULT 0 COMMENT '库存',
  `warning_stock` INT DEFAULT 10 COMMENT '预警库存',
  `sales` INT DEFAULT 0 COMMENT '销量',
  `lock_stock` INT DEFAULT 0 COMMENT '锁定库存（订单未支付）',
  `weight` DECIMAL(10,2) DEFAULT 0.00 COMMENT '重量(kg)',
  `volume` DECIMAL(10,2) DEFAULT 0.00 COMMENT '体积(m³)',
  `barcode` VARCHAR(100) NULL COMMENT '条形码',
  `qr_code` VARCHAR(500) NULL COMMENT '二维码URL',
  `status` TINYINT DEFAULT 1 COMMENT '状态 (0-禁用 1-启用)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted_at` TIMESTAMP NULL COMMENT '软删除时间',
  INDEX `idx_merchant_product` (`merchant_id`, `product_id`),
  INDEX `idx_merchant` (`merchant_id`),
  INDEX `idx_product` (`product_id`),
  INDEX `idx_spec_1` (`spec_value_id_1`),
  INDEX `idx_spec_2` (`spec_value_id_2`),
  INDEX `idx_spec_3` (`spec_value_id_3`),
  INDEX `idx_status` (`status`),
  INDEX `idx_stock` (`stock`),
  INDEX `idx_barcode` (`barcode`),
  UNIQUE KEY `uniq_product_specs` (`product_id`, `spec_value_id_1`, `spec_value_id_2`, `spec_value_id_3`),
  FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`spec_value_id_1`) REFERENCES `sku_spec_values`(`id`),
  FOREIGN KEY (`spec_value_id_2`) REFERENCES `sku_spec_values`(`id`),
  FOREIGN KEY (`spec_value_id_3`) REFERENCES `sku_spec_values`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品SKU表';

-- 5. 商品分类表 (categories)
CREATE TABLE IF NOT EXISTS `categories` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '分类ID',
  `merchant_id` BIGINT NOT NULL COMMENT '商户ID',
  `parent_id` BIGINT DEFAULT 0 COMMENT '父分类ID',
  `category_name` VARCHAR(100) NOT NULL COMMENT '分类名称',
  `category_code` VARCHAR(50) NULL COMMENT '分类编码',
  `icon` VARCHAR(500) NULL COMMENT '分类图标',
  `image` VARCHAR(500) NULL COMMENT '分类图片',
  `description` TEXT NULL COMMENT '分类描述',
  `level` TINYINT DEFAULT 1 COMMENT '分类层级',
  `path_ids` VARCHAR(500) NULL COMMENT '路径ID（逗号分隔）',
  `sort` INT DEFAULT 0 COMMENT '排序',
  `status` TINYINT DEFAULT 1 COMMENT '状态 (0-禁用 1-启用)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_merchant` (`merchant_id`),
  INDEX `idx_parent` (`parent_id`),
  INDEX `idx_level` (`level`),
  INDEX `idx_sort` (`sort`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品分类表';

-- =========================================
-- 示例数据
-- =========================================

-- 示例：插入一个有三级SKU的商品（T恤）
-- 商品基础信息
INSERT INTO `products` (
  `merchant_id`, `brand_id`, `category_id`, `product_name`, `product_no`,
  `main_image`, `price`, `stock`, `has_sku`, `status`
) VALUES (
  1, 1, 1, '经典款纯棉T恤', 'PROD-20250001',
  'https://example.com/tshirt.jpg', 99.00, 1000, 1, 1
);

-- 假设 product_id = 1

-- 一级规格：颜色
INSERT INTO `sku_spec_names` (`merchant_id`, `product_id`, `spec_name`, `spec_level`, `parent_id`, `sort`)
VALUES (1, 1, '颜色', 1, NULL, 1);
-- 假设 spec_name_id = 1

INSERT INTO `sku_spec_values` (`spec_name_id`, `product_id`, `spec_value`, `sort`)
VALUES
  (1, 1, '黑色', 1),
  (1, 1, '白色', 2),
  (1, 1, '红色', 3);
-- 假设 value_ids: 1-黑色, 2-白色, 3-红色

-- 二级规格：尺寸
INSERT INTO `sku_spec_names` (`merchant_id`, `product_id`, `spec_name`, `spec_level`, `parent_id`, `sort`)
VALUES (1, 1, '尺寸', 2, 1, 2);
-- 假设 spec_name_id = 2

INSERT INTO `sku_spec_values` (`spec_name_id`, `product_id`, `spec_value`, `sort`)
VALUES
  (2, 1, 'S', 1),
  (2, 1, 'M', 2),
  (2, 1, 'L', 3),
  (2, 1, 'XL', 4);
-- 假设 value_ids: 4-S, 5-M, 6-L, 7-XL

-- 三级规格：材质
INSERT INTO `sku_spec_names` (`merchant_id`, `product_id`, `spec_name`, `spec_level`, `parent_id`, `sort`)
VALUES (1, 1, '材质', 3, 2, 3);
-- 假设 spec_name_id = 3

INSERT INTO `sku_spec_values` (`spec_name_id`, `product_id`, `spec_value`, `sort`)
VALUES
  (3, 1, '纯棉', 1),
  (3, 1, '棉麻', 2);
-- 假设 value_ids: 8-纯棉, 9-棉麻

-- 创建SKU组合（示例：黑色-M-纯棉）
INSERT INTO `product_skus` (
  `merchant_id`, `product_id`, `sku_no`, `spec_value_id_1`, `spec_value_id_2`, `spec_value_id_3`,
  `spec_text`, `price`, `stock`, `status`
) VALUES (
  1, 1, 'SKU-20250001-001', 1, 5, 8,
  '黑色-M-纯棉', 99.00, 100, 1
);

-- =========================================
-- 查询示例
-- =========================================

/*
-- 1. 查询商品的所有SKU规格
SELECT
  sn.spec_name,
  sn.spec_level,
  sv.spec_value,
  sv.image
FROM sku_spec_names sn
JOIN sku_spec_values sv ON sn.id = sv.spec_name_id
WHERE sn.product_id = 1
ORDER BY sn.spec_level, sn.sort, sv.sort;

-- 2. 查询商品的所有SKU列表
SELECT
  ps.id,
  ps.sku_no,
  ps.spec_text,
  ps.price,
  ps.stock,
  ps.sales,
  sv1.spec_value as spec_1,
  sv2.spec_value as spec_2,
  sv3.spec_value as spec_3
FROM product_skus ps
LEFT JOIN sku_spec_values sv1 ON ps.spec_value_id_1 = sv1.id
LEFT JOIN sku_spec_values sv2 ON ps.spec_value_id_2 = sv2.id
LEFT JOIN sku_spec_values sv3 ON ps.spec_value_id_3 = sv3.id
WHERE ps.product_id = 1
ORDER BY ps.id;

-- 3. 查询特定规格组合的SKU
SELECT * FROM product_skus
WHERE product_id = 1
  AND spec_value_id_1 = 1  -- 黑色
  AND spec_value_id_2 = 5  -- M
  AND spec_value_id_3 = 8; -- 纯棉

-- 4. 统计商品总库存
SELECT SUM(stock) as total_stock
FROM product_skus
WHERE product_id = 1 AND status = 1;
*/
