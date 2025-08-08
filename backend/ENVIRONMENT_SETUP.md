# 环境配置说明

## 环境配置文件

项目支持多环境配置，根据不同环境加载不同的配置文件：

### 1. 开发环境 (.env.development)
- **用途**: 本地开发
- **特点**: 详细日志、自动同步数据库、宽松的安全设置
- **端口**: 3000
- **数据库**: wechat_mall_dev
- **Redis**: DB 0

### 2. 测试环境 (.env.testing)
- **用途**: 测试环境
- **特点**: 中等日志级别、独立数据库、中等安全设置
- **端口**: 3001
- **数据库**: wechat_mall_test
- **Redis**: DB 1

### 3. 生产环境 (.env.production)
- **用途**: 生产部署
- **特点**: 最小日志、严格安全、性能优化
- **端口**: 3000
- **数据库**: wechat_mall_prod
- **Redis**: DB 0

## 启动不同环境

### 开发环境
```bash
# 默认启动开发环境
npm run start:dev

# 或明确指定环境
NODE_ENV=development npm run start:dev
```

### 测试环境
```bash
NODE_ENV=testing npm run start:dev
```

### 生产环境
```bash
NODE_ENV=production npm run start:dev
```

## 配置项说明

### 数据库配置
- `DATABASE_HOST`: 数据库主机地址
- `DATABASE_PORT`: 数据库端口
- `DATABASE_USERNAME`: 数据库用户名
- `DATABASE_PASSWORD`: 数据库密码
- `DATABASE_NAME`: 数据库名称
- `DATABASE_SYNCHRONIZE`: 是否自动同步表结构
- `DATABASE_LOGGING`: 是否启用SQL日志

### Redis配置
- `REDIS_HOST`: Redis主机地址
- `REDIS_PORT`: Redis端口
- `REDIS_PASSWORD`: Redis密码
- `REDIS_DB`: Redis数据库编号
- `REDIS_TTL`: 缓存过期时间

### 安全配置
- `SESSION_SECRET`: Session密钥
- `JWT_SECRET`: JWT密钥
- `BCRYPT_ROUNDS`: 密码加密轮数
- `PASSWORD_MIN_LENGTH`: 密码最小长度

### 应用配置
- `PORT`: 应用端口
- `API_PREFIX`: API前缀
- `API_DOCS_ENABLED`: 是否启用API文档
- `CORS_ORIGIN`: 跨域允许的域名

## 环境切换脚本

创建便捷的环境切换脚本：

```bash
#!/bin/bash
# scripts/switch-env.sh

ENV=$1

if [ -z "$ENV" ]; then
    echo "Usage: ./scripts/switch-env.sh [development|testing|production]"
    exit 1
fi

export NODE_ENV=$ENV
echo "Switched to $ENV environment"

# 启动对应的服务
npm run start:dev
```

## 数据库环境隔离

### 开发环境数据库
```sql
CREATE DATABASE wechat_mall_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 测试环境数据库
```sql
CREATE DATABASE wechat_mall_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 生产环境数据库
```sql
CREATE DATABASE wechat_mall_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Redis环境隔离

### 开发环境
- 使用DB 0
- 缓存时间: 1小时
- 最大项目数: 1000

### 测试环境
- 使用DB 1
- 缓存时间: 30分钟
- 最大项目数: 500

### 生产环境
- 使用DB 0
- 缓存时间: 2小时
- 最大项目数: 5000

## 日志配置

### 开发环境
- 级别: debug
- 文件: logs/app.log
- 控制台: 详细输出

### 测试环境
- 级别: info
- 文件: logs/test.log
- 控制台: 标准输出

### 生产环境
- 级别: warn
- 文件: logs/prod.log
- 控制台: 错误输出

## 安全配置

### 开发环境
- 密码最小长度: 6位
- 加密轮数: 10
- 宽松的CORS设置

### 测试环境
- 密码最小长度: 6位
- 加密轮数: 8
- 中等CORS设置

### 生产环境
- 密码最小长度: 8位
- 加密轮数: 12
- 严格的CORS设置

## 监控和备份

### 生产环境特有配置
- `ENABLE_METRICS`: 启用监控指标
- `METRICS_PORT`: 监控端口
- `BACKUP_ENABLED`: 启用自动备份
- `BACKUP_SCHEDULE`: 备份计划
- `BACKUP_RETENTION_DAYS`: 备份保留天数

## 注意事项

1. **敏感信息**: 生产环境的敏感信息不应提交到版本控制
2. **环境隔离**: 确保不同环境使用独立的数据库和Redis
3. **配置验证**: 启动前验证配置文件的正确性
4. **备份策略**: 生产环境必须有完善的备份策略
5. **监控告警**: 生产环境需要配置监控和告警

## 故障排除

### 配置加载失败
```bash
# 检查环境变量
echo $NODE_ENV

# 检查配置文件是否存在
ls -la .env.*

# 检查配置文件语法
cat .env.development
```

### 数据库连接失败
```bash
# 检查数据库服务
mysql -u root -p -e "SHOW DATABASES;"

# 检查数据库权限
mysql -u root -p -e "SHOW GRANTS FOR 'mall_user'@'localhost';"
```

### Redis连接失败
```bash
# 检查Redis服务
redis-cli ping

# 检查Redis配置
redis-cli info server
```

---

✅ **多环境配置已完成，支持开发、测试、生产环境的灵活切换！**
