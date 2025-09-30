// 全局类型声明文件

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.scss' {
  const content: string;
  export default content;
}

declare module '*.sass' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const content: string;
  export default content;
}

// 扩展 Window 对象
declare global {
  interface Window {
    // 微信相关
    wx?: unknown;
    WeixinJSBridge?: unknown;
    
    // QQ相关
    QC?: unknown;
    
    // 支付宝相关
    AlipayJSBridge?: unknown;
    
    // 其他第三方SDK
    [key: string]: unknown;
  }
}

// 设备信息类型
export interface DeviceInfo {
  isIOS: boolean;
  isAndroid: boolean;
  isWeChat: boolean;
  isMobile: boolean;
  userAgent: string;
}

// 用户信息类型
export interface UserInfo {
  id: string;
  phone: string;
  nickname?: string;
  avatar?: string;
  loginType: 'sms' | 'password' | 'wechat' | 'qq' | 'alipay';
}

// API 响应类型
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

export {};