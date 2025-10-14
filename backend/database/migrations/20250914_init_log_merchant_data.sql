-- 初始化登录日志和操作日志的商户ID数据
-- 将现有数据的商户ID设置为平台超级商户ID(1)

-- 1. 初始化登录日志表的商户ID
UPDATE user_login_logs 
SET merchant_id = 1 
WHERE merchant_id IS NULL;

-- 2. 初始化操作日志表的商户ID
UPDATE operation_logs 
SET merchant_id = 1 
WHERE merchant_id IS NULL;

-- 3. 为登录日志表添加外键约束（如果merchants表存在）
ALTER TABLE user_login_logs 
ADD CONSTRAINT fk_user_login_logs_merchant 
FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE SET NULL;

-- 4. 为操作日志表添加外键约束（如果merchants表存在）
ALTER TABLE operation_logs 
ADD CONSTRAINT fk_operation_logs_merchant 
FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE SET NULL;

-- 记录迁移信息
INSERT INTO migration_notes (version, description, created_at) VALUES 
('20250914_init_log_merchant_data', '初始化登录日志和操作日志的商户ID数据', NOW())
ON DUPLICATE KEY UPDATE description = VALUES(description), created_at = VALUES(created_at);