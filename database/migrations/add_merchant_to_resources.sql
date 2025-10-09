-- ============================================================
-- 资源管理多商户支持迁移脚本
-- Resource Management Multi-Tenant Support Migration
-- ============================================================
-- 功能说明：
-- 1. 为资源分类表(resource_categories)添加商户关联
-- 2. 为资源表(resources)添加商户关联
-- 3. 迁移现有数据到超级商户
-- ============================================================

USE `wechat_mall`;

SET @dbname = DATABASE();

-- ============================================================
-- 1. 资源分类表 - 添加商户关联
-- ============================================================

-- 检查resource_categories表是否存在
SET @resource_categories_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'resource_categories');

-- 如果表存在，添加merchant_id列
SET @preparedStatement = IF(@resource_categories_exists = 0,
  "SELECT '⚠️  resource_categories表不存在，跳过' AS Message",
  (SELECT IF(
    (
      SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'resource_categories'
      AND COLUMN_NAME = 'merchant_id'
    ) > 0,
    "SELECT '✅ resource_categories表已有merchant_id字段' AS Message",
    "ALTER TABLE resource_categories ADD COLUMN merchant_id BIGINT NOT NULL DEFAULT 1 COMMENT '所属商户ID' AFTER id"
  ))
);
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 添加外键约束
SET @preparedStatement = IF(@resource_categories_exists = 0,
  "SELECT 1",
  IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA = @dbname
      AND TABLE_NAME = 'resource_categories'
      AND CONSTRAINT_NAME = 'fk_resource_categories_merchant_id') > 0,
    "SELECT '✅ resource_categories外键已存在' AS Message",
    "ALTER TABLE resource_categories ADD CONSTRAINT fk_resource_categories_merchant_id FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE"
  )
);
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 添加索引
SET @preparedStatement = IF(@resource_categories_exists = 0,
  "SELECT 1",
  IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'resource_categories'
      AND INDEX_NAME = 'idx_merchant_id') > 0,
    "SELECT '✅ resource_categories索引已存在' AS Message",
    "ALTER TABLE resource_categories ADD INDEX idx_merchant_id (merchant_id)"
  )
);
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 添加组合索引
SET @preparedStatement = IF(@resource_categories_exists = 0,
  "SELECT 1",
  IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'resource_categories'
      AND INDEX_NAME = 'idx_merchant_parent_status') > 0,
    "SELECT '✅ resource_categories组合索引已存在' AS Message",
    "ALTER TABLE resource_categories ADD INDEX idx_merchant_parent_status (merchant_id, parent_id, status)"
  )
);
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 更新现有数据
SET @preparedStatement = IF(@resource_categories_exists = 0,
  "SELECT 1",
  "UPDATE resource_categories SET merchant_id = 1 WHERE merchant_id IS NULL OR merchant_id = 0"
);
PREPARE updateIfExists FROM @preparedStatement;
EXECUTE updateIfExists;
DEALLOCATE PREPARE updateIfExists;

-- ============================================================
-- 2. 资源表 - 添加商户关联
-- ============================================================

-- 检查resources表是否存在
SET @resources_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'resources');

-- 如果表存在，添加merchant_id列
SET @preparedStatement = IF(@resources_exists = 0,
  "SELECT '⚠️  resources表不存在，跳过' AS Message",
  (SELECT IF(
    (
      SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'resources'
      AND COLUMN_NAME = 'merchant_id'
    ) > 0,
    "SELECT '✅ resources表已有merchant_id字段' AS Message",
    "ALTER TABLE resources ADD COLUMN merchant_id BIGINT NOT NULL DEFAULT 1 COMMENT '所属商户ID' AFTER id"
  ))
);
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 添加外键约束
SET @preparedStatement = IF(@resources_exists = 0,
  "SELECT 1",
  IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA = @dbname
      AND TABLE_NAME = 'resources'
      AND CONSTRAINT_NAME = 'fk_resources_merchant_id') > 0,
    "SELECT '✅ resources外键已存在' AS Message",
    "ALTER TABLE resources ADD CONSTRAINT fk_resources_merchant_id FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE"
  )
);
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 添加索引
SET @preparedStatement = IF(@resources_exists = 0,
  "SELECT 1",
  IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'resources'
      AND INDEX_NAME = 'idx_merchant_id') > 0,
    "SELECT '✅ resources索引已存在' AS Message",
    "ALTER TABLE resources ADD INDEX idx_merchant_id (merchant_id)"
  )
);
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 添加组合索引
SET @preparedStatement = IF(@resources_exists = 0,
  "SELECT 1",
  IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'resources'
      AND INDEX_NAME = 'idx_merchant_category_status') > 0,
    "SELECT '✅ resources组合索引已存在' AS Message",
    "ALTER TABLE resources ADD INDEX idx_merchant_category_status (merchant_id, category_id, status)"
  )
);
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 更新现有数据
SET @preparedStatement = IF(@resources_exists = 0,
  "SELECT 1",
  "UPDATE resources SET merchant_id = 1 WHERE merchant_id IS NULL OR merchant_id = 0"
);
PREPARE updateIfExists FROM @preparedStatement;
EXECUTE updateIfExists;
DEALLOCATE PREPARE updateIfExists;

-- ============================================================
-- 3. 创建商户资源统计视图
-- ============================================================

DROP VIEW IF EXISTS `merchant_resource_stats`;

CREATE VIEW `merchant_resource_stats` AS
SELECT
  m.id AS merchant_id,
  m.merchant_code,
  m.merchant_name,
  COUNT(DISTINCT rc.id) AS total_categories,
  COUNT(DISTINCT r.id) AS total_resources,
  COUNT(DISTINCT CASE WHEN r.type = 'image' THEN r.id END) AS total_images,
  COUNT(DISTINCT CASE WHEN r.type = 'video' THEN r.id END) AS total_videos,
  COALESCE(SUM(r.file_size), 0) AS total_storage_used,
  m.max_storage,
  ROUND(COALESCE(SUM(r.file_size), 0) / m.max_storage * 100, 2) AS storage_usage_percent
FROM merchants m
LEFT JOIN resource_categories rc ON m.id = rc.merchant_id AND rc.status = 1
LEFT JOIN resources r ON m.id = r.merchant_id AND r.status = 1
GROUP BY m.id;

-- ============================================================
-- 4. 创建商户资源分类视图
-- ============================================================

DROP VIEW IF EXISTS `merchant_resource_categories_view`;

CREATE VIEW `merchant_resource_categories_view` AS
SELECT
  rc.id,
  rc.merchant_id,
  m.merchant_name,
  rc.name AS category_name,
  rc.parent_id,
  parent.name AS parent_name,
  rc.level,
  rc.sort_order,
  rc.status,
  COUNT(DISTINCT r.id) AS resource_count,
  COALESCE(SUM(r.file_size), 0) AS total_size,
  rc.created_at,
  rc.updated_at
FROM resource_categories rc
INNER JOIN merchants m ON rc.merchant_id = m.id
LEFT JOIN resource_categories parent ON rc.parent_id = parent.id
LEFT JOIN resources r ON rc.id = r.category_id AND r.status = 1
GROUP BY rc.id;

-- ============================================================
-- 完成提示
-- ============================================================
SELECT
  '✅ 资源管理多商户支持迁移完成！' AS Status,
  '已为资源分类和资源表添加商户关联' AS Message,
  (SELECT COUNT(*) FROM resource_categories WHERE merchant_id = 1) AS SuperMerchantCategories,
  (SELECT COUNT(*) FROM resources WHERE merchant_id = 1) AS SuperMerchantResources,
  (SELECT CONCAT(ROUND(SUM(file_size) / 1024 / 1024, 2), ' MB') FROM resources WHERE merchant_id = 1) AS SuperMerchantStorageUsed;
