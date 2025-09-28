USE cursor_shop;

CREATE TABLE IF NOT EXISTS user_login_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
  userId BIGINT NOT NULL COMMENT '用户ID',
  ip VARCHAR(45) NOT NULL COMMENT 'IP地址',
  userAgent VARCHAR(500) NULL COMMENT '用户代理',
  location VARCHAR(100) NULL COMMENT '登录地点',
  status ENUM('success', 'failed') DEFAULT 'success' COMMENT '登录状态',
  failReason VARCHAR(255) NULL COMMENT '失败原因',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX IDX_USER_LOGIN_LOGS_USER_ID (userId),
  INDEX IDX_USER_LOGIN_LOGS_STATUS (status),
  INDEX IDX_USER_LOGIN_LOGS_CREATED_AT (createdAt)
);

-- 插入一些测试数据
INSERT INTO user_login_logs (userId, ip, userAgent, location, status, createdAt) VALUES
(1, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '北京市', 'success', '2024-01-15 09:30:00'),
(1, '192.168.1.100', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)', '上海市', 'success', '2024-01-14 14:20:00'),
(2, '10.0.0.50', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', '广州市', 'failed', '2024-01-13 16:45:00'),
(2, '10.0.0.50', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', '广州市', 'success', '2024-01-13 16:47:00'),
(3, '172.16.0.25', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', '深圳市', 'success', '2024-01-12 11:15:00');

SELECT 'User login logs table created and sample data inserted successfully' as result;