-- 资源池数据库迁移脚本
-- 执行顺序：按文件名顺序执行

-- 1. 创建资源分类表
SOURCE database/migrations/20250922_create_resource_categories_table.sql;

-- 2. 创建资源表
SOURCE database/migrations/20250922_create_resources_table.sql;

-- 3. 创建视图
SOURCE database/migrations/20250922_create_resource_views.sql;

-- 显示创建结果
SHOW TABLES LIKE 'resource%';
SHOW CREATE VIEW v_resource_details;
SHOW CREATE VIEW v_category_stats;