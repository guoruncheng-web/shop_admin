-- 优化后的菜单表结构
-- 根据前端路由菜单展示逻辑进行字段优化

DROP TABLE IF EXISTS `menus`;

CREATE TABLE `menus` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '菜单ID',
  
  -- 基础路由信息
  `name` VARCHAR(100) NOT NULL COMMENT '路由名称/菜单名称',
  `path` VARCHAR(200) COMMENT '路由路径',
  `component` VARCHAR(200) COMMENT '组件路径',
  `redirect` VARCHAR(200) COMMENT '重定向路径',
  
  -- Meta 属性字段
  `title` VARCHAR(100) NOT NULL COMMENT '菜单标题（显示名称）',
  `icon` VARCHAR(100) COMMENT '菜单图标',
  `active_icon` VARCHAR(100) COMMENT '激活状态图标',
  `order_num` INT DEFAULT 0 COMMENT '排序号（用于菜单排序）',
  
  -- 显示控制
  `hide_in_menu` TINYINT DEFAULT 0 COMMENT '是否在菜单中隐藏：0-显示，1-隐藏',
  `hide_children_in_menu` TINYINT DEFAULT 0 COMMENT '子菜单是否在菜单中隐藏：0-显示，1-隐藏',
  `hide_in_breadcrumb` TINYINT DEFAULT 0 COMMENT '是否在面包屑中隐藏：0-显示，1-隐藏',
  `hide_in_tab` TINYINT DEFAULT 0 COMMENT '是否在标签页中隐藏：0-显示，1-隐藏',
  
  -- 功能控制
  `keep_alive` TINYINT DEFAULT 0 COMMENT '是否开启KeepAlive缓存：0-关闭，1-开启',
  `ignore_access` TINYINT DEFAULT 0 COMMENT '是否忽略权限直接访问：0-需要权限，1-忽略权限',
  `affix_tab` TINYINT DEFAULT 0 COMMENT '是否固定标签页：0-不固定，1-固定',
  `affix_tab_order` INT DEFAULT 0 COMMENT '固定标签页的排序',
  
  -- 外链和iframe
  `is_external` TINYINT DEFAULT 0 COMMENT '是否外链：0-否，1-是',
  `external_link` VARCHAR(500) COMMENT '外链地址',
  `iframe_src` VARCHAR(500) COMMENT 'iframe地址',
  `open_in_new_window` TINYINT DEFAULT 0 COMMENT '是否在新窗口打开：0-否，1-是',
  
  -- 徽标配置
  `badge` VARCHAR(50) COMMENT '徽标文本',
  `badge_type` ENUM('dot', 'normal') DEFAULT 'normal' COMMENT '徽标类型',
  `badge_variants` VARCHAR(50) DEFAULT 'default' COMMENT '徽标颜色变体',
  
  -- 权限和访问控制
  `authority` TEXT COMMENT '权限标识数组（角色权限）JSON格式',
  `menu_visible_with_forbidden` TINYINT DEFAULT 0 COMMENT '菜单可见但访问被禁止：0-否，1-是',
  `active_path` VARCHAR(200) COMMENT '激活的父级菜单路径',
  
  -- 标签页控制
  `max_num_of_open_tab` INT DEFAULT -1 COMMENT '标签页最大打开数量（-1为无限制）',
  `full_path_key` TINYINT DEFAULT 1 COMMENT '是否使用完整路径作为key：0-否，1-是',
  
  -- 布局控制
  `no_basic_layout` TINYINT DEFAULT 0 COMMENT '是否不使用基础布局：0-使用，1-不使用',
  
  -- 菜单类型和状态
  `type` TINYINT DEFAULT 1 COMMENT '菜单类型：1-目录，2-菜单，3-按钮',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  
  -- 层级关系
  `parent_id` BIGINT COMMENT '父菜单ID',
  `level` TINYINT DEFAULT 1 COMMENT '菜单层级',
  `path_ids` VARCHAR(500) COMMENT '路径ID串（用于快速查询祖先节点）',
  
  -- 权限关联
  `permission_id` BIGINT COMMENT '关联权限ID',
  `button_key` VARCHAR(100) COMMENT '按钮权限标识',
  
  -- 查询参数
  `query_params` TEXT COMMENT '菜单携带的查询参数JSON格式',
  
  -- 时间戳
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  -- 索引
  INDEX `idx_parent_id` (`parent_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_order_num` (`order_num`),
  INDEX `idx_path` (`path`),
  INDEX `idx_name` (`name`),
  INDEX `idx_level` (`level`),
  INDEX `idx_permission_id` (`permission_id`)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='菜单表（优化版）';

-- 注意：存储过程和触发器需要根据实际的权限表结构进行调整
-- 如果权限相关表不存在，请先创建相关表或注释掉以下代码

/*
-- 创建菜单层级查询的存储过程（需要权限相关表支持）
DELIMITER //

CREATE PROCEDURE GetMenuTree(IN userId BIGINT)
BEGIN
    -- 简化版本：获取所有启用的菜单（不依赖权限表）
    SELECT * FROM menus 
    WHERE status = 1 AND hide_in_menu = 0 
    ORDER BY parent_id, order_num ASC;
END //

DELIMITER ;
*/

-- 注意：触发器在命令行执行时可能有语法问题，建议在MySQL客户端中单独执行
-- 或者注释掉触发器部分

/*
-- 创建更新路径ID的触发器
DELIMITER //

CREATE TRIGGER update_path_ids_after_insert
AFTER INSERT ON menus
FOR EACH ROW
BEGIN
    DECLARE parent_path_ids VARCHAR(500) DEFAULT '';
    DECLARE parent_level INT DEFAULT 0;
    
    IF NEW.parent_id IS NOT NULL THEN
        SELECT IFNULL(path_ids, ''), level INTO parent_path_ids, parent_level
        FROM menus WHERE id = NEW.parent_id;
        
        UPDATE menus 
        SET path_ids = CONCAT(parent_path_ids, IF(parent_path_ids = '', '', ','), NEW.parent_id),
            level = parent_level + 1
        WHERE id = NEW.id;
    ELSE
        UPDATE menus 
        SET path_ids = '',
            level = 1
        WHERE id = NEW.id;
    END IF;
END //

DELIMITER ;
*/

-- 示例数据插入
INSERT INTO `menus` (
    `name`, `path`, `component`, `title`, `icon`, `order_num`, `type`, `status`, `parent_id`,
    `hide_in_menu`, `keep_alive`, `authority`
) VALUES 
-- 系统管理目录
('System', '/system', 'BasicLayout', '系统管理', 'ion:settings-outline', 1, 1, 1, NULL, 0, 0, '["admin", "super_admin"]'),

-- 用户管理菜单
('UserManagement', '/system/user', 'system/user/index', '用户管理', 'ion:people-outline', 1, 2, 1, 1, 0, 1, '["admin", "super_admin"]'),

-- 角色管理菜单
('RoleManagement', '/system/role', 'system/role/index', '角色管理', 'ion:key-outline', 2, 2, 1, 1, 0, 1, '["super_admin"]'),

-- 菜单管理
('MenuManagement', '/system/menu', 'system/menu/index', '菜单管理', 'ion:menu-outline', 3, 2, 1, 1, 0, 1, '["super_admin"]'),

-- 商品管理目录
('Product', '/product', 'BasicLayout', '商品管理', 'ion:cube-outline', 2, 1, 1, NULL, 0, 0, '["admin", "super_admin", "product_admin"]'),

-- 商品列表
('ProductList', '/product/list', 'product/list/index', '商品列表', 'ion:list-outline', 1, 2, 1, 5, 0, 1, '["admin", "super_admin", "product_admin"]'),

-- 分类管理
('CategoryManagement', '/product/category', 'product/category/index', '分类管理', 'ion:file-tray-stacked-outline', 2, 2, 1, 5, 0, 1, '["admin", "super_admin", "product_admin"]');

-- 创建视图用于前端菜单查询
CREATE VIEW menu_view AS
SELECT 
    id,
    name,
    path,
    component,
    redirect,
    title,
    icon,
    active_icon,
    order_num,
    hide_in_menu,
    hide_children_in_menu,
    hide_in_breadcrumb,
    hide_in_tab,
    keep_alive,
    ignore_access,
    affix_tab,
    affix_tab_order,
    is_external,
    external_link,
    iframe_src,
    open_in_new_window,
    badge,
    badge_type,
    badge_variants,
    authority,
    menu_visible_with_forbidden,
    active_path,
    max_num_of_open_tab,
    full_path_key,
    no_basic_layout,
    type,
    status,
    parent_id,
    level,
    permission_id,
    button_key,
    query_params,
    created_at,
    updated_at
FROM menus
WHERE status = 1
ORDER BY order_num ASC;