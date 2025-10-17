-- 创建品牌表
CREATE TABLE IF NOT EXISTS `brands` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `merchant_id` INT NOT NULL COMMENT '商户ID',
  `name` VARCHAR(255) NOT NULL COMMENT '品牌名称',
  `icon_url` TEXT NOT NULL COMMENT '品牌图标URL',
  `creator_id` INT NULL COMMENT '创建者ID',
  `label` JSON NULL COMMENT '品牌标签',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `is_auth` TINYINT NOT NULL DEFAULT 0 COMMENT '认证状态：0-未认证，1-已认证',
  `is_hot` TINYINT NOT NULL DEFAULT 0 COMMENT '热门状态：0-不是热门，1-热门',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_brand_name` (`name`),
  KEY `idx_merchant_status` (`merchant_id`, `status`),
  KEY `idx_merchant_auth` (`merchant_id`, `is_auth`),
  KEY `idx_merchant_hot` (`merchant_id`, `is_hot`),
  KEY `idx_creator` (`creator_id`),
  CONSTRAINT `fk_brands_merchant` FOREIGN KEY (`merchant_id`) REFERENCES `merchants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_brands_creator` FOREIGN KEY (`creator_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='品牌表';

-- 添加品牌管理菜单权限
INSERT INTO `permissions` (`code`, `name`, `description`, `create_time`, `update_time`) VALUES
('system:brands:view', '查看品牌列表', '品牌管理-查看品牌列表权限', NOW(), NOW()),
('system:brands:viewAll', '查看所有品牌', '品牌管理-查看所有品牌权限', NOW(), NOW()),
('system:brands:details', '查看品牌详情', '品牌管理-查看品牌详情权限', NOW(), NOW()),
('system:brands:add', '创建品牌', '品牌管理-创建品牌权限', NOW(), NOW()),
('system:brands:edit', '编辑品牌', '品牌管理-编辑品牌权限', NOW(), NOW()),
('system:brands:delete', '删除品牌', '品牌管理-删除品牌权限', NOW(), NOW()),
('system:brands:batchStatus', '批量更新状态', '品牌管理-批量更新状态权限', NOW(), NOW()),
('system:brands:batchAuth', '批量认证', '品牌管理-批量认证权限', NOW(), NOW()),
('system:brands:statistics', '查看统计', '品牌管理-查看统计权限', NOW(), NOW())
ON DUPLICATE KEY UPDATE `update_time` = NOW();

-- 添加品牌管理菜单
INSERT INTO `menus` (`parent_id`, `name`, `path`, `component`, `icon`, `type`, `permission`, `sort`, `status`, `create_time`, `update_time`, `merchant_id`) VALUES
(0, '品牌管理', '/brands', '', 'shopping-cart', 1, 'system:brands:view', 30, 1, NOW(), NOW(), 1),
((SELECT id FROM `menus` WHERE `name` = '品牌管理' AND `merchant_id` = 1), '品牌列表', '/brands/list', 'system/brands/index', '', 2, 'system:brands:view', 1, 1, NOW(), NOW(), 1),
((SELECT id FROM `menus` WHERE `name` = '品牌管理' AND `merchant_id` = 1), '新增品牌', '', '', 'plus', 3, 'system:brands:add', 2, 1, NOW(), NOW(), 1),
((SELECT id FROM `menus` WHERE `name` = '品牌管理' AND `merchant_id` = 1), '编辑品牌', '', '', 'edit', 3, 'system:brands:edit', 3, 1, NOW(), NOW(), 1),
((SELECT id FROM `menus` WHERE `name` = '品牌管理' AND `merchant_id` = 1), '删除品牌', '', '', 'delete', 3, 'system:brands:delete', 4, 1, NOW(), NOW(), 1)
ON DUPLICATE KEY UPDATE `update_time` = NOW();

-- 为超级管理员角色添加品牌管理权限
INSERT INTO `role_permissions` (`role_id`, `permission_id`, `create_time`, `update_time`)
SELECT r.id, p.id, NOW(), NOW()
FROM `roles` r
CROSS JOIN `permissions` p
WHERE r.code = 'super_admin' 
AND p.code IN (
  'system:brands:view', 'system:brands:viewAll', 'system:brands:details', 
  'system:brands:add', 'system:brands:edit', 'system:brands:delete',
  'system:brands:batchStatus', 'system:brands:batchAuth', 'system:brands:statistics'
)
ON DUPLICATE KEY UPDATE `update_time` = NOW();