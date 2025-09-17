/**
 * 用户管理API测试脚本
 * 用于验证前后端接口对接是否正常
 */

import { 
  getUserListApi, 
  createUserApi, 
  updateUserApi, 
  deleteUserApi,
  toggleUserStatusApi,
  resetPasswordApi
} from '#/api/system/user';

// 测试获取用户列表
export const testGetUserList = async () => {
  try {
    console.log('🧪 测试获取用户列表...');
    const response = await getUserListApi({ page: 1, pageSize: 10 });
    console.log('✅ 用户列表获取成功:', response);
    return response;
  } catch (error) {
    console.error('❌ 用户列表获取失败:', error);
    throw error;
  }
};

// 测试创建用户
export const testCreateUser = async () => {
  try {
    console.log('🧪 测试创建用户...');
    const testUser = {
      username: `test_user_${Date.now()}`,
      password: '123456',
      realName: '测试用户',
      email: `test${Date.now()}@example.com`,
      phone: '13800138000',
      status: 1,
      roleIds: [1]
    };
    
    const response = await createUserApi(testUser);
    console.log('✅ 用户创建成功:', response);
    return response;
  } catch (error) {
    console.error('❌ 用户创建失败:', error);
    throw error;
  }
};

// 测试更新用户
export const testUpdateUser = async (userId: number) => {
  try {
    console.log('🧪 测试更新用户...');
    const updateData = {
      realName: '更新后的用户名',
      email: `updated${Date.now()}@example.com`,
      status: 1
    };
    
    const response = await updateUserApi(userId, updateData);
    console.log('✅ 用户更新成功:', response);
    return response;
  } catch (error) {
    console.error('❌ 用户更新失败:', error);
    throw error;
  }
};

// 测试切换用户状态
export const testToggleUserStatus = async (userId: number) => {
  try {
    console.log('🧪 测试切换用户状态...');
    const response = await toggleUserStatusApi(userId);
    console.log('✅ 用户状态切换成功:', response);
    return response;
  } catch (error) {
    console.error('❌ 用户状态切换失败:', error);
    throw error;
  }
};

// 测试重置密码
export const testResetPassword = async (userId: number) => {
  try {
    console.log('🧪 测试重置密码...');
    const response = await resetPasswordApi(userId, 'newpassword123');
    console.log('✅ 密码重置成功:', response);
    return response;
  } catch (error) {
    console.error('❌ 密码重置失败:', error);
    throw error;
  }
};

// 测试删除用户
export const testDeleteUser = async (userId: number) => {
  try {
    console.log('🧪 测试删除用户...');
    const response = await deleteUserApi(userId);
    console.log('✅ 用户删除成功:', response);
    return response;
  } catch (error) {
    console.error('❌ 用户删除失败:', error);
    throw error;
  }
};

// 运行所有测试
export const runAllTests = async () => {
  console.log('🚀 开始运行用户管理API测试...');
  
  try {
    // 1. 测试获取用户列表
    await testGetUserList();
    
    // 2. 测试创建用户
    const createResponse = await testCreateUser();
    const newUserId = createResponse?.data?.id;
    
    if (newUserId) {
      // 3. 测试更新用户
      await testUpdateUser(newUserId);
      
      // 4. 测试切换用户状态
      await testToggleUserStatus(newUserId);
      
      // 5. 测试重置密码
      await testResetPassword(newUserId);
      
      // 6. 测试删除用户
      await testDeleteUser(newUserId);
    }
    
    console.log('🎉 所有测试完成！');
  } catch (error) {
    console.error('💥 测试过程中出现错误:', error);
  }
};

// 在浏览器控制台中可以调用的测试函数
if (typeof window !== 'undefined') {
  (window as any).userApiTest = {
    testGetUserList,
    testCreateUser,
    testUpdateUser,
    testToggleUserStatus,
    testResetPassword,
    testDeleteUser,
    runAllTests
  };
  
  console.log('🔧 用户API测试工具已加载到 window.userApiTest');
  console.log('📝 可用的测试方法:');
  console.log('  - window.userApiTest.testGetUserList()');
  console.log('  - window.userApiTest.testCreateUser()');
  console.log('  - window.userApiTest.runAllTests()');
}