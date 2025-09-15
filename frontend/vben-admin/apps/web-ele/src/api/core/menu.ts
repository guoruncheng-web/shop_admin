import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from '#/api/request';
import { useUserStore } from '@vben/stores';

/**
 * 获取用户所有菜单 - 纯动态模式
 */
export async function getAllMenusApi(): Promise<RouteRecordStringComponent[]> {
  console.log('🚀 getAllMenusApi 被调用了！当前为纯动态路由模式');
  
  try {
    // 首先尝试从用户store中获取已有的菜单数据
    const userStore = useUserStore();
    const userInfo = userStore.userInfo;
    console.log('👤 当前用户信息:', userInfo);
    
    let backendMenus: any[] = [];
    
    // 如果用户信息中包含菜单数据，优先使用它
    if (userInfo && userInfo.menus && Array.isArray(userInfo.menus) && userInfo.menus.length > 0) {
      backendMenus = userInfo.menus;
      console.log('📍 从用户信息中获取的菜单数据:', backendMenus);
    } else {
      // 如果用户信息中没有菜单数据，则调用后端菜单接口
      console.log('📞 用户信息中无菜单数据，调用后端接口获取...');
      try {
        const response = await requestClient.get('/menus/user');
        backendMenus = response.data || [];
        console.log('📍 后端接口返回的菜单数据:', backendMenus);
      } catch (error) {
        console.warn('⚠️ 后端菜单接口调用失败，返回空菜单:', error);
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
    
    // 将后端菜单转换为前端路由格式
    const dynamicMenus = convertBackendMenusToRoutes(backendMenus);
    console.log('🔄 转换后的动态菜单:', dynamicMenus);
    
    // 合并静态路由和动态菜单
    const allMenus = [...staticMenus, ...dynamicMenus];
    
    console.log('📋 返回合并后的菜单数据:', allMenus);
    return allMenus;
  } catch (error) {
    console.error('😨 获取菜单数据失败:', error);
    
    // 纯动态模式下，如果获取失败，只返回基础仪表盘
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
    ];
    
    console.log('📋 返回备用菜单数据（仅仪表盘）:', fallbackMenus);
    return fallbackMenus;
  }
}

/**
 * 将后端菜单数据转换为前端路由格式
 */
function convertBackendMenusToRoutes(menus: any[]): RouteRecordStringComponent[] {
  if (!menus || !Array.isArray(menus)) {
    console.log('😨 菜单数据为空或格式不正确:', menus);
    return [];
  }
  
  console.log('🔄 开始转换菜单数据:', menus);
  
  return menus.map((menu) => {
    console.log('🗺️ 正在转换菜单项:', menu);
    
    // 从后端数据提取字段，兼容不同命名方式
    const menuType = menu.type || menu.menuType;
    const isDirectory = menuType === 1 || menuType === 'directory';
    const isMenu = menuType === 2 || menuType === 'menu';
    
    // 针对不同类型的菜单设置不同的component
    let component = menu.component;
    if (!component) {
      if (isDirectory) {
        component = 'BasicLayout';
      } else if (isMenu) {
        // 如果是菜单类型但没有component，尝试根据path生成
        const path = menu.path || menu.routePath;
        if (path) {
          // 将路径转换为组件路径，例如 /system/user -> #/views/system/user/index.vue
          const cleanPath = path.startsWith('/') ? path.slice(1) : path;
          component = `#/views/${cleanPath}/index.vue`;
        }
      }
    }
    
    const route: RouteRecordStringComponent = {
      name: menu.name || menu.routeName || menu.title,
      path: menu.path || menu.routePath || '',
      component: component || '',
      redirect: menu.redirect,
      meta: {
        title: menu.title || menu.name,
        icon: menu.icon,
        order: menu.orderNum || menu.sort || menu.order || 0,
        hideInMenu: menu.hideInMenu === 1 || menu.hidden === true || menu.visible === false,
        hideChildrenInMenu: menu.hideChildrenInMenu === 1,
        hideInBreadcrumb: menu.hideInBreadcrumb === 1,
        hideInTab: menu.hideInTab === 1,
        keepAlive: menu.keepAlive === 1 || menu.cache === true,
        ignoreAccess: menu.ignoreAccess === 1,
        affixTab: menu.affixTab === 1,
        affixTabOrder: menu.affixTabOrder || 0,
        link: menu.link,
        iframeSrc: menu.iframeSrc,
        openInNewWindow: menu.openInNewWindow === 1,
        badge: menu.badge,
        badgeType: menu.badgeType || 'normal',
        badgeVariants: menu.badgeVariants || 'default',
        authority: menu.authority || [],
        menuVisibleWithForbidden: menu.menuVisibleWithForbidden === 1,
        activePath: menu.activePath,
      },
    };
    
    // 递归处理子菜单
    if (menu.children && Array.isArray(menu.children) && menu.children.length > 0) {
      route.children = convertBackendMenusToRoutes(menu.children);
      console.log(`👨‍👧‍👦 菜单 ${String(route.name)} 有 ${route.children.length} 个子菜单`);
    }
    
    console.log(`✅ 菜单项 ${String(route.name)} 转换完成:`, route);
    return route;
  }).filter(route => {
    // 过滤掉没有路径的菜单（但目录类型可以没有path）
    const hasValidPath = route.path || route.component === 'BasicLayout';
    const hasValidComponent = route.component;
    const isValid = hasValidPath && hasValidComponent;
    
    if (!isValid) {
      console.warn(`⚠️ 过滤掉无效的菜单:`, route);
    }
    return isValid;
  });
}
