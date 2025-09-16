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
  
  const routes: RouteRecordStringComponent[] = menus.map((menu) => {
    console.log(`📝 处理菜单: ${menu.title || menu.name}`, menu);
    
    // 处理子菜单
    const children: RouteRecordStringComponent[] = [];
    if (menu.children && Array.isArray(menu.children)) {
      menu.children.forEach((child: any) => {
        console.log(`  📝 处理子菜单: ${child.title || child.name}`, child);
        
        children.push({
          name: child.name || child.title,
          path: child.path,
          component: child.component || 'BasicLayout',
          meta: {
            title: child.title || child.name,
            icon: child.icon || 'lucide:file',
            order: child.order || 0,
            hideInMenu: child.hidden === true,
            keepAlive: child.keepAlive !== false,
          },
        });
      });
    }

    // 构建主菜单路由
    const route: RouteRecordStringComponent = {
      name: menu.name || menu.title,
      path: menu.path,
      component: menu.component || 'BasicLayout',
      meta: {
        title: menu.title || menu.name,
        icon: menu.icon || 'lucide:folder',
        order: menu.order || 0,
        hideInMenu: menu.hidden === true,
        hideChildrenInMenu: menu.hideChildrenInMenu === true,
      },
      children: children.length > 0 ? children : undefined,
    };

    console.log(`✅ 转换完成的路由:`, route);
    return route;
  });

  console.log(`🎉 菜单转换完成，共生成 ${routes.length} 个路由`);
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
  const pageMap: ComponentRecordType = import.meta.glob('../views/**/*.vue');

  const layoutMap: ComponentRecordType = {
    BasicLayout,
    IFrameView,
  };

  return await generateAccessible(preferences.app.accessMode, {
    ...options,
    fetchMenuListAsync: async () => {
      try {
        console.log('🚀 开始获取路由数据...');
        
        // 1. 获取静态路由（框架内置路由）
        console.log('📋 获取静态路由:', accessRoutes);
        const staticRoutes = convertStaticRoutesToStringComponent(accessRoutes);
        console.log('✅ 静态路由转换完成:', staticRoutes);
        
        // 2. 获取后端动态菜单数据
        let dynamicRoutes: RouteRecordStringComponent[] = [];
        try {
          console.log('🌐 开始获取用户资料和菜单数据...');
          const userProfile = await getProfile();
          console.log('✅ 成功获取用户资料:', userProfile);
          
          // 提取菜单数据
          const menus = userProfile.menus || [];
          console.log('📋 提取到的菜单数据:', menus);
          
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