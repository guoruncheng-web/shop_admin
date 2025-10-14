const axios = require('axios');

async function testLoginLogsApi() {
  try {
    console.log('🧪 测试登录日志接口...\n');

    const baseUrl = 'http://localhost:3000/api';

    // 1. 登录获取 token
    console.log('1️⃣ 登录...');
    const captchaResponse = await axios.get(`${baseUrl}/auth/captcha`);
    const { captchaId } = captchaResponse.data.data;

    const loginResponse = await axios.post(`${baseUrl}/auth/login`, {
      username: 'admin',
      password: 'admin123',
      captchaId: captchaId,
      captcha: '1234'
    });

    const token = loginResponse.data.data.accessToken;
    console.log('✅ 登录成功\n');

    // 2. 访问登录日志接口
    console.log('2️⃣ 访问登录日志接口...');
    const logsResponse = await axios.get(`${baseUrl}/login-logs?page=1&pageSize=20`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ 登录日志接口访问成功！');
    console.log(`总记录数: ${logsResponse.data.meta.total}`);
    console.log(`当前页数据: ${logsResponse.data.data.length} 条\n`);

    if (logsResponse.data.data.length > 0) {
      console.log('最近的登录记录:');
      console.table(logsResponse.data.data.slice(0, 3).map(log => ({
        用户名: log.username,
        IP: log.ip,
        状态: log.status,
        登录时间: log.loginTime,
        商户: log.merchant?.merchantName || '-'
      })));
    }

    console.log('\n🎉 测试通过！登录日志接口可以正常访问');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

testLoginLogsApi();
