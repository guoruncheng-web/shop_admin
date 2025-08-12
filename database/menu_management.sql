-- 添加菜单管理目录和相关菜单
-- 菜单类型：1目录，2菜单，3按钮

-- 1. 菜单管理目录
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, createdAt) VALUES 
('菜单管理', '/menu-management', 'Layout', 'Menu', 1, 8, true, true, NULL, NOW());

-- 2. 菜单列表页面
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, createdAt) VALUES 
('菜单列表', '/menu-management/list', 'menu-management/list/index', 'List', 2, 1, true, true, 44, NOW());

-- 3. 菜单树形页面
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, createdAt) VALUES 
('菜单树形', '/menu-management/tree', 'menu-management/tree/index', 'Share', 2, 2, true, true, 44, NOW());

-- 4. 菜单权限配置页面
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, createdAt) VALUES 
('权限配置', '/menu-management/permission', 'menu-management/permission/index', 'Lock', 2, 3, true, true, 44, NOW());

-- 5. 菜单角色分配页面
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, createdAt) VALUES 
('角色分配', '/menu-management/role', 'menu-management/role/index', 'UserFilled', 2, 4, true, true, 44, NOW());

-- 添加按钮权限（type=3）
-- 菜单列表按钮
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, buttonKey, createdAt) VALUES 
('菜单查询', '', '', '', 3, 1, true, true, 45, 'menu-list:query', NOW()),
('菜单新增', '', '', '', 3, 2, true, true, 45, 'menu-list:add', NOW()),
('菜单修改', '', '', '', 3, 3, true, true, 45, 'menu-list:edit', NOW()),
('菜单删除', '', '', '', 3, 4, true, true, 45, 'menu-list:delete', NOW()),
('菜单导出', '', '', '', 3, 5, true, true, 45, 'menu-list:export', NOW()),
('菜单排序', '', '', '', 3, 6, true, true, 45, 'menu-list:sort', NOW());

-- 菜单树形按钮
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, buttonKey, createdAt) VALUES 
('树形查询', '', '', '', 3, 1, true, true, 46, 'menu-tree:query', NOW()),
('树形展开', '', '', '', 3, 2, true, true, 46, 'menu-tree:expand', NOW()),
('树形收起', '', '', '', 3, 3, true, true, 46, 'menu-tree:collapse', NOW()),
('树形拖拽', '', '', '', 3, 4, true, true, 46, 'menu-tree:drag', NOW());

-- 权限配置按钮
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, buttonKey, createdAt) VALUES 
('权限查询', '', '', '', 3, 1, true, true, 47, 'menu-permission:query', NOW()),
('权限分配', '', '', '', 3, 2, true, true, 47, 'menu-permission:assign', NOW()),
('权限撤销', '', '', '', 3, 3, true, true, 47, 'menu-permission:revoke', NOW()),
('权限继承', '', '', '', 3, 4, true, true, 47, 'menu-permission:inherit', NOW());

-- 角色分配按钮
INSERT INTO menus (name, path, component, icon, type, sort, visible, status, parent_id, buttonKey, createdAt) VALUES 
('角色查询', '', '', '', 3, 1, true, true, 48, 'menu-role:query', NOW()),
('角色分配', '', '', '', 3, 2, true, true, 48, 'menu-role:assign', NOW()),
('角色撤销', '', '', '', 3, 3, true, true, 48, 'menu-role:revoke', NOW()),
('批量分配', '', '', '', 3, 4, true, true, 48, 'menu-role:batch', NOW());
