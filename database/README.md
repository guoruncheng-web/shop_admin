# 微信小程序商城数据库文档

## 概述

本目录包含微信小程序商城的完整数据库设计，包括表结构、初始数据、存储过程和触发器。

## 文件说明

### 1. schema.sql
- **用途**: 数据库表结构定义
- **内容**: 包含所有表的创建语句、索引、外键约束
- **执行顺序**: 第一个执行

### 2. data.sql
- **用途**: 初始化数据
- **内容**: 包含用户等级、商品分类、品牌、角色、管理员、系统配置等基础数据
- **执行顺序**: 第二个执行

### 3. procedures.sql
- **用途**: 存储过程和触发器
- **内容**: 包含业务逻辑相关的存储过程和触发器
- **执行顺序**: 第三个执行

### 4. init_all.sql
- **用途**: 一键初始化脚本
- **内容**: 包含所有上述文件的内容，可以一次性完成数据库初始化
- **执行顺序**: 如果使用此文件，则不需要执行其他文件

## 数据库结构

### 核心表

#### 用户相关
- `user_levels` - 用户等级表
- `users` - 用户表
- `user_addresses` - 用户地址表

#### 商品相关
- `categories` - 商品分类表
- `brands` - 品牌表
- `products` - 商品表
- `product_skus` - 商品SKU表

#### 订单相关
- `orders` - 订单表
- `order_items` - 订单商品表
- `cart_items` - 购物车表

#### 支付相关
- `payments` - 支付记录表

#### 营销相关
- `coupons` - 优惠券表
- `user_coupons` - 用户优惠券表

#### 系统管理
- `roles` - 角色表
- `admins` - 管理员表
- `system_configs` - 系统配置表

## 安装步骤

### 方法一：分步执行（推荐）

1. **创建数据库**
```sql
CREATE DATABASE `wechat_mall` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **执行表结构**
```bash
mysql -u root -p wechat_mall < schema.sql
```

3. **插入初始数据**
```bash
mysql -u root -p wechat_mall < data.sql
```

4. **创建存储过程和触发器**
```bash
mysql -u root -p wechat_mall < procedures.sql
```

### 方法二：一键初始化

```bash
mysql -u root -p < init_all.sql
```

## 数据库配置

### 环境要求
- MySQL 8.0+
- 字符集: utf8mb4
- 排序规则: utf8mb4_unicode_ci

### 连接配置
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=wechat_mall
DB_USER=root
DB_PASSWORD=your_password
```

## 核心功能

### 1. 订单管理
- 自动生成订单号
- 库存自动扣减
- 订单状态自动流转
- 超时订单自动取消

### 2. 用户管理
- 积分自动计算
- 等级自动升级
- 地址管理

### 3. 商品管理
- 多规格SKU支持
- 库存实时更新
- 销量统计

### 4. 营销功能
- 优惠券管理
- 用户等级折扣
- 积分系统

## 存储过程说明

### 核心存储过程

1. **GenerateOrderNo** - 生成订单号
2. **UpdateProductStock** - 更新商品库存
3. **CalculateUserLevel** - 计算用户等级
4. **CreateOrder** - 创建订单
5. **PayOrder** - 支付订单
6. **CancelOrder** - 取消订单
7. **ShipOrder** - 发货
8. **ConfirmOrder** - 确认收货

### 使用示例

```sql
-- 创建订单
CALL CreateOrder(1, 1000.00, 50.00, 10.00, '{"receiver":"张三"}', '备注', @order_id, @order_no);

-- 支付订单
CALL PayOrder(@order_id, 1, 'WX123456789', @payment_id);

-- 发货
CALL ShipOrder(@order_id);

-- 确认收货
CALL ConfirmOrder(@order_id);
```

## 触发器说明

### 自动触发器

1. **订单创建** - 自动生成订单号
2. **订单商品创建** - 自动更新销量和库存
3. **用户积分变更** - 自动计算等级
4. **优惠券使用** - 自动更新使用数量

## 索引优化

### 复合索引
- `idx_orders_user_status_time` - 订单查询优化
- `idx_products_category_status` - 商品查询优化
- `idx_user_coupons_user_status` - 优惠券查询优化

### 全文索引
- `ft_product_name` - 商品名称搜索
- `ft_product_description` - 商品描述搜索

## 数据备份

### 备份脚本
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p --single-transaction --routines --triggers wechat_mall > backup_${DATE}.sql
```

### 恢复脚本
```bash
mysql -u root -p wechat_mall < backup_20240101_120000.sql
```

## 性能优化

### 1. 查询优化
- 使用复合索引
- 避免全表扫描
- 合理使用分页

### 2. 缓存策略
- 商品信息缓存
- 用户信息缓存
- 分类数据缓存

### 3. 分库分表
- 订单表按时间分表
- 用户表按ID范围分表
- 商品表按分类分表

## 监控和维护

### 1. 慢查询监控
```sql
-- 开启慢查询日志
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
```

### 2. 性能监控
```sql
-- 查看表大小
SELECT 
    TABLE_NAME,
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'wechat_mall'
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;
```

### 3. 数据清理
- 定期清理过期订单
- 清理无效支付记录
- 清理过期优惠券

## 安全建议

### 1. 权限控制
- 创建专用数据库用户
- 限制用户权限
- 定期更新密码

### 2. 数据加密
- 敏感信息加密存储
- 传输数据加密
- 备份文件加密

### 3. 审计日志
- 记录重要操作
- 监控异常访问
- 定期审计

## 常见问题

### 1. 字符集问题
```sql
-- 检查字符集
SHOW VARIABLES LIKE 'character_set%';
SHOW VARIABLES LIKE 'collation%';
```

### 2. 存储过程权限
```sql
-- 授予存储过程权限
GRANT EXECUTE ON PROCEDURE wechat_mall.* TO 'username'@'localhost';
```

### 3. 触发器权限
```sql
-- 授予触发器权限
GRANT TRIGGER ON wechat_mall.* TO 'username'@'localhost';
```

## 联系支持

如有问题，请联系技术支持团队：
- 邮箱: support@example.com
- 电话: 400-123-4567
- 文档: https://docs.example.com 