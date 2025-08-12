const axios = require('axios');

async function testLogin() {
  try {
    // 1. 获取验证码
    console.log('1. 获取验证码...');
    const captchaResponse = await axios.get('http://localhost:3000/api/v1/auth/captcha');
    const captchaId = captchaResponse.data.data.captchaId;
    console.log('验证码ID:', captchaId);

    // 2. 获取验证码文本
    console.log('2. 获取验证码文本...');
    const debugResponse = await axios.get('http://localhost:3000/api/v1/auth/captcha/debug');
    const captchaData = debugResponse.data.data.find(item => item.id === captchaId);
    const captchaText = captchaData.text;
    console.log('验证码文本:', captchaText);

    // 3. 执行登录
    console.log('3. 执行登录...');
    const loginResponse = await axios.post('http://localhost:3000/api/v1/auth/login', {
      username: 'admin',
      password: '123456',
      captcha: captchaText,
      captchaId: captchaId
    });

    console.log('登录响应状态:', loginResponse.status);
    console.log('登录响应数据:', {
      code: loginResponse.data.code,
      msg: loginResponse.data.msg,
      hasToken: !!loginResponse.data.data?.accessToken,
      hasUser: !!loginResponse.data.data?.user,
      menuCount: loginResponse.data.data?.user?.menus?.length || 0
    });

    if (loginResponse.data.data?.accessToken) {
      console.log('✅ 登录成功！');
      console.log('菜单数量:', loginResponse.data.data.user.menus.length);
      console.log('第一个菜单:', loginResponse.data.data.user.menus[0]?.name);
    } else {
      console.log('❌ 登录失败！');
    }

  } catch (error) {
    console.error('测试失败:', error.response?.data || error.message);
  }
}

testLogin();
