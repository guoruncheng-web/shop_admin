/**
 * 调试 /auth/profile 接口调用次数
 * 用于监控和分析接口调用情况
 */

// 记录接口调用次数
let profileCallCount = 0;
const profileCallStack: string[] = [];

/**
 * 包装原始的 getProfile 函数，添加调用监控
 */
export function wrapProfileFunction() {
  // 动态导入并包装 getProfile 函数
  const originalGetProfile = async () => {
    const { getProfile } = await import('#/api/core/user');
    return getProfile;
  };

  return async (...args: any[]) => {
    profileCallCount++;
    const callStack = new Error().stack || '';
    profileCallStack.push(`Call ${profileCallCount}: ${callStack.split('\n')[2]?.trim()}`);
    
    console.group(`🔍 Profile API Call #${profileCallCount}`);
    console.log('📞 调用堆栈:', callStack.split('\n').slice(1, 4).map(line => line.trim()));
    console.log('📊 总调用次数:', profileCallCount);
    console.groupEnd();
    
    const getProfile = await originalGetProfile();
    return getProfile(...args);
  };
}

/**
 * 获取调用统计信息
 */
export function getProfileCallStats() {
  return {
    totalCalls: profileCallCount,
    callStack: profileCallStack,
  };
}

/**
 * 重置调用计数
 */
export function resetProfileCallCount() {
  profileCallCount = 0;
  profileCallStack.length = 0;
}

/**
 * 在浏览器控制台中查看调用统计
 */
if (typeof window !== 'undefined') {
  (window as any).getProfileStats = getProfileCallStats;
  (window as any).resetProfileStats = resetProfileCallCount;
}