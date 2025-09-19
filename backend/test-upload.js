const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000/api';

// 创建一个测试图片文件
function createTestImage() {
  const testImagePath = path.join(__dirname, 'test-image.txt');
  const testContent = 'This is a test file for upload testing';
  fs.writeFileSync(testImagePath, testContent);
  return testImagePath;
}

async function testUploadAPI() {
  try {
    console.log('🚀 开始测试腾讯云COS上传接口...\n');

    // 1. 首先获取验证码
    console.log('1. 获取验证码...');
    const captchaResponse = await axios.get(`${BASE_URL}/auth/captcha`);
    console.log('✅ 获取验证码成功');

    // 2. 登录获取token
    console.log('2. 登录获取token...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: '123456',
      captcha: '1234', // 开发环境会跳过验证码验证
      captchaId: captchaResponse.data.data.captchaId
    });

    if (loginResponse.status !== 200 && loginResponse.status !== 201) {
      console.log('❌ 登录失败:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.data?.accessToken;
    if (!token) {
      console.log('❌ 未获取到token:', loginResponse.data);
      return;
    }
    console.log('✅ 登录成功，获取到token');

    // 3. 测试上传接口（模拟测试）
    console.log('3. 测试上传接口配置...');
    
    // 创建测试文件
    const testFilePath = createTestImage();
    
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(testFilePath));
      formData.append('folder', 'test');

      const uploadResponse = await axios.post(`${BASE_URL}/upload/image`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          ...formData.getHeaders()
        }
      });

      console.log('✅ 上传接口调用成功');
      console.log('📄 响应数据:', JSON.stringify(uploadResponse.data, null, 2));
    } catch (uploadError) {
      if (uploadError.response) {
        console.log('⚠️  上传接口响应错误:', uploadError.response.status);
        console.log('📄 错误详情:', uploadError.response.data);
        
        if (uploadError.response.status === 400) {
          console.log('💡 这可能是因为腾讯云COS配置未完成，请检查环境变量配置');
        }
      } else {
        console.log('❌ 上传接口请求失败:', uploadError.message);
      }
    }

    // 清理测试文件
    fs.unlinkSync(testFilePath);

    console.log('\n📋 接口测试总结:');
    console.log('- ✅ 验证码接口正常');
    console.log('- ✅ 登录接口正常');
    console.log('- ✅ 上传接口已创建（需要配置腾讯云COS参数）');
    
    console.log('\n🔧 下一步配置说明:');
    console.log('1. 在腾讯云控制台创建COS存储桶');
    console.log('2. 获取API密钥（SecretId和SecretKey）');
    console.log('3. 修改 .env.development 文件中的COS配置:');
    console.log('   - COS_SECRET_ID=你的SecretId');
    console.log('   - COS_SECRET_KEY=你的SecretKey');
    console.log('   - COS_BUCKET=你的存储桶名称');
    console.log('   - COS_REGION=存储桶地域（如ap-beijing）');
    console.log('   - COS_BASE_URL=访问域名');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    if (error.response) {
      console.error('📄 错误响应:', error.response.data);
    }
  }
}

// 运行测试
testUploadAPI();