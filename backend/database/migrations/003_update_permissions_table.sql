-- 更新权限表，添加菜单关联字段
ALTER TABLE permissions ADD COLUMN menu_id BIGINT NULL COMMENT '关联菜单ID';

-- 添加外键约束
ALTER TABLE permissions ADD CONSTRAINT fk_permissions_menu_id 
FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE SET NULL;

-- 创建索引
CREATE INDEX idx_permissions_menu_id ON permissions(menu_id);
CREATE INDEX idx_permissions_parent_id ON permissions(parent_id);