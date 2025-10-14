-- 添加商户ID外键到相关表
-- 为多商户支持做准备

-- 1. 为 resource_categories 表添加 merchant_id 外键
ALTER TABLE resource_categories 
ADD COLUMN merchant_id BIGINT NOT NULL DEFAULT 1 COMMENT '所属商户ID';

-- 为 resource_categories 表添加索引
CREATE INDEX idx_resource_categories_merchant_id ON resource_categories(merchant_id);

-- 更新现有数据的商户ID为平台超级商户ID(1)
UPDATE resource_categories SET merchant_id = 1 WHERE merchant_id IS NULL OR merchant_id = 0;

-- 2. 为 menus 表添加 merchant_id 外键（如果不存在）
ALTER TABLE menus 
ADD COLUMN IF NOT EXISTS merchant_id BIGINT NOT NULL DEFAULT 1 COMMENT '所属商户ID';

-- 为 menus 表添加索引
CREATE INDEX IF NOT EXISTS idx_menus_merchant_id ON menus(merchant_id);

-- 更新现有数据的商户ID为平台超级商户ID(1)
UPDATE menus SET merchant_id = 1 WHERE merchant_id IS NULL OR merchant_id = 0;

-- 3. 为 resources 表添加 merchant_id 外键
ALTER TABLE resources 
ADD COLUMN merchant_id BIGINT NOT NULL DEFAULT 1 COMMENT '所属商户ID';

-- 为 resources 表添加索引
CREATE INDEX idx_resources_merchant_id ON resources(merchant_id);

-- 更新现有数据的商户ID为平台超级商户ID(1)
UPDATE resources SET merchant_id = 1 WHERE merchant_id IS NULL OR merchant_id = 0;

-- 4. 为 roles 表添加 merchant_id 外键
ALTER TABLE roles 
ADD COLUMN merchant_id BIGINT NOT NULL DEFAULT 1 COMMENT '所属商户ID';

-- 为 roles 表添加索引
CREATE INDEX idx_roles_merchant_id ON roles(merchant_id);

-- 更新现有数据的商户ID为平台超级商户ID(1)
UPDATE roles SET merchant_id = 1 WHERE merchant_id IS NULL OR merchant_id = 0;

-- 5. 为 admins 表添加 merchant_id 外键（如果不存在）
ALTER TABLE admins 
ADD COLUMN IF NOT EXISTS merchant_id BIGINT NOT NULL DEFAULT 1 COMMENT '所属商户ID';

-- 为 admins 表添加索引
CREATE INDEX IF NOT EXISTS idx_admins_merchant_id ON admins(merchant_id);

-- 更新现有数据的商户ID为平台超级商户ID(1)
UPDATE admins SET merchant_id = 1 WHERE merchant_id IS NULL OR merchant_id = 0;

-- 6. 为 operation_logs 表添加 merchant_id 外键
ALTER TABLE operation_logs 
ADD COLUMN merchant_id BIGINT NULL COMMENT '所属商户ID';

-- 为 operation_logs 表添加索引
CREATE INDEX idx_operation_logs_merchant_id ON operation_logs(merchant_id);

-- 7. 为 user_login_logs 表添加 merchant_id 外键
ALTER TABLE user_login_logs 
ADD COLUMN merchant_id BIGINT NULL COMMENT '所属商户ID';

-- 为 user_login_logs 表添加索引
CREATE INDEX idx_user_login_logs_merchant_id ON user_login_logs(merchant_id);

-- 添加外键约束（确保数据完整性）
-- 注意：如果 merchants 表不存在，这些约束会失败，需要先确保 merchants 表存在

-- 假设 merchants 表存在，添加外键约束
-- ALTER TABLE resource_categories ADD CONSTRAINT fk_resource_categories_merchant 
-- FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE;

-- ALTER TABLE menus ADD CONSTRAINT fk_menus_merchant 
-- FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE;

-- ALTER TABLE resources ADD CONSTRAINT fk_resources_merchant 
-- FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE;

-- ALTER TABLE roles ADD CONSTRAINT fk_roles_merchant 
-- FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE;

-- ALTER TABLE admins ADD CONSTRAINT fk_admins_merchant 
-- FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE;

-- ALTER TABLE operation_logs ADD CONSTRAINT fk_operation_logs_merchant 
-- FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE SET NULL;

-- ALTER TABLE user_login_logs ADD CONSTRAINT fk_user_login_logs_merchant 
-- FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE SET NULL;

-- 插入一条注释说明
INSERT INTO migration_notes (version, description, created_at) VALUES 
('20250914_add_merchant_id_to_tables', '为多商户支持添加商户ID外键到相关表', NOW())
ON DUPLICATE KEY UPDATE description = VALUES(description), created_at = VALUES(created_at);