-- =====================================================
-- 微信小程序商城数据库完整初始化脚本
-- 版本: 1.0.0
-- 创建时间: 2024-01-01
-- 说明: 一键初始化所有数据库表、数据、存储过程和触发器
-- =====================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `wechat_mall` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `wechat_mall`;

-- =====================================================
-- 1. 创建表结构
-- =====================================================

-- 用户等级表
CREATE TABLE `user_levels` (
  `id` INT PRIMARY KEY AUTO_INCREMENT COMMENT '等级ID',
  `name` VARCHAR(50) NOT NULL COMMENT '等级名称',
  `min_points` INT NOT NULL COMMENT '最小积分',
  `discount` DECIMAL(3,2) DEFAULT 1.00 COMMENT '折扣率',
  `description` TEXT COMMENT '等级描述',
  `icon` VARCHAR(255) COMMENT '等级图标',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_min_points` (`min_points`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户等级表';

-- 用户表
CREATE TABLE `users` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  `openid` VARCHAR(64) UNIQUE NOT NULL COMMENT '微信openid',
  `unionid` VARCHAR(64) COMMENT '微信unionid',
  `nickname` VARCHAR(50) COMMENT '用户昵称',
  `avatar_url` VARCHAR(255) COMMENT '头像URL',
  `phone` VARCHAR(20) UNIQUE COMMENT '手机号',
  `gender` TINYINT DEFAULT 0 COMMENT '性别：0-未知，1-男，2-女',
  `birthday` DATE COMMENT '生日',
  `email` VARCHAR(100) COMMENT '邮箱',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-正常',
  `level_id` INT DEFAULT 1 COMMENT '用户等级ID',
  `points` INT DEFAULT 0 COMMENT '积分',
  `balance` DECIMAL(10,2) DEFAULT 0.00 COMMENT '账户余额',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`level_id`) REFERENCES `user_levels`(`id`),
  INDEX `idx_openid` (`openid`),
  INDEX `idx_phone` (`phone`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 用户地址表
CREATE TABLE `user_addresses` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '地址ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `receiver` VARCHAR(50) NOT NULL COMMENT '收货人',
  `phone` VARCHAR(20) NOT NULL COMMENT '联系电话',
  `province` VARCHAR(50) NOT NULL COMMENT '省份',
  `city` VARCHAR(50) NOT NULL COMMENT '城市',
  `district` VARCHAR(50) NOT NULL COMMENT '区县',
  `detail_address` VARCHAR(255) NOT NULL COMMENT '详细地址',
  `is_default` TINYINT DEFAULT 0 COMMENT '是否默认地址：0-否，1-是',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_is_default` (`is_default`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户地址表';

-- 商品分类表
CREATE TABLE `categories` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '分类ID',
  `parent_id` BIGINT DEFAULT 0 COMMENT '父分类ID',
  `name` VARCHAR(100) NOT NULL COMMENT '分类名称',
  `description` TEXT COMMENT '分类描述',
  `icon` VARCHAR(255) COMMENT '分类图标',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `level` INT DEFAULT 1 COMMENT '分类层级',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_parent_id` (`parent_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品分类表';

-- 品牌表
CREATE TABLE `brands` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '品牌ID',
  `name` VARCHAR(100) NOT NULL COMMENT '品牌名称',
  `logo` VARCHAR(255) COMMENT '品牌logo',
  `description` TEXT COMMENT '品牌描述',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_status` (`status`),
  INDEX `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='品牌表';

-- 商品表
CREATE TABLE `products` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '商品ID',
  `name` VARCHAR(255) NOT NULL COMMENT '商品名称',
  `subtitle` VARCHAR(255) COMMENT '商品副标题',
  `category_id` BIGINT NOT NULL COMMENT '分类ID',
  `brand_id` BIGINT COMMENT '品牌ID',
  `description` TEXT COMMENT '商品描述',
  `price` DECIMAL(10,2) NOT NULL COMMENT '原价',
  `sale_price` DECIMAL(10,2) COMMENT '促销价',
  `cost_price` DECIMAL(10,2) COMMENT '成本价',
  `stock` INT DEFAULT 0 COMMENT '总库存',
  `sold_count` INT DEFAULT 0 COMMENT '已售数量',
  `view_count` INT DEFAULT 0 COMMENT '浏览次数',
  `images` JSON COMMENT '商品图片JSON数组',
  `main_image` VARCHAR(255) COMMENT '主图',
  `video_url` VARCHAR(255) COMMENT '商品视频',
  `weight` DECIMAL(8,2) COMMENT '商品重量(kg)',
  `volume` DECIMAL(8,2) COMMENT '商品体积(m³)',
  `is_hot` TINYINT DEFAULT 0 COMMENT '是否热门：0-否，1-是',
  `is_new` TINYINT DEFAULT 0 COMMENT '是否新品：0-否，1-是',
  `is_recommend` TINYINT DEFAULT 0 COMMENT '是否推荐：0-否，1-是',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-下架，1-上架，2-审核中',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`),
  FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`),
  INDEX `idx_category_id` (`category_id`),
  INDEX `idx_brand_id` (`brand_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_is_hot` (`is_hot`),
  INDEX `idx_is_new` (`is_new`),
  INDEX `idx_is_recommend` (`is_recommend`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';

-- 商品SKU表
CREATE TABLE `product_skus` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'SKU ID',
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `sku_code` VARCHAR(100) UNIQUE NOT NULL COMMENT 'SKU编码',
  `name` VARCHAR(255) NOT NULL COMMENT 'SKU名称',
  `price` DECIMAL(10,2) NOT NULL COMMENT '价格',
  `original_price` DECIMAL(10,2) COMMENT '原价',
  `stock` INT DEFAULT 0 COMMENT '库存',
  `sold_count` INT DEFAULT 0 COMMENT '已售数量',
  `image` VARCHAR(255) COMMENT 'SKU图片',
  `specs` JSON COMMENT '规格属性JSON',
  `weight` DECIMAL(8,2) COMMENT '重量',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  INDEX `idx_product_id` (`product_id`),
  INDEX `idx_sku_code` (`sku_code`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品SKU表';

-- 订单表
CREATE TABLE `orders` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
  `order_no` VARCHAR(32) UNIQUE NOT NULL COMMENT '订单号',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `total_amount` DECIMAL(10,2) NOT NULL COMMENT '订单总金额',
  `discount_amount` DECIMAL(10,2) DEFAULT 0.00 COMMENT '优惠金额',
  `shipping_fee` DECIMAL(10,2) DEFAULT 0.00 COMMENT '运费',
  `actual_amount` DECIMAL(10,2) NOT NULL COMMENT '实付金额',
  `status` TINYINT DEFAULT 1 COMMENT '订单状态：1-待付款，2-待发货，3-待收货，4-已完成，5-已取消，6-已退款',
  `payment_status` TINYINT DEFAULT 0 COMMENT '支付状态：0-未支付，1-已支付，2-已退款',
  `payment_method` TINYINT COMMENT '支付方式：1-微信支付，2-余额支付',
  `payment_time` TIMESTAMP NULL COMMENT '支付时间',
  `shipping_address` JSON NOT NULL COMMENT '收货地址JSON',
  `remark` VARCHAR(500) COMMENT '订单备注',
  `cancel_reason` VARCHAR(200) COMMENT '取消原因',
  `cancel_time` TIMESTAMP NULL COMMENT '取消时间',
  `ship_time` TIMESTAMP NULL COMMENT '发货时间',
  `complete_time` TIMESTAMP NULL COMMENT '完成时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  INDEX `idx_order_no` (`order_no`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_payment_status` (`payment_status`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- 订单商品表
CREATE TABLE `order_items` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订单商品ID',
  `order_id` BIGINT NOT NULL COMMENT '订单ID',
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `sku_id` BIGINT COMMENT 'SKU ID',
  `product_name` VARCHAR(255) NOT NULL COMMENT '商品名称',
  `sku_name` VARCHAR(255) COMMENT 'SKU名称',
  `product_image` VARCHAR(255) COMMENT '商品图片',
  `price` DECIMAL(10,2) NOT NULL COMMENT '单价',
  `quantity` INT NOT NULL COMMENT '数量',
  `total_amount` DECIMAL(10,2) NOT NULL COMMENT '小计金额',
  `specs` JSON COMMENT '规格属性JSON',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`),
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单商品表';

-- 购物车表
CREATE TABLE `cart_items` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '购物车ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `sku_id` BIGINT COMMENT 'SKU ID',
  `quantity` INT NOT NULL DEFAULT 1 COMMENT '数量',
  `selected` TINYINT DEFAULT 1 COMMENT '是否选中：0-否，1-是',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`),
  UNIQUE KEY `uk_user_product_sku` (`user_id`, `product_id`, `sku_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_selected` (`selected`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='购物车表';

-- 支付记录表
CREATE TABLE `payments` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '支付ID',
  `order_id` BIGINT NOT NULL COMMENT '订单ID',
  `payment_no` VARCHAR(64) UNIQUE NOT NULL COMMENT '支付单号',
  `transaction_id` VARCHAR(64) COMMENT '第三方交易号',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '支付金额',
  `payment_method` TINYINT NOT NULL COMMENT '支付方式：1-微信支付，2-余额支付',
  `status` TINYINT DEFAULT 0 COMMENT '支付状态：0-待支付，1-支付成功，2-支付失败，3-已退款',
  `callback_data` JSON COMMENT '回调数据',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`),
  INDEX `idx_payment_no` (`payment_no`),
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付记录表';

-- 优惠券表
CREATE TABLE `coupons` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '优惠券ID',
  `name` VARCHAR(100) NOT NULL COMMENT '优惠券名称',
  `type` TINYINT NOT NULL COMMENT '类型：1-满减券，2-折扣券，3-无门槛券',
  `value` DECIMAL(10,2) NOT NULL COMMENT '优惠金额或折扣率',
  `min_amount` DECIMAL(10,2) DEFAULT 0.00 COMMENT '最低消费金额',
  `total_count` INT NOT NULL COMMENT '发放总数',
  `used_count` INT DEFAULT 0 COMMENT '已使用数量',
  `start_time` TIMESTAMP NOT NULL COMMENT '生效时间',
  `end_time` TIMESTAMP NOT NULL COMMENT '失效时间',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_status` (`status`),
  INDEX `idx_start_time` (`start_time`),
  INDEX `idx_end_time` (`end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='优惠券表';

-- 用户优惠券表
CREATE TABLE `user_coupons` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户优惠券ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `coupon_id` BIGINT NOT NULL COMMENT '优惠券ID',
  `status` TINYINT DEFAULT 0 COMMENT '状态：0-未使用，1-已使用，2-已过期',
  `used_time` TIMESTAMP NULL COMMENT '使用时间',
  `order_id` BIGINT COMMENT '使用订单ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '领取时间',
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`coupon_id`) REFERENCES `coupons`(`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_coupon_id` (`coupon_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户优惠券表';

-- 角色表
CREATE TABLE `roles` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '角色ID',
  `name` VARCHAR(50) NOT NULL COMMENT '角色名称',
  `description` VARCHAR(200) COMMENT '角色描述',
  `permissions` JSON COMMENT '权限JSON',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- 管理员表
CREATE TABLE `admins` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '管理员ID',
  `username` VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码',
  `real_name` VARCHAR(50) COMMENT '真实姓名',
  `email` VARCHAR(100) COMMENT '邮箱',
  `phone` VARCHAR(20) COMMENT '手机号',
  `avatar` VARCHAR(255) COMMENT '头像',
  `role_id` BIGINT NOT NULL COMMENT '角色ID',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `last_login_time` TIMESTAMP NULL COMMENT '最后登录时间',
  `last_login_ip` VARCHAR(50) COMMENT '最后登录IP',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`),
  INDEX `idx_username` (`username`),
  INDEX `idx_role_id` (`role_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';

-- 系统配置表
CREATE TABLE `system_configs` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
  `config_key` VARCHAR(100) UNIQUE NOT NULL COMMENT '配置键',
  `config_value` TEXT COMMENT '配置值',
  `description` VARCHAR(200) COMMENT '配置描述',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- =====================================================
-- 2. 创建索引
-- =====================================================

-- 复合索引
CREATE INDEX `idx_orders_user_status_time` ON `orders`(`user_id`, `status`, `created_at`);
CREATE INDEX `idx_products_category_status` ON `products`(`category_id`, `status`);
CREATE INDEX `idx_user_coupons_user_status` ON `user_coupons`(`user_id`, `status`, `created_at`);

-- 全文索引
ALTER TABLE `products` ADD FULLTEXT INDEX `ft_product_name`(`name`, `subtitle`);
ALTER TABLE `products` ADD FULLTEXT INDEX `ft_product_description`(`description`);

-- =====================================================
-- 3. 插入初始数据
-- =====================================================

-- 插入用户等级数据
INSERT INTO `user_levels` (`name`, `min_points`, `discount`, `description`, `icon`) VALUES
('普通会员', 0, 1.00, '新注册用户', '/images/level/bronze.png'),
('银卡会员', 1000, 0.95, '消费满1000积分', '/images/level/silver.png'),
('金卡会员', 5000, 0.90, '消费满5000积分', '/images/level/gold.png'),
('钻石会员', 20000, 0.85, '消费满20000积分', '/images/level/diamond.png');

-- 插入商品分类数据
INSERT INTO `categories` (`parent_id`, `name`, `description`, `icon`, `sort_order`, `level`) VALUES
(0, '数码电子', '手机、电脑、数码配件', '/images/category/digital.png', 1, 1),
(0, '服装鞋帽', '男装、女装、童装、鞋帽', '/images/category/clothing.png', 2, 1),
(0, '家居生活', '家具、家电、生活用品', '/images/category/home.png', 3, 1),
(0, '美妆护肤', '化妆品、护肤品、香水', '/images/category/beauty.png', 4, 1),
(0, '食品生鲜', '零食、生鲜、饮料', '/images/category/food.png', 5, 1),
(1, '手机通讯', '智能手机、平板电脑', '/images/category/phone.png', 1, 2),
(1, '电脑办公', '笔记本、台式机、办公用品', '/images/category/computer.png', 2, 2),
(2, '男装', '男士服装、配饰', '/images/category/mens.png', 1, 2),
(2, '女装', '女士服装、配饰', '/images/category/womens.png', 2, 2),
(3, '家具', '沙发、床、桌椅', '/images/category/furniture.png', 1, 2),
(3, '家电', '电视、冰箱、洗衣机', '/images/category/appliance.png', 2, 2);

-- 插入品牌数据
INSERT INTO `brands` (`name`, `logo`, `description`, `sort_order`) VALUES
('苹果', '/images/brands/apple.png', 'Apple Inc.', 1),
('华为', '/images/brands/huawei.png', '华为技术有限公司', 2),
('小米', '/images/brands/xiaomi.png', '小米科技有限责任公司', 3),
('耐克', '/images/brands/nike.png', 'Nike Inc.', 4),
('阿迪达斯', '/images/brands/adidas.png', 'Adidas AG', 5),
('优衣库', '/images/brands/uniqlo.png', 'UNIQLO Co., Ltd.', 6);

-- 插入角色数据
INSERT INTO `roles` (`name`, `description`, `permissions`) VALUES
('超级管理员', '拥有所有权限', '["*"]'),
('商品管理员', '商品管理权限', '["product:*", "category:*", "brand:*"]'),
('订单管理员', '订单管理权限', '["order:*", "payment:*"]'),
('用户管理员', '用户管理权限', '["user:*", "coupon:*"]'),
('运营管理员', '运营管理权限', '["marketing:*", "statistics:*"]');

-- 插入管理员数据 (密码: admin123)
INSERT INTO `admins` (`username`, `password`, `real_name`, `email`, `role_id`) VALUES
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '系统管理员', 'admin@example.com', 1);

-- 插入系统配置数据
INSERT INTO `system_configs` (`config_key`, `config_value`, `description`) VALUES
('site_name', '微信小程序商城', '网站名称'),
('site_description', '基于微信生态的电商平台', '网站描述'),
('site_logo', '/images/logo.png', '网站Logo'),
('contact_phone', '400-123-4567', '客服电话'),
('contact_email', 'service@example.com', '客服邮箱'),
('shipping_fee', '10.00', '默认运费'),
('free_shipping_threshold', '99.00', '包邮门槛'),
('points_rate', '1', '积分兑换比例：1元=1积分'),
('auto_cancel_minutes', '30', '自动取消订单时间（分钟）'),
('auto_confirm_days', '7', '自动确认收货时间（天）');

-- 插入示例商品数据
INSERT INTO `products` (`name`, `subtitle`, `category_id`, `brand_id`, `description`, `price`, `sale_price`, `stock`, `images`, `main_image`, `is_hot`, `is_new`, `is_recommend`, `status`) VALUES
('iPhone 15 Pro', '苹果最新旗舰手机', 6, 1, '搭载A17 Pro芯片，钛金属机身，专业级摄影系统', 7999.00, 7499.00, 100, '["/images/products/iphone15-1.jpg", "/images/products/iphone15-2.jpg"]', '/images/products/iphone15-main.jpg', 1, 1, 1, 1),
('华为 Mate 60 Pro', '华为旗舰手机', 6, 2, '麒麟芯片，卫星通信，超长续航', 6999.00, 6499.00, 50, '["/images/products/mate60-1.jpg", "/images/products/mate60-2.jpg"]', '/images/products/mate60-main.jpg', 1, 1, 1, 1),
('小米14 Pro', '小米年度旗舰', 6, 3, '骁龙8 Gen 3，徕卡光学，2K屏幕', 4999.00, 4699.00, 200, '["/images/products/mi14-1.jpg", "/images/products/mi14-2.jpg"]', '/images/products/mi14-main.jpg', 1, 1, 0, 1),
('MacBook Pro 14', '专业级笔记本电脑', 7, 1, 'M3芯片，14英寸视网膜显示屏，专业级性能', 14999.00, 13999.00, 30, '["/images/products/macbook-1.jpg", "/images/products/macbook-2.jpg"]', '/images/products/macbook-main.jpg', 0, 1, 1, 1),
('Nike Air Max 270', '经典气垫跑鞋', 8, 4, 'Air Max气垫技术，舒适缓震，时尚设计', 899.00, 799.00, 500, '["/images/products/nike-1.jpg", "/images/products/nike-2.jpg"]', '/images/products/nike-main.jpg', 1, 0, 1, 1),
('Adidas Ultraboost 22', '专业跑步鞋', 8, 5, 'Boost中底，Primeknit鞋面，专业跑步性能', 1299.00, 1099.00, 300, '["/images/products/adidas-1.jpg", "/images/products/adidas-2.jpg"]', '/images/products/adidas-main.jpg', 1, 0, 0, 1);

-- 插入商品SKU数据
INSERT INTO `product_skus` (`product_id`, `sku_code`, `name`, `price`, `original_price`, `stock`, `specs`) VALUES
(1, 'IP15P-128-BLACK', 'iPhone 15 Pro 128GB 深空黑色', 7499.00, 7999.00, 30, '{"color": "深空黑色", "storage": "128GB"}'),
(1, 'IP15P-256-BLACK', 'iPhone 15 Pro 256GB 深空黑色', 8499.00, 8999.00, 25, '{"color": "深空黑色", "storage": "256GB"}'),
(1, 'IP15P-128-WHITE', 'iPhone 15 Pro 128GB 白色', 7499.00, 7999.00, 25, '{"color": "白色", "storage": "128GB"}'),
(2, 'MATE60-512-BLACK', '华为 Mate 60 Pro 512GB 雅川青', 6499.00, 6999.00, 20, '{"color": "雅川青", "storage": "512GB"}'),
(2, 'MATE60-1T-BLACK', '华为 Mate 60 Pro 1TB 雅川青', 7499.00, 7999.00, 15, '{"color": "雅川青", "storage": "1TB"}'),
(3, 'MI14-256-BLACK', '小米14 Pro 256GB 黑色', 4699.00, 4999.00, 100, '{"color": "黑色", "storage": "256GB"}'),
(3, 'MI14-512-BLACK', '小米14 Pro 512GB 黑色', 5199.00, 5499.00, 80, '{"color": "黑色", "storage": "512GB"}');

-- 插入优惠券数据
INSERT INTO `coupons` (`name`, `type`, `value`, `min_amount`, `total_count`, `start_time`, `end_time`, `status`) VALUES
('新人专享券', 1, 50.00, 200.00, 1000, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1),
('满减优惠券', 1, 100.00, 500.00, 500, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), 1),
('9折优惠券', 2, 0.90, 1000.00, 200, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY), 1),
('无门槛券', 3, 20.00, 0.00, 2000, NOW(), DATE_ADD(NOW(), INTERVAL 15 DAY), 1);

-- 插入示例用户数据
INSERT INTO `users` (`openid`, `nickname`, `avatar_url`, `phone`, `gender`, `points`, `balance`) VALUES
('test_openid_001', '测试用户1', '/images/avatars/user1.jpg', '13800138001', 1, 500, 100.00),
('test_openid_002', '测试用户2', '/images/avatars/user2.jpg', '13800138002', 2, 1200, 50.00),
('test_openid_003', '测试用户3', '/images/avatars/user3.jpg', '13800138003', 1, 3000, 200.00);

-- 插入用户地址数据
INSERT INTO `user_addresses` (`user_id`, `receiver`, `phone`, `province`, `city`, `district`, `detail_address`, `is_default`) VALUES
(1, '张三', '13800138001', '北京市', '北京市', '朝阳区', '三里屯SOHO 1号楼 1001室', 1),
(1, '张三', '13800138001', '上海市', '上海市', '浦东新区', '陆家嘴金融中心 2号楼 2002室', 0),
(2, '李四', '13800138002', '广州市', '广州市', '天河区', '珠江新城 3号楼 3003室', 1),
(3, '王五', '13800138003', '深圳市', '深圳市', '南山区', '科技园 4号楼 4004室', 1);

-- 插入用户优惠券数据
INSERT INTO `user_coupons` (`user_id`, `coupon_id`, `status`) VALUES
(1, 1, 0),
(1, 4, 0),
(2, 1, 0),
(2, 2, 0),
(3, 1, 0),
(3, 3, 0);

-- =====================================================
-- 4. 创建存储过程
-- =====================================================

DELIMITER //

-- 生成订单号存储过程
CREATE PROCEDURE `GenerateOrderNo`(OUT order_no VARCHAR(32))
BEGIN
    DECLARE current_date_str VARCHAR(8);
    DECLARE sequence_num INT;
    
    SET current_date_str = DATE_FORMAT(NOW(), '%Y%m%d');
    
    -- 获取当前日期的序列号
    SELECT COALESCE(MAX(SUBSTRING(order_no, 9)), 0) + 1 INTO sequence_num
    FROM orders 
    WHERE order_no LIKE CONCAT(current_date_str, '%');
    
    -- 生成订单号：日期(8位) + 序列号(6位) + 随机数(2位)
    SET order_no = CONCAT(
        current_date_str,
        LPAD(sequence_num, 6, '0'),
        LPAD(FLOOR(RAND() * 100), 2, '0')
    );
END //

-- 更新商品库存存储过程
CREATE PROCEDURE `UpdateProductStock`(
    IN p_product_id BIGINT,
    IN p_sku_id BIGINT,
    IN p_quantity INT,
    IN p_operation ENUM('decrease', 'increase')
)
BEGIN
    DECLARE current_stock INT;
    DECLARE new_stock INT;
    
    START TRANSACTION;
    
    -- 获取当前库存
    IF p_sku_id IS NOT NULL THEN
        SELECT stock INTO current_stock FROM product_skus WHERE id = p_sku_id FOR UPDATE;
        IF p_operation = 'decrease' THEN
            SET new_stock = current_stock - p_quantity;
        ELSE
            SET new_stock = current_stock + p_quantity;
        END IF;
        
        IF new_stock < 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '库存不足';
        END IF;
        
        UPDATE product_skus SET stock = new_stock WHERE id = p_sku_id;
    ELSE
        SELECT stock INTO current_stock FROM products WHERE id = p_product_id FOR UPDATE;
        IF p_operation = 'decrease' THEN
            SET new_stock = current_stock - p_quantity;
        ELSE
            SET new_stock = current_stock + p_quantity;
        END IF;
        
        IF new_stock < 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '库存不足';
        END IF;
        
        UPDATE products SET stock = new_stock WHERE id = p_product_id;
    END IF;
    
    COMMIT;
END //

-- 计算用户等级存储过程
CREATE PROCEDURE `CalculateUserLevel`(IN p_user_id BIGINT)
BEGIN
    DECLARE user_points INT;
    DECLARE new_level_id INT;
    
    -- 获取用户积分
    SELECT points INTO user_points FROM users WHERE id = p_user_id;
    
    -- 根据积分计算等级
    SELECT id INTO new_level_id 
    FROM user_levels 
    WHERE min_points <= user_points 
    ORDER BY min_points DESC 
    LIMIT 1;
    
    -- 更新用户等级
    UPDATE users SET level_id = new_level_id WHERE id = p_user_id;
END //

DELIMITER ;

-- =====================================================
-- 5. 创建触发器
-- =====================================================

-- 订单创建时自动生成订单号
DELIMITER //
CREATE TRIGGER `tr_orders_before_insert` 
BEFORE INSERT ON `orders`
FOR EACH ROW
BEGIN
    IF NEW.order_no IS NULL OR NEW.order_no = '' THEN
        CALL GenerateOrderNo(NEW.order_no);
    END IF;
END //
DELIMITER ;

-- 订单商品创建时更新商品销量
DELIMITER //
CREATE TRIGGER `tr_order_items_after_insert` 
AFTER INSERT ON `order_items`
FOR EACH ROW
BEGIN
    -- 更新商品销量
    UPDATE products 
    SET sold_count = sold_count + NEW.quantity 
    WHERE id = NEW.product_id;
    
    -- 更新SKU销量
    IF NEW.sku_id IS NOT NULL THEN
        UPDATE product_skus 
        SET sold_count = sold_count + NEW.quantity 
        WHERE id = NEW.sku_id;
    END IF;
END //
DELIMITER ;

-- 用户积分变更时自动计算等级
DELIMITER //
CREATE TRIGGER `tr_users_after_update` 
AFTER UPDATE ON `users`
FOR EACH ROW
BEGIN
    IF NEW.points != OLD.points THEN
        CALL CalculateUserLevel(NEW.id);
    END IF;
END //
DELIMITER ;

-- =====================================================
-- 6. 创建视图
-- =====================================================

-- 商品详情视图
CREATE VIEW `v_product_detail` AS
SELECT 
    p.id,
    p.name,
    p.subtitle,
    p.description,
    p.price,
    p.sale_price,
    p.stock,
    p.sold_count,
    p.view_count,
    p.images,
    p.main_image,
    p.is_hot,
    p.is_new,
    p.is_recommend,
    p.status,
    c.name as category_name,
    c.id as category_id,
    b.name as brand_name,
    b.id as brand_id,
    COUNT(ps.id) as sku_count
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN product_skus ps ON p.id = ps.product_id
GROUP BY p.id;

-- 订单详情视图
CREATE VIEW `v_order_detail` AS
SELECT 
    o.id,
    o.order_no,
    o.user_id,
    o.total_amount,
    o.discount_amount,
    o.shipping_fee,
    o.actual_amount,
    o.status,
    o.payment_status,
    o.payment_method,
    o.payment_time,
    o.shipping_address,
    o.remark,
    o.created_at,
    u.nickname,
    u.phone,
    COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;

-- 用户统计视图
CREATE VIEW `v_user_stats` AS
SELECT 
    u.id,
    u.nickname,
    u.phone,
    u.points,
    u.balance,
    ul.name as level_name,
    ul.discount,
    COUNT(DISTINCT o.id) as order_count,
    SUM(o.actual_amount) as total_spent,
    COUNT(DISTINCT ua.id) as address_count,
    COUNT(DISTINCT uc.id) as coupon_count
FROM users u
LEFT JOIN user_levels ul ON u.level_id = ul.id
LEFT JOIN orders o ON u.id = o.user_id AND o.status = 4
LEFT JOIN user_addresses ua ON u.id = ua.user_id
LEFT JOIN user_coupons uc ON u.id = uc.user_id AND uc.status = 0
GROUP BY u.id;

-- =====================================================
-- 完成
-- =====================================================

-- 显示创建的表
SHOW TABLES;

-- 显示表的详细信息
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    DATA_LENGTH,
    INDEX_LENGTH,
    (DATA_LENGTH + INDEX_LENGTH) as TOTAL_SIZE
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'wechat_mall'
ORDER BY TOTAL_SIZE DESC;

-- 显示存储过程
SHOW PROCEDURE STATUS WHERE db = 'wechat_mall';

-- 显示触发器
SHOW TRIGGERS;

-- 显示视图
SHOW FULL TABLES WHERE Table_type = 'VIEW'; 