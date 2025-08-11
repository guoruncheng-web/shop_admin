-- 微信小程序商城数据库表结构
-- 创建数据库
CREATE DATABASE IF NOT EXISTS `wechat_mall` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `wechat_mall`;

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
  `updated_at` DATETIME DEFAULT NULL COMMENT '更新时间',
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
  `updated_at` DATETIME DEFAULT NULL COMMENT '更新时间',
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
  `updated_at` DATETIME DEFAULT NULL COMMENT '更新时间',
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
  `updated_at` DATETIME DEFAULT NULL COMMENT '更新时间',
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
  `images` TEXT COMMENT '商品图片TEXT数组',
  `main_image` VARCHAR(255) COMMENT '主图',
  `video_url` VARCHAR(255) COMMENT '商品视频',
  `weight` DECIMAL(8,2) COMMENT '商品重量(kg)',
  `volume` DECIMAL(8,2) COMMENT '商品体积(m³)',
  `is_hot` TINYINT DEFAULT 0 COMMENT '是否热门：0-否，1-是',
  `is_new` TINYINT DEFAULT 0 COMMENT '是否新品：0-否，1-是',
  `is_recommend` TINYINT DEFAULT 0 COMMENT '是否推荐：0-否，1-是',
  `is_discount` TINYINT DEFAULT 0 COMMENT '是否折扣商品：0-否，1-是',
  `discount_rate` DECIMAL(5,2) DEFAULT 0 COMMENT '折扣率(0-100)',
  `sort_order` INT DEFAULT 0 COMMENT '排序权重',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-下架，1-上架，2-审核中',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT NULL COMMENT '更新时间',
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`),
  FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`),
  INDEX `idx_category_id` (`category_id`),
  INDEX `idx_brand_id` (`brand_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_is_hot` (`is_hot`),
  INDEX `idx_is_new` (`is_new`),
  INDEX `idx_is_recommend` (`is_recommend`),
  INDEX `idx_is_discount` (`is_discount`),
  INDEX `idx_sort_order` (`sort_order`),
  INDEX `idx_hot_sold` (`is_hot`, `sold_count`),
  INDEX `idx_discount_rate` (`is_discount`, `discount_rate`)
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
  `specs` TEXT COMMENT '规格属性TEXT',
  `weight` DECIMAL(8,2) COMMENT '重量',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT NULL COMMENT '更新时间',
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
  `shipping_address` TEXT NOT NULL COMMENT '收货地址TEXT',
  `remark` VARCHAR(500) COMMENT '订单备注',
  `cancel_reason` VARCHAR(200) COMMENT '取消原因',
  `cancel_time` TIMESTAMP NULL COMMENT '取消时间',
  `ship_time` TIMESTAMP NULL COMMENT '发货时间',
  `complete_time` TIMESTAMP NULL COMMENT '完成时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT NULL COMMENT '更新时间',
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
  `specs` TEXT COMMENT '规格属性TEXT',
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
  `updated_at` DATETIME DEFAULT NULL COMMENT '更新时间',
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
  `callback_data` TEXT COMMENT '回调数据',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT NULL COMMENT '更新时间',
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
  `code` VARCHAR(50) UNIQUE NOT NULL COMMENT '角色编码',
  `description` TEXT COMMENT '角色描述',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT NULL COMMENT '更新时间',
  INDEX `idx_status` (`status`),
  INDEX `idx_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- 权限表
CREATE TABLE `permissions` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '权限ID',
  `name` VARCHAR(100) NOT NULL COMMENT '权限名称',
  `code` VARCHAR(100) UNIQUE NOT NULL COMMENT '权限编码',
  `type` TINYINT NOT NULL COMMENT '权限类型：1-菜单权限，2-路由权限，3-按钮权限',
  `parent_id` BIGINT DEFAULT 0 COMMENT '父权限ID',
  `path` VARCHAR(200) COMMENT '路由路径',
  `component` VARCHAR(200) COMMENT '组件路径',
  `icon` VARCHAR(50) COMMENT '图标',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_parent_id` (`parent_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限表';

-- 角色权限关联表
CREATE TABLE `role_permissions` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
  `role_id` BIGINT NOT NULL COMMENT '角色ID',
  `permission_id` BIGINT NOT NULL COMMENT '权限ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_role_permission` (`role_id`, `permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限关联表';

-- 管理员表
CREATE TABLE `admins` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '管理员ID',
  `username` VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码',
  `real_name` VARCHAR(50) COMMENT '真实姓名',
  `email` VARCHAR(100) COMMENT '邮箱',
  `phone` VARCHAR(20) COMMENT '手机号',
  `avatar` VARCHAR(255) COMMENT '头像',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `last_login_time` TIMESTAMP NULL COMMENT '最后登录时间',
  `last_login_ip` VARCHAR(50) COMMENT '最后登录IP',
  `login_count` INT DEFAULT 0 COMMENT '登录次数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT NULL COMMENT '更新时间',
  INDEX `idx_username` (`username`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';

-- 管理员角色关联表
CREATE TABLE `admin_roles` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
  `admin_id` BIGINT NOT NULL COMMENT '管理员ID',
  `role_id` BIGINT NOT NULL COMMENT '角色ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_admin_role` (`admin_id`, `role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员角色关联表';

-- 管理员登录日志表
CREATE TABLE `admin_login_logs` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
  `admin_id` BIGINT COMMENT '管理员ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `ip` VARCHAR(50) COMMENT '登录IP',
  `user_agent` TEXT COMMENT '用户代理',
  `login_location` VARCHAR(100) COMMENT '登录地点',
  `browser` VARCHAR(50) COMMENT '浏览器类型',
  `os` VARCHAR(50) COMMENT '操作系统',
  `status` TINYINT NOT NULL COMMENT '登录状态：0-失败，1-成功',
  `message` VARCHAR(255) COMMENT '登录信息',
  `login_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '登录时间',
  `logout_time` TIMESTAMP NULL COMMENT '登出时间',
  INDEX `idx_admin_id` (`admin_id`),
  INDEX `idx_username` (`username`),
  INDEX `idx_status` (`status`),
  INDEX `idx_login_time` (`login_time`),
  INDEX `idx_ip` (`ip`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员登录日志表';

-- 管理员操作日志表
CREATE TABLE `admin_operation_logs` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
  `admin_id` BIGINT NOT NULL COMMENT '管理员ID',
  `username` VARCHAR(50) NOT NULL COMMENT '管理员用户名',
  `module` VARCHAR(50) NOT NULL COMMENT '操作模块',
  `operation` VARCHAR(50) NOT NULL COMMENT '操作类型',
  `method` VARCHAR(10) NOT NULL COMMENT '请求方法',
  `url` VARCHAR(500) NOT NULL COMMENT '请求URL',
  `ip` VARCHAR(50) COMMENT '操作IP',
  `user_agent` TEXT COMMENT '用户代理',
  `request_params` TEXT COMMENT '请求参数',
  `response_result` TEXT COMMENT '响应结果',
  `status` TINYINT DEFAULT 1 COMMENT '操作状态：1-成功，0-失败',
  `error_message` TEXT COMMENT '错误信息',
  `execution_time` INT DEFAULT 0 COMMENT '执行时间(毫秒)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  INDEX `idx_admin_id` (`admin_id`),
  INDEX `idx_username` (`username`),
  INDEX `idx_module` (`module`),
  INDEX `idx_operation` (`operation`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_ip` (`ip`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员操作日志表';

-- Banner轮播图表
CREATE TABLE `banners` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'Banner ID',
  `title` VARCHAR(100) NOT NULL COMMENT 'Banner标题',
  `image_url` VARCHAR(500) NOT NULL COMMENT '图片URL',
  `link_type` TINYINT NOT NULL COMMENT '跳转类型：1-商品列表，2-商品详情，3-分类页面，4-活动页面，5-外链',
  `link_value` VARCHAR(500) COMMENT '跳转值',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `status` TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `start_time` TIMESTAMP NULL COMMENT '开始时间',
  `end_time` TIMESTAMP NULL COMMENT '结束时间',
  `click_count` INT DEFAULT 0 COMMENT '点击次数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT NULL COMMENT '更新时间',
  INDEX `idx_status` (`status`),
  INDEX `idx_sort_order` (`sort_order`),
  INDEX `idx_link_type` (`link_type`),
  INDEX `idx_start_end_time` (`start_time`, `end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Banner轮播图表';

-- Banner关联商品表
CREATE TABLE `banner_products` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '关联ID',
  `banner_id` BIGINT NOT NULL COMMENT 'Banner ID',
  `product_id` BIGINT NOT NULL COMMENT '商品ID',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_banner_id` (`banner_id`),
  INDEX `idx_product_id` (`product_id`),
  UNIQUE KEY `uk_banner_product` (`banner_id`, `product_id`),
  FOREIGN KEY (`banner_id`) REFERENCES `banners`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Banner关联商品表';

-- 系统配置表
CREATE TABLE `system_configs` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
  `config_key` VARCHAR(100) UNIQUE NOT NULL COMMENT '配置键',
  `config_value` TEXT COMMENT '配置值',
  `description` VARCHAR(200) COMMENT '配置描述',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT NULL COMMENT '更新时间',
  INDEX `idx_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- 创建复合索引
CREATE INDEX `idx_orders_user_status_time` ON `orders`(`user_id`, `status`, `created_at`);
CREATE INDEX `idx_products_category_status` ON `products`(`category_id`, `status`);
CREATE INDEX `idx_user_coupons_user_status` ON `user_coupons`(`user_id`, `status`, `created_at`);

-- 创建全文索引
ALTER TABLE `products` ADD FULLTEXT INDEX `ft_product_name`(`name`, `subtitle`);
ALTER TABLE `products` ADD FULLTEXT INDEX `ft_product_description`(`description`); 