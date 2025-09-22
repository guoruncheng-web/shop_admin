-- 资源池数据库查询示例

-- 1. 获取所有分类树结构
SELECT 
    c1.id as parent_id,
    c1.name as parent_name,
    c2.id as child_id,
    c2.name as child_name,
    c2.sort_order
FROM resource_categories c1
LEFT JOIN resource_categories c2 ON c1.id = c2.parent_id
WHERE c1.level = 1 AND c1.status = 1
ORDER BY c1.sort_order, c2.sort_order;

-- 2. 获取指定分类下的所有资源
SELECT * FROM v_resource_details 
WHERE category_id = ? 
ORDER BY uploaded_at DESC;

-- 3. 按资源类型统计
SELECT 
    type,
    COUNT(*) as count,
    SUM(file_size) as total_size,
    AVG(file_size) as avg_size
FROM resources 
WHERE status = 1 
GROUP BY type;

-- 4. 获取最近上传的资源
SELECT * FROM v_resource_details 
WHERE status = 1 
ORDER BY uploaded_at DESC 
LIMIT 20;

-- 5. 搜索资源（支持名称和描述全文搜索）
SELECT * FROM v_resource_details 
WHERE MATCH(name, description) AGAINST('关键词' IN NATURAL LANGUAGE MODE)
AND status = 1;

-- 6. 获取热门资源（按下载次数排序）
SELECT * FROM v_resource_details 
WHERE status = 1 
ORDER BY download_count DESC, view_count DESC 
LIMIT 50;

-- 7. 获取指定上传者的资源
SELECT * FROM v_resource_details 
WHERE uploader_id = ? 
AND status = 1 
ORDER BY uploaded_at DESC;

-- 8. 按标签搜索资源
SELECT * FROM v_resource_details 
WHERE FIND_IN_SET('标签名', REPLACE(tags, ',', ',')) > 0
AND status = 1;

-- 9. 获取分类统计信息
SELECT * FROM v_category_stats 
ORDER BY parent_id, category_id;

-- 10. 清理已删除的资源（物理删除）
-- 注意：这个操作会永久删除数据，请谨慎使用
-- DELETE FROM resources WHERE status = -1 AND updated_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- 性能优化建议：
-- 1. 定期分析表统计信息
-- ANALYZE TABLE resource_categories, resources;

-- 2. 如果资源表数据量很大，可以考虑按时间分区
-- ALTER TABLE resources PARTITION BY RANGE (YEAR(uploaded_at)) (
--     PARTITION p2024 VALUES LESS THAN (2025),
--     PARTITION p2025 VALUES LESS THAN (2026),
--     PARTITION p_future VALUES LESS THAN MAXVALUE
-- );

-- 3. 为经常查询的字段组合创建复合索引
-- CREATE INDEX idx_type_category_status ON resources(type, category_id, status);
-- CREATE INDEX idx_uploader_uploaded ON resources(uploader_id, uploaded_at);