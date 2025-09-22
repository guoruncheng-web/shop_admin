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

    console.log(`✅ 转换完成的路由:`, route);
    return route;
  });

  console.log(`🎉 菜单转换完成，共生成 ${routes.length} 个路由`);
  console.log('📋 最终路由数据:', JSON.stringify(routes, null, 2));
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
        console.log('🚀 fetchMenuListAsync 函数被调用了！');
        console.log('🚀 开始获取路由数据...');
        
        // 1. 获取静态路由（框架内置路由）
        console.log('📋 获取静态路由:', accessRoutes);
        const staticRoutes = convertStaticRoutesToStringComponent(accessRoutes);
        console.log('✅ 静态路由转换完成:', staticRoutes);
        
        // 2. 获取后端动态菜单数据
        let dynamicRoutes: RouteRecordStringComponent[] = [];
        try {
          console.log('🌐 开始获取用户资料和菜单数据...');
          
          // 🔄 复用已经获取的用户信息，避免重复调用 /auth/profile 接口
          const { useUserStore } = await import('@vben/stores');
          const userStore = useUserStore();
          
          let userProfile = userStore.userInfo;
          
          // 如果 store 中没有用户信息，才调用 API
          if (!userProfile) {
            console.log('📞 用户信息不存在，调用 getProfile API...');
            userProfile = await getProfile();
          } else {
            console.log('✅ 复用已存在的用户信息:', userProfile);
          }
          
          // 提取菜单数据
          const menus = userProfile.menus || [];
          console.log('📋 从 profile 提取到的菜单数据:', menus);
          
          // 转换菜单数据为路由格式
          dynamicRoutes = transformMenusToRoutes(menus);
          console.log('✅ 动态路由转换完成:', dynamicRoutes);
          
        } catch (error) {
          console.warn('⚠️ 获取后端菜单数据失败，仅使用静态路由:', error);
        }
        
        // 3. 合并静态路由和动态路由
        const allRoutes = [...staticRoutes, ...dynamicRoutes];
        console.log('🎯 最终合并的路由数据:', allRoutes);
        console.log(`📊 路由统计: 静态路由 ${staticRoutes.length} 个，动态路由 ${dynamicRoutes.length} 个，总计 ${allRoutes.length} 个`);
        
        return allRoutes;
        
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