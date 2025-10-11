-- 商户发货地址表
-- 一个商户只能有一个发货地址

USE wechat_mall;

-- 创建商户发货地址表
CREATE TABLE IF NOT EXISTS `merchant_shipping_addresses` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '发货地址ID',
  `merchant_id` BIGINT NOT NULL COMMENT '商户ID',
  `contact_name` VARCHAR(50) NOT NULL COMMENT '联系人姓名',
  `contact_phone` VARCHAR(20) NOT NULL COMMENT '联系电话',
  `province_code` VARCHAR(20) NOT NULL COMMENT '省份编码',
  `province_name` VARCHAR(50) NOT NULL COMMENT '省份名称',
  `city_code` VARCHAR(20) NOT NULL COMMENT '城市编码',
  `city_name` VARCHAR(50) NOT NULL COMMENT '城市名称',
  `district_code` VARCHAR(20) NOT NULL COMMENT '区/县编码',
  `district_name` VARCHAR(50) NOT NULL COMMENT '区/县名称',
  `detail_address` VARCHAR(255) NOT NULL COMMENT '详细地址',
  `postal_code` VARCHAR(10) DEFAULT NULL COMMENT '邮政编码',
  `is_default` TINYINT NOT NULL DEFAULT 1 COMMENT '是否默认地址：0-否，1-是',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `created_by` BIGINT DEFAULT NULL COMMENT '创建人ID',
  `updated_by` BIGINT DEFAULT NULL COMMENT '更新人ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_merchant_id` (`merchant_id`),
  KEY `idx_merchant_id` (`merchant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商户发货地址表';

-- 添加外键约束
ALTER TABLE `merchant_shipping_addresses`
  ADD CONSTRAINT `fk_merchant_shipping_merchant`
  FOREIGN KEY (`merchant_id`)
  REFERENCES `merchants` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;
