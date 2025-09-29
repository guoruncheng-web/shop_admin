-- 创建测试管理员数据来匹配登录日志中的userId
USE wechat_mall_dev;

-- 插入测试管理员数据，确保与login_logs中的userId匹配
INSERT IGNORE INTO admins (id, username, password, real_name, email, phone, avatar, status, created_at, updated_at) VALUES
(1, 'admin', '$2b$10$YourHashedPasswordHere', '管理员', 'admin@example.com', '13800138000', '/avatars/admin.png', 1, NOW(), NOW()),
(2, 'user2', '$2b$10$YourHashedPasswordHere', '用户2', 'user2@example.com', '13800138001', '/avatars/user2.png', 1, NOW(), NOW()),
(3, 'user3', '$2b$10$YourHashedPasswordHere', '用户3', 'user3@example.com', '13800138002', '/avatars/user3.png', 1, NOW(), NOW());

-- 检查数据是否插入成功
SELECT id, username, real_name, email FROM admins WHERE id IN (1, 2, 3);