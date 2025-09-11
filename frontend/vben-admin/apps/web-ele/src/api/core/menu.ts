import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from '#/api/request';
import { useUserStore } from '@vben/stores';

/**
 * 获取用户所有菜单
 */
export async function getAllMenusApi(): Promise<RouteRecordStringComponent[]> {
  console.log('🚀 getAllMenusApi 被调用了！');
  
  // 从 Pinia store 中获取用户信息
  const userStore = useUserStore();
  const userInfo = userStore.userInfo;
  console.log('👤 当前用户信息:', userInfo);
  
  // 基础静态路由
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
  
  // 从用户信息中获取动态菜单（如果用户信息中包含菜单数据）
  let dynamicMenus: RouteRecordStringComponent[] = [];
  if (userInfo && userInfo.menus) {
    dynamicMenus = userInfo.menus;
    console.log('📋 用户动态菜单:', dynamicMenus);
  }
  
  // 合并静态路由和动态菜单
  const allMenus = [...staticMenus, ...dynamicMenus];
  
  // 模拟异步请求
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log('📋 返回合并后的菜单数据:', allMenus);
  return allMenus;
}
