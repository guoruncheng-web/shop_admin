const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000/api';

// 创建一个测试图片文件（模拟真实图片）
function createTestImage() {
  const testImagePath = path.join(__dirname, 'test-image.jpg');
  // 创建一个简单的测试文件（实际应该是真实图片）
  const testContent = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
    0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
    0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
    0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
    0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xD9
  ]);
  fs.writeFileSync(testImagePath, testContent);
  return testImagePath;
}

async function testCOSUpload() {
  try {
    console.log('🚀 开始测试腾讯云COS上传功能...\n');

    // 1. 获取验证码
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

    // 3. 测试上传接口
    console.log('3. 测试图片上传...');
    
    // 创建测试图片文件
    const testFilePath = createTestImage();
    
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(testFilePath), {
        filename: 'test-image.jpg',
        contentType: 'image/jpeg'
      });
      formData.append('folder', 'test');

      console.log('📤 正在上传图片到腾讯云COS...');
      const uploadResponse = await axios.post(`${BASE_URL}/upload/image`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          ...formData.getHeaders()
        },
        timeout: 30000 // 30秒超时
      });

      console.log('🎉 图片上传成功！');
      console.log('📄 上传结果:', JSON.stringify(uploadResponse.data, null, 2));
      
      // 验证返回的URL是否可访问
      if (uploadResponse.data.data && uploadResponse.data.data.url) {
        console.log('\n4. 验证图片URL可访问性...');
        try {
          const imageResponse = await axios.head(uploadResponse.data.data.url, { timeout: 10000 });
          console.log('✅ 图片URL可正常访问');
          console.log('🌐 图片地址:', uploadResponse.data.data.url);
        } catch (urlError) {
          console.log('⚠️  图片URL访问测试失败:', urlError.message);
          console.log('💡 这可能是因为存储桶权限设置或域名配置问题');
        }
      }

    } catch (uploadError) {
      if (uploadError.response) {
        console.log('❌ 上传失败 - HTTP状态:', uploadError.response.status);
        console.log('📄 错误详情:', JSON.stringify(uploadError.response.data, null, 2));
        
        if (uploadError.response.status === 400) {
          console.log('\n💡 可能的原因:');
          console.log('- 腾讯云COS配置错误（SecretId、SecretKey、Bucket、Region）');
          console.log('- 存储桶不存在或权限不足');
          console.log('- 网络连接问题');
        } else if (uploadError.response.status === 401) {
          console.log('\n💡 可能的原因:');
          console.log('- JWT Token无效或过期');
          console.log('- 认证配置问题');
        } else if (uploadError.response.status === 404) {
          console.log('\n💡 可能的原因:');
          console.log('- 上传接口路由未正确注册');
          console.log('- 服务器未正确启动');
        }
      } else {
        console.log('❌ 上传请求失败:', uploadError.message);
      }
    }

    // 清理测试文件
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }

    console.log('\n📋 测试总结:');
    console.log('- ✅ 验证码接口正常');
    console.log('- ✅ 登录接口正常');
    console.log('- 🔄 上传接口测试完成');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    if (error.response) {
      console.error('📄 错误响应:', error.response.data);
    }
  }
}

// 运行测试
testCOSUpload();