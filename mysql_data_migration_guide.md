# MySQL 数据迁移指南

## 概述

本指南用于将备份的数据文件迁移到新升级的MySQL 8容器中。

## 前提条件

- 远程服务器已成功部署MySQL 8容器
- 拥有数据库备份文件（SQL格式或数据目录备份）
- 具有远程服务器的SSH访问权限

## 数据迁移步骤

### 1. 确认MySQL 8容器状态

```bash
# 检查容器是否正在运行
sudo docker ps | grep mysql

# 查看容器日志确认启动正常
sudo docker logs mysql8

# 测试数据库连接
sudo docker exec -it mysql8 mysql -uroot -p
```

### 2. 准备备份文件

#### 方法一：如果有SQL备份文件

```bash
# 将备份文件上传到服务器
scp backup.sql user@43.139.80.246:/tmp/

# 或者如果备份文件在本地项目中
scp database/wechat_mall_backup_20250817_185648.sql user@43.139.80.246:/tmp/
```

#### 方法二：如果有数据目录备份

```bash
# 压缩数据目录备份
tar -czf mysql_data_backup.tar.gz /path/to/backup/data

# 上传到服务器
scp mysql_data_backup.tar.gz user@43.139.80.246:/tmp/
```

### 3. 数据恢复

#### 方法一：从SQL文件恢复（推荐）

```bash
# 连接到远程服务器
ssh user@43.139.80.246

# 将SQL文件复制到容器中
sudo docker cp /tmp/backup.sql mysql8:/tmp/

# 进入容器执行恢复
sudo docker exec -it mysql8 bash

# 在容器内执行恢复
mysql -uroot -p < /tmp/backup.sql

# 或者指定特定数据库
mysql -uroot -p wechat_mall < /tmp/backup.sql
```

#### 方法二：从外部直接恢复

```bash
# 直接从外部执行恢复
sudo docker exec -i mysql8 mysql -uroot -p < /tmp/backup.sql

# 或者指定数据库
sudo docker exec -i mysql8 mysql -uroot -p wechat_mall < /tmp/backup.sql
```

### 4. 验证数据迁移

```bash
# 进入MySQL容器
sudo docker exec -it mysql8 mysql -uroot -p

# 检查数据库列表
SHOW DATABASES;

# 选择目标数据库
USE wechat_mall;

# 检查表列表
SHOW TABLES;

# 检查表数据
SELECT COUNT(*) FROM your_table_name;

# 检查表结构
DESCRIBE your_table_name;
```

### 5. 权限配置

```bash
# 创建应用用户（如果需要）
CREATE USER 'mall_user'@'%' IDENTIFIED BY 'grc@19980713';
GRANT ALL PRIVILEGES ON wechat_mall.* TO 'mall_user'@'%';
FLUSH PRIVILEGES;

# 或者更新root用户权限
ALTER USER 'root'@'%' IDENTIFIED BY 'grc@19980713';
FLUSH PRIVILEGES;
```

### 6. 外部连接测试

```bash
# 从本地测试连接
mysql -h 43.139.80.246 -P 3306 -uroot -p

# 或者使用应用用户
mysql -h 43.139.80.246 -P 3306 -umall_user -p
```

## 常见问题解决

### 1. 字符集问题

```sql
-- 检查字符集
SHOW VARIABLES LIKE 'character_set%';

-- 如果需要修改表字符集
ALTER TABLE table_name CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 时区问题

```sql
-- 检查时区设置
SELECT @@global.time_zone, @@session.time_zone;

-- 设置时区
SET GLOBAL time_zone = '+8:00';
```

### 3. 大小写敏感问题

```sql
-- 检查大小写设置
SHOW VARIABLES LIKE 'lower_case_table_names';
```

注意：MySQL 8.0中，`lower_case_table_names`只能在初始化时设置。

### 4. 备份验证

```bash
# 创建新的备份验证迁移成功
sudo docker exec mysql8 mysqldump -uroot -p --all-databases > /tmp/post_migration_backup.sql

# 比较备份文件大小
ls -lh /tmp/*backup*.sql
```

## 自动化脚本示例

```bash
#!/bin/bash
# 数据迁移自动化脚本

BACKUP_FILE="/tmp/backup.sql"
CONTAINER_NAME="mysql8"
DB_NAME="wechat_mall"
ROOT_PASSWORD="grc@19980713"

echo "开始数据迁移..."

# 检查容器状态
if ! docker ps | grep -q $CONTAINER_NAME; then
    echo "错误：MySQL容器未运行"
    exit 1
fi

# 复制备份文件到容器
docker cp $BACKUP_FILE $CONTAINER_NAME:/tmp/

# 执行数据恢复
echo "正在恢复数据..."
docker exec -i $CONTAINER_NAME mysql -uroot -p$ROOT_PASSWORD $DB_NAME < $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "数据迁移成功完成！"
else
    echo "数据迁移失败，请检查日志"
    exit 1
fi

# 验证数据
echo "验证数据迁移..."
docker exec $CONTAINER_NAME mysql -uroot -p$ROOT_PASSWORD -e "USE $DB_NAME; SHOW TABLES;"

echo "数据迁移验证完成！"
```

## 注意事项

1. **备份重要性**：在迁移前务必备份现有数据
2. **版本兼容性**：确保备份数据与MySQL 8兼容
3. **权限设置**：正确配置用户权限和网络访问
4. **字符集统一**：建议使用utf8mb4字符集
5. **防火墙配置**：确保3306端口开放
6. **监控日志**：密切关注容器和MySQL日志

## 完成检查清单

- [ ] MySQL 8容器正常运行
- [ ] 备份文件成功上传
- [ ] 数据恢复无错误
- [ ] 表结构和数据完整
- [ ] 用户权限配置正确
- [ ] 外部连接测试成功
- [ ] 应用程序连接正常
- [ ] 创建迁移后备份

迁移完成后，建议进行全面的功能测试以确保数据完整性和应用程序正常运行。