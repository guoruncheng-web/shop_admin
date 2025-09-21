/**
 * 测试拦截器响应格式
 * 用于验证拦截器是否正确返回 {code, data, msg} 格式
 */
import { requestClient } from '#/api/request';

// API 响应包装类型
interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg: string;
}

/**
 * 测试拦截器响应格式
 */
export async function testInterceptorResponse() {
  try {
    console.log('🧪 开始测试拦截器响应格式...');
    
    // 测试获取验证码接口
    const response = await requestClient.get<ApiResponse<any>>('/auth/captcha');
    
    console.log('📋 拦截器处理后的响应:', response);
    console.log('📋 响应类型:', typeof response);
    console.log('📋 是否包含 code 字段:', 'code' in (response || {}));
    console.log('📋 是否包含 data 字段:', 'data' in (response || {}));
    console.log('📋 是否包含 msg 字段:', 'msg' in (response || {}));
    
    if (response && typeof response === 'object') {
      console.log('✅ 拦截器正确返回了完整的响应格式');
      console.log('📊 响应结构:', {
        code: response.code,
        dataType: typeof response.data,
        msg: response.msg
      });
      return true;
    } else {
      console.error('❌ 拦截器返回的不是完整的响应格式');
      return false;
    }
  } catch (error) {
    console.error('❌ 测试拦截器时发生错误:', error);
    return false;
  }
}

/**
 * 在浏览器控制台中运行测试
 * 使用方法：在浏览器控制台中输入 window.testInterceptor()
 */
if (typeof window !== 'undefined') {
  (window as any).testInterceptor = testInterceptorResponse;
}