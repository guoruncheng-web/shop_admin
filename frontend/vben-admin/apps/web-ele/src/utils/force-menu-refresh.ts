import { useAccessStore, useUserStore } from '@vben/stores';
import { getAllMenusApiDebug } from '#/api/core/menu-debug';

/**
 * 强制刷新菜单的工具函数
 */
export async function forceRefreshMenus() {
  console.log('🔄 [强制刷新] 开始强制刷新菜单...');
  
  try {
    const accessStore = useAccessStore();
    const userStore = useUserStore();
    
    console.log('📊 [强制刷新] 当前状态:', {
      isAccessChecked: accessStore.isAccessChecked,
      accessMenus: accessStore.accessMenus,
      userInfo: userStore.userInfo,
    });
    
    // 1. 重置访问状态
    accessStore.setIsAccessChecked(false);
    console.log('✅ [强制刷新] 已重置访问检查状态');
    
    // 2. 清空现有菜单
    accessStore.setAccessMenus([]);
    console.log('✅ [强制刷新] 已清空现有菜单');
    
    // 3. 重新获取菜单
    console.log('🔍 [强制刷新] 重新获取菜单...');
    const menus = await getAllMenusApiDebug();
    console.log('📋 [强制刷新] 获取到的菜单:', menus);
    
    // 4. 设置新菜单
    accessStore.setAccessMenus(menus);
    console.log('✅ [强制刷新] 已设置新菜单');
    
    // 5. 标记访问已检查
    accessStore.setIsAccessChecked(true);
    console.log('✅ [强制刷新] 菜单刷新完成！');
    
    return menus;
  } catch (error) {
    console.error('❌ [强制刷新] 菜单刷新失败:', error);
    throw error;
  }
}

/**
 * 在浏览器控制台中可以直接调用的全局函数
 */
if (typeof window !== 'undefined') {
  (window as any).forceRefreshMenus = forceRefreshMenus;
  console.log('🛠️ [工具] 已注册全局函数 window.forceRefreshMenus()');
}