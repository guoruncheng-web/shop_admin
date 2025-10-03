#!/bin/bash

# ========================================
# SSH 密钥配置指南脚本
# 请按照以下步骤手动执行
# ========================================

cat << 'INSTRUCTIONS'
========================================
SSH 密钥配置指南
========================================

由于需要交互式输入密码，请手动执行以下步骤：

步骤 1: 复制本地公钥到服务器
----------------------------------------
ssh-copy-id root@43.139.80.246

# 输入密码: grc@19980713

步骤 2: 测试 SSH 密钥登录
----------------------------------------
ssh root@43.139.80.246

# 如果不需要输入密码即可登录，说明配置成功！

步骤 3: 在服务器上生成 Git SSH 密钥
----------------------------------------
ssh root@43.139.80.246

# 在服务器上执行:
ssh-keygen -t ed25519 -C "deploy@43.139.80.246"

# 一路按 Enter (使用默认配置)

# 查看公钥:
cat ~/.ssh/id_ed25519.pub

步骤 4: 将服务器公钥添加到 GitHub
----------------------------------------
1. 复制上一步的公钥内容
2. 前往 GitHub 仓库
3. Settings → Deploy keys → Add deploy key
4. Title: Production Server (43.139.80.246)
5. Key: 粘贴公钥
6. ✅ 勾选 "Allow write access"
7. 点击 "Add key"

步骤 5: 测试 GitHub 连接
----------------------------------------
ssh root@43.139.80.246

# 在服务器上测试:
ssh -T git@github.com

# 应该看到类似信息:
# Hi username! You've successfully authenticated, but GitHub does not provide shell access.

步骤 6: 配置 GitHub Secrets
----------------------------------------
前往 GitHub 仓库:
Settings → Secrets and variables → Actions → New repository secret

添加以下 Secrets:

1. SERVER_HOST
   值: 43.139.80.246

2. SERVER_USER
   值: root

3. SERVER_PORT
   值: 22

4. SSH_PRIVATE_KEY
   获取私钥:

   在本地执行:
   cat ~/.ssh/id_rsa

   复制完整内容 (包括 BEGIN 和 END 行)
   粘贴到 GitHub Secret

5. REPO_URL
   值: git@github.com:your-username/cursor_shop.git
   (替换 your-username 为您的 GitHub 用户名)

步骤 7: 验证配置
----------------------------------------
1. 推送代码到 main 分支
2. 前往 GitHub Actions 页面
3. 查看部署工作流是否成功运行

========================================
配置完成！
========================================

如果遇到问题，请查看:
- 本地 SSH 配置: ~/.ssh/config
- 服务器 SSH 日志: /var/log/auth.log
- GitHub Actions 日志: 仓库 Actions 页面

INSTRUCTIONS
