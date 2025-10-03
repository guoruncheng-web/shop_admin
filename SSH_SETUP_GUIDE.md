# SSH 密钥配置指南

本指南将帮助您完成 SSH 密钥认证配置，实现免密登录和 GitHub Actions 自动部署。

## 配置流程图

```
本地 SSH 密钥 → 服务器 authorized_keys → 免密登录 ✓
                                                ↓
服务器生成 SSH 密钥 → GitHub Deploy Keys → Git 免密克隆 ✓
                                                ↓
本地私钥 → GitHub Secrets → GitHub Actions 自动部署 ✓
```

---

## 第一步: 复制本地公钥到服务器

在**本地终端**执行：

```bash
ssh-copy-id root@43.139.80.246
```

提示输入密码时输入: `grc@19980713`

**预期输出**:
```
Number of key(s) added: 1

Now try logging into the machine, with:   "ssh 'root@43.139.80.246'"
and check to make sure that only the key(s) you wanted were added.
```

---

## 第二步: 测试免密登录

```bash
ssh root@43.139.80.246
```

✅ **如果不需要密码即可登录，说明配置成功！**

继续下一步前，**保持 SSH 连接**。

---

## 第三步: 在服务器上生成 Git SSH 密钥

在**服务器终端** (保持 SSH 连接) 执行：

```bash
# 生成 SSH 密钥
ssh-keygen -t ed25519 -C "deploy@43.139.80.246"

# 一路按 Enter (使用默认配置，不设置密码短语)
```

**预期输出**:
```
Generating public/private ed25519 key pair.
Enter file in which to save the key (/root/.ssh/id_ed25519): [按 Enter]
Enter passphrase (empty for no passphrase): [按 Enter]
Enter same passphrase again: [按 Enter]
Your identification has been saved in /root/.ssh/id_ed25519
Your public key has been saved in /root/.ssh/id_ed25519.pub
```

**查看公钥**:
```bash
cat ~/.ssh/id_ed25519.pub
```

**复制输出的完整内容** (类似这样):
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx deploy@43.139.80.246
```

---

## 第四步: 将服务器公钥添加到 GitHub

### 4.1 添加 Deploy Key

1. 前往您的 GitHub 仓库
2. 点击 **Settings** (设置)
3. 左侧菜单点击 **Deploy keys**
4. 点击 **Add deploy key** 按钮
5. 填写表单:
   - **Title**: `Production Server (43.139.80.246)`
   - **Key**: 粘贴上一步复制的公钥
   - ✅ **勾选** "Allow write access"
6. 点击 **Add key** 按钮

### 4.2 测试 GitHub 连接

在**服务器终端**执行:

```bash
ssh -T git@github.com
```

首次连接会提示:
```
The authenticity of host 'github.com (xxx.xxx.xxx.xxx)' can't be established.
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

输入 `yes` 并按 Enter。

**预期成功输出**:
```
Hi your-username! You've successfully authenticated, but GitHub does not provide shell access.
```

✅ **看到这条消息说明配置成功！**

---

## 第五步: 配置 GitHub Secrets

### 5.1 获取本地 SSH 私钥

在**本地终端**执行:

```bash
cat ~/.ssh/id_rsa
```

**复制完整输出** (包括开头和结尾的标记):
```
-----BEGIN OPENSSH PRIVATE KEY-----
...完整的私钥内容...
-----END OPENSSH PRIVATE KEY-----
```

### 5.2 在 GitHub 添加 Secrets

1. 前往您的 GitHub 仓库
2. 点击 **Settings** (设置)
3. 左侧菜单展开 **Secrets and variables** → 点击 **Actions**
4. 点击 **New repository secret** 按钮

依次添加以下 Secrets:

#### Secret 1: SERVER_HOST
- **Name**: `SERVER_HOST`
- **Value**: `43.139.80.246`
- 点击 **Add secret**

#### Secret 2: SERVER_USER
- **Name**: `SERVER_USER`
- **Value**: `root`
- 点击 **Add secret**

#### Secret 3: SERVER_PORT
- **Name**: `SERVER_PORT`
- **Value**: `22`
- 点击 **Add secret**

#### Secret 4: SSH_PRIVATE_KEY
- **Name**: `SSH_PRIVATE_KEY`
- **Value**: 粘贴上面复制的完整私钥内容
- ⚠️ 确保包含 `-----BEGIN` 和 `-----END` 行
- 点击 **Add secret**

#### Secret 5: REPO_URL
- **Name**: `REPO_URL`
- **Value**: `git@github.com:your-username/cursor_shop.git`
- ⚠️ 将 `your-username` 替换为您的实际 GitHub 用户名
- 点击 **Add secret**

### 5.3 验证 Secrets

确保已添加所有 5 个 Secrets:
- ✅ SERVER_HOST
- ✅ SERVER_USER
- ✅ SERVER_PORT
- ✅ SSH_PRIVATE_KEY
- ✅ REPO_URL

---

## 第六步: 准备服务器环境

### 6.1 创建部署目录

在**服务器终端**执行:

```bash
# 创建部署目录
mkdir -p /www/wwwroot/shop_admin/bk_admin

# 进入目录
cd /www/wwwroot/shop_admin/bk_admin

# 克隆仓库 (替换 your-username)
git clone git@github.com:your-username/cursor_shop.git .
```

### 6.2 检查 Node.js 和 PM2

```bash
# 检查 Node.js 版本
node -v

# 如果版本低于 18，需要升级:
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 安装 PM2
npm install -g pm2

# 验证安装
node -v   # 应该是 v20.x.x
pm2 -v
```

### 6.3 配置环境变量

```bash
cd /www/wwwroot/shop_admin/bk_admin/backend

# 创建生产环境配置
nano .env.production
```

粘贴以下内容:

```bash
# 应用配置
NODE_ENV=production
PORT=3000
API_PREFIX=/api
API_DOCS_ENABLED=false

# 数据库配置
DATABASE_HOST=43.139.80.246
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=grc@19980713
DATABASE_NAME=wechat_mall
DATABASE_CHARSET=utf8mb4
DATABASE_SYNCHRONIZE=false
DATABASE_LOGGING=false

# Redis配置
REDIS_HOST=43.139.80.246
REDIS_PORT=6379
REDIS_PASSWORD=grc@19980713
REDIS_DB=0
REDIS_TTL=3600

# Session配置 (⚠️ 修改为随机字符串)
SESSION_SECRET=your-super-secret-session-key-please-change-this
SESSION_MAX_AGE=86400000

# JWT配置 (⚠️ 修改为随机字符串)
JWT_SECRET=your-super-secret-jwt-key-please-change-this
JWT_EXPIRES_IN=7d

# 跨域配置
CORS_ORIGIN=http://localhost:8080,http://43.139.80.246:8080

# 安全配置
BCRYPT_ROUNDS=12
PASSWORD_MIN_LENGTH=8

# 日志配置
LOG_LEVEL=info
LOG_FILE_ENABLED=true
LOG_FILE_PATH=logs/production.log

# 文件上传配置
UPLOAD_MAX_SIZE=10485760
UPLOAD_DEST=uploads/production
```

保存: `Ctrl+X` → `Y` → `Enter`

**⚠️ 生成随机密钥**:
```bash
# 生成两个随机字符串
openssl rand -base64 32
openssl rand -base64 32

# 将输出的字符串分别替换 SESSION_SECRET 和 JWT_SECRET
nano .env.production
```

### 6.4 首次手动部署

```bash
cd /www/wwwroot/shop_admin/bk_admin/backend

# 安装依赖
npm ci

# 构建应用
npm run build

# 启动应用
pm2 start ecosystem.config.js --env production

# 保存 PM2 进程列表
pm2 save

# 设置开机自启
pm2 startup

# 查看状态
pm2 status
pm2 logs wechat-mall-backend --lines 50
```

### 6.5 测试应用

在**本地终端**执行:

```bash
curl http://43.139.80.246:3000/api
```

✅ **看到 JSON 响应说明应用运行成功！**

---

## 第七步: 测试自动部署

### 7.1 触发自动部署

在**本地终端**执行:

```bash
cd /Users/mac/test/cursor1/cursor_shop

# 创建一个测试提交
echo "# Test deployment" >> backend/README.md
git add .
git commit -m "test: trigger auto deployment"
git push origin main
```

### 7.2 查看部署进度

1. 前往 GitHub 仓库
2. 点击 **Actions** 标签
3. 查看 "Deploy Backend to Production" 工作流
4. 点击最新的运行记录
5. 查看执行日志

✅ **所有步骤都显示绿色勾号说明部署成功！**

---

## 常见问题排查

### 问题 1: ssh-copy-id 失败

```bash
# 手动添加公钥
ssh root@43.139.80.246 "mkdir -p ~/.ssh && chmod 700 ~/.ssh"
cat ~/.ssh/id_rsa.pub | ssh root@43.139.80.246 "cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

### 问题 2: GitHub 连接失败

```bash
# 在服务器上检查 SSH 配置
ssh -vT git@github.com

# 如果提示 Permission denied，重新生成密钥
rm -f ~/.ssh/id_ed25519*
ssh-keygen -t ed25519 -C "deploy@43.139.80.246"
```

### 问题 3: GitHub Actions 部署失败

检查 GitHub Secrets:
- ✅ SSH_PRIVATE_KEY 是否包含完整内容
- ✅ REPO_URL 是否正确 (使用 git@github.com 格式)
- ✅ SERVER_HOST 是否正确

### 问题 4: PM2 应用无法启动

```bash
# 查看详细日志
pm2 logs wechat-mall-backend --lines 100

# 检查环境变量
cat /www/wwwroot/shop_admin/bk_admin/backend/.env.production

# 手动测试启动
cd /www/wwwroot/shop_admin/bk_admin/backend
npm run start:prod
```

---

## 配置完成检查清单

- [ ] 本地可以免密 SSH 登录服务器
- [ ] 服务器可以免密访问 GitHub
- [ ] GitHub Secrets 已全部配置 (5 个)
- [ ] .env.production 已创建并配置
- [ ] PM2 应用成功运行
- [ ] 可以访问 http://43.139.80.246:3000/api
- [ ] GitHub Actions 自动部署测试成功

全部勾选后，配置完成！🎉

---

## 安全提示

配置完成后，建议执行以下安全加固:

```bash
# 1. 修改服务器密码
ssh root@43.139.80.246
passwd

# 2. 禁用密码登录 (仅允许密钥登录)
nano /etc/ssh/sshd_config
# 修改: PasswordAuthentication no
systemctl restart sshd

# 3. 配置防火墙
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 3000
ufw enable

# 4. 定期备份数据库
crontab -e
# 添加: 0 2 * * * mysqldump -h 43.139.80.246 -u root -pgrc@19980713 wechat_mall > /backups/db_$(date +\%Y\%m\%d).sql
```

---

## 更多帮助

- 详细部署文档: [DEPLOYMENT.md](backend/DEPLOYMENT.md)
- 快速部署指南: [QUICK_DEPLOY.md](backend/QUICK_DEPLOY.md)
- PM2 文档: https://pm2.keymetrics.io/
- GitHub Actions 文档: https://docs.github.com/actions
