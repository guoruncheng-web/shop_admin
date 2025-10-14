import { SetMetadata } from '@nestjs/common';

export interface TypesOptions {
  permission: string;
  name: string;
  module?: string;
  operation?: string;
  includeParams?: boolean;
  includeResponse?: boolean;
}

export const TYPES_KEY = 'types';

/**
 * 权限验证装饰器
 * 用于验证用户权限并记录操作日志
 * @param options 权限配置选项
 */
export const Types = (
  permission: string,
  options: Omit<TypesOptions, 'permission'>,
) => SetMetadata(TYPES_KEY, { permission, ...options });

/**
 * 权限守卫使用的元数据键
 */
export const PERMISSION_KEY = 'permission';

/**
 * 操作日志使用的元数据键
 */
export const OPERATION_LOG_META_KEY = 'operation_log_meta';