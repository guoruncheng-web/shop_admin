#!/bin/bash

# ========================================
# 应用回滚脚本
# ========================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 配置变量
APP_NAME="wechat-mall-backend"
APP_DIR="/www/wwwroot/shop_admin/bk_admin"
BACKUP_DIR="$APP_DIR/backups"

log_info "========================================="
log_info "应用回滚工具"
log_info "========================================="

# 检查备份目录
if [ ! -d "$BACKUP_DIR" ]; then
    log_error "备份目录不存在: $BACKUP_DIR"
    exit 1
fi

# 列出可用的备份
log_info "可用的备份版本:"
cd $BACKUP_DIR
backups=($(ls -t))

if [ ${#backups[@]} -eq 0 ]; then
    log_error "没有可用的备份"
    exit 1
fi

# 显示备份列表
for i in "${!backups[@]}"; do
    echo "  $((i+1)). ${backups[$i]}"
done

# 选择备份版本
echo ""
read -p "请选择要回滚到的版本 (1-${#backups[@]}): " choice

if ! [[ "$choice" =~ ^[0-9]+$ ]] || [ "$choice" -lt 1 ] || [ "$choice" -gt ${#backups[@]} ]; then
    log_error "无效的选择"
    exit 1
fi

selected_backup="${backups[$((choice-1))]}"
log_info "选择的备份: $selected_backup"

# 确认回滚
read -p "确认要回滚到此版本吗? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    log_info "取消回滚"
    exit 0
fi

# 停止应用
log_info "停止应用..."
pm2 stop $APP_NAME || true

# 创建当前版本的备份
log_info "备份当前版本..."
current_backup="rollback-backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR/$current_backup
cd $APP_DIR/backend
cp -r dist $BACKUP_DIR/$current_backup/
cp -r node_modules $BACKUP_DIR/$current_backup/ || true
cp .env.production $BACKUP_DIR/$current_backup/ || true

# 恢复选定的备份
log_info "恢复备份..."
cd $APP_DIR/backend
rm -rf dist
cp -r $BACKUP_DIR/$selected_backup/dist .

if [ -d "$BACKUP_DIR/$selected_backup/node_modules" ]; then
    rm -rf node_modules
    cp -r $BACKUP_DIR/$selected_backup/node_modules .
fi

if [ -f "$BACKUP_DIR/$selected_backup/.env.production" ]; then
    cp $BACKUP_DIR/$selected_backup/.env.production .
fi

# 重启应用
log_info "重启应用..."
pm2 restart $APP_NAME

# 等待应用启动
sleep 5

# 健康检查
log_info "执行健康检查..."
if curl -f http://localhost:3000/api > /dev/null 2>&1; then
    log_info "✅ 回滚成功！应用正常运行"
else
    log_error "⚠️  健康检查失败，请检查日志"
    pm2 logs $APP_NAME --lines 50 --nostream
fi

log_info "========================================="
log_info "✅ 回滚完成"
log_info "========================================="
log_info "回滚版本: $selected_backup"
log_info "当前版本已备份至: $current_backup"
log_info "========================================="
