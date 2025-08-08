@echo off
chcp 65001 >nul
echo === 微信小程序商城数据库设置 ===
echo 请确保MySQL服务已启动
echo.

REM 检查MySQL是否可用
mysql --version >nul 2>&1
if errorlevel 1 (
    echo 错误: MySQL未安装或未添加到PATH
    pause
    exit /b 1
)

REM 提示用户输入MySQL信息
set /p MYSQL_USER="请输入MySQL用户名 (默认: root): "
if "%MYSQL_USER%"=="" set MYSQL_USER=root

set /p MYSQL_PASSWORD="请输入MySQL密码: "

set /p MYSQL_HOST="请输入MySQL主机 (默认: localhost): "
if "%MYSQL_HOST%"=="" set MYSQL_HOST=localhost

set /p MYSQL_PORT="请输入MySQL端口 (默认: 3306): "
if "%MYSQL_PORT%"=="" set MYSQL_PORT=3306

echo.
echo === 开始创建数据库 ===

REM 1. 创建数据库
echo 1. 创建数据库...
mysql -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% -p%MYSQL_PASSWORD% < database\init.sql
if errorlevel 1 (
    echo ✗ 数据库创建失败
    pause
    exit /b 1
) else (
    echo ✓ 数据库创建成功
)

REM 2. 创建表结构
echo 2. 创建表结构...
mysql -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% -p%MYSQL_PASSWORD% wechat_mall < database\schema.sql
if errorlevel 1 (
    echo ✗ 表结构创建失败
    pause
    exit /b 1
) else (
    echo ✓ 表结构创建成功
)

REM 3. 插入初始数据
echo 3. 插入初始数据...
mysql -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% -p%MYSQL_PASSWORD% wechat_mall < database\data.sql
if errorlevel 1 (
    echo ✗ 初始数据插入失败
    pause
    exit /b 1
) else (
    echo ✓ 初始数据插入成功
)

REM 4. 创建存储过程和触发器（如果存在）
if exist "database\procedures.sql" (
    echo 4. 创建存储过程和触发器...
    mysql -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% -p%MYSQL_PASSWORD% wechat_mall < database\procedures.sql
    if errorlevel 1 (
        echo ✗ 存储过程和触发器创建失败
    ) else (
        echo ✓ 存储过程和触发器创建成功
    )
)

echo.
echo === 数据库设置完成 ===
echo 数据库名: wechat_mall
echo 字符集: utf8mb4
echo.
echo 您可以使用以下命令连接数据库:
echo mysql -h%MYSQL_HOST% -P%MYSQL_PORT% -u%MYSQL_USER% -p wechat_mall
echo.
pause
