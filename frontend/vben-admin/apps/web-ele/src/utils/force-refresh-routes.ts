import { useAccessStore, useUserStore } from '@vben/stores';
import { generateAccess } from '#/router/access';
import { accessRoutes } from '#/router/routes';
import { router } from '#/router';

/**
 * 强制刷新路由和菜单
 */
export async function forceRefreshRoutes() {
  console.log('🔄 [FORCE] 开始强制刷新路由和菜单...');
  
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  
  try {
    // 重置访问检查状态
    accessStore.setIsAccessChecked(false);
    
    // 获取用户信息
    const userInfo = userStore.userInfo;
    console.log('👤 [FORCE] 当前用户信息:', userInfo);
    
    if (!userInfo) {
      console.error('❌ [FORCE] 用户信息不存在');
      return;
    }
    
    const userRoles = userInfo.roles ?? [];
    console.log('🎭 [FORCE] 用户角色:', userRoles);
    
    // 生成菜单和路由
    console.log('⚙️ [FORCE] 调用 generateAccess...');
    const { accessibleMenus, accessibleRoutes } = await generateAccess({
      roles: userRoles,
      router,
      routes: accessRoutes,
    });
    
    console.log('📋 [FORCE] 生成的菜单:', JSON.stringify(accessibleMenus, null, 2));
    console.log('🛣️ [FORCE] 生成的路由:', JSON.stringify(accessibleRoutes, null, 2));
    
    // 保存菜单信息和路由信息
    accessStore.setAccessMenus(accessibleMenus);
    accessStore.setAccessRoutes(accessibleRoutes);
    accessStore.setIsAccessChecked(true);
    
    console.log('✅ [FORCE] 路由和菜单刷新完成');
    
    // 强制重新渲染
    router.replace('/analytics');
    
  } catch (error) {
    console.error('😨 [FORCE] 强制刷新失败:', error);
  }
}

// 将函数挂载到全局，方便在控制台调用
if (typeof window !== 'undefined') {
  (window as any).forceRefreshRoutes = forceRefreshRoutes;
}