import type {
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
  RouteRecordStringComponent,
} from '@vben/types';

import { generateAccessible } from '@vben/access';
import { preferences } from '@vben/preferences';

import { BasicLayout, IFrameView } from '#/layouts';
import { getProfile } from '#/api/core/user';
import { accessRoutes } from './routes';

const forbiddenComponent = () => import('#/views/_core/fallback/forbidden.vue');

/**
 * 将后端菜单数据转换为路由格式
 */
function transformMenusToRoutes(menus: any[]): RouteRecordStringComponent[] {
  if (!menus || !Array.isArray(menus)) {
    console.warn('⚠️ 菜单数据为空或格式不正确');
    return [];
  }

  console.log('🔄 开始转换菜单数据为路由格式...');
  console.log('📋 原始菜单数据:', JSON.stringify(menus, null, 2));
  
  const routes: RouteRecordStringComponent[] = menus.map((menu) => {
    console.log(`📝 处理菜单:`, menu);
    
    // 🔧 正确提取菜单字段（后端将 title/icon 等放在 meta 中）
    const menuTitle = menu.meta?.title || menu.title || menu.name;
    const menuIcon = menu.meta?.icon || menu.icon || 'lucide:folder';
    const menuOrder = menu.meta?.order || menu.order || 0;
    const menuHideInMenu = menu.meta?.hideInMenu || menu.hidden === true;
    const menuHideChildrenInMenu = menu.meta?.hideChildrenInMenu || menu.hideChildrenInMenu === true;
    
    // 处理子菜单
    const children: RouteRecordStringComponent[] = [];
    if (menu.children && Array.isArray(menu.children)) {
      menu.children.forEach((child: any) => {
        console.log(`  📝 处理子菜单:`, child);
        
        // 🔧 正确提取子菜单字段
        const childTitle = child.meta?.title || child.title || child.name;
        const childIcon = child.meta?.icon || child.icon || 'lucide:file';
        const childOrder = child.meta?.order || child.order || 0;
        const childHideInMenu = child.meta?.hideInMenu || child.hidden === true;
        const childKeepAlive = child.meta?.keepAlive !== false;
        
        children.push({
          name: child.name || childTitle,
          path: child.path,
          component: child.component || 'BasicLayout',
          meta: {
            title: childTitle,
            icon: childIcon,
            order: childOrder,
            hideInMenu: childHideInMenu,
            keepAlive: childKeepAlive,
            // 传递其他 meta 属性
            ...child.meta,
          },
        });
      });
    }

    // 构建主菜单路由
    const route: RouteRecordStringComponent = {
      name: menu.name || menuTitle,
      path: menu.path,
      component: menu.component || 'BasicLayout',
      meta: {
        title: menuTitle,
        icon: menuIcon,
        order: menuOrder,
        hideInMenu: menuHideInMenu,
        hideChildrenInMenu: menuHideChildrenInMenu,
        // 传递其他 meta 属性
        ...menu.meta,
      },
      children: children.length > 0 ? children : undefined,
    };
    return route;
  });
  return routes;
}

/**
 * 将静态路由转换为字符串组件格式
 */
function convertStaticRoutesToStringComponent(routes: any[]): RouteRecordStringComponent[] {
  return routes.map((route) => {
    const convertedRoute: RouteRecordStringComponent = {
      ...route,
      component: 'BasicLayout', // 静态路由使用 BasicLayout
    };
    
    if (route.children) {
      convertedRoute.children = route.children.map((child: any) => ({
        ...child,
        component: child.component ? child.component.toString() : 'BasicLayout',
      }));
    }
    
    return convertedRoute;
  });
}

async function generateAccess(options: GenerateMenuAndRoutesOptions) {
  console.log('🎯 generateAccess 函数被调用了！');
  
  const pageMap: ComponentRecordType = import.meta.glob('../views/**/*.vue');

  const layoutMap: ComponentRecordType = {
    BasicLayout,
    IFrameView,
  };

  // 🔍 调试：检查当前访问模式
  console.log('🔍 当前访问模式 (preferences.app.accessMode):', preferences.app.accessMode);
  console.log('🔍 完整的 preferences.app 配置:', preferences.app);

  // 🔧 使用配置的访问模式，而不是强制使用 backend
  const accessMode = preferences.app.accessMode;
  console.log('🔧 使用访问模式:', accessMode);

  return await generateAccessible(accessMode, {
    ...options,
    fetchMenuListAsync: async () => {
      try {
        console.log('🚀 [CORRECTED] fetchMenuListAsync starting...');
        
        // 在混合模式下，此函数只应获取、转换和返回后端菜单。
        // 框架会自动将这些动态菜单与 `accessRoutes` 中的静态菜单合并。
        try {
          console.log('🌐 Fetching user profile and menus from backend...');
          
          const { useUserStore } = await import('@vben/stores');
          const userStore = useUserStore();
          
          let userProfile = userStore.userInfo;
          if (!userProfile) {
            console.log('📞 User info not in store, calling getProfile API...');
            userProfile = await getProfile();
          } else {
            console.log('✅ Using existing user info from store.');
          }
          
          const backendMenus = userProfile.menus || [];
          console.log(`📋 Got ${backendMenus.length} menus from backend.`);
          
          // 🚫 过滤掉与前端静态路由重复的后端菜单项
          // 静态路由定义在 /router/routes/modules 和 /router/routes/static
          const staticRoutePaths = ['/dashboard', '/medail'];
          const staticRouteNames = ['Dashboard', 'Medail', '概览', '静态资源'];

          const filteredBackendMenus = backendMenus.filter((menu: any) => {
            const menuPath = menu.path || menu.route || menu.url;
            const menuName = menu.meta?.title || menu.title || menu.name;

            const isDuplicate = staticRoutePaths.includes(menuPath) || staticRouteNames.includes(menuName);

            if (isDuplicate) {
              console.log(`🚫 Filtering duplicate menu from backend: ${menuName} (${menuPath})`);
            }
            return !isDuplicate;
          });

          console.log(`📊 Backend menus filtered: ${backendMenus.length} -> ${filteredBackendMenus.length}`);
          
          const dynamicRoutes = transformMenusToRoutes(filteredBackendMenus);
          console.log(`✅ Transformed ${dynamicRoutes.length} dynamic routes.`);
          
          return dynamicRoutes;
        } catch (error) {
          console.warn('⚠️ Failed to fetch backend menus, returning empty array:', error);
          return []; // Return empty array on failure
        }
        
      } catch (error) {
        console.error('❌ 路由生成失败:', error);
        
        // 如果完全失败，至少返回静态路由
        const staticRoutes = convertStaticRoutesToStringComponent(accessRoutes);
        console.log('🔄 使用静态路由作为降级方案:', staticRoutes);
        return staticRoutes;
      }
    },
    // 可以指定没有权限跳转403页面
    forbiddenComponent,
    // 如果 route.meta.menuVisibleWithForbidden = true
    layoutMap,
    pageMap,
  });
}

export { generateAccess };