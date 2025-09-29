-- 添加日志管理相关权限到 permissions 表
INSERT INTO `permissions` (`name`, `code`, `description`, `type`, `status`, `created_at`) VALUES
('日志管理', 'system:log', '日志管理权限', 'menu', 1, NOW()),
('登录日志', 'system:log:login', '登录日志查看权限', 'menu', 1, NOW()),
('操作日志', 'system:log:operation', '操作日志查看权限', 'menu', 1, NOW()),
('日志导出', 'system:log:export', '日志导出权限', 'button', 1, NOW()),
('日志删除', 'system:log:delete', '日志删除权限', 'button', 1, NOW());

-- 查看添加结果
SELECT * FROM permissions WHERE code LIKE 'system:log%';