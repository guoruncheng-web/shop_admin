# ========================================
# 多阶段构建 Dockerfile for NestJS Backend
# ========================================

# 阶段1: 构建阶段
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装所有依赖 (包括 devDependencies)
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 清理开发依赖，只保留生产依赖
RUN npm ci --production && npm cache clean --force

# ========================================
# 阶段2: 生产阶段
FROM node:20-alpine AS production

# 安装 dumb-init 用于正确处理信号
RUN apk add --no-cache dumb-init

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# 设置工作目录
WORKDIR /app

# 从构建阶段复制必要文件
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# 创建日志和上传目录
RUN mkdir -p /app/logs /app/uploads && \
    chown -R nestjs:nodejs /app/logs /app/uploads

# 切换到非 root 用户
USER nestjs

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 使用 dumb-init 启动应用
CMD ["dumb-init", "node", "dist/main"]
