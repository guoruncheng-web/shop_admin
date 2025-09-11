-- Fix missing tables for admin roles and permissions
-- The backend code expects many-to-many relationships but the current DB has simple foreign keys

USE wechat_mall;

-- Create permissions table
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '权限ID',
  `name` VARCHAR(50) NOT NULL COMMENT '权限名称',
  `code` VARCHAR(100) NOT NULL UNIQUE COMMENT '权限代码',
  `description` VARCHAR(200) COMMENT '权限描述',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_code` (`code`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限表';

-- Create admin_roles table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS `admin_roles` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
  `admin_id` BIGINT NOT NULL COMMENT '管理员ID',
  `role_id` BIGINT NOT NULL COMMENT '角色ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_admin_role` (`admin_id`, `role_id`),
  INDEX `idx_admin_id` (`admin_id`),
  INDEX `idx_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员角色关联表';

-- Create role_permissions table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
  `role_id` BIGINT NOT NULL COMMENT '角色ID',
  `permission_id` BIGINT NOT NULL COMMENT '权限ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_role_permission` (`role_id`, `permission_id`),
  INDEX `idx_role_id` (`role_id`),
  INDEX `idx_permission_id` (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限关联表';

-- Insert basic permissions
INSERT IGNORE INTO `permissions` (`name`, `code`, `description`) VALUES
('系统管理', 'system:admin', '系统管理权限'),
('用户管理', 'system:user', '用户管理权限'),
('角色管理', 'system:role', '角色管理权限'),
('菜单管理', 'system:menu', '菜单管理权限'),
('商品管理', 'product:list', '商品列表权限'),
('商品新增', 'product:add', '商品新增权限'),
('商品编辑', 'product:edit', '商品编辑权限'),
('商品删除', 'product:delete', '商品删除权限'),
('订单管理', 'order:list', '订单列表权限'),
('订单详情', 'order:detail', '订单详情权限');

-- Update roles table structure (remove permissions JSON column, use relationship table instead)
-- Check if permissions column exists and drop it
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'wechat_mall' 
     AND TABLE_NAME = 'roles' 
     AND COLUMN_NAME = 'permissions') > 0,
    'ALTER TABLE `roles` DROP COLUMN `permissions`',
    'SELECT "Column permissions does not exist" as info'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if code column exists and add it
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'wechat_mall' 
     AND TABLE_NAME = 'roles' 
     AND COLUMN_NAME = 'code') = 0,
    'ALTER TABLE `roles` ADD COLUMN `code` VARCHAR(50) UNIQUE COMMENT "角色代码"',
    'SELECT "Column code already exists" as info'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update roles with codes
UPDATE `roles` SET `code` = 'super_admin' WHERE `name` = '超级管理员';
UPDATE `roles` SET `code` = 'admin' WHERE `name` = '管理员';
UPDATE `roles` SET `code` = 'product_admin' WHERE `name` = '商品管理员';
UPDATE `roles` SET `code` = 'order_admin' WHERE `name` = '订单管理员';
UPDATE `roles` SET `code` = 'user_admin' WHERE `name` = '用户管理员';

-- Migrate existing admin role relationships
-- Insert into admin_roles based on existing role_id in admins table
INSERT IGNORE INTO `admin_roles` (`admin_id`, `role_id`)
SELECT `id`, `role_id` FROM `admins` WHERE `role_id` IS NOT NULL;

-- Assign permissions to roles
-- Super admin gets all permissions
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.id, p.id 
FROM `roles` r, `permissions` p 
WHERE r.code = 'super_admin';

-- Admin gets most permissions
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.id, p.id 
FROM `roles` r, `permissions` p 
WHERE r.code = 'admin' AND p.code IN ('system:user', 'product:list', 'product:add', 'product:edit', 'order:list', 'order:detail');

-- Product admin gets product permissions
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.id, p.id 
FROM `roles` r, `permissions` p 
WHERE r.code = 'product_admin' AND p.code LIKE 'product:%';

-- Order admin gets order permissions
INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT r.id, p.id 
FROM `roles` r, `permissions` p 
WHERE r.code = 'order_admin' AND p.code LIKE 'order:%';

-- Add indexes for better performance (ignore errors if they already exist)
CREATE INDEX `idx_menu_query_optimization` ON `menus`(`status`, `hide_in_menu`, `type`, `permission_id`);
CREATE INDEX `idx_menu_order` ON `menus`(`order_num`);

-- Show results
SELECT 'Tables created successfully' as status;
SELECT COUNT(*) as permission_count FROM permissions;
SELECT COUNT(*) as admin_role_count FROM admin_roles;
SELECT COUNT(*) as role_permission_count FROM role_permissions;