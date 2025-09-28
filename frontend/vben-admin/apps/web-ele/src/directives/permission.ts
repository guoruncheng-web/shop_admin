/**
 * 全局权限指令
 * 用于根据后端返回的菜单按钮权限控制按钮的显示与隐藏
 * @Example v-permission="'btn:add'" 
 * @Example v-permission="['btn:add', 'btn:edit']" 
 * @Example v-permission:code="'system:user:add'"
 * @Example v-permission:button="'add'"
 */
import type { App, Directive, DirectiveBinding } from 'vue';

import { useAccessStore, useUserStore } from '@vben/stores';

// 权限检查函数
function checkPermission(value: string | string[], arg?: string): boolean {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  
  if (!value) return false;
  
  // 将单个权限转为数组
  const permissions = Array.isArray(value) ? value : [value];
  
  // 获取用户的所有权限码
  const userCodes = new Set(accessStore.accessCodes || []);
  
  // 获取用户的按钮权限（从菜单中提取按钮权限）
  const userMenus = userStore.userInfo?.menus || [];
  const buttonPermissions = extractButtonPermissions(userMenus);
  const userButtons = new Set(buttonPermissions);
  
  // 根据参数类型决定检查方式
  if (arg === 'code') {
    // 检查权限码
    return permissions.some(permission => userCodes.has(permission));
  } else if (arg === 'button') {
    // 检查按钮权限
    return permissions.some(permission => userButtons.has(permission));
  } else {
    // 默认检查方式：先检查权限码，再检查按钮权限
    return permissions.some(permission => 
      userCodes.has(permission) || userButtons.has(permission)
    );
  }
}

// 从菜单树中递归提取按钮权限
function extractButtonPermissions(menus: any[]): string[] {
  const permissions: string[] = [];
  
  function traverse(menuList: any[]) {
    for (const menu of menuList) {
      // 如果是按钮类型的菜单项（type=3）
      if (menu.type === 3 && menu.status) {
        // 优先使用 buttonKey，其次使用 permission 或 code
        const buttonPermission = menu.buttonKey || menu.permission || menu.code;
        if (buttonPermission) {
          permissions.push(buttonPermission);
        }
      }
      
      // 递归处理子菜单
      if (menu.children && Array.isArray(menu.children)) {
        traverse(menu.children);
      }
    }
  }
  
  traverse(menus);
  return permissions;
}

// 指令更新函数
function updatePermission(el: Element, binding: DirectiveBinding<string | string[]>) {
  const hasPermission = checkPermission(binding.value, binding.arg);
  
  if (!hasPermission) {
    // 没有权限时隐藏元素
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }
}

// 指令挂载函数
const mounted = (el: Element, binding: DirectiveBinding<string | string[]>) => {
  updatePermission(el, binding);
};

// 指令更新函数
const updated = (el: Element, binding: DirectiveBinding<string | string[]>) => {
  updatePermission(el, binding);
};

// 权限指令定义
const permissionDirective: Directive = {
  mounted,
  updated,
};

// 注册权限指令函数
export function registerPermissionDirective(app: App) {
  app.directive('permission', permissionDirective);
}

// 权限检查工具函数（可在组件中使用）
export function usePermission() {
  return {
    hasPermission: checkPermission,
    checkButtonPermission: (permission: string | string[]) => checkPermission(permission, 'button'),
    checkCodePermission: (permission: string | string[]) => checkPermission(permission, 'code'),
  };
}