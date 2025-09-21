import { registerAs } from '@nestjs/config';

export default registerAs('tencent', () => ({
  // 腾讯云API密钥
  secretId: process.env.TENCENT_SECRET_ID || '',
  secretKey: process.env.TENCENT_SECRET_KEY || '',
  
  // 腾讯云COS配置
  cos: {
    bucket: process.env.TENCENT_COS_BUCKET || '',
    region: process.env.TENCENT_COS_REGION || 'ap-beijing',
    // 是否使用HTTPS
    protocol: process.env.TENCENT_COS_PROTOCOL || 'https',
    // 自定义域名（可选）
    domain: process.env.TENCENT_COS_DOMAIN || '',
  },
  
  // 腾讯云SMS配置（短信服务，可选）
  sms: {
    appId: process.env.TENCENT_SMS_APP_ID || '',
    signName: process.env.TENCENT_SMS_SIGN_NAME || '',
  },
  
  // 腾讯云VOD配置（视频点播，可选）
  vod: {
    subAppId: process.env.TENCENT_VOD_SUB_APP_ID || '',
  },
}));