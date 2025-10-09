-- ============================================================
-- 多商户平台数据库迁移脚本
-- Multi-Tenant E-commerce Platform Migration
-- ============================================================
-- 功能说明：
-- 1. 创建商户(merchants)表
-- 2. 在roles表中添加merchant_id外键
-- 3. 在menus表中添加merchant_id外键
-- 4. 在admins表中添加merchant_id外键
-- 5. 创建超级商户并迁移现有数据
-- 6. 添加相关索引和约束
-- ============================================================

USE `wechat_mall`;

-- ============================================================
-- 1. 创建商户表 (Merchants Table)
-- ============================================================
CREATE TABLE IF NOT EXISTS `merchants` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '商户ID',

  -- 基础信息
  `merchant_code` VARCHAR(50) UNIQUE NOT NULL COMMENT '商户编码（唯一标识）',
  `merchant_name` VARCHAR(100) NOT NULL COMMENT '商户名称',
  `merchant_type` TINYINT DEFAULT 1 COMMENT '商户类型：1-超级商户（平台），2-普通商户',
  `legal_person` VARCHAR(50) COMMENT '法人代表',
  `business_license` VARCHAR(100) COMMENT '营业执照号',

  -- 联系信息
  `contact_name` VARCHAR(50) COMMENT '联系人姓名',
  `contact_phone` VARCHAR(20) COMMENT '联系电话',
  `contact_email` VARCHAR(100) COMMENT '联系邮箱',
  `address` VARCHAR(255) COMMENT '商户地址',

  -- 认证信息
  `logo` VARCHAR(500) COMMENT '商户Logo',
  `description` TEXT COMMENT '商户描述',
  `certification_status` TINYINT DEFAULT 0 COMMENT '认证状态：0-未认证，1-审核中，2-已认证，3-认证失败',
  `certification_time` TIMESTAMP NULL COMMENT '认证时间',
  `certification_docs` JSON COMMENT '认证文件JSON数组',

  -- 经营信息
  `business_scope` TEXT COMMENT '经营范围',
  `category_ids` JSON COMMENT '经营类目ID数组',
  `settlement_account` VARCHAR(100) COMMENT '结算账户',
  `settlement_bank` VARCHAR(100) COMMENT '结算银行',

  -- 状态和配额
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用，2-冻结',
  `expire_time` TIMESTAMP NULL COMMENT '到期时间（套餐有效期）',
  `max_products` INT DEFAULT 1000 COMMENT '最大商品数量',
  `max_admins` INT DEFAULT 10 COMMENT '最大管理员数量',
  `max_storage` BIGINT DEFAULT 10737418240 COMMENT '最大存储空间(字节)，默认10GB',

  -- 财务信息
  `commission_rate` DECIMAL(5,2) DEFAULT 0.00 COMMENT '平台抽成比例（%）',
  `balance` DECIMAL(12,2) DEFAULT 0.00 COMMENT '账户余额',
  `frozen_balance` DECIMAL(12,2) DEFAULT 0.00 COMMENT '冻结金额',
  `total_sales` DECIMAL(15,2) DEFAULT 0.00 COMMENT '累计销售额',

  -- 配置信息
  `config` JSON COMMENT '商户配置JSON（主题色、功能开关等）',
  `api_key` VARCHAR(64) UNIQUE COMMENT 'API密钥',
  `api_secret` VARCHAR(64) COMMENT 'API密钥',
  `webhook_url` VARCHAR(500) COMMENT 'Webhook回调地址',

  -- 时间戳
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` BIGINT COMMENT '创建人ID',
  `updated_by` BIGINT COMMENT '更新人ID',

  -- 索引
  INDEX `idx_merchant_code` (`merchant_code`),
  INDEX `idx_merchant_type` (`merchant_type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_certification_status` (`certification_status`),
  INDEX `idx_created_at` (`created_at`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商户表';

-- ============================================================
-- 2. 修改角色表 - 添加商户关联
-- ============================================================
-- 检查merchant_id列是否已存在，不存在则添加
SET @dbname = DATABASE();
SET @tablename = 'roles';
SET @columnname = 'merchant_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " BIGINT NOT NULL DEFAULT 1 COMMENT '所属商户ID' AFTER id")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 添加外键约束（如果不存在）
SET @fk_check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = @dbname
  AND TABLE_NAME = 'roles'
  AND CONSTRAINT_NAME = 'fk_roles_merchant_id');

SET @preparedStatement = IF(@fk_check > 0,
  "SELECT 1",
  "ALTER TABLE roles ADD CONSTRAINT fk_roles_merchant_id FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE"
);
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 添加索引
SET @index_check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = @dbname
  AND TABLE_NAME = 'roles'
  AND INDEX_NAME = 'idx_merchant_id');

SET @preparedStatement = IF(@index_check > 0,
  "SELECT 1",
  "ALTER TABLE roles ADD INDEX idx_merchant_id (merchant_id)"
);
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 添加组合索引，用于快速查询某商户的所有角色
SET @composite_index_check = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = @dbname
  AND TABLE_NAME = 'roles'
  AND INDEX_NAME = 'idx_merchant_status');

SET @preparedStatement = IF(@composite_index_check > 0,
  "SELECT 1",
  "ALTER TABLE roles ADD INDEX idx_merchant_status (merchant_id, status)"
);
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ============================================================
-- 3. 修改菜单表 - 添加商户关联
-- ============================================================
-- 检查menus表是否存在
SET @menus_table_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'menus');

-- 如果menus表存在，添加merchant_id列
SET @preparedStatement = IF(@menus_table_exists = 0,
  "SELECT 1",
  (SELECT IF(
    (
      SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'menus'
      AND COLUMN_NAME = 'merchant_id'
    ) > 0,
    "SELECT 1",
    "ALTER TABLE menus ADD COLUMN merchant_id BIGINT NOT NULL DEFAULT 1 COMMENT '所属商户ID' AFTER id"
  ))
);
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 添加外键约束（如果menus表存在且外键不存在）
SET @preparedStatement = IF(@menus_table_exists = 0,
  "SELECT 1",
  IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA = @dbname
      AND TABLE_NAME = 'menus'
      AND CONSTRAINT_NAME = 'fk_menus_merchant_id') > 0,
    "SELECT 1",
    "ALTER TABLE menus ADD CONSTRAINT fk_menus_merchant_id FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE"
  )
);
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 添加索引
SET @preparedStatement = IF(@menus_table_exists = 0,
  "SELECT 1",
  IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'menus'
      AND INDEX_NAME = 'idx_merchant_id') > 0,
    "SELECT 1",
    "ALTER TABLE menus ADD INDEX idx_merchant_id (merchant_id)"
  )
);
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 添加组合索引
SET @preparedStatement = IF(@menus_table_exists = 0,
  "SELECT 1",
  IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'menus'
      AND INDEX_NAME = 'idx_merchant_parent_status') > 0,
    "SELECT 1",
    "ALTER TABLE menus ADD INDEX idx_merchant_parent_status (merchant_id, parent_id, status)"
  )
);
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ============================================================
-- 4. 修改管理员表 - 添加商户关联
-- ============================================================
-- 添加merchant_id列
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = 'admins'
    AND COLUMN_NAME = 'merchant_id'
  ) > 0,
  "SELECT 1",
  "ALTER TABLE admins ADD COLUMN merchant_id BIGINT NOT NULL DEFAULT 1 COMMENT '所属商户ID' AFTER id"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 添加外键约束
SET @preparedStatement = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = @dbname
    AND TABLE_NAME = 'admins'
    AND CONSTRAINT_NAME = 'fk_admins_merchant_id') > 0,
  "SELECT 1",
  "ALTER TABLE admins ADD CONSTRAINT fk_admins_merchant_id FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE"
);
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 添加索引
SET @preparedStatement = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = 'admins'
    AND INDEX_NAME = 'idx_merchant_id') > 0,
  "SELECT 1",
  "ALTER TABLE admins ADD INDEX idx_merchant_id (merchant_id)"
);
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ============================================================
-- 5. 创建超级商户（平台商户）
-- ============================================================
INSERT INTO `merchants` (
  `id`,
  `merchant_code`,
  `merchant_name`,
  `merchant_type`,
  `legal_person`,
  `contact_name`,
  `contact_phone`,
  `contact_email`,
  `description`,
  `certification_status`,
  `certification_time`,
  `status`,
  `expire_time`,
  `max_products`,
  `max_admins`,
  `max_storage`,
  `commission_rate`,
  `config`,
  `created_at`,
  `updated_at`
) VALUES (
  1,
  'SUPER_MERCHANT',
  '平台超级商户',
  1,
  '平台管理员',
  '系统管理员',
  '400-000-0000',
  'admin@platform.com',
  '平台超级商户，拥有最高权限，管理所有商户和系统配置',
  2,
  NOW(),
  1,
  '2099-12-31 23:59:59',
  999999,
  999,
  107374182400,  -- 100GB
  0.00,
  JSON_OBJECT(
    'theme', 'default',
    'features', JSON_OBJECT(
      'multiTenant', true,
      'merchantManagement', true,
      'systemConfig', true
    ),
    'permissions', JSON_ARRAY('*')
  ),
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  `merchant_name` = '平台超级商户',
  `merchant_type` = 1,
  `updated_at` = NOW();

-- ============================================================
-- 6. 迁移现有数据到超级商户
-- ============================================================
-- 更新现有的roles数据
UPDATE `roles` SET `merchant_id` = 1 WHERE `merchant_id` IS NULL OR `merchant_id` = 0;

-- 更新现有的menus数据（如果表存在）
SET @preparedStatement = IF(@menus_table_exists = 0,
  "SELECT 1",
  "UPDATE menus SET merchant_id = 1 WHERE merchant_id IS NULL OR merchant_id = 0"
);
PREPARE updateIfExists FROM @preparedStatement;
EXECUTE updateIfExists;
DEALLOCATE PREPARE updateIfExists;

-- 更新现有的admins数据
UPDATE `admins` SET `merchant_id` = 1 WHERE `merchant_id` IS NULL OR `merchant_id` = 0;

-- ============================================================
-- 7. 创建商户管理员关联视图（可选）
-- ============================================================
CREATE OR REPLACE VIEW `merchant_admins_view` AS
SELECT
  m.id AS merchant_id,
  m.merchant_code,
  m.merchant_name,
  m.status AS merchant_status,
  a.id AS admin_id,
  a.username,
  a.real_name,
  a.email,
  a.phone,
  a.status AS admin_status,
  a.created_at AS admin_created_at,
  GROUP_CONCAT(r.name) AS role_names
FROM merchants m
LEFT JOIN admins a ON m.id = a.merchant_id
LEFT JOIN admin_roles ar ON a.id = ar.admin_id
LEFT JOIN roles r ON ar.role_id = r.id
GROUP BY m.id, a.id;

-- ============================================================
-- 8. 创建商户角色统计视图（可选）
-- ============================================================
CREATE OR REPLACE VIEW `merchant_roles_stats` AS
SELECT
  m.id AS merchant_id,
  m.merchant_code,
  m.merchant_name,
  m.status AS merchant_status,
  COUNT(r.id) AS total_roles,
  SUM(CASE WHEN r.status = 1 THEN 1 ELSE 0 END) AS active_roles,
  SUM(CASE WHEN r.status = 0 THEN 1 ELSE 0 END) AS disabled_roles
FROM merchants m
LEFT JOIN roles r ON m.id = r.merchant_id
GROUP BY m.id;

-- ============================================================
-- 9. 其他商户相关的业务表修改（商品、订单等）
-- ============================================================
-- 商品表添加商户ID
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = 'products'
    AND COLUMN_NAME = 'merchant_id'
  ) > 0,
  "SELECT 1",
  "ALTER TABLE products ADD COLUMN merchant_id BIGINT NOT NULL DEFAULT 1 COMMENT '所属商户ID' AFTER id"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 添加商品表外键
SET @preparedStatement = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = @dbname
    AND TABLE_NAME = 'products'
    AND CONSTRAINT_NAME = 'fk_products_merchant_id') > 0,
  "SELECT 1",
  "ALTER TABLE products ADD CONSTRAINT fk_products_merchant_id FOREIGN KEY (merchant_id) REFERENCES merchants(id)"
);
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 添加商品表索引
SET @preparedStatement = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = 'products'
    AND INDEX_NAME = 'idx_merchant_id') > 0,
  "SELECT 1",
  "ALTER TABLE products ADD INDEX idx_merchant_id (merchant_id)"
);
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 更新现有商品数据
UPDATE `products` SET `merchant_id` = 1 WHERE `merchant_id` IS NULL OR `merchant_id` = 0;

-- 订单表添加商户ID
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = 'orders'
    AND COLUMN_NAME = 'merchant_id'
  ) > 0,
  "SELECT 1",
  "ALTER TABLE orders ADD COLUMN merchant_id BIGINT NOT NULL DEFAULT 1 COMMENT '所属商户ID（卖家）' AFTER id"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 添加订单表外键
SET @preparedStatement = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = @dbname
    AND TABLE_NAME = 'orders'
    AND CONSTRAINT_NAME = 'fk_orders_merchant_id') > 0,
  "SELECT 1",
  "ALTER TABLE orders ADD CONSTRAINT fk_orders_merchant_id FOREIGN KEY (merchant_id) REFERENCES merchants(id)"
);
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 添加订单表索引
SET @preparedStatement = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = 'orders'
    AND INDEX_NAME = 'idx_merchant_id') > 0,
  "SELECT 1",
  "ALTER TABLE orders ADD INDEX idx_merchant_id (merchant_id)"
);
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 更新现有订单数据
UPDATE `orders` SET `merchant_id` = 1 WHERE `merchant_id` IS NULL OR `merchant_id` = 0;

-- 品牌表添加商户ID
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = 'brands'
    AND COLUMN_NAME = 'merchant_id'
  ) > 0,
  "SELECT 1",
  "ALTER TABLE brands ADD COLUMN merchant_id BIGINT NOT NULL DEFAULT 1 COMMENT '所属商户ID' AFTER id"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 添加品牌表外键
SET @preparedStatement = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = @dbname
    AND TABLE_NAME = 'brands'
    AND CONSTRAINT_NAME = 'fk_brands_merchant_id') > 0,
  "SELECT 1",
  "ALTER TABLE brands ADD CONSTRAINT fk_brands_merchant_id FOREIGN KEY (merchant_id) REFERENCES merchants(id)"
);
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 添加品牌表索引
SET @preparedStatement = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = 'brands'
    AND INDEX_NAME = 'idx_merchant_id') > 0,
  "SELECT 1",
  "ALTER TABLE brands ADD INDEX idx_merchant_id (merchant_id)"
);
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 更新现有品牌数据
UPDATE `brands` SET `merchant_id` = 1 WHERE `merchant_id` IS NULL OR `merchant_id` = 0;

-- ============================================================
-- 10. 创建示例普通商户（可选）
-- ============================================================
-- 取消注释以下代码以创建测试商户
/*
INSERT INTO `merchants` (
  `merchant_code`,
  `merchant_name`,
  `merchant_type`,
  `contact_name`,
  `contact_phone`,
  `contact_email`,
  `description`,
  `certification_status`,
  `status`,
  `expire_time`,
  `max_products`,
  `max_admins`,
  `commission_rate`
) VALUES
(
  'MERCHANT_001',
  '示例商户A',
  2,
  '张三',
  '13800138000',
  'zhangsan@merchant-a.com',
  '这是一个示例商户，用于测试多商户功能',
  2,
  1,
  DATE_ADD(NOW(), INTERVAL 1 YEAR),
  500,
  5,
  5.00
),
(
  'MERCHANT_002',
  '示例商户B',
  2,
  '李四',
  '13900139000',
  'lisi@merchant-b.com',
  '这是另一个示例商户',
  2,
  1,
  DATE_ADD(NOW(), INTERVAL 1 YEAR),
  300,
  3,
  5.00
);
*/

-- ============================================================
-- 完成提示
-- ============================================================
SELECT '✅ 多商户平台数据库迁移完成！' AS Status,
       '已创建商户表，并为角色、菜单、管理员、商品、订单、品牌表添加了商户关联' AS Message,
       (SELECT COUNT(*) FROM merchants) AS TotalMerchants,
       (SELECT COUNT(*) FROM roles WHERE merchant_id = 1) AS SuperMerchantRoles,
       (SELECT COUNT(*) FROM admins WHERE merchant_id = 1) AS SuperMerchantAdmins;
