# 操作日志表初始化说明

## 数据库表创建

请在数据库中执行以下SQL脚本创建操作日志表：

```bash
# 连接到MySQL数据库
mysql -u your_username -p your_database_name

# 执行创建表的SQL脚本
source /Users/mac/test/cursor1/cursor_shop/database/migrations/create_operation_logs_table.sql
```

或者直接在MySQL客户端中执行 `create_operation_logs_table.sql` 文件中的SQL语句。

## 验证表是否创建成功

```sql
-- 查看表结构
DESC operation_logs;

-- 查看表索引
SHOW INDEX FROM operation_logs;

-- 查看表记录数（应该为0）
SELECT COUNT(*) FROM operation_logs;
```

## 表结构说明

- **id**: 日志ID（主键，自增）
- **userId**: 用户ID
- **username**: 用户名
- **module**: 模块名称（如：system, user, role等）
- **operation**: 操作类型（如：create, update, delete, view等）
- **description**: 操作描述
- **method**: 请求方法（GET, POST, PUT, DELETE等）
- **path**: 请求路径
- **params**: 请求参数（JSON格式）
- **response**: 响应数据（JSON格式）
- **ip**: IP地址
- **location**: 地理位置
- **userAgent**: 用户代理（浏览器信息）
- **statusCode**: 响应状态码
- **executionTime**: 执行时间（毫秒）
- **status**: 操作状态（success/failed）
- **errorMessage**: 错误信息
- **businessId**: 业务标识
- **createdAt**: 创建时间

## 索引说明

为了提高查询性能，表中创建了以下索引：

1. `idx_userId_createdAt`: 用户ID和创建时间联合索引
2. `idx_module_operation`: 模块和操作类型联合索引
3. `idx_createdAt`: 创建时间索引
4. `idx_status`: 操作状态索引
5. `idx_businessId`: 业务标识索引

## 注意事项

1. 确保数据库字符集为 `utf8mb4`，以支持存储表情符号和特殊字符
2. 定期清理旧日志，避免表数据过大影响性能
3. 可以通过后台管理界面的"清理过期日志"功能定期清理