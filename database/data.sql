-- 微信小程序商城初始化数据
USE `wechat_mall`;

-- 插入用户等级数据
INSERT INTO `user_levels` (`name`, `min_points`, `discount`, `description`, `icon`) VALUES
('普通会员', 0, 1.00, '新注册用户', '/images/level/bronze.png'),
('银卡会员', 1000, 0.95, '消费满1000积分', '/images/level/silver.png'),
('金卡会员', 5000, 0.90, '消费满5000积分', '/images/level/gold.png'),
('钻石会员', 20000, 0.85, '消费满20000积分', '/images/level/diamond.png');

-- 插入商品分类数据（三级分类结构）
INSERT INTO `categories` (`parent_id`, `name`, `description`, `icon`, `sort_order`, `level`) VALUES
-- 一级分类
(0, '数码电子', '手机、电脑、数码配件等电子产品', '/images/category/digital.png', 1, 1),
(0, '服装鞋帽', '男装、女装、童装、鞋帽等服饰', '/images/category/clothing.png', 2, 1),
(0, '家居生活', '家具、家电、生活用品等居家用品', '/images/category/home.png', 3, 1),
(0, '美妆护肤', '化妆品、护肤品、香水等美妆产品', '/images/category/beauty.png', 4, 1),
(0, '食品生鲜', '零食、生鲜、饮料等食品', '/images/category/food.png', 5, 1),

-- 二级分类
(1, '手机通讯', '智能手机、平板电脑、通讯设备', '/images/category/phone.png', 1, 2),
(1, '电脑办公', '笔记本、台式机、办公设备', '/images/category/computer.png', 2, 2),
(1, '数码配件', '手机配件、电脑配件、数码周边', '/images/category/accessories.png', 3, 2),
(2, '男装', '男士服装、男士配饰', '/images/category/mens.png', 1, 2),
(2, '女装', '女士服装、女士配饰', '/images/category/womens.png', 2, 2),
(2, '童装', '儿童服装、婴幼儿用品', '/images/category/kids.png', 3, 2),
(2, '鞋靴', '男鞋、女鞋、童鞋', '/images/category/shoes.png', 4, 2),
(3, '家具', '沙发、床具、桌椅、储物', '/images/category/furniture.png', 1, 2),
(3, '家电', '大家电、小家电、厨房电器', '/images/category/appliance.png', 2, 2),
(3, '家装', '灯具、装饰、建材', '/images/category/decoration.png', 3, 2),

-- 三级分类
-- 手机通讯下的三级分类
(6, '智能手机', '各品牌智能手机', '/images/category/smartphone.png', 1, 3),
(6, '游戏手机', '专业游戏手机', '/images/category/gaming-phone.png', 2, 3),
(6, '老人机', '老年人专用手机', '/images/category/senior-phone.png', 3, 3),
(6, '平板电脑', '各尺寸平板电脑', '/images/category/tablet.png', 4, 3),

-- 电脑办公下的三级分类
(7, '笔记本电脑', '轻薄本、游戏本、商务本', '/images/category/laptop.png', 1, 3),
(7, '台式电脑', '品牌机、组装机', '/images/category/desktop.png', 2, 3),
(7, '办公设备', '打印机、扫描仪、投影仪', '/images/category/office.png', 3, 3),

-- 男装下的三级分类
(9, '商务男装', '西装、衬衫、商务休闲', '/images/category/business-men.png', 1, 3),
(9, '休闲男装', 'T恤、牛仔裤、休闲裤', '/images/category/casual-men.png', 2, 3),
(9, '运动男装', '运动服、运动裤、运动鞋', '/images/category/sport-men.png', 3, 3),

-- 女装下的三级分类
(10, '时尚女装', '连衣裙、套装、时尚单品', '/images/category/fashion-women.png', 1, 3),
(10, '休闲女装', '休闲上衣、休闲裤、牛仔服', '/images/category/casual-women.png', 2, 3),
(10, '职场女装', '职业套装、职业衬衫', '/images/category/office-women.png', 3, 3),

-- 家具下的三级分类
(13, '客厅家具', '沙发、茶几、电视柜', '/images/category/living-room.png', 1, 3),
(13, '卧室家具', '床、衣柜、梳妆台', '/images/category/bedroom.png', 2, 3),
(13, '餐厅家具', '餐桌、餐椅、餐边柜', '/images/category/dining-room.png', 3, 3),

-- 家电下的三级分类
(14, '厨房电器', '冰箱、微波炉、电饭煲', '/images/category/kitchen.png', 1, 3),
(14, '生活电器', '洗衣机、空调、热水器', '/images/category/life-appliance.png', 2, 3),
(14, '小家电', '豆浆机、榨汁机、吸尘器', '/images/category/small-appliance.png', 3, 3);

-- 插入品牌数据
INSERT INTO `brands` (`name`, `logo`, `description`, `sort_order`) VALUES
('苹果', '/images/brands/apple.png', 'Apple Inc.', 1),
('华为', '/images/brands/huawei.png', '华为技术有限公司', 2),
('小米', '/images/brands/xiaomi.png', '小米科技有限责任公司', 3),
('耐克', '/images/brands/nike.png', 'Nike Inc.', 4),
('阿迪达斯', '/images/brands/adidas.png', 'Adidas AG', 5),
('自有品牌', '/images/brands/own.png', '商城自有品牌', 6),
('华硕', '/images/brands/asus.png', 'ASUS', 7),
('优衣库', '/images/brands/uniqlo.png', 'UNIQLO Co., Ltd.', 8);

-- 插入角色数据
INSERT INTO `roles` (`name`, `code`, `description`) VALUES
('超级管理员', 'super_admin', '拥有所有权限的超级管理员'),
('商品管理员', 'product_admin', '负责商品、分类、品牌管理'),
('订单管理员', 'order_admin', '负责订单、支付、物流管理'),
('用户管理员', 'user_admin', '负责用户、优惠券管理'),
('运营管理员', 'operation_admin', '负责营销活动、数据统计');

-- 插入权限数据
INSERT INTO `permissions` (`name`, `code`, `type`, `parent_id`, `path`, `component`, `icon`, `sort_order`) VALUES

-- 菜单权限 (type=1)
('系统管理', 'system', 1, 0, '/system', 'Layout', 'setting', 1),
('管理员管理', 'system:admin', 1, 1, '/system/admin', 'system/admin/index', 'user', 1),
('角色管理', 'system:role', 1, 1, '/system/role', 'system/role/index', 'peoples', 2),
('权限管理', 'system:permission', 1, 1, '/system/permission', 'system/permission/index', 'lock', 3),

('商品管理', 'product', 1, 0, '/product', 'Layout', 'shopping', 2),
('商品列表', 'product:list', 1, 5, '/product/list', 'product/list/index', 'goods', 1),
('分类管理', 'product:category', 1, 5, '/product/category', 'product/category/index', 'tree-table', 2),
('品牌管理', 'product:brand', 1, 5, '/product/brand', 'product/brand/index', 'international', 3),

('订单管理', 'order', 1, 0, '/order', 'Layout', 'list', 3),
('订单列表', 'order:list', 1, 9, '/order/list', 'order/list/index', 'documentation', 1),
('支付管理', 'order:payment', 1, 9, '/order/payment', 'order/payment/index', 'money', 2),

('用户管理', 'user', 1, 0, '/user', 'Layout', 'peoples', 4),
('用户列表', 'user:list', 1, 12, '/user/list', 'user/list/index', 'user', 1),
('优惠券管理', 'user:coupon', 1, 12, '/user/coupon', 'user/coupon/index', 'shopping', 2),

('统计分析', 'statistics', 1, 0, '/statistics', 'Layout', 'chart', 5),
('销售统计', 'statistics:sales', 1, 15, '/statistics/sales', 'statistics/sales/index', 'money', 1),
('用户统计', 'statistics:user', 1, 15, '/statistics/user', 'statistics/user/index', 'peoples', 2),

-- 路由权限 (type=2)
('系统管理路由', 'route:system', 2, 0, '/system/*', '', '', 0),
('管理员管理路由', 'route:system:admin', 2, 0, '/system/admin/*', '', '', 0),
('角色管理路由', 'route:system:role', 2, 0, '/system/role/*', '', '', 0),
('权限管理路由', 'route:system:permission', 2, 0, '/system/permission/*', '', '', 0),

('商品管理路由', 'route:product', 2, 0, '/product/*', '', '', 0),
('商品列表路由', 'route:product:list', 2, 0, '/product/list/*', '', '', 0),
('分类管理路由', 'route:product:category', 2, 0, '/product/category/*', '', '', 0),
('品牌管理路由', 'route:product:brand', 2, 0, '/product/brand/*', '', '', 0),

('订单管理路由', 'route:order', 2, 0, '/order/*', '', '', 0),
('订单列表路由', 'route:order:list', 2, 0, '/order/list/*', '', '', 0),
('支付管理路由', 'route:order:payment', 2, 0, '/order/payment/*', '', '', 0),

('用户管理路由', 'route:user', 2, 0, '/user/*', '', '', 0),
('用户列表路由', 'route:user:list', 2, 0, '/user/list/*', '', '', 0),
('优惠券管理路由', 'route:user:coupon', 2, 0, '/user/coupon/*', '', '', 0),

('统计分析路由', 'route:statistics', 2, 0, '/statistics/*', '', '', 0),
('销售统计路由', 'route:statistics:sales', 2, 0, '/statistics/sales/*', '', '', 0),
('用户统计路由', 'route:statistics:user', 2, 0, '/statistics/user/*', '', '', 0),

-- 按钮权限 (type=3)
('新增按钮', 'btn:add', 3, 0, '', '', '', 0),
('编辑按钮', 'btn:edit', 3, 0, '', '', '', 0),
('删除按钮', 'btn:delete', 3, 0, '', '', '', 0),
('查看按钮', 'btn:view', 3, 0, '', '', '', 0),
('导出按钮', 'btn:export', 3, 0, '', '', '', 0),
('导入按钮', 'btn:import', 3, 0, '', '', '', 0),
('审核按钮', 'btn:audit', 3, 0, '', '', '', 0),
('重置密码按钮', 'btn:reset:password', 3, 0, '', '', '', 0),
('状态切换按钮', 'btn:status', 3, 0, '', '', '', 0),
('批量操作按钮', 'btn:batch', 3, 0, '', '', '', 0),
('设置热销按钮', 'btn:set:hot', 3, 0, '', '', '', 0),
('设置折扣按钮', 'btn:set:discount', 3, 0, '', '', '', 0),
('专区排序按钮', 'btn:zone:sort', 3, 0, '', '', '', 0),
('专区预览按钮', 'btn:zone:preview', 3, 0, '', '', '', 0);

-- 插入管理员数据 (密码: admin123)
INSERT INTO `admins` (`username`, `password`, `real_name`, `email`) VALUES
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '系统管理员', 'admin@example.com'),
('product_admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '商品管理员', 'product@example.com'),
('order_admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '订单管理员', 'order@example.com');

-- 插入管理员角色关联
INSERT INTO `admin_roles` (`admin_id`, `role_id`) VALUES
(1, 1), -- admin -> 超级管理员
(2, 2), -- product_admin -> 商品管理员  
(3, 3); -- order_admin -> 订单管理员

-- 插入角色权限关联 (超级管理员拥有所有权限)
INSERT INTO `role_permissions` (`role_id`, `permission_id`) 
SELECT 1, id FROM `permissions`;

-- 商品管理员权限
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
-- 菜单权限
(2, 5), (2, 6), (2, 7), (2, 8), -- 商品管理相关菜单
-- 路由权限  
(2, 22), (2, 23), (2, 24), (2, 25), -- 商品管理相关路由
-- 按钮权限
(2, 33), (2, 34), (2, 35), (2, 36), (2, 37), (2, 39), -- 新增、编辑、删除、查看、导出、状态切换
(2, 43), (2, 44), (2, 45), (2, 46); -- 设置热销、设置折扣、专区排序、专区预览

-- 订单管理员权限  
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
-- 菜单权限
(3, 9), (3, 10), (3, 11), -- 订单管理相关菜单
-- 路由权限
(3, 26), (3, 27), (3, 28), -- 订单管理相关路由
-- 按钮权限
(3, 34), (3, 36), (3, 37), (3, 39); -- 编辑、查看、导出、状态切换

-- 用户管理员权限
INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
-- 菜单权限
(4, 12), (4, 13), (4, 14), -- 用户管理相关菜单
-- 路由权限
(4, 29), (4, 30), (4, 31), -- 用户管理相关路由
-- 按钮权限
(4, 33), (4, 34), (4, 36), (4, 37), (4, 39); -- 新增、编辑、查看、导出、状态切换

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

-- 插入示例商品数据（关联到三级分类）
INSERT INTO `products` (`name`, `subtitle`, `category_id`, `brand_id`, `description`, `price`, `sale_price`, `stock`, `sold_count`, `images`, `main_image`, `is_hot`, `is_new`, `is_recommend`, `is_discount`, `discount_rate`, `sort_order`, `status`) VALUES
-- 智能手机分类商品
('iPhone 15 Pro', '苹果最新旗舰手机', 16, 1, '搭载A17 Pro芯片，钛金属机身，专业级摄影系统', 7999.00, 7499.00, 100, 1250, '["/images/products/iphone15-1.jpg", "/images/products/iphone15-2.jpg"]', '/images/products/iphone15-main.jpg', 1, 1, 1, 1, 6.25, 100, 1),
('华为 Mate 60 Pro', '华为旗舰手机', 16, 2, '麒麟芯片，卫星通信，超长续航', 6999.00, 6499.00, 50, 890, '["/images/products/mate60-1.jpg", "/images/products/mate60-2.jpg"]', '/images/products/mate60-main.jpg', 1, 1, 1, 1, 7.14, 90, 1),
('小米14 Pro', '小米年度旗舰', 16, 3, '骁龙8 Gen 3，徕卡光学，2K屏幕', 4999.00, 4699.00, 200, 756, '["/images/products/mi14-1.jpg", "/images/products/mi14-2.jpg"]', '/images/products/mi14-main.jpg', 1, 1, 0, 1, 6.00, 80, 1),

-- 游戏手机分类商品
('ROG Phone 7', '专业游戏手机', 17, 6, '骁龙8 Gen 2，165Hz屏幕，游戏优化', 4999.00, 4599.00, 80, 456, '["/images/products/rog-1.jpg", "/images/products/rog-2.jpg"]', '/images/products/rog-main.jpg', 1, 1, 1, 1, 8.00, 70, 1),

-- 笔记本电脑分类商品
('MacBook Pro 14', '专业级笔记本电脑', 19, 1, 'M3芯片，14英寸视网膜显示屏，专业级性能', 14999.00, 13999.00, 30, 234, '["/images/products/macbook-1.jpg", "/images/products/macbook-2.jpg"]', '/images/products/macbook-main.jpg', 0, 1, 1, 1, 6.67, 60, 1),
('华为 MateBook X Pro', '轻薄商务本', 19, 2, '13.9英寸3K触控屏，第12代酷睿处理器', 8999.00, 8499.00, 40, 167, '["/images/products/matebook-1.jpg", "/images/products/matebook-2.jpg"]', '/images/products/matebook-main.jpg', 0, 1, 0, 1, 5.56, 50, 1),

-- 商务男装分类商品
('经典商务西装', '羊毛混纺商务套装', 22, 6, '意大利进口面料，经典版型，商务首选', 1999.00, 1799.00, 50, 89, '["/images/products/suit-1.jpg", "/images/products/suit-2.jpg"]', '/images/products/suit-main.jpg', 0, 0, 1, 1, 10.01, 40, 1),
('商务衬衫', '免烫商务长袖衬衫', 22, 6, '纯棉面料，免烫处理，商务休闲皆宜', 299.00, 259.00, 200, 345, '["/images/products/shirt-1.jpg", "/images/products/shirt-2.jpg"]', '/images/products/shirt-main.jpg', 1, 0, 0, 1, 13.38, 30, 1),

-- 时尚女装分类商品
('连衣裙', '优雅气质连衣裙', 25, 6, '真丝面料，修身版型，优雅气质', 899.00, 799.00, 100, 234, '["/images/products/dress-1.jpg", "/images/products/dress-2.jpg"]', '/images/products/dress-main.jpg', 1, 1, 1, 1, 11.12, 20, 1),

-- 客厅家具分类商品
('现代简约沙发', '三人位布艺沙发', 28, 6, '高品质海绵填充，透气布艺面料', 3999.00, 3599.00, 20, 67, '["/images/products/sofa-1.jpg", "/images/products/sofa-2.jpg"]', '/images/products/sofa-main.jpg', 1, 0, 1, 1, 10.00, 10, 1);

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

-- 插入示例订单数据
INSERT INTO `orders` (`order_no`, `user_id`, `total_amount`, `discount_amount`, `shipping_fee`, `actual_amount`, `status`, `payment_status`, `payment_method`, `shipping_address`) VALUES
('202401010001', 1, 7599.00, 50.00, 0.00, 7549.00, 4, 1, 1, '{"receiver": "张三", "phone": "13800138001", "province": "北京市", "city": "北京市", "district": "朝阳区", "detail_address": "三里屯SOHO 1号楼 1001室"}'),
('202401010002', 2, 1299.00, 0.00, 10.00, 1309.00, 3, 1, 1, '{"receiver": "李四", "phone": "13800138002", "province": "广州市", "city": "广州市", "district": "天河区", "detail_address": "珠江新城 3号楼 3003室"}'),
('202401010003', 3, 4699.00, 100.00, 0.00, 4599.00, 2, 1, 1, '{"receiver": "王五", "phone": "13800138003", "province": "深圳市", "city": "深圳市", "district": "南山区", "detail_address": "科技园 4号楼 4004室"}');

-- 插入订单商品数据
INSERT INTO `order_items` (`order_id`, `product_id`, `sku_id`, `product_name`, `sku_name`, `product_image`, `price`, `quantity`, `total_amount`, `specs`) VALUES
(1, 1, 1, 'iPhone 15 Pro', 'iPhone 15 Pro 128GB 深空黑色', '/images/products/iphone15-main.jpg', 7499.00, 1, 7499.00, '{"color": "深空黑色", "storage": "128GB"}'),
(2, 6, NULL, 'Adidas Ultraboost 22', 'Adidas Ultraboost 22', '/images/products/adidas-main.jpg', 1099.00, 1, 1099.00, '{}'),
(3, 3, 6, '小米14 Pro', '小米14 Pro 256GB 黑色', '/images/products/mi14-main.jpg', 4599.00, 1, 4599.00, '{"color": "黑色", "storage": "256GB"}');

-- 插入支付记录数据
INSERT INTO `payments` (`order_id`, `payment_no`, `transaction_id`, `amount`, `payment_method`, `status`) VALUES
(1, 'PAY202401010001', 'WX202401010001', 7549.00, 1, 1),
(2, 'PAY202401010002', 'WX202401010002', 1309.00, 1, 1),
(3, 'PAY202401010003', 'WX202401010003', 4599.00, 1, 1);

-- 插入购物车数据
INSERT INTO `cart_items` (`user_id`, `product_id`, `sku_id`, `quantity`, `selected`) VALUES
(1, 4, NULL, 1, 1),
(1, 5, NULL, 2, 1),
(2, 3, 6, 1, 1),
(3, 2, 4, 1, 1);

-- 插入管理员登录日志示例数据
INSERT INTO `admin_login_logs` (`admin_id`, `username`, `ip`, `user_agent`, `login_location`, `browser`, `os`, `status`, `message`, `login_time`) VALUES
(1, 'admin', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '北京市', 'Chrome', 'Windows 10', 1, '登录成功', '2024-01-15 09:00:00'),
(1, 'admin', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '北京市', 'Chrome', 'Windows 10', 1, '登录成功', '2024-01-15 14:30:00'),
(2, 'product_admin', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '上海市', 'Safari', 'macOS', 1, '登录成功', '2024-01-15 10:15:00'),
(1, 'admin', '203.0.113.1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', '广州市', 'Firefox', 'Ubuntu', 0, '密码错误', '2024-01-15 16:45:00');

-- 插入管理员操作日志示例数据
INSERT INTO `admin_operation_logs` (`admin_id`, `username`, `module`, `operation`, `method`, `url`, `ip`, `user_agent`, `request_params`, `response_result`, `status`, `execution_time`, `created_at`) VALUES
(1, 'admin', '商品管理', '创建商品', 'POST', '/admin/products', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '{"name":"新款手机","price":2999}', '{"success":true,"id":11}', 1, 156, '2024-01-15 09:15:00'),
(1, 'admin', '商品管理', '更新商品', 'PUT', '/admin/products/1', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '{"price":7299}', '{"success":true}', 1, 89, '2024-01-15 09:30:00'),
(2, 'product_admin', '分类管理', '创建分类', 'POST', '/admin/categories', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '{"name":"新分类","parent_id":1}', '{"success":true,"id":32}', 1, 134, '2024-01-15 10:30:00'),
(1, 'admin', '用户管理', '删除用户', 'DELETE', '/admin/users/999', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '{}', '{"success":false,"error":"用户不存在"}', 0, 45, '2024-01-15 11:00:00'),
(2, 'product_admin', '商品管理', '批量更新状态', 'PUT', '/admin/products/batch/status', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '{"ids":[1,2,3],"status":1}', '{"success":true,"updated":3}', 1, 267, '2024-01-15 11:15:00'),
(2, 'product_admin', '商品管理', '设置热销商品', 'PUT', '/admin/products/1/hot', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '{"is_hot":1,"sort_order":100}', '{"success":true}', 1, 89, '2024-01-15 11:30:00'),
(2, 'product_admin', '商品管理', '设置折扣商品', 'PUT', '/admin/products/2/discount', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '{"is_discount":1,"discount_rate":10.5}', '{"success":true}', 1, 95, '2024-01-15 11:45:00'),
(1, 'admin', '商品管理', '批量设置热销', 'POST', '/admin/products/batch/hot', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '{"ids":[1,2,3],"is_hot":1}', '{"success":true,"updated":3}', 1, 156, '2024-01-15 12:00:00');

-- 插入Banner轮播图示例数据
INSERT INTO `banners` (`title`, `image_url`, `link_type`, `link_value`, `sort_order`, `status`, `start_time`, `end_time`, `click_count`) VALUES
('新年大促销', 'https://example.com/images/banner1.jpg', 1, 'category_id=1', 1, 1, '2024-01-01 00:00:00', '2024-02-29 23:59:59', 1250),
('iPhone 15 Pro 新品上市', 'https://example.com/images/banner2.jpg', 2, 'product_id=1', 2, 1, '2024-01-15 00:00:00', '2024-03-15 23:59:59', 890),
('数码电子专场', 'https://example.com/images/banner3.jpg', 3, 'category_id=1', 3, 1, '2024-01-10 00:00:00', '2024-12-31 23:59:59', 567),
('春季新品发布', 'https://example.com/images/banner4.jpg', 1, 'tag=spring_new', 4, 0, '2024-03-01 00:00:00', '2024-05-31 23:59:59', 0),
('品牌官网', 'https://example.com/images/banner5.jpg', 5, 'https://brand.example.com', 5, 1, NULL, NULL, 234);

-- 插入Banner关联商品示例数据
INSERT INTO `banner_products` (`banner_id`, `product_id`, `sort_order`) VALUES
(1, 1, 1),  -- 新年大促销 关联 iPhone 15 Pro
(1, 2, 2),  -- 新年大促销 关联 MacBook Pro
(1, 3, 3),  -- 新年大促销 关联 iPad Air
(2, 1, 1),  -- iPhone 15 Pro新品 关联 iPhone 15 Pro
(3, 1, 1),  -- 数码电子专场 关联 iPhone 15 Pro
(3, 2, 2),  -- 数码电子专场 关联 MacBook Pro
(3, 4, 3),  -- 数码电子专场 关联 AirPods Pro
(4, 5, 1);  -- 春季新品 关联 Apple Watch 