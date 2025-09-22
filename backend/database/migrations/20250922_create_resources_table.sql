-- 创建资源表
CREATE TABLE resources (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL COMMENT '资源名称',
    url VARCHAR(500) NOT NULL COMMENT '资源URL链接',
    type ENUM('image', 'video') NOT NULL COMMENT '资源类型：image-图片，video-视频',
    file_size BIGINT DEFAULT NULL COMMENT '文件大小（字节）',
    file_extension VARCHAR(10) DEFAULT NULL COMMENT '文件扩展名',
    mime_type VARCHAR(100) DEFAULT NULL COMMENT 'MIME类型',
    width INT DEFAULT NULL COMMENT '图片/视频宽度',
    height INT DEFAULT NULL COMMENT '图片/视频高度',
    duration INT DEFAULT NULL COMMENT '视频时长（秒）',
    category_id INT NOT NULL COMMENT '分类ID（只能是二级分类）',
    uploader_id INT NOT NULL COMMENT '上传者ID',
    uploader_name VARCHAR(100) NOT NULL COMMENT '上传者姓名',
    description TEXT COMMENT '资源描述',
    tags VARCHAR(500) COMMENT '标签，用逗号分隔',
    download_count INT DEFAULT 0 COMMENT '下载次数',
    view_count INT DEFAULT 0 COMMENT '查看次数',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-禁用，-1-已删除',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    -- 索引
    INDEX idx_type (type),
    INDEX idx_category_id (category_id),
    INDEX idx_uploader_id (uploader_id),
    INDEX idx_status (status),
    INDEX idx_uploaded_at (uploaded_at),
    INDEX idx_name (name),
    FULLTEXT INDEX ft_name_description (name, description),
    
    -- 外键约束
    FOREIGN KEY (category_id) REFERENCES resource_categories(id) ON DELETE RESTRICT,
    
    -- 检查约束
    CHECK (status IN (-1, 0, 1)),
    CHECK (type IN ('image', 'video')),
    CHECK (file_size >= 0),
    CHECK (download_count >= 0),
    CHECK (view_count >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资源表';

-- 创建触发器确保只能在二级分类下上传资源
DELIMITER $$
CREATE TRIGGER check_category_level_before_insert
    BEFORE INSERT ON resources
    FOR EACH ROW
BEGIN
    DECLARE category_level TINYINT;
    
    SELECT level INTO category_level 
    FROM resource_categories 
    WHERE id = NEW.category_id AND status = 1;
    
    IF category_level IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '分类不存在或已禁用';
    END IF;
    
    IF category_level != 2 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '只能在二级分类下上传资源';
    END IF;
END$$

CREATE TRIGGER check_category_level_before_update
    BEFORE UPDATE ON resources
    FOR EACH ROW
BEGIN
    DECLARE category_level TINYINT;
    
    IF NEW.category_id != OLD.category_id THEN
        SELECT level INTO category_level 
        FROM resource_categories 
        WHERE id = NEW.category_id AND status = 1;
        
        IF category_level IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '分类不存在或已禁用';
        END IF;
        
        IF category_level != 2 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '只能在二级分类下上传资源';
        END IF;
    END IF;
END$$
DELIMITER ;