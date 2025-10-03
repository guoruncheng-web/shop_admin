#!/bin/bash

# ========================================
# 服务器配置命令（在服务器上执行）
# 请复制以下命令到服务器终端逐步执行
# ========================================

echo "========================================="
echo "步骤 1: 检查当前环境"
echo "========================================="

# 检查 Node.js
echo "检查 Node.js 版本..."
node -v 2>/dev/null || echo "❌ Node.js 未安装"

# 检查 npm
echo "检查 npm 版本..."
npm -v 2>/dev/null || echo "❌ npm 未安装"

# 检查 PM2
echo "检查 PM2 版本..."
pm2 -v 2>/dev/null || echo "❌ PM2 未安装"

# 检查 Git
echo "检查 Git 版本..."
git --version 2>/dev/null || echo "❌ Git 未安装"

echo ""
echo "========================================="
echo "步骤 2: 安装 Node.js 20"
echo "========================================="

# 更新系统
echo "更新系统包..."
apt-get update

# 添加 NodeSource 仓库
echo "添加 NodeSource 仓库..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# 安装 Node.js
echo "安装 Node.js..."
apt-get install -y nodejs

# 验证安装
echo "Node.js 版本: $(node -v)"
echo "npm 版本: $(npm -v)"

echo ""
echo "========================================="
echo "步骤 3: 安装 PM2"
echo "========================================="

npm install -g pm2

# 验证安装
echo "PM2 版本: $(pm2 -v)"

echo ""
echo "========================================="
echo "步骤 4: 安装 Git (如果未安装)"
echo "========================================="

apt-get install -y git

# 验证安装
echo "Git 版本: $(git --version)"

echo ""
echo "========================================="
echo "步骤 5: 配置 Git"
echo "========================================="

# 配置 Git 全局用户信息
git config --global user.name "Deploy Bot"
git config --global user.email "deploy@43.139.80.246"

# 添加 GitHub 到 known_hosts
echo "添加 GitHub 到 known_hosts..."
ssh-keyscan github.com >> ~/.ssh/known_hosts

echo ""
echo "========================================="
echo "步骤 6: 测试 GitHub SSH 连接"
echo "========================================="

echo "测试 GitHub 连接..."
ssh -T git@github.com 2>&1 | grep -q "successfully authenticated" && echo "✅ GitHub SSH 连接成功" || echo "⚠️ GitHub SSH 连接失败，需要先在 GitHub 添加 Deploy Key"

echo ""
echo "========================================="
echo "步骤 7: 显示服务器 SSH 公钥"
echo "========================================="

echo "服务器 SSH 公钥 (请添加到 GitHub Deploy Keys):"
echo "========================================="
cat ~/.ssh/id_ed25519.pub
echo "========================================="

echo ""
echo "✅ 环境检查和基础软件安装完成！"
echo ""
echo "下一步操作："
echo "1. 将上面的 SSH 公钥添加到 GitHub Deploy Keys"
echo "2. 在 GitHub 仓库 Settings → Deploy keys → Add deploy key"
echo "3. 确认 GitHub 连接成功后，继续执行后续命令"
