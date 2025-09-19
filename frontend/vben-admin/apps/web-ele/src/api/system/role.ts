import { requestClient } from '#/api/request';

// API 响应包装类型
interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg: string;
}

// 角色相关的类型定义
export interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  code: string;
  type: string;
}

export interface CreateRoleParams {
  name: string;
  code: string;
  description?: string;
  status?: number;
  permissionIds?: number[];
}

export interface UpdateRoleParams {
  name?: string;
  code?: string;
  description?: string;
  status?: number;
  permissionIds?: number[];
}

export interface QueryRoleParams {
  page?: number;
  pageSize?: number;
  name?: string;
  code?: string;
  status?: number;
}

export interface RoleListResult {
  list: Role[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// API 函数
/**
 * 获取角色列表
 */
export function getRoleListApi(params?: QueryRoleParams) {
  return requestClient.get<RoleListResult>('/roles', { params });
}

/**
 * 获取所有角色（不分页，用于下拉选择）
 */
export function getAllRolesApi() {
  return requestClient.get<Role[]>('/roles/all');
}

/**
 * 获取角色详情
 */
export function getRoleDetailApi(id: number) {
  return requestClient.get<Role>(`/roles/${id}`);
}

/**
 * 创建角色
 */
export function createRoleApi(data: CreateRoleParams) {
  return requestClient.post<Role>('/roles', data);
}

/**
 * 更新角色
 */
export function updateRoleApi(id: number, data: UpdateRoleParams) {
  return requestClient.put<Role>(`/roles/${id}`, data);
}

/**
 * 删除角色
 */
export function deleteRoleApi(id: number) {
  return requestClient.delete<void>(`/roles/${id}`);
}

/**
 * 批量删除角色
 */
export function batchDeleteRoleApi(ids: number[]) {
  return requestClient.post<void>('/roles/batch-delete', { ids });
}

/**
 * 切换角色状态
 */
export function toggleRoleStatusApi(id: number) {
  return requestClient.put<Role>(`/roles/${id}/toggle-status`);
}