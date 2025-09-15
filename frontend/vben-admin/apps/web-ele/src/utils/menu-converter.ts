import type { RouteRecordStringComponent } from '@vben/types';

/**
 * 将后端菜单数据转换为前端路由格式
 */
export function convertBackendMenusToFrontendRoutes(backendMenus: any[]): RouteRecordStringComponent[] {
  console.log('🔄 [CONVERTER] 开始转换后端菜单数据:', backendMenus);
  
  if (!backendMenus || !Array.isArray(backendMenus) || backendMenus.length === 0) {
    console.warn('⚠️ [CONVERTER] 后端菜单数据为空');
    return [];
  }

  const convertedRoutes: RouteRecordStringComponent[] = [];

  backendMenus.forEach((menu, index) => {
    console.log(`🗺️ [CONVERTER] 转换第${index + 1}个菜单:`, menu);
    
    // 确保必要的字段存在
    if (!menu.name || !menu.path) {
      console.warn(`⚠️ [CONVERTER] 跳过无效菜单项:`, menu);
      return;
    }

    // 根据菜单类型确定组件
    let component = menu.component || 'BasicLayout';
    
    // 如果是菜单类型且没有指定组件，根据路径生成组件路径
    if (menu.type === 2 && (!menu.component || menu.component === 'BasicLayout')) {
      const cleanPath = menu.path.startsWith('/') ? menu.path.slice(1) : menu.path;
      component = `#/views/${cleanPath}/index.vue`;
    }

    const route: RouteRecordStringComponent = {
      name: menu.name,
      path: menu.path,
      component: component,
      meta: {
        title: menu.title || menu.name,
        icon: menu.icon || 'lucide:folder',
        order: menu.orderNum || menu.sort || index,
        hideInMenu: false, // 确保菜单显示
        hideInBreadcrumb: false,
        hideInTab: false,
      },
    };

    // 处理子菜单
    if (menu.children && Array.isArray(menu.children) && menu.children.length > 0) {
      console.log(`👨‍👧‍👦 [CONVERTER] 处理${menu.name}的子菜单，共${menu.children.length}个`);
      route.children = convertBackendMenusToFrontendRoutes(menu.children);
    }

    console.log(`✅ [CONVERTER] 菜单${menu.name}转换完成:`, route);
    convertedRoutes.push(route);
  });

  console.log('🎯 [CONVERTER] 转换完成，共生成', convertedRoutes.length, '个路由');
  return convertedRoutes;
}

/**
 * 创建测试菜单数据
 */
export function createTestMenus(): RouteRecordStringComponent[] {
  return [
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
        {
          name: 'Menu',
          path: '/system/menu',
          component: '#/views/system/menu/index.vue',
          meta: {
            title: '菜单管理',
            icon: 'lucide:menu',
          },
        },
      ],
    },
    {
      name: 'Product',
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
          component: '#/views/product/list/index.vue',
          meta: {
            title: '商品列表',
            icon: 'lucide:list',
          },
        },
      ],
    },
    {
      name: 'Logs',
      path: '/logs',
      component: 'BasicLayout',
      meta: {
        title: '日志管理',
        icon: 'lucide:file-text',
        order: 3,
      },
      children: [
        {
          name: 'LoginLogs',
          path: '/logs/login',
          component: '#/views/logs/login/index.vue',
          meta: {
            title: '登录日志',
            icon: 'lucide:log-in',
          },
        },
      ],
    },
  ];
}