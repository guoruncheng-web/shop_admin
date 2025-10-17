-- 添加品牌管理菜单权限
INSERT INTO `permissions` (`code`, `name`, `description`, `created_at`, `updated_at`) VALUES
('system:brands:view', '查看品牌列表', '品牌管理-查看品牌列表权限', NOW(), NOW()),
('system:brands:viewAll', '查看所有品牌', '品牌管理-查看所有品牌权限', NOW(), NOW()),
('system:brands:details', '查看品牌详情', '品牌管理-查看品牌详情权限', NOW(), NOW()),
('system:brands:add', '创建品牌', '品牌管理-创建品牌权限', NOW(), NOW()),
('system:brands:edit', '编辑品牌', '品牌管理-编辑品牌权限', NOW(), NOW()),
('system:brands:delete', '删除品牌', '品牌管理-删除品牌权限', NOW(), NOW()),
('system:brands:batchStatus', '批量更新状态', '品牌管理-批量更新状态权限', NOW(), NOW()),
('system:brands:batchAuth', '批量认证', '品牌管理-批量认证权限', NOW(), NOW()),
('system:brands:statistics', '查看统计', '品牌管理-查看统计权限', NOW(), NOW())
ON DUPLICATE KEY UPDATE `updated_at` = NOW();

-- 添加品牌管理菜单
INSERT INTO `menus` (`parent_id`, `name`, `path`, `component`, `icon`, `type`, `authority`, `order_num`, `status`, `created_at`, `updated_at`, `merchant_id`) VALUES
(0, '品牌管理', '/brands', '', 'shopping-cart', 1, 'system:brands:view', 30, 1, NOW(), NOW(), 1),
((SELECT id FROM `menus` WHERE `name` = '品牌管理' AND `merchant_id` = 1), '品牌列表', '/brands/list', 'system/brands/index', '', 2, 'system:brands:view', 1, 1, NOW(), NOW(), 1),
((SELECT id FROM `menus` WHERE `name` = '品牌管理' AND `merchant_id` = 1), '新增品牌', '', '', 'plus', 3, 'system:brands:add', 2, 1, NOW(), NOW(), 1),
((SELECT id FROM `menus` WHERE `name` = '品牌管理' AND `merchant_id` = 1), '编辑品牌', '', '', 'edit', 3, 'system:brands:edit', 3, 1, NOW(), NOW(), 1),
((SELECT id FROM `menus` WHERE `name` = '品牌管理' AND `merchant_id` = 1), '删除品牌', '', '', 'delete', 3, 'system:brands:delete', 4, 1, NOW(), NOW(), 1)
ON DUPLICATE KEY UPDATE `updated_at` = NOW();

-- 为超级管理员角色添加品牌管理权限
INSERT INTO `role_permissions` (`role_id`, `permission_id`, `created_at`, `updated_at`)
SELECT r.id, p.id, NOW(), NOW()
FROM `roles` r
CROSS JOIN `permissions` p
WHERE r.code = 'super_admin' 
AND p.code IN (
  'system:brands:view', 'system:brands:viewAll', 'system:brands:details', 
  'system:brands:add', 'system:brands:edit', 'system:brands:delete',
  'system:brands:batchStatus', 'system:brands:batchAuth', 'system:brands:statistics'
)
ON DUPLICATE KEY UPDATE `updated_at` = NOW();