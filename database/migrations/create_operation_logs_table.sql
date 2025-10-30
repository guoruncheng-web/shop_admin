-- 创建操作日志表
CREATE TABLE `operation_logs` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `username` VARCHAR(100) NOT NULL COMMENT '用户名',
  `module` VARCHAR(100) NOT NULL COMMENT '模块名称',
  `operation` VARCHAR(100) NOT NULL COMMENT '操作类型',
  `description` VARCHAR(255) NOT NULL COMMENT '操作描述',
  `method` VARCHAR(10) NOT NULL COMMENT '请求方法',
  `path` VARCHAR(500) NOT NULL COMMENT '请求路径',
  `params` TEXT NULL COMMENT '请求参数',
  `response` TEXT NULL COMMENT '响应数据',
  `ip` VARCHAR(45) NOT NULL COMMENT 'IP地址',
  `location` VARCHAR(100) NULL COMMENT '地理位置',
  `user_agent` VARCHAR(500) NULL COMMENT '用户代理',
  `status_code` INT DEFAULT 200 COMMENT '响应状态码',
  `execution_time` INT DEFAULT 0 COMMENT '执行时间(ms)',
  `status` ENUM('success', 'failed') DEFAULT 'success' COMMENT '操作状态',
  `error_message` TEXT NULL COMMENT '错误信息',
  `business_id` VARCHAR(50) NULL COMMENT '业务标识',
  `merchant_id` BIGINT NULL COMMENT '所属商户ID',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  INDEX `idx_user_id_created_at` (`user_id`, `created_at`),
  INDEX `idx_module_operation` (`module`, `operation`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_merchant_id` (`merchant_id`),
  INDEX `idx_business_id` (`business_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

-- 添加外键约束（如果merchants表存在）
-- ALTER TABLE `operation_logs` ADD CONSTRAINT `fk_operation_logs_merchant_id` 
--   FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE SET NULL;