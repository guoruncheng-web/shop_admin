-- 创建资源分类表
CREATE TABLE resource_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '分类名称',
    parent_id INT DEFAULT NULL COMMENT '父分类ID，NULL表示一级分类',
    level TINYINT NOT NULL DEFAULT 1 COMMENT '分类层级：1-一级分类，2-二级分类',
    sort_order INT DEFAULT 0 COMMENT '排序字段',
    status TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    -- 索引
    INDEX idx_parent_id (parent_id),
    INDEX idx_level (level),
    INDEX idx_status (status),
    
    -- 外键约束
    FOREIGN KEY (parent_id) REFERENCES resource_categories(id) ON DELETE CASCADE,
    
    -- 检查约束
    CHECK (level IN (1, 2)),
    CHECK (status IN (0, 1)),
    CHECK ((level = 1 AND parent_id IS NULL) OR (level = 2 AND parent_id IS NOT NULL))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资源分类表';

-- 插入一些示例数据
INSERT INTO resource_categories (name, parent_id, level, sort_order) VALUES
('图片素材', NULL, 1, 1),
('视频素材', NULL, 1, 2),
('产品图片', 1, 2, 1),
('广告图片', 1, 2, 2),
('宣传视频', 2, 2, 1),
('教程视频', 2, 2, 2);