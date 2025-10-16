-- 使用数据库
USE wechat_mall;

-- 修复 operation_logs 表的默认值问题
ALTER TABLE operation_logs
MODIFY COLUMN statusCode INT NOT NULL DEFAULT 200 COMMENT '响应状态码';

ALTER TABLE operation_logs
MODIFY COLUMN executionTime INT NOT NULL DEFAULT 0 COMMENT '执行时间(ms)';

-- 确保其他必填字段也有适当的默认值
ALTER TABLE operation_logs
MODIFY COLUMN status ENUM('success', 'failed') NOT NULL DEFAULT 'success' COMMENT '操作状态';