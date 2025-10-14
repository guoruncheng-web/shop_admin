const axios = require('axios');

async function testLogin() {
  try {
    console.log('🧪 测试登录接口...\n');

    const baseUrl = 'http://localhost:3000/api';

    // 1. 获取验证码
    console.log('1️⃣ 获取验证码...');
    const captchaResponse = await axios.get(`${baseUrl}/auth/captcha`);
    const { captchaId } = captchaResponse.data.data;
    console.log('✅ 验证码ID:', captchaId);

    // 2. 尝试登录（开发模式会跳过验证码验证）
    console.log('\n2️⃣ 尝试登录...');
    const loginResponse = await axios.post(`${baseUrl}/auth/login`, {
      username: 'admin',
      password: 'admin123',
      captchaId: captchaId,
      captcha: '1234'
    });

    console.log('✅ 登录成功！');
    console.log('用户信息:', {
      id: loginResponse.data.data.user.id,
      username: loginResponse.data.data.user.username,
      merchantId: loginResponse.data.data.user.merchantId,
      merchant: loginResponse.data.data.user.merchant
    });

    console.log('\n🎉 测试通过！');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
    process.exit(1);
  }
}

testLogin();
