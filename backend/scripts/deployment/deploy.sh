#!/bin/bash

# ========================================
# 后端应用部署脚本
# ========================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量
APP_NAME="wechat-mall-backend"
APP_DIR="/www/wwwroot/shop_admin/bk_admin"
REPO_URL="${REPO_URL:-git@github.com:guoruncheng/shop_admin.git}"
BRANCH="${BRANCH:-main}"
NODE_ENV="${NODE_ENV:-production}"

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 未安装，请先安装 $1"
        exit 1
    fi
}

# 检查必要的命令
log_info "检查系统依赖..."
check_command git
check_command node
check_command npm
check_command pm2

# 检查 Node.js 版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    log_error "Node.js 版本过低，需要 18 或更高版本"
    exit 1
fi
log_info "Node.js 版本: $(node -v)"

# 创建应用目录
log_info "创建应用目录..."
mkdir -p $APP_DIR
cd $APP_DIR

# 拉取代码
if [ -d ".git" ]; then
    log_info "拉取最新代码..."
    git fetch origin
    git reset --hard origin/$BRANCH
    git pull origin $BRANCH
else
    log_info "克隆仓库..."
    git clone -b $BRANCH $REPO_URL .
fi

# 进入 backend 目录
cd backend

# 备份当前环境变量文件
if [ -f ".env.production" ]; then
    log_info "备份环境变量文件..."
    cp .env.production .env.production.backup.$(date +%Y%m%d_%H%M%S)
fi

# 安装依赖
log_info "安装依赖..."
npm ci --production=false

# 构建应用
log_info "构建应用..."
npm run build

# 检查构建结果
if [ ! -d "dist" ]; then
    log_error "构建失败，dist 目录不存在"
    exit 1
fi

# 检查环境变量文件
if [ ! -f ".env.production" ]; then
    log_warn "生产环境配置文件不存在，请创建 .env.production 文件"
    log_info "复制示例配置文件..."
    cp .env.example .env.production
    log_warn "⚠️  请编辑 .env.production 并填写正确的配置信息！"
    exit 1
fi

# 运行数据库迁移 (可选)
# log_info "运行数据库迁移..."
# npm run migration:run

# 使用 PM2 管理进程
log_info "启动/重启应用..."
if pm2 describe $APP_NAME > /dev/null 2>&1; then
    log_info "应用已存在，执行重载..."
    pm2 reload ecosystem.config.js --env production
else
    log_info "首次启动应用..."
    pm2 start ecosystem.config.js --env production
fi

# 保存 PM2 进程列表
log_info "保存 PM2 进程列表..."
pm2 save

# 设置 PM2 开机自启动
log_info "设置 PM2 开机自启动..."
pm2 startup | grep "sudo" | bash || true

# 等待应用启动
log_info "等待应用启动..."
sleep 5

# 检查应用状态
log_info "检查应用状态..."
pm2 status

# 显示最近的日志
log_info "显示最近的日志..."
pm2 logs $APP_NAME --lines 20 --nostream

# 健康检查
log_info "执行健康检查..."
sleep 3
if curl -f http://localhost:3000/api > /dev/null 2>&1; then
    log_info "✅ 健康检查通过！"
else
    log_warn "⚠️  健康检查失败，请检查应用日志"
    pm2 logs $APP_NAME --lines 50 --nostream
fi

log_info "========================================="
log_info "✅ 部署完成！"
log_info "========================================="
log_info "应用名称: $APP_NAME"
log_info "环境: $NODE_ENV"
log_info "分支: $BRANCH"
log_info "目录: $APP_DIR/backend"
log_info ""
log_info "常用命令:"
log_info "  查看状态: pm2 status"
log_info "  查看日志: pm2 logs $APP_NAME"
log_info "  重启应用: pm2 restart $APP_NAME"
log_info "  停止应用: pm2 stop $APP_NAME"
log_info "========================================="
