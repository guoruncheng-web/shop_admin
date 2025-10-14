const axios = require('axios');

async function testLoginAndLogs() {
  try {
    console.log('🔍 开始测试登录和日志接口...');
    
    // 1. 获取验证码
    console.log('\n1. 获取验证码...');
    const captchaResponse = await axios.get('http://localhost:3000/api/auth/captcha');
    const { captchaId } = captchaResponse.data.data;
    console.log('验证码ID:', captchaId);
    
    // 2. 登录（使用一个简单的验证码，或者我们可以尝试绕过验证码）
    console.log('\n2. 尝试登录...');
    try {
      const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
        username: 'super_admin',
        password: '123456',
        captcha: '1234', // 简单验证码
        captchaId: captchaId
      });
      
      const { accessToken } = loginResponse.data.data;
      console.log('登录成功，获取到token');
      
      // 3. 测试登录日志接口
      console.log('\n3. 测试登录日志接口...');
      const loginLogsResponse = await axios.get('http://localhost:3000/api/login-logs', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      console.log('登录日志接口响应:');
      console.log(JSON.stringify(loginLogsResponse.data, null, 2));
      
      // 4. 测试操作日志接口
      console.log('\n4. 测试操作日志接口...');
      const operationLogsResponse = await axios.get('http://localhost:3000/api/operation-logs', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      console.log('操作日志接口响应:');
      console.log(JSON.stringify(operationLogsResponse.data, null, 2));
      
    } catch (loginError) {
      console.error('登录失败:', loginError.response?.data || loginError.message);
      
      // 如果登录失败，我们尝试使用一个固定的token来测试接口结构
      console.log('\n尝试使用测试token检查接口结构...');
      
      try {
        const testToken = 'test-token';
        
        // 测试登录日志接口结构
        const loginLogsResponse = await axios.get('http://localhost:3000/api/login-logs', {
          headers: {
            'Authorization': `Bearer ${testToken}`
          }
        });
      } catch (error) {
        console.log('登录日志接口错误响应结构:');
        console.log(JSON.stringify(error.response?.data, null, 2));
      }
      
      try {
        const testToken = 'test-token';
        
        // 测试操作日志接口结构
        const operationLogsResponse = await axios.get('http://localhost:3000/api/operation-logs', {
          headers: {
            'Authorization': `Bearer ${testToken}`
          }
        });
      } catch (error) {
        console.log('操作日志接口错误响应结构:');
        console.log(JSON.stringify(error.response?.data, null, 2));
      }
    }
    
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

testLoginAndLogs();