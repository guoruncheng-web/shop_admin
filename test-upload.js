const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

// 测试上传接口
async function testUpload() {
  try {
    // 创建一个测试图片文件
    const testImageContent = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    // 将base64转换为buffer
    const base64Data = testImageContent.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // 创建FormData
    const form = new FormData();
    form.append('file', buffer, {
      filename: 'test.png',
      contentType: 'image/png'
    });

    console.log('🚀 开始测试上传接口...');
    
    // 发送请求
    const response = await axios.post('http://localhost:3000/api/upload/image', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': 'Bearer test-token' // 这里需要真实的token
      }
    });

    console.log('✅ 上传成功:', response.data);
  } catch (error) {
    console.error('❌ 上传失败:', error.response?.data || error.message);
  }
}

// 测试接口是否可访问
async function testHealth() {
  try {
    const response = await axios.get('http://localhost:3000/api/health');
    console.log('✅ 后端服务正常:', response.data);
    return true;
  } catch (error) {
    console.error('❌ 后端服务异常:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 检查后端服务状态...');
  const isHealthy = await testHealth();
  
  if (isHealthy) {
    await testUpload();
  } else {
    console.log('请先启动后端服务: cd backend && npm run start:dev');
  }
}

main();