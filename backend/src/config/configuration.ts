export default () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  return {
    // 应用配置
    app: {
      nodeEnv,
      port: parseInt(process.env.PORT || '3000', 10),
      apiPrefix: process.env.API_PREFIX || 'api/v1',
      apiDocsEnabled: process.env.API_DOCS_ENABLED === 'true',
    },

    // 数据库配置
    database: {
      host: process.env.DATABASE_HOST || process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || process.env.DB_PORT || '3306', 10),
      username: process.env.DATABASE_USERNAME || process.env.DB_USERNAME || 'root',
      password: process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD || 'root123',
      database: process.env.DATABASE_NAME || process.env.DB_DATABASE || 'wechat_mall_dev',
      charset: process.env.DATABASE_CHARSET || process.env.DB_CHARSET || 'utf8mb4',
      synchronize: process.env.DATABASE_SYNCHRONIZE === 'true' || nodeEnv === 'development',
      logging: process.env.DATABASE_LOGGING === 'true' || nodeEnv === 'development',
    },

    // Redis配置
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || '',
      db: parseInt(process.env.REDIS_DB || '0', 10),
      ttl: parseInt(process.env.REDIS_TTL || '3600', 10),
    },

    // Session配置
    session: {
      secret: process.env.SESSION_SECRET || 'dev_session_secret_2024',
      maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000', 10),
    },

    // JWT配置
    jwt: {
      secret: process.env.JWT_SECRET || 'dev_jwt_secret_key_2024',
      expiresIn: process.env.JWT_EXPIRES_IN || '10s',
    },

    // 跨域配置
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:8080', 'http://localhost:3000'],
    },

    // 日志配置
    logging: {
      level: process.env.LOG_LEVEL || 'debug',
      fileEnabled: process.env.LOG_FILE_ENABLED === 'true',
      filePath: process.env.LOG_FILE_PATH || 'logs/app.log',
    },

    // 验证码配置
    captcha: {
      length: parseInt(process.env.CAPTCHA_LENGTH || '4', 10),
      expires: parseInt(process.env.CAPTCHA_EXPIRES || '300', 10),
    },

    // 文件上传配置
    upload: {
      maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '5242880', 10),
      dest: process.env.UPLOAD_DEST || 'uploads',
    },

    // 邮件配置
    mail: {
      host: process.env.MAIL_HOST || 'smtp.qq.com',
      port: parseInt(process.env.MAIL_PORT || '587', 10),
      secure: process.env.MAIL_SECURE === 'true',
      user: process.env.MAIL_USER || 'test@example.com',
      pass: process.env.MAIL_PASS || 'test_password',
    },

    // 微信小程序配置
    wechat: {
      appId: process.env.WECHAT_APPID || 'your_dev_appid',
      secret: process.env.WECHAT_SECRET || 'your_dev_secret',
    },

    // 支付配置
    payment: {
      merchantId: process.env.PAYMENT_MERCHANT_ID || 'test_merchant',
      key: process.env.PAYMENT_KEY || 'test_key',
      notifyUrl: process.env.PAYMENT_NOTIFY_URL || 'http://localhost:3000/api/v1/payment/notify',
    },

    // 缓存配置
    cache: {
      ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
      maxItems: parseInt(process.env.CACHE_MAX_ITEMS || '1000', 10),
    },

    // 限流配置
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
      max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    },

    // 安全配置
    security: {
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
      passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '6', 10),
    },

    // 监控配置 (仅生产环境)
    metrics: {
      enabled: process.env.ENABLE_METRICS === 'true',
      port: parseInt(process.env.METRICS_PORT || '9090', 10),
    },

    // 备份配置 (仅生产环境)
    backup: {
      enabled: process.env.BACKUP_ENABLED === 'true',
      schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *',
      retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30', 10),
    },
  };
};
