import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from '#/api/request';
import { useUserStore } from '@vben/stores';
import { convertBackendMenusToFrontendRoutes, createTestMenus } from '#/utils/menu-converter';

/**
 * 调试版本的菜单获取函数
 */
export async function getAllMenusApiDebug(): Promise<RouteRecordStringComponent[]> {
  console.log('🚀 [DEBUG] getAllMenusApiDebug 被调用了！');
  
  try {
    // 首先尝试从用户store中获取已有的菜单数据
    const userStore = useUserStore();
    const userInfo = userStore.userInfo;
    console.log('👤 [DEBUG] 当前用户信息:', userInfo);
    
    let backendMenus: any[] = [];
    
    // 如果用户信息中包含菜单数据，优先使用它
    if (userInfo && userInfo.menus && Array.isArray(userInfo.menus) && userInfo.menus.length > 0) {
      backendMenus = userInfo.menus;
      console.log('📍 [DEBUG] 从用户信息中获取的菜单数据:', JSON.stringify(backendMenus, null, 2));
    } else {
      // 如果用户信息中没有菜单数据，则调用后端菜单接口
      console.log('📞 [DEBUG] 用户信息中无菜单数据，调用后端接口获取...');
      try {
        const response = await requestClient.get('/menus/user');
        backendMenus = response.data || [];
        console.log('📍 [DEBUG] 后端接口返回的菜单数据:', JSON.stringify(backendMenus, null, 2));
      } catch (error) {
        console.warn('⚠️ [DEBUG] 后端菜单接口调用失败:', error);
        backendMenus = [];
      }
    }
    
    // 基础静态路由（仅保留仪表盘）
    const staticMenus: RouteRecordStringComponent[] = [
      {
        name: 'Dashboard',
        path: '/dashboard',
        component: 'BasicLayout',
        meta: {
          title: '仪表盘',
          icon: 'lucide:layout-dashboard',
          order: -1,
        },
        children: [
          {
            name: 'Analytics',
            path: '/analytics',
            component: '#/views/dashboard/analytics/index.vue',
            meta: {
              affixTab: true,
              icon: 'lucide:area-chart',
              title: '分析页',
            },
          },
          {
            name: 'Workspace',
            path: '/workspace',
            component: '#/views/dashboard/workspace/index.vue',
            meta: {
              icon: 'carbon:workspace',
              title: '工作台',
            },
          },
        ],
      }
    ];
    
    // 如果没有后端菜单数据，使用测试菜单
    if (!backendMenus || backendMenus.length === 0) {
      console.log('🧪 [DEBUG] 没有后端菜单数据，使用测试菜单');
      const testMenus = createTestMenus();
      console.log('📋 [DEBUG] 返回测试菜单数据:', JSON.stringify(testMenus, null, 2));
      return testMenus;
    }
    
    // 将后端菜单转换为前端路由格式
    const dynamicMenus = convertBackendMenusToFrontendRoutes(backendMenus);
    console.log('🔄 [DEBUG] 转换后的动态菜单:', JSON.stringify(dynamicMenus, null, 2));
    
    // 合并静态路由和动态菜单
    const allMenus = [...staticMenus, ...dynamicMenus];
    
    console.log('📋 [DEBUG] 返回合并后的菜单数据:', JSON.stringify(allMenus, null, 2));
    return allMenus;
  } catch (error) {
    console.error('😨 [DEBUG] 获取菜单数据失败:', error);
    
    // 返回基础菜单和测试菜单
    const fallbackMenus: RouteRecordStringComponent[] = [
      {
        name: 'Dashboard',
        path: '/dashboard',
        component: 'BasicLayout',
        meta: {
          title: '仪表盘',
          icon: 'lucide:layout-dashboard',
          order: -1,
        },
        children: [
          {
            name: 'Analytics',
            path: '/analytics',
            component: '#/views/dashboard/analytics/index.vue',
            meta: {
              affixTab: true,
              icon: 'lucide:area-chart',
              title: '分析页',
            },
          },
        ],
      },
      {
        name: 'System',
        path: '/system',
        component: 'BasicLayout',
        meta: {
          title: '系统管理',
          icon: 'lucide:settings',
          order: 1,
        },
        children: [
          {
            name: 'User',
            path: '/system/user',
            component: '#/views/system/user/index.vue',
            meta: {
              title: '用户管理',
              icon: 'lucide:users',
            },
          },
        ],
      },
    ];
    
    console.log('📋 [DEBUG] 返回备用菜单数据:', JSON.stringify(fallbackMenus, null, 2));
    return fallbackMenus;
  }
}

