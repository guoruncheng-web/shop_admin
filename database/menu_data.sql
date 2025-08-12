-- 插入菜单数据
-- 菜单类型：1目录，2菜单，3按钮

-- 1. 系统管理目录
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, createdAt) VALUES 
('系统管理', '/system', 'Layout', 'Setting', 1, 1, true, true, NULL, NOW());

-- 2. 用户管理菜单
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, createdAt) VALUES 
('用户管理', '/system/user', 'system/user/index', 'User', 2, 1, true, true, 1, NOW());

-- 3. 角色管理菜单
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, createdAt) VALUES 
('角色管理', '/system/role', 'system/role/index', 'UserFilled', 2, 2, true, true, 1, NOW());

-- 4. 菜单管理菜单
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, createdAt) VALUES 
('菜单管理', '/system/menu', 'system/menu/index', 'Menu', 2, 3, true, true, 1, NOW());

-- 5. 权限管理菜单
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, createdAt) VALUES 
('权限管理', '/system/permission', 'system/permission/index', 'Lock', 2, 4, true, true, 1, NOW());

-- 6. 内容管理目录
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, createdAt) VALUES 
('内容管理', '/content', 'Layout', 'Document', 1, 2, true, true, NULL, NOW());

-- 7. 商品管理菜单
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, createdAt) VALUES 
('商品管理', '/content/product', 'content/product/index', 'Goods', 2, 1, true, true, 6, NOW());

-- 8. 分类管理菜单
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, createdAt) VALUES 
('分类管理', '/content/category', 'content/category/index', 'Files', 2, 2, true, true, 6, NOW());

-- 9. 订单管理目录
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, createdAt) VALUES 
('订单管理', '/order', 'Layout', 'ShoppingCart', 1, 3, true, true, NULL, NOW());

-- 10. 订单列表菜单
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, createdAt) VALUES 
('订单列表', '/order/list', 'order/list/index', 'List', 2, 1, true, true, 9, NOW());

-- 11. 营销管理目录
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, createdAt) VALUES 
('营销管理', '/marketing', 'Layout', 'Promotion', 1, 4, true, true, NULL, NOW());

-- 12. 优惠券管理菜单
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, createdAt) VALUES 
('优惠券管理', '/marketing/coupon', 'marketing/coupon/index', 'Ticket', 2, 1, true, true, 11, NOW());

-- 13. 数据统计目录
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, createdAt) VALUES 
('数据统计', '/statistics', 'Layout', 'DataAnalysis', 1, 5, true, true, NULL, NOW());

-- 14. 销售统计菜单
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, createdAt) VALUES 
('销售统计', '/statistics/sales', 'statistics/sales/index', 'TrendCharts', 2, 1, true, true, 13, NOW());

-- 15. 用户统计菜单
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, createdAt) VALUES 
('用户统计', '/statistics/user', 'statistics/user/index', 'PieChart', 2, 2, true, true, 13, NOW());

-- 16. 系统监控目录
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, createdAt) VALUES 
('系统监控', '/monitor', 'Layout', 'Monitor', 1, 6, true, true, NULL, NOW());

-- 17. 操作日志菜单
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, createdAt) VALUES 
('操作日志', '/monitor/log', 'monitor/log/index', 'Document', 2, 1, true, true, 16, NOW());

-- 18. 登录日志菜单
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, createdAt) VALUES 
('登录日志', '/monitor/login-log', 'monitor/login-log/index', 'Key', 2, 2, true, true, 16, NOW());

-- 19. 系统设置目录
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, createdAt) VALUES 
('系统设置', '/settings', 'Layout', 'Tools', 1, 7, true, true, NULL, NOW());

-- 20. 网站设置菜单
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, createdAt) VALUES 
('网站设置', '/settings/website', 'settings/website/index', 'Globe', 2, 1, true, true, 19, NOW());

-- 21. 个人中心菜单
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, createdAt) VALUES 
('个人中心', '/profile', 'profile/index', 'User', 2, 8, true, true, NULL, NOW());

-- 添加按钮权限（type=3）
-- 用户管理按钮
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, buttonKey, createdAt) VALUES 
('用户查询', '', '', '', 3, 1, true, true, 2, 'user:query', NOW()),
('用户新增', '', '', '', 3, 2, true, true, 2, 'user:add', NOW()),
('用户修改', '', '', '', 3, 3, true, true, 2, 'user:edit', NOW()),
('用户删除', '', '', '', 3, 4, true, true, 2, 'user:delete', NOW()),
('用户导出', '', '', '', 3, 5, true, true, 2, 'user:export', NOW());

-- 角色管理按钮
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, buttonKey, createdAt) VALUES 
('角色查询', '', '', '', 3, 1, true, true, 3, 'role:query', NOW()),
('角色新增', '', '', '', 3, 2, true, true, 3, 'role:add', NOW()),
('角色修改', '', '', '', 3, 3, true, true, 3, 'role:edit', NOW()),
('角色删除', '', '', '', 3, 4, true, true, 3, 'role:delete', NOW());

-- 菜单管理按钮
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, buttonKey, createdAt) VALUES 
('菜单查询', '', '', '', 3, 1, true, true, 4, 'menu:query', NOW()),
('菜单新增', '', '', '', 3, 2, true, true, 4, 'menu:add', NOW()),
('菜单修改', '', '', '', 3, 3, true, true, 4, 'menu:edit', NOW()),
('菜单删除', '', '', '', 3, 4, true, true, 4, 'menu:delete', NOW());

-- 商品管理按钮
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, buttonKey, createdAt) VALUES 
('商品查询', '', '', '', 3, 1, true, true, 7, 'product:query', NOW()),
('商品新增', '', '', '', 3, 2, true, true, 7, 'product:add', NOW()),
('商品修改', '', '', '', 3, 3, true, true, 7, 'product:edit', NOW()),
('商品删除', '', '', '', 3, 4, true, true, 7, 'product:delete', NOW()),
('商品上下架', '', '', '', 3, 5, true, true, 7, 'product:status', NOW());

-- 订单管理按钮
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, buttonKey, createdAt) VALUES 
('订单查询', '', '', '', 3, 1, true, true, 10, 'order:query', NOW()),
('订单详情', '', '', '', 3, 2, true, true, 10, 'order:detail', NOW()),
('订单发货', '', '', '', 3, 3, true, true, 10, 'order:ship', NOW()),
('订单取消', '', '', '', 3, 4, true, true, 10, 'order:cancel', NOW());
