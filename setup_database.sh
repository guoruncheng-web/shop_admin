#!/bin/bash
# 微信小程序商城数据库设置脚本

echo "=== 微信小程序商城数据库设置 ==="
echo "请确保MySQL服务已启动"
echo ""

# 检查MySQL是否运行
if ! command -v mysql &> /dev/null; then
    echo "错误: MySQL未安装或未添加到PATH"
    exit 1
fi

# 提示用户输入MySQL信息
read -p "请输入MySQL用户名 (默认: root): " MYSQL_USER
MYSQL_USER=${MYSQL_USER:-root}

read -s -p "请输入MySQL密码: " MYSQL_PASSWORD
echo ""

read -p "请输入MySQL主机 (默认: localhost): " MYSQL_HOST
MYSQL_HOST=${MYSQL_HOST:-localhost}

read -p "请输入MySQL端口 (默认: 3306): " MYSQL_PORT
MYSQL_PORT=${MYSQL_PORT:-3306}

echo ""
echo "=== 开始创建数据库 ==="

# 1. 创建数据库
echo "1. 创建数据库..."
mysql -h$MYSQL_HOST -P$MYSQL_PORT -u$MYSQL_USER -p$MYSQL_PASSWORD < database/init.sql
if [ $? -eq 0 ]; then
    echo "✓ 数据库创建成功"
else
    echo "✗ 数据库创建失败"
    exit 1
fi

# 2. 创建表结构
echo "2. 创建表结构..."
mysql -h$MYSQL_HOST -P$MYSQL_PORT -u$MYSQL_USER -p$MYSQL_PASSWORD wechat_mall < database/schema.sql
if [ $? -eq 0 ]; then
    echo "✓ 表结构创建成功"
else
    echo "✗ 表结构创建失败"
    exit 1
fi

# 3. 插入初始数据
echo "3. 插入初始数据..."
mysql -h$MYSQL_HOST -P$MYSQL_PORT -u$MYSQL_USER -p$MYSQL_PASSWORD wechat_mall < database/data.sql
if [ $? -eq 0 ]; then
    echo "✓ 初始数据插入成功"
else
    echo "✗ 初始数据插入失败"
    exit 1
fi

# 4. 创建存储过程和触发器（如果存在）
if [ -f "database/procedures.sql" ]; then
    echo "4. 创建存储过程和触发器..."
    mysql -h$MYSQL_HOST -P$MYSQL_PORT -u$MYSQL_USER -p$MYSQL_PASSWORD wechat_mall < database/procedures.sql
    if [ $? -eq 0 ]; then
        echo "✓ 存储过程和触发器创建成功"
    else
        echo "✗ 存储过程和触发器创建失败"
    fi
fi

echo ""
echo "=== 数据库设置完成 ==="
echo "数据库名: wechat_mall"
echo "字符集: utf8mb4"
echo ""
echo "您可以使用以下命令连接数据库:"
echo "mysql -h$MYSQL_HOST -P$MYSQL_PORT -u$MYSQL_USER -p wechat_mall"
