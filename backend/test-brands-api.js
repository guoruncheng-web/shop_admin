const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// 测试品牌管理API
async function testBrandsAPI() {
  let token = '';
  
  try {
    console.log('🚀 开始测试品牌管理API...\n');

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

    token = loginResponse.data.data?.accessToken;
    if (!token) {
      console.log('❌ 未获取到token:', loginResponse.data);
      return;
    }
    console.log('✅ 登录成功，获取到token');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 3. 测试获取品牌列表
    console.log('\n3. 测试获取品牌列表...');
    const brandsListResponse = await axios.get(`${BASE_URL}/brands`, { headers });
    console.log('✅ 品牌列表获取成功');
    console.log('📊 品牌数量:', brandsListResponse.data.data.total);
    console.log('📄 前3个品牌:', brandsListResponse.data.data.items.slice(0, 3).map(b => ({ id: b.id, name: b.name, status: b.status })));

    // 4. 测试创建新品牌
    console.log('\n4. 测试创建新品牌...');
    const newBrandData = {
      name: '测试品牌_' + Date.now(),
      iconUrl: 'https://example.com/icon.png',
      status: true,
      isAuth: false,
      isHot: true,
      label: ['news', 'test']
    };

    const createResponse = await axios.post(`${BASE_URL}/brands`, newBrandData, { headers });
    if (createResponse.status === 200 || createResponse.status === 201) {
      console.log('✅ 品牌创建成功');
      const createdBrand = createResponse.data.data;
      console.log('📄 创建的品牌:', {
        id: createdBrand.id,
        name: createdBrand.name,
        merchantId: createdBrand.merchantId,
        status: createdBrand.status,
        isAuth: createdBrand.isAuth,
        isHot: createdBrand.isHot,
        label: createdBrand.label
      });

      const brandId = createdBrand.id;

      // 5. 测试获取品牌详情
      console.log('\n5. 测试获取品牌详情...');
      const detailResponse = await axios.get(`${BASE_URL}/brands/${brandId}`, { headers });
      console.log('✅ 品牌详情获取成功');
      console.log('📄 品牌详情:', {
        id: detailResponse.data.data.id,
        name: detailResponse.data.data.name,
        creator: detailResponse.data.data.creator,
        createTime: detailResponse.data.data.createTime
      });

      // 6. 测试更新品牌
      console.log('\n6. 测试更新品牌...');
      const updateData = {
        name: createdBrand.name + '_updated',
        status: false,
        isAuth: true,
        isHot: false,
        label: ['updated', 'test']
      };

      const updateResponse = await axios.put(`${BASE_URL}/brands/${brandId}`, updateData, { headers });
      if (updateResponse.status === 200) {
        console.log('✅ 品牌更新成功');
        console.log('📄 更新后的品牌:', {
          name: updateResponse.data.data.name,
          status: updateResponse.data.data.status,
          isAuth: updateResponse.data.data.isAuth,
          isHot: updateResponse.data.data.isHot,
          label: updateResponse.data.data.label,
          updateTime: updateResponse.data.data.updateTime
        });
      }

      // 7. 测试批量状态更新
      console.log('\n7. 测试批量状态更新...');
      const batchStatusData = {
        ids: [brandId],
        status: true
      };

      const batchStatusResponse = await axios.put(`${BASE_URL}/brands/batch/status`, batchStatusData, { headers });
      if (batchStatusResponse.status === 200) {
        console.log('✅ 批量状态更新成功');
        console.log('📄 更新结果:', batchStatusResponse.data.data);
      }

      // 8. 测试批量认证
      console.log('\n8. 测试批量认证...');
      const batchAuthData = {
        ids: [brandId],
        isAuth: true
      };

      const batchAuthResponse = await axios.put(`${BASE_URL}/brands/batch/auth`, batchAuthData, { headers });
      if (batchAuthResponse.status === 200) {
        console.log('✅ 批量认证成功');
        console.log('📄 认证结果:', batchAuthResponse.data.data);
      }

      // 9. 测试获取品牌统计
      console.log('\n9. 测试获取品牌统计...');
      const statsResponse = await axios.get(`${BASE_URL}/brands/statistics`, { headers });
      console.log('✅ 品牌统计获取成功');
      console.log('📊 统计数据:', statsResponse.data.data);

      // 10. 测试获取所有品牌
      console.log('\n10. 测试获取所有品牌...');
      const allBrandsResponse = await axios.get(`${BASE_URL}/brands/all`, { headers });
      console.log('✅ 所有品牌获取成功');
      console.log('📊 品牌总数:', allBrandsResponse.data.data.length);
      console.log('📄 前3个品牌:', allBrandsResponse.data.data.slice(0, 3).map(b => ({ id: b.id, name: b.name, status: b.status })));

      // 11. 测试删除品牌
      console.log('\n11. 测试删除品牌...');
      const deleteResponse = await axios.delete(`${BASE_URL}/brands/${brandId}`, { headers });
      if (deleteResponse.status === 200) {
        console.log('✅ 品牌删除成功');
        console.log('📄 删除结果:', deleteResponse.data.data);
      }
    }

    console.log('\n📋 API测试总结:');
    console.log('- ✅ 品牌列表查询');
    console.log('- ✅ 品牌创建');
    console.log('- ✅ 品牌详情查询');
    console.log('- ✅ 品牌更新');
    console.log('- ✅ 批量状态更新');
    console.log('- ✅ 批量认证');
    console.log('- ✅ 品牌统计');
    console.log('- ✅ 所有品牌查询');
    console.log('- ✅ 品牌删除');
    console.log('\n🎉 品牌管理模块API测试完成！');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    if (error.response) {
      console.error('📄 错误响应:', error.response.data);
      console.error('🔍 HTTP状态:', error.response.status);
      
      if (error.response.status === 401) {
        console.log('\n💡 可能的原因:');
        console.log('- JWT Token无效或过期');
        console.log('- 认证配置问题');
      } else if (error.response.status === 403) {
        console.log('\n💡 可能的原因:');
        console.log('- 权限不足，缺少品牌管理权限');
        console.log('- 角色权限配置问题');
      } else if (error.response.status === 404) {
        console.log('\n💡 可能的原因:');
        console.log('- 品牌模块路由未正确注册');
        console.log('- 服务器未正确启动');
      } else if (error.response.status === 500) {
        console.log('\n💡 可能的原因:');
        console.log('- 数据库连接问题');
        console.log('- 品牌表未创建或结构不正确');
        console.log('- 服务器内部错误');
      }
    }
  }
}

// 运行测试
testBrandsAPI();