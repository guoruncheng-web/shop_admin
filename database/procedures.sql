-- 微信小程序商城存储过程和触发器
USE `wechat_mall`;

-- =====================================================
-- 存储过程
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

-- 创建订单存储过程
CREATE PROCEDURE `CreateOrder`(
    IN p_user_id BIGINT,
    IN p_total_amount DECIMAL(10,2),
    IN p_discount_amount DECIMAL(10,2),
    IN p_shipping_fee DECIMAL(10,2),
    IN p_shipping_address JSON,
    IN p_remark VARCHAR(500),
    OUT p_order_id BIGINT,
    OUT p_order_no VARCHAR(32)
)
BEGIN
    DECLARE actual_amount DECIMAL(10,2);
    
    -- 计算实付金额
    SET actual_amount = p_total_amount - p_discount_amount + p_shipping_fee;
    
    -- 生成订单号
    CALL GenerateOrderNo(p_order_no);
    
    -- 创建订单
    INSERT INTO orders (
        order_no, user_id, total_amount, discount_amount, 
        shipping_fee, actual_amount, shipping_address, remark
    ) VALUES (
        p_order_no, p_user_id, p_total_amount, p_discount_amount,
        p_shipping_fee, actual_amount, p_shipping_address, p_remark
    );
    
    SET p_order_id = LAST_INSERT_ID();
END //

-- 添加订单商品存储过程
CREATE PROCEDURE `AddOrderItem`(
    IN p_order_id BIGINT,
    IN p_product_id BIGINT,
    IN p_sku_id BIGINT,
    IN p_quantity INT,
    IN p_price DECIMAL(10,2)
)
BEGIN
    DECLARE product_name VARCHAR(255);
    DECLARE sku_name VARCHAR(255);
    DECLARE product_image VARCHAR(255);
    DECLARE specs JSON;
    DECLARE total_amount DECIMAL(10,2);
    
    -- 获取商品信息
    SELECT name, main_image INTO product_name, product_image 
    FROM products WHERE id = p_product_id;
    
    -- 获取SKU信息
    IF p_sku_id IS NOT NULL THEN
        SELECT name, specs INTO sku_name, specs 
        FROM product_skus WHERE id = p_sku_id;
    END IF;
    
    -- 计算小计金额
    SET total_amount = p_price * p_quantity;
    
    -- 插入订单商品
    INSERT INTO order_items (
        order_id, product_id, sku_id, product_name, sku_name,
        product_image, price, quantity, total_amount, specs
    ) VALUES (
        p_order_id, p_product_id, p_sku_id, product_name, sku_name,
        product_image, p_price, p_quantity, total_amount, specs
    );
    
    -- 更新商品库存
    CALL UpdateProductStock(p_product_id, p_sku_id, p_quantity, 'decrease');
END //

-- 支付订单存储过程
CREATE PROCEDURE `PayOrder`(
    IN p_order_id BIGINT,
    IN p_payment_method TINYINT,
    IN p_transaction_id VARCHAR(64),
    OUT p_payment_id BIGINT
)
BEGIN
    DECLARE order_amount DECIMAL(10,2);
    DECLARE payment_no VARCHAR(64);
    
    -- 获取订单金额
    SELECT actual_amount INTO order_amount FROM orders WHERE id = p_order_id;
    
    -- 生成支付单号
    SET payment_no = CONCAT('PAY', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(p_order_id, 6, '0'));
    
    -- 创建支付记录
    INSERT INTO payments (
        order_id, payment_no, transaction_id, amount, payment_method, status
    ) VALUES (
        p_order_id, payment_no, p_transaction_id, order_amount, p_payment_method, 1
    );
    
    SET p_payment_id = LAST_INSERT_ID();
    
    -- 更新订单状态
    UPDATE orders SET 
        payment_status = 1,
        payment_time = NOW(),
        status = 2
    WHERE id = p_order_id;
END //

-- 取消订单存储过程
CREATE PROCEDURE `CancelOrder`(
    IN p_order_id BIGINT,
    IN p_cancel_reason VARCHAR(200)
)
BEGIN
    DECLARE order_status TINYINT;
    DECLARE payment_status TINYINT;
    
    -- 获取订单状态
    SELECT status, payment_status INTO order_status, payment_status 
    FROM orders WHERE id = p_order_id;
    
    -- 检查订单是否可以取消
    IF order_status NOT IN (1, 2) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '订单状态不允许取消';
    END IF;
    
    -- 如果已支付，需要退款
    IF payment_status = 1 THEN
        -- 这里可以调用退款接口
        UPDATE payments SET status = 3 WHERE order_id = p_order_id;
    END IF;
    
    -- 更新订单状态
    UPDATE orders SET 
        status = 5,
        cancel_reason = p_cancel_reason,
        cancel_time = NOW()
    WHERE id = p_order_id;
    
    -- 恢复库存
    UPDATE order_items oi
    JOIN products p ON oi.product_id = p.id
    SET p.stock = p.stock + oi.quantity
    WHERE oi.order_id = p_order_id;
    
    UPDATE order_items oi
    JOIN product_skus ps ON oi.sku_id = ps.id
    SET ps.stock = ps.stock + oi.quantity
    WHERE oi.order_id = p_order_id AND oi.sku_id IS NOT NULL;
END //

-- 发货存储过程
CREATE PROCEDURE `ShipOrder`(IN p_order_id BIGINT)
BEGIN
    DECLARE order_status TINYINT;
    
    -- 获取订单状态
    SELECT status INTO order_status FROM orders WHERE id = p_order_id;
    
    -- 检查订单状态
    IF order_status != 2 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '订单状态不允许发货';
    END IF;
    
    -- 更新订单状态
    UPDATE orders SET 
        status = 3,
        ship_time = NOW()
    WHERE id = p_order_id;
END //

-- 确认收货存储过程
CREATE PROCEDURE `ConfirmOrder`(IN p_order_id BIGINT)
BEGIN
    DECLARE order_status TINYINT;
    DECLARE user_id BIGINT;
    DECLARE actual_amount DECIMAL(10,2);
    DECLARE points_to_add INT;
    
    -- 获取订单信息
    SELECT status, user_id, actual_amount INTO order_status, user_id, actual_amount 
    FROM orders WHERE id = p_order_id;
    
    -- 检查订单状态
    IF order_status != 3 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '订单状态不允许确认收货';
    END IF;
    
    -- 更新订单状态
    UPDATE orders SET 
        status = 4,
        complete_time = NOW()
    WHERE id = p_order_id;
    
    -- 添加积分
    SET points_to_add = FLOOR(actual_amount);
    UPDATE users SET points = points + points_to_add WHERE id = user_id;
    
    -- 重新计算用户等级
    CALL CalculateUserLevel(user_id);
END //

-- 自动取消超时订单存储过程
CREATE PROCEDURE `AutoCancelTimeoutOrders`()
BEGIN
    DECLARE auto_cancel_minutes INT DEFAULT 30;
    
    -- 获取自动取消时间配置
    SELECT CAST(config_value AS UNSIGNED) INTO auto_cancel_minutes
    FROM system_configs 
    WHERE config_key = 'auto_cancel_minutes';
    
    -- 取消超时订单
    UPDATE orders 
    SET status = 5, 
        cancel_reason = '超时未支付自动取消',
        cancel_time = NOW()
    WHERE status = 1 
    AND payment_status = 0
    AND created_at < DATE_SUB(NOW(), INTERVAL auto_cancel_minutes MINUTE);
END //

-- 自动确认收货存储过程
CREATE PROCEDURE `AutoConfirmOrders`()
BEGIN
    DECLARE auto_confirm_days INT DEFAULT 7;
    
    -- 获取自动确认时间配置
    SELECT CAST(config_value AS UNSIGNED) INTO auto_confirm_days
    FROM system_configs 
    WHERE config_key = 'auto_confirm_days';
    
    -- 自动确认收货
    UPDATE orders 
    SET status = 4, 
        complete_time = NOW()
    WHERE status = 3
    AND ship_time < DATE_SUB(NOW(), INTERVAL auto_confirm_days DAY);
END //

DELIMITER ;

-- =====================================================
-- 触发器
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

-- 优惠券使用后更新使用数量
DELIMITER //
CREATE TRIGGER `tr_user_coupons_after_update` 
AFTER UPDATE ON `user_coupons`
FOR EACH ROW
BEGIN
    IF NEW.status = 1 AND OLD.status = 0 THEN
        UPDATE coupons 
        SET used_count = used_count + 1 
        WHERE id = NEW.coupon_id;
    END IF;
END //
DELIMITER ;

-- 商品浏览时增加浏览次数
DELIMITER //
CREATE TRIGGER `tr_products_after_update` 
AFTER UPDATE ON `products`
FOR EACH ROW
BEGIN
    IF NEW.view_count != OLD.view_count THEN
        -- 这里可以添加其他逻辑，比如记录浏览日志
        INSERT INTO product_view_logs (product_id, view_count, created_at)
        VALUES (NEW.id, NEW.view_count - OLD.view_count, NOW());
    END IF;
END //
DELIMITER ;

-- =====================================================
-- 事件调度器
-- =====================================================

-- 启用事件调度器
SET GLOBAL event_scheduler = ON;

-- 创建自动取消超时订单事件
CREATE EVENT `evt_auto_cancel_orders`
ON SCHEDULE EVERY 5 MINUTE
DO CALL AutoCancelTimeoutOrders();

-- 创建自动确认收货事件
CREATE EVENT `evt_auto_confirm_orders`
ON SCHEDULE EVERY 1 HOUR
DO CALL AutoConfirmOrders();

-- 创建数据清理事件（清理30天前的日志数据）
CREATE EVENT `evt_cleanup_logs`
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    -- 清理30天前的支付记录
    DELETE FROM payments 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
    AND status IN (2, 3); -- 支付失败或已退款
    
    -- 清理90天前的已取消订单
    DELETE FROM orders 
    WHERE status = 5 
    AND cancel_time < DATE_SUB(NOW(), INTERVAL 90 DAY);
END; 