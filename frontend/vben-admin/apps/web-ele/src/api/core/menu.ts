import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 获取用户所有菜单
 */
export async function getAllMenusApi(): Promise<RouteRecordStringComponent[]> {
  console.log('🚀 getAllMenusApi 被调用了！');
  
  // 临时使用测试数据，验证菜单显示功能
  const testMenus: RouteRecordStringComponent[] = [
    {
      name: 'SystemManagement',
      path: '/system',
      component: 'BasicLayout',
      meta: {
        title: '系统管理',
        icon: 'lucide:settings',
        order: 1,
      },
      children: [
        {
          name: 'UserManagement',
          path: '/system/user',
          component: '#/views/_core/fallback/not-found.vue',
          meta: {
            title: '用户管理',
            icon: 'lucide:users',
          },
        },
        {
          name: 'RoleManagement',
          path: '/system/role',
          component: '#/views/_core/fallback/not-found.vue',
          meta: {
            title: '角色管理',
            icon: 'lucide:user-check',
          },
        },
      ],
    },
    {
      name: 'ProductManagement',
      path: '/product',
      component: 'BasicLayout',
      meta: {
        title: '商品管理',
        icon: 'lucide:package',
        order: 2,
      },
      children: [
        {
          name: 'ProductList',
          path: '/product/list',
          component: '#/views/_core/fallback/not-found.vue',
          meta: {
            title: '商品列表',
            icon: 'lucide:list',
          },
        },
        {
          name: 'CategoryManagement',
          path: '/product/category',
          component: '#/views/_core/fallback/not-found.vue',
          meta: {
            title: '分类管理',
            icon: 'lucide:folder',
          },
        },
      ],
    },
  ];
  
  // 模拟异步请求
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log('📋 返回测试菜单数据:', testMenus);
  return testMenus;
}
