/**
 * PM2 生产环境配置文件
 * 用于进程管理和自动重启
 */

module.exports = {
  apps: [
    {
      name: 'wechat-mall-backend',
      script: './dist/src/main.js',
      instances: 'max', // 使用所有可用 CPU 核心
      exec_mode: 'cluster', // 集群模式
      autorestart: true, // 自动重启
      watch: false, // 生产环境不建议开启 watch
      max_memory_restart: '1G', // 内存超过 1G 自动重启

      // 环境变量
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      // 日志配置
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // 进程管理
      min_uptime: '10s', // 最小运行时间
      max_restarts: 10, // 最大重启次数
      restart_delay: 4000, // 重启延迟

      // 性能监控
      source_map_support: true,
      instance_var: 'INSTANCE_ID',

      // 优雅退出
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],

  // 部署配置
  deploy: {
    production: {
      user: 'root', // 服务器用户名
      host: '43.139.80.246', // 服务器地址
      ref: 'origin/main', // Git 分支
      repo: 'git@github.com:guoruncheng/shop_admin.git', // Git 仓库地址
      path: '/www/wwwroot/shop_admin/bk_admin', // 部署路径
      'post-deploy':
        'cd backend && npm ci && npm run build && pm2 reload ecosystem.config.js --env production',
      env: {
        NODE_ENV: 'production',
      },
    },
  },
};
