import type { UserInfo } from '@vben/types';
import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from '#/api/request';
import { useUserStore } from '@vben/stores';

// API 响应包装类型
interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg: string;
}

// 扩展用户信息接口，包含菜单字段
interface ExtendedUserInfo extends UserInfo {
  menus?: any[]; // 菜单数据
  permissions?: string[]; // 权限数据
  roleInfo?: any[]; // 角色详细信息
}

/**
 * 获取用户详细信息
 */
export async function getProfile(): Promise<ExtendedUserInfo> {
  const userInfo = await requestClient.get<ExtendedUserInfo>('/auth/profile');
  
  if (!userInfo) {
    throw new Error('获取用户信息失败');
  }
  
  console.log('📋 获取到的用户信息:', userInfo);
  console.log('📋 用户菜单数据:', userInfo.menus);
  
  // 如果有菜单数据，打印详细的结构
  if (userInfo.menus && Array.isArray(userInfo.menus)) {
    console.log(`📊 菜单数据统计: 共 ${userInfo.menus.length} 个一级菜单`);
    userInfo.menus.forEach((menu, index) => {
      console.log(`🗺️ 菜单${index + 1}:`, {
        name: menu.name,
        title: menu.title,
        path: menu.path,
        component: menu.component,
        type: menu.type,
        children: menu.children ? `${menu.children.length}个子菜单` : '无子菜单'
      });
      
      if (menu.children && Array.isArray(menu.children)) {
        menu.children.forEach((child: any, childIndex: number) => {
          console.log(`  🔹 子菜单${childIndex + 1}:`, {
            name: child.name,
            title: child.title,
            path: child.path,
            component: child.component,
            type: child.type
          });
        });
      }
    });
  } else {
    console.warn('⚠️ 用户信息中没有菜单数据或格式不正确');
  }
  
  // 将用户信息保存到 Pinia store
  const userStore = useUserStore();
  userStore.setUserInfo(userInfo as any);
  
  return userInfo;
}

/**
 * 获取用户信息
 */
export async function getUserInfoApi(): Promise<ExtendedUserInfo> {
  // 调用getProfile获取用户信息并保存到store
  const userInfo = await getProfile();
  return userInfo;
}
