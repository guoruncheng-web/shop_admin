-- 添加权限表的新字段
ALTER TABLE `permissions` 
ADD COLUMN `type` ENUM('menu', 'button', 'api') NOT NULL DEFAULT 'menu' COMMENT '权限类型：menu-菜单，button-按钮，api-接口' AFTER `description`,
ADD COLUMN `parent_id` BIGINT NULL COMMENT '父权限ID' AFTER `type`;

-- 插入初始权限数据
INSERT INTO `permissions` (`name`, `code`, `description`, `type`, `parent_id`, `status`) VALUES
-- 系统管理
(1, '系统管理', 'system', '系统管理模块', 'menu', NULL, 1),
(11, '用户管理', 'system:user', '用户管理页面', 'menu', 1, 1),
(111, '查看用户', 'system:user:view', '查看用户列表', 'button', 11, 1),
(112, '新增用户', 'system:user:add', '新增用户', 'button', 11, 1),
(113, '编辑用户', 'system:user:edit', '编辑用户信息', 'button', 11, 1),
(114, '删除用户', 'system:user:delete', '删除用户', 'button', 11, 1),
(115, '重置密码', 'system:user:reset-password', '重置用户密码', 'button', 11, 1),

(12, '角色管理', 'system:role', '角色管理页面', 'menu', 1, 1),
(121, '查看角色', 'system:role:view', '查看角色列表', 'button', 12, 1),
(122, '新增角色', 'system:role:add', '新增角色', 'button', 12, 1),
(123, '编辑角色', 'system:role:edit', '编辑角色信息', 'button', 12, 1),
(124, '删除角色', 'system:role:delete', '删除角色', 'button', 12, 1),
(125, '分配权限', 'system:role:permission', '为角色分配权限', 'button', 12, 1),

(13, '菜单管理', 'system:menu', '菜单管理页面', 'menu', 1, 1),
(131, '查看菜单', 'system:menu:view', '查看菜单列表', 'button', 13, 1),
(132, '新增菜单', 'system:menu:add', '新增菜单', 'button', 13, 1),
(133, '编辑菜单', 'system:menu:edit', '编辑菜单信息', 'button', 13, 1),
(134, '删除菜单', 'system:menu:delete', '删除菜单', 'button', 13, 1),

-- 商品管理
(2, '商品管理', 'product', '商品管理模块', 'menu', NULL, 1),
(21, '商品列表', 'product:list', '商品列表页面', 'menu', 2, 1),
(211, '查看商品', 'product:view', '查看商品详情', 'button', 21, 1),
(212, '新增商品', 'product:add', '新增商品', 'button', 21, 1),
(213, '编辑商品', 'product:edit', '编辑商品信息', 'button', 21, 1),
(214, '删除商品', 'product:delete', '删除商品', 'button', 21, 1),

(22, '分类管理', 'product:category', '商品分类管理', 'menu', 2, 1),
(221, '查看分类', 'product:category:view', '查看分类列表', 'button', 22, 1),
(222, '新增分类', 'product:category:add', '新增分类', 'button', 22, 1),
(223, '编辑分类', 'product:category:edit', '编辑分类信息', 'button', 22, 1),
(224, '删除分类', 'product:category:delete', '删除分类', 'button', 22, 1),

-- 订单管理
(3, '订单管理', 'order', '订单管理模块', 'menu', NULL, 1),
(31, '订单列表', 'order:list', '订单列表页面', 'menu', 3, 1),
(311, '查看订单', 'order:view', '查看订单详情', 'button', 31, 1),
(312, '处理订单', 'order:process', '处理订单状态', 'button', 31, 1),
(313, '取消订单', 'order:cancel', '取消订单', 'button', 31, 1),
(314, '退款订单', 'order:refund', '订单退款', 'button', 31, 1);

-- 创建超级管理员角色并分配所有权限
INSERT INTO `roles` (`name`, `code`, `description`, `status`) VALUES
('超级管理员', 'super_admin', '拥有所有权限的超级管理员角色', 1);

-- 获取刚创建的角色ID和所有权限ID，建立关联关系
SET @role_id = LAST_INSERT_ID();

INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT @role_id, `id` FROM `permissions` WHERE `status` = 1;