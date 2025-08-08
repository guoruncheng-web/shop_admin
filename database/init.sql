-- 微信小程序商城数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS `wechat_mall` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE `wechat_mall`;

-- 设置时区
SET time_zone = '+08:00';

-- 设置字符集
SET NAMES utf8mb4;

-- 显示创建成功信息
SELECT 'Database wechat_mall created successfully!' as message;
