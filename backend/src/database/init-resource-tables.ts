import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export async function initResourceTables() {
  const configService = new ConfigService();

  const dataSource = new DataSource({
    type: 'mysql',
    host: configService.get('DATABASE_HOST', 'localhost'),
    port: configService.get('DATABASE_PORT', 3306),
    username: configService.get('DATABASE_USERNAME', 'root'),
    password: configService.get('DATABASE_PASSWORD', ''),
    database: configService.get('DATABASE_NAME', 'wechat_mall'),
    synchronize: false,
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('数据库连接成功');

    // 创建资源分类表
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS resource_categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL COMMENT '分类名称',
        parent_id INT NULL COMMENT '父分类ID',
        level TINYINT NOT NULL CHECK (level IN (1, 2)) COMMENT '分类层级：1-一级分类，2-二级分类',
        sort_order INT DEFAULT 0 COMMENT '排序权重',
        description TEXT NULL COMMENT '分类描述',
        is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        
        INDEX idx_parent_id (parent_id),
        INDEX idx_level (level),
        INDEX idx_sort_order (sort_order),
        
        FOREIGN KEY (parent_id) REFERENCES resource_categories(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资源分类表';
    `);

    // 创建资源表
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS resources (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL COMMENT '资源名称',
        url TEXT NOT NULL COMMENT '资源URL链接',
        type ENUM('image', 'video') NOT NULL COMMENT '资源类型',
        file_size BIGINT NULL COMMENT '文件大小（字节）',
        file_hash VARCHAR(64) NULL COMMENT '文件哈希值（用于去重）',
        mime_type VARCHAR(100) NULL COMMENT 'MIME类型',
        width INT NULL COMMENT '图片/视频宽度',
        height INT NULL COMMENT '图片/视频高度',
        duration INT NULL COMMENT '视频时长（秒）',
        category_id INT NOT NULL COMMENT '分类ID',
        uploader_id INT NOT NULL COMMENT '上传者ID',
        description TEXT NULL COMMENT '资源描述',
        tags TEXT NULL COMMENT '标签（逗号分隔）',
        view_count INT DEFAULT 0 COMMENT '查看次数',
        download_count INT DEFAULT 0 COMMENT '下载次数',
        status TINYINT DEFAULT 1 COMMENT '状态：-1删除，0禁用，1正常',
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        
        INDEX idx_type (type),
        INDEX idx_category_id (category_id),
        INDEX idx_uploader_id (uploader_id),
        INDEX idx_status (status),
        INDEX idx_uploaded_at (uploaded_at),
        INDEX idx_file_hash (file_hash),
        FULLTEXT idx_name_description (name, description),
        
        FOREIGN KEY (category_id) REFERENCES resource_categories(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资源表';
    `);

    // 创建触发器：确保只能在二级分类下上传资源
    await dataSource.query(`
      DROP TRIGGER IF EXISTS check_resource_category_level;
    `);

    await dataSource.query(`
      CREATE TRIGGER check_resource_category_level
      BEFORE INSERT ON resources
      FOR EACH ROW
      BEGIN
        DECLARE category_level TINYINT;
        
        SELECT level INTO category_level 
        FROM resource_categories 
        WHERE id = NEW.category_id;
        
        IF category_level != 2 THEN
          SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '只能在二级分类下上传资源';
        END IF;
      END;
    `);

    // 插入示例分类数据
    await dataSource.query(`
      INSERT IGNORE INTO resource_categories (id, name, parent_id, level, sort_order, description) VALUES
      (1, '产品素材', NULL, 1, 1, '产品相关的图片和视频素材'),
      (2, '营销素材', NULL, 1, 2, '营销推广相关的素材'),
      (3, '系统素材', NULL, 1, 3, '系统默认和通用素材'),
      (4, '商品主图', 1, 2, 1, '商品的主要展示图片'),
      (5, '商品详情图', 1, 2, 2, '商品详情页面的图片'),
      (6, '商品视频', 1, 2, 3, '商品展示视频'),
      (7, '广告横幅', 2, 2, 1, '网站和APP的广告横幅'),
      (8, '社交媒体', 2, 2, 2, '社交媒体推广素材'),
      (9, '邮件模板', 2, 2, 3, '邮件营销模板素材'),
      (10, '系统图标', 3, 2, 1, '系统界面图标'),
      (11, '默认头像', 3, 2, 2, '用户默认头像'),
      (12, '占位图片', 3, 2, 3, '各种占位图片');
    `);

    // 插入示例资源数据
    await dataSource.query(`
      INSERT IGNORE INTO resources (id, name, url, type, file_size, category_id, uploader_id, description, tags) VALUES
      (1, '产品展示图1.jpg', '/uploads/products/product1.jpg', 'image', 2048576, 4, 1, '主要产品展示图片', '产品,展示,主图'),
      (2, '产品展示图2.jpg', '/uploads/products/product2.jpg', 'image', 1856432, 4, 1, '产品侧面展示图', '产品,展示,侧面'),
      (3, '产品详情图1.jpg', '/uploads/products/detail1.jpg', 'image', 3145728, 5, 1, '产品详情页图片', '详情,说明'),
      (4, '产品宣传视频.mp4', '/uploads/videos/promo1.mp4', 'video', 52428800, 6, 1, '产品宣传视频', '视频,宣传,产品'),
      (5, '首页横幅1.jpg', '/uploads/banners/banner1.jpg', 'image', 1024000, 7, 1, '首页主要横幅广告', '横幅,广告,首页'),
      (6, '促销活动图.jpg', '/uploads/marketing/sale1.jpg', 'image', 1536000, 8, 1, '促销活动宣传图', '促销,活动,宣传'),
      (7, '系统默认图标.png', '/uploads/system/icon1.png', 'image', 32768, 10, 1, '系统默认图标', '图标,系统,默认'),
      (8, '用户默认头像.jpg', '/uploads/system/avatar.jpg', 'image', 65536, 11, 1, '用户默认头像', '头像,默认,用户');
    `);

    console.log('资源管理表创建成功！');
    console.log('示例数据插入完成！');
  } catch (error) {
    console.error('初始化失败:', error);
  } finally {
    await dataSource.destroy();
  }
}

// 如果直接运行此文件
if (require.main === module) {
  initResourceTables()
    .then(() => {
      console.log('初始化完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('初始化失败:', error);
      process.exit(1);
    });
}
