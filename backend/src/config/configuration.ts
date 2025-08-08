export default () => ({
  // 应用配置
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
    apiPrefix: process.env.API_PREFIX || '/api/v1',
    apiDocsEnabled: process.env.API_DOCS_ENABLED !== 'false',
  },

  // 数据库配置
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root123',
    database: process.env.DB_DATABASE || 'wechat_mall_dev',
    charset: process.env.DB_CHARSET || 'utf8mb4',
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
  },

  // Redis配置
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB, 10) || 0,
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_jwt_secret_key_2024',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // Session配置
  session: {
    secret: process.env.SESSION_SECRET || 'dev_session_secret_2024',
    maxAge: parseInt(process.env.SESSION_MAX_AGE, 10) || 86400000,
  },

  // 跨域配置
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:8080'],
  },

  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
  },

  // 验证码配置
  captcha: {
    length: parseInt(process.env.CAPTCHA_LENGTH, 10) || 4,
    expires: parseInt(process.env.CAPTCHA_EXPIRES, 10) || 300,
  },
});
