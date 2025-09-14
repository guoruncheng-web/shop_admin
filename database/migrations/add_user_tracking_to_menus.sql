-- 为菜单表添加创建者和更新者字段
ALTER TABLE menus 
ADD COLUMN created_by BIGINT NULL COMMENT '创建者用户ID',
ADD COLUMN updated_by BIGINT NULL COMMENT '更新者用户ID',
ADD COLUMN created_by_name VARCHAR(100) NULL COMMENT '创建者姓名',
ADD COLUMN updated_by_name VARCHAR(100) NULL COMMENT '更新者姓名';

-- 添加索引以提高查询性能
CREATE INDEX idx_menus_created_by ON menus(created_by);
CREATE INDEX idx_menus_updated_by ON menus(updated_by);