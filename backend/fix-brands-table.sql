-- 修复brands表结构以匹配claude.md要求
-- 执行前请备份数据库！

-- 1. 添加缺失的字段
ALTER TABLE brands
  ADD COLUMN merchantId int NOT NULL DEFAULT 1 COMMENT '商户id',
  ADD COLUMN iconUrl varchar(255) NOT NULL DEFAULT '' COMMENT '品牌icon 必填',
  ADD COLUMN creator varchar(100) NULL COMMENT '品牌的创建者',
  ADD COLUMN createTime datetime NULL COMMENT '品牌的创建时间',
  ADD COLUMN updateTime datetime NULL COMMENT '品牌的更新时间',
  ADD COLUMN isAuth tinyint NULL DEFAULT 0 COMMENT '0 未认证 1 已认证',
  ADD COLUMN isHot tinyint NULL DEFAULT 0 COMMENT '0 不是热门 1 热门',
  ADD COLUMN label json NULL COMMENT '品牌标签数组';

-- 2. 重命名字段以匹配claude.md要求
ALTER TABLE brands
  CHANGE COLUMN logo logo_old varchar(255),
  CHANGE COLUMN created_at created_at_old timestamp,
  CHANGE COLUMN updated_at updated_at_old timestamp,
  CHANGE COLUMN sort_order sort_order_old int,
  CHANGE COLUMN status status_old tinyint;

-- 3. 添加新字段（如果上面的ALTER TABLE没有执行成功）
-- 这些是claude.md中要求的字段

-- 4. 创建索引
CREATE INDEX idx_brands_merchantId ON brands(merchantId);
CREATE INDEX idx_brands_status ON brands(status);
CREATE INDEX idx_brands_isAuth ON brands(isAuth);
CREATE INDEX idx_brands_isHot ON brands(isHot);

-- 5. 删除旧索引（如果存在）
DROP INDEX idx_status ON brands;
DROP INDEX idx_sort_order ON brands;

-- 6. 更新现有数据（如果需要）
UPDATE brands SET 
  merchantId = 1,
  iconUrl = COALESCE(logo_old, ''),
  createTime = created_at_old,
  updateTime = updated_at_old,
  isAuth = CASE WHEN status_old = 1 THEN 1 ELSE 0 END,
  isHot = 0,
  label = JSON_ARRAY()
WHERE merchantId IS NULL OR merchantId = 0;

-- 7. 添加外键约束（可选）
-- ALTER TABLE brands ADD CONSTRAINT fk_brands_merchantId 
--   FOREIGN KEY (merchantId) REFERENCES merchants(id) ON DELETE CASCADE;

-- 8. 最终验证查询
SELECT 
  COLUMN_NAME,
  DATA_TYPE,
  IS_NULLABLE,
  COLUMN_DEFAULT,
  COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'brands'
ORDER BY ORDINAL_POSITION;