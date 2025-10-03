#!/bin/bash

# ========================================
# 服务器初始化脚本
# 用于首次部署时配置服务器环境
# ========================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    log_error "请使用 root 用户或 sudo 执行此脚本"
    exit 1
fi

log_info "========================================="
log_info "开始配置服务器环境"
log_info "========================================="

# 1. 更新系统
log_step "1. 更新系统包..."
apt-get update
apt-get upgrade -y

# 2. 安装基础工具
log_step "2. 安装基础工具..."
apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    vim \
    htop \
    ufw \
    fail2ban

# 3. 安装 Node.js 20
log_step "3. 安装 Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    log_info "Node.js 版本: $(node -v)"
    log_info "npm 版本: $(npm -v)"
else
    log_info "Node.js 已安装，版本: $(node -v)"
fi

# 4. 安装 PM2
log_step "4. 安装 PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    log_info "PM2 版本: $(pm2 -v)"
else
    log_info "PM2 已安装，版本: $(pm2 -v)"
fi

# 5. 安装 MySQL 8.0
log_step "5. 安装 MySQL 8.0..."
if ! command -v mysql &> /dev/null; then
    apt-get install -y mysql-server
    systemctl start mysql
    systemctl enable mysql
    log_info "MySQL 已安装并启动"
    log_warn "⚠️  请运行 'mysql_secure_installation' 来配置 MySQL 安全设置"
else
    log_info "MySQL 已安装"
fi

# 6. 安装 Redis
log_step "6. 安装 Redis..."
if ! command -v redis-cli &> /dev/null; then
    apt-get install -y redis-server
    systemctl start redis-server
    systemctl enable redis-server
    log_info "Redis 已安装并启动"
else
    log_info "Redis 已安装"
fi

# 7. 安装 Nginx
log_step "7. 安装 Nginx..."
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
    systemctl start nginx
    systemctl enable nginx
    log_info "Nginx 已安装并启动"
else
    log_info "Nginx 已安装"
fi

# 8. 配置防火墙
log_step "8. 配置防火墙..."
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw allow 3000/tcp    # Backend API (可选，用于直接访问)
ufw --force enable
log_info "防火墙规则已配置"

# 9. 创建部署用户
log_step "9. 创建部署用户..."
DEPLOY_USER="deploy"
if id "$DEPLOY_USER" &>/dev/null; then
    log_info "用户 $DEPLOY_USER 已存在"
else
    useradd -m -s /bin/bash $DEPLOY_USER
    log_info "用户 $DEPLOY_USER 已创建"
fi

# 10. 创建应用目录
log_step "10. 创建应用目录..."
APP_DIR="/var/www/wechat-mall-backend"
mkdir -p $APP_DIR
chown -R $DEPLOY_USER:$DEPLOY_USER $APP_DIR
log_info "应用目录已创建: $APP_DIR"

# 11. 配置 SSH 密钥
log_step "11. 配置 SSH..."
log_warn "请手动完成以下步骤："
log_warn "  1. 在服务器上生成 SSH 密钥: ssh-keygen -t ed25519 -C 'deploy@server'"
log_warn "  2. 将公钥添加到 GitHub: cat ~/.ssh/id_ed25519.pub"
log_warn "  3. 测试连接: ssh -T git@github.com"

# 12. 配置 PM2 开机自启动
log_step "12. 配置 PM2 开机自启动..."
env PATH=$PATH:/usr/bin pm2 startup systemd -u $DEPLOY_USER --hp /home/$DEPLOY_USER
log_info "PM2 开机自启动已配置"

# 13. 安装 Docker (可选)
log_step "13. 是否安装 Docker? (y/n)"
read -r install_docker
if [ "$install_docker" = "y" ]; then
    curl -fsSL https://get.docker.com | sh
    systemctl start docker
    systemctl enable docker
    usermod -aG docker $DEPLOY_USER

    # 安装 Docker Compose
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
        -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose

    log_info "Docker 和 Docker Compose 已安装"
else
    log_info "跳过 Docker 安装"
fi

log_info "========================================="
log_info "✅ 服务器环境配置完成！"
log_info "========================================="
log_info ""
log_info "已安装的服务:"
log_info "  - Node.js: $(node -v)"
log_info "  - npm: $(npm -v)"
log_info "  - PM2: $(pm2 -v)"
log_info "  - MySQL: $(mysql --version | awk '{print $5}')"
log_info "  - Redis: $(redis-cli --version)"
log_info "  - Nginx: $(nginx -v 2>&1 | awk '{print $3}')"
log_info ""
log_info "下一步操作:"
log_info "  1. 配置 MySQL 数据库和用户"
log_info "  2. 配置 Redis 密码"
log_info "  3. 配置 Nginx 反向代理"
log_info "  4. 在 GitHub 添加 SSH 公钥"
log_info "  5. 配置环境变量文件 .env.production"
log_info "  6. 运行部署脚本: bash scripts/deployment/deploy.sh"
log_info "========================================="
