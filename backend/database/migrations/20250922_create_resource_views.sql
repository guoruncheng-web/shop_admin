-- 创建资源详情视图，包含完整的分类信息
CREATE VIEW v_resource_details AS
SELECT 
    r.id,
    r.name,
    r.url,
    r.type,
    r.file_size,
    r.file_extension,
    r.mime_type,
    r.width,
    r.height,
    r.duration,
    r.uploader_id,
    r.uploader_name,
    r.description,
    r.tags,
    r.download_count,
    r.view_count,
    r.status,
    r.uploaded_at,
    r.created_at,
    r.updated_at,
    -- 二级分类信息
    c2.id as category_id,
    c2.name as category_name,
    -- 一级分类信息
    c1.id as parent_category_id,
    c1.name as parent_category_name,
    -- 完整分类路径
    CONCAT(c1.name, ' > ', c2.name) as category_path
FROM resources r
JOIN resource_categories c2 ON r.category_id = c2.id
JOIN resource_categories c1 ON c2.parent_id = c1.id
WHERE r.status >= 0 AND c2.status = 1 AND c1.status = 1;

-- 创建分类统计视图
CREATE VIEW v_category_stats AS
SELECT 
    c1.id as parent_id,
    c1.name as parent_name,
    c2.id as category_id,
    c2.name as category_name,
    COUNT(r.id) as resource_count,
    COUNT(CASE WHEN r.type = 'image' THEN 1 END) as image_count,
    COUNT(CASE WHEN r.type = 'video' THEN 1 END) as video_count,
    COALESCE(SUM(r.file_size), 0) as total_size,
    COALESCE(SUM(r.download_count), 0) as total_downloads,
    COALESCE(SUM(r.view_count), 0) as total_views
FROM resource_categories c1
JOIN resource_categories c2 ON c1.id = c2.parent_id
LEFT JOIN resources r ON c2.id = r.category_id AND r.status >= 0
WHERE c1.level = 1 AND c2.level = 2 AND c1.status = 1 AND c2.status = 1
GROUP BY c1.id, c1.name, c2.id, c2.name
ORDER BY c1.sort_order, c2.sort_order;