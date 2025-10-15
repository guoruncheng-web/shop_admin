import { SetMetadata } from '@nestjs/common';

export interface OperationLogOptions {
  module: string;
  operation: string;
  description: string;
  includeParams?: boolean;
  includeResponse?: boolean;
  businessIdField?: string; // 从请求参数中提取业务ID的字段名
}

export const OPERATION_LOG_KEY = 'operation_log';

/**
 * 操作日志装饰器
 * @param options 操作日志配置
 */
export const OperationLog = (options: OperationLogOptions) =>
  SetMetadata(OPERATION_LOG_KEY, options);

// 预定义的常用操作类型
export const OperationTypes = {
  // 用户管理
  USER_CREATE: { operation: 'create', description: '创建用户' },
  USER_UPDATE: { operation: 'update', description: '更新用户' },
  USER_DELETE: { operation: 'delete', description: '删除用户' },
  USER_RESET_PASSWORD: { operation: 'reset_password', description: '重置密码' },
  USER_CHANGE_STATUS: {
    operation: 'change_status',
    description: '修改用户状态',
  },

  // 角色管理
  ROLE_CREATE: { operation: 'create', description: '创建角色' },
  ROLE_UPDATE: { operation: 'update', description: '更新角色' },
  ROLE_DELETE: { operation: 'delete', description: '删除角色' },
  ROLE_ASSIGN_PERMISSIONS: {
    operation: 'assign_permissions',
    description: '分配权限',
  },

  // 权限管理
  PERMISSION_CREATE: { operation: 'create', description: '创建权限' },
  PERMISSION_UPDATE: { operation: 'update', description: '更新权限' },
  PERMISSION_DELETE: { operation: 'delete', description: '删除权限' },

  // 菜单管理
  MENU_CREATE: { operation: 'create', description: '创建菜单' },
  MENU_UPDATE: { operation: 'update', description: '更新菜单' },
  MENU_DELETE: { operation: 'delete', description: '删除菜单' },

  // 商品管理
  PRODUCT_CREATE: { operation: 'create', description: '创建商品' },
  PRODUCT_UPDATE: { operation: 'update', description: '更新商品' },
  PRODUCT_DELETE: { operation: 'delete', description: '删除商品' },
  PRODUCT_CHANGE_STATUS: {
    operation: 'change_status',
    description: '修改商品状态',
  },

  // 分类管理
  CATEGORY_CREATE: { operation: 'create', description: '创建分类' },
  CATEGORY_UPDATE: { operation: 'update', description: '更新分类' },
  CATEGORY_DELETE: { operation: 'delete', description: '删除分类' },

  // 订单管理
  ORDER_CREATE: { operation: 'create', description: '创建订单' },
  ORDER_UPDATE: { operation: 'update', description: '更新订单' },
  ORDER_DELETE: { operation: 'delete', description: '删除订单' },
  ORDER_CHANGE_STATUS: {
    operation: 'change_status',
    description: '修改订单状态',
  },

  // 轮播图管理
  BANNER_CREATE: { operation: 'create', description: '创建轮播图' },
  BANNER_UPDATE: { operation: 'update', description: '更新轮播图' },
  BANNER_DELETE: { operation: 'delete', description: '删除轮播图' },

  // 文件上传
  FILE_UPLOAD: { operation: 'upload', description: '上传文件' },
  FILE_DELETE: { operation: 'delete', description: '删除文件' },

  // 商户管理
  MERCHANT_CREATE: { operation: 'create', description: '创建商户' },
  MERCHANT_UPDATE: { operation: 'update', description: '更新商户' },
  MERCHANT_DELETE: { operation: 'delete', description: '删除商户' },
  MERCHANT_CHANGE_STATUS: {
    operation: 'change_status',
    description: '修改商户状态',
  },
  MERCHANT_CERTIFICATION: {
    operation: 'certification',
    description: '商户认证',
  },
  MERCHANT_RESET_PASSWORD: {
    operation: 'reset_password',
    description: '重置管理员密码',
  },
  MERCHANT_REGENERATE_KEYS: {
    operation: 'regenerate_keys',
    description: '重新生成API密钥',
  },

  // 系统管理
  SYSTEM_CONFIG_UPDATE: { operation: 'update', description: '更新系统配置' },
  SYSTEM_CACHE_CLEAR: { operation: 'clear_cache', description: '清除缓存' },
  SYSTEM_LOG_CLEAR: { operation: 'clear_logs', description: '清除日志' },

  // 通用操作
  VIEW: { operation: 'view', description: '查看' },
  EXPORT: { operation: 'export', description: '导出' },
  IMPORT: { operation: 'import', description: '导入' },
} as const;

// 模块名称常量
export const ModuleNames = {
  USER: 'user',
  ROLE: 'role',
  PERMISSION: 'permission',
  MENU: 'menu',
  PRODUCT: 'product',
  CATEGORY: 'category',
  ORDER: 'order',
  BANNER: 'banner',
  FILE: 'file',
  MERCHANT: 'merchant',
  SYSTEM: 'system',
  AUTH: 'auth',
} as const;
