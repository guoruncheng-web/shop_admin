# 微信小程序商城数据库部署脚本
# 连接到远程MySQL服务器并执行SQL文件

# 数据库连接参数
$MYSQL_HOST = "43.139.80.246"
$MYSQL_PORT = "3306"
$MYSQL_USER = "root"
$MYSQL_PASSWORD = "grc@19980713"  # 请根据实际情况修改密码
$DATABASE_NAME = "wechat_mall"  # 请根据实际情况修改数据库名

# SQL文件执行顺序（根据README.md文档）
$SQL_FILES = @(
    "schema.sql",
    "data.sql", 
    "procedures.sql"
)

Write-Host "开始部署微信小程序商城数据库..." -ForegroundColor Green
Write-Host "目标服务器: ${MYSQL_HOST}:${MYSQL_PORT}" -ForegroundColor Yellow
Write-Host "数据库名称: $DATABASE_NAME" -ForegroundColor Yellow

# 检查MySQL客户端是否可用
try {
    $null = mysql --version 2>$null
    Write-Host "MySQL客户端检查通过" -ForegroundColor Green
}
catch {
    Write-Host "错误: 未找到MySQL客户端，请确保已安装MySQL客户端工具" -ForegroundColor Red
    exit 1
}

# 测试数据库连接
Write-Host "测试数据库连接..." -ForegroundColor Yellow
try {
    $testResult = mysql -h$MYSQL_HOST -P$MYSQL_PORT -u$MYSQL_USER -p$MYSQL_PASSWORD -e "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "数据库连接测试成功" -ForegroundColor Green
    } else {
        throw "连接失败"
    }
}
catch {
    Write-Host "错误: 无法连接到数据库服务器，请检查连接参数" -ForegroundColor Red
    Write-Host "连接信息: ${MYSQL_HOST}:${MYSQL_PORT}, 用户: $MYSQL_USER" -ForegroundColor Red
    exit 1
}

# 创建数据库（如果不存在）
Write-Host "创建数据库 $DATABASE_NAME（如果不存在）..." -ForegroundColor Yellow
$createResult = mysql -h$MYSQL_HOST -P$MYSQL_PORT -u$MYSQL_USER -p$MYSQL_PASSWORD -e "CREATE DATABASE IF NOT EXISTS ``$DATABASE_NAME`` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "创建数据库失败: $createResult" -ForegroundColor Red
    exit 1
}

# 切换到database目录
Set-Location "d:\web\cursor_demo\database"

# 执行SQL文件
foreach ($sqlFile in $SQL_FILES) {
    if (Test-Path $sqlFile) {
        Write-Host "正在执行: $sqlFile" -ForegroundColor Cyan
        
        try {
            # 执行SQL文件
            $executeResult = cmd /c "mysql -h$MYSQL_HOST -P$MYSQL_PORT -u$MYSQL_USER -p$MYSQL_PASSWORD $DATABASE_NAME < $sqlFile 2>&1"
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ $sqlFile 执行成功" -ForegroundColor Green
            } else {
                Write-Host "✗ $sqlFile 执行失败: $executeResult" -ForegroundColor Red
                Write-Host "继续执行下一个文件..." -ForegroundColor Yellow
            }
        }
        catch {
            Write-Host "✗ $sqlFile 执行失败: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "继续执行下一个文件..." -ForegroundColor Yellow
        }
    } else {
        Write-Host "警告: 文件 $sqlFile 不存在" -ForegroundColor Yellow
    }
}

# 验证部署结果
Write-Host "`n验证数据库部署结果..." -ForegroundColor Yellow
try {
    $tables = mysql -h$MYSQL_HOST -P$MYSQL_PORT -u$MYSQL_USER -p$MYSQL_PASSWORD $DATABASE_NAME -e "SHOW TABLES;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "数据库表列表:" -ForegroundColor Green
        Write-Host $tables -ForegroundColor White
    } else {
        Write-Host "验证失败: $tables" -ForegroundColor Red
    }
}
catch {
    Write-Host "验证失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n数据库部署完成！" -ForegroundColor Green
Write-Host "请检查上述输出确认所有SQL文件都已成功执行" -ForegroundColor Yellow

# 返回原目录
Set-Location "d:\web\cursor_demo"