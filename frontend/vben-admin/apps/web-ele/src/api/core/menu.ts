import type { MenuRecordRaw } from '@vben/types';

/**
 * 获取用户菜单列表
 * 这是一个简化的 mock 实现，返回默认的菜单结构
 */
export async function getAllMenusApi(): Promise<MenuRecordRaw[]> {
  // 模拟 API 延迟
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  return [
    {
      children: [
        {
          component: '/dashboard/analytics/index',
          meta: {
            affixTab: true,
            icon: 'lucide:area-chart',
            title: 'page.dashboard.analytics',
          },
          name: 'DashboardAnalytics',
          path: '/dashboard/analytics',
        },
        {
          component: '/dashboard/workspace/index',
          meta: {
            icon: 'carbon:workspace',
            title: 'page.dashboard.workspace',
          },
          name: 'DashboardWorkspace',
          path: '/dashboard/workspace',
        },
      ],
      component: 'BasicLayout',
      meta: {
        icon: 'lucide:layout-dashboard',
        order: -1,
        title: 'page.dashboard.title',
      },
      name: 'Dashboard',
      path: '/dashboard',
    },
    {
      children: [
        {
          component: '/demos/access/index',
          meta: {
            authority: ['super', 'admin', 'user'],
            icon: 'mdi:shield-key-outline',
            title: 'page.demos.access.frontendPermissions',
          },
          name: 'DemosAccess',
          path: '/demos/access',
        },
        {
          component: '/demos/features/index',
          meta: {
            icon: 'mdi:feature-search-outline',
            title: 'page.demos.features.title',
          },
          name: 'DemosFeatures',
          path: '/demos/features',
        },
      ],
      component: 'BasicLayout',
      meta: {
        icon: 'carbon:chemistry',
        title: 'page.demos.title',
      },
      name: 'Demos',
      path: '/demos',
    },
    {
      children: [
        {
          component: '/vben-admin/about/index',
          meta: {
            icon: 'lucide:copyright',
            title: 'page.vben.about',
          },
          name: 'VbenAbout',
          path: '/vben-admin/about',
        },
      ],
      component: 'BasicLayout',
      meta: {
        icon: 'logos:vue',
        title: 'Vben Admin',
      },
      name: 'VbenProject',
      path: '/vben-admin',
    },
  ];
}