# Redis 配置说明

## Redis 服务状态

✅ **Redis 已成功安装并运行**

- **版本**: Redis 8.2.0
- **状态**: 服务已启动
- **端口**: 6379 (默认)
- **连接测试**: ✅ 正常

## 服务管理命令

### 启动 Redis 服务
```bash
brew services start redis
```

### 停止 Redis 服务
```bash
brew services stop redis
```

### 重启 Redis 服务
```bash
brew services restart redis
```

### 查看服务状态
```bash
brew services list | grep redis
```

## 连接测试

### 基本连接测试
```bash
redis-cli ping
# 预期输出: PONG
```

### 查看 Redis 信息
```bash
redis-cli info server
```

### 测试基本操作
```bash
# 设置键值
redis-cli set test:key "Hello Redis"

# 获取值
redis-cli get test:key

# 删除键
redis-cli del test:key
```

## 后端项目集成

### 配置信息
- **主机**: localhost
- **端口**: 6379
- **密码**: (无)
- **数据库**: 0 (默认)

### 环境变量配置
在 `.env` 文件中配置：
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### 缓存功能
Redis 在后端项目中的用途：

1. **Session 存储**
   - 管理员登录会话
   - 用户认证状态

2. **数据缓存**
   - 商品列表缓存
   - 分类数据缓存
   - Banner 数据缓存

3. **计数器**
   - 商品浏览量
   - Banner 点击量
   - 用户访问统计

4. **限流控制**
   - API 访问频率限制
   - 登录失败次数限制

## 监控和维护

### 查看内存使用
```bash
redis-cli info memory
```

### 查看连接数
```bash
redis-cli info clients
```

### 查看键数量
```bash
redis-cli dbsize
```

### 清空数据库
```bash
redis-cli flushdb
```

## 性能优化建议

1. **内存配置**
   - 根据实际需求调整 maxmemory
   - 配置合适的淘汰策略

2. **持久化配置**
   - 启用 RDB 快照
   - 配置 AOF 日志

3. **网络配置**
   - 调整 tcp-keepalive
   - 配置连接池大小

## 故障排除

### 常见问题

1. **连接被拒绝**
   ```bash
   # 检查服务状态
   brew services list | grep redis
   
   # 重启服务
   brew services restart redis
   ```

2. **内存不足**
   ```bash
   # 查看内存使用
   redis-cli info memory
   
   # 清理过期键
   redis-cli flushdb
   ```

3. **性能问题**
   ```bash
   # 查看慢查询
   redis-cli slowlog get 10
   
   # 查看命令统计
   redis-cli info commandstats
   ```

## 安全建议

1. **设置密码**
   ```bash
   # 在 redis.conf 中设置
   requirepass your_password
   ```

2. **绑定地址**
   ```bash
   # 只允许本地连接
   bind 127.0.0.1
   ```

3. **禁用危险命令**
   ```bash
   # 在 redis.conf 中禁用
   rename-command FLUSHDB ""
   rename-command FLUSHALL ""
   ```

## 备份和恢复

### 创建备份
```bash
# 创建 RDB 备份
redis-cli bgsave

# 手动创建快照
redis-cli save
```

### 恢复数据
```bash
# 停止 Redis
brew services stop redis

# 复制备份文件到数据目录
cp dump.rdb /usr/local/var/db/redis/

# 启动 Redis
brew services start redis
```

---

✅ **Redis 配置完成，后端项目已成功集成 Redis 缓存功能！**
