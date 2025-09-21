import { baseRequestClient, requestClient } from '#/api/request';

// API 响应包装类型
interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg: string;
}

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
    captcha?: string;
    captchaId?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }

  /** 验证码响应 */
  export interface CaptchaResult {
    captchaId: string;
    captchaImage: string;
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  const response = await requestClient.post<ApiResponse<AuthApi.LoginResult>>('/auth/login', data);
  
  // 现在拦截器返回完整的响应格式: { code: 200, data: { accessToken: "..." }, msg: "登录成功" }
  if (response && response.code === 200 && response.data) {
    return response.data;
  }
  
  throw new Error(response?.msg || '登录失败');
}

/**
 * 获取验证码
 */
export async function getCaptchaApi() {
  console.log('🚀 开始调用验证码API...');
  
  const response = await requestClient.get<ApiResponse<AuthApi.CaptchaResult>>('/auth/captcha');
  
  console.log('🔍 验证码API原始响应:', response);
  console.log('🔍 响应类型:', typeof response);
  console.log('🔍 响应是否有code字段:', 'code' in (response || {}));
  console.log('🔍 响应是否有data字段:', 'data' in (response || {}));
  
  // 现在拦截器返回完整的响应格式: { code: 200, data: { captchaId: "...", captchaImage: "..." }, msg: "成功" }
  if (response && response.code === 200 && response.data) {
    console.log('✅ 验证码数据解析成功:', response.data);
    return response.data;
  }
  
  console.error('❌ 验证码响应格式异常:', response);
  throw new Error(response?.msg || '获取验证码失败');
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>('/auth/refresh', {
    withCredentials: true,
  });
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return baseRequestClient.post('/auth/logout', {
    withCredentials: true,
  });
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  const response = await requestClient.get<ApiResponse<string[]>>('/auth/codes');
  
  // 现在拦截器返回完整的响应格式: { code: 200, data: [...权限码数组], msg: "成功" }
  if (response && response.code === 200 && response.data) {
    return response.data;
  }
  
  return [];
}
