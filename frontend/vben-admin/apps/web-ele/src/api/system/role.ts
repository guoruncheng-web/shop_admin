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

// API 响应包装类型
interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg: string;
}

// API 函数
/**
 * 获取角色列表
 */
export async function getRoleListApi(params?: QueryRoleParams) {
  const response = await requestClient.get<ApiResponse<RoleListResult>>('/roles', { params });
  
  if (response && response.code === 200 && response.data) {
    return response.data;
  }
  
  throw new Error(response?.msg || '获取角色列表失败');
}

/**
 * 获取所有角色（不分页，用于下拉选择）
 */
export async function getAllRolesApi() {
  const response = await requestClient.get<ApiResponse<Role[]>>('/roles/all');
  
  if (response && response.code === 200 && response.data) {
    return response.data;
  }
  
  throw new Error(response?.msg || '获取角色列表失败');
}

/**
 * 获取角色详情
 */
export async function getRoleDetailApi(id: number) {
  const response = await requestClient.get<ApiResponse<Role>>(`/roles/${id}`);
  
  if (response && response.code === 200 && response.data) {
    return response.data;
  }
  
  throw new Error(response?.msg || '获取角色详情失败');
}

/**
 * 创建角色
 */
export async function createRoleApi(data: CreateRoleParams) {
  const response = await requestClient.post<ApiResponse<Role>>('/roles', data);
  
  if (response && response.code === 200 && response.data) {
    return response.data;
  }
  
  throw new Error(response?.msg || '创建角色失败');
}

/**
 * 更新角色
 */
export async function updateRoleApi(id: number, data: UpdateRoleParams) {
  const response = await requestClient.put<ApiResponse<Role>>(`/roles/${id}`, data);
  
  if (response && response.code === 200 && response.data) {
    return response.data;
  }
  
  throw new Error(response?.msg || '更新角色失败');
}

/**
 * 删除角色
 */
export async function deleteRoleApi(id: number) {
  const response = await requestClient.delete<ApiResponse<void>>(`/roles/${id}`);
  
  if (response && response.code === 200) {
    return;
  }
  
  throw new Error(response?.msg || '删除角色失败');
}

/**
 * 批量删除角色
 */
export async function batchDeleteRoleApi(ids: number[]) {
  const response = await requestClient.post<ApiResponse<void>>('/roles/batch-delete', { ids });
  
  if (response && response.code === 200) {
    return;
  }
  
  throw new Error(response?.msg || '批量删除角色失败');
}

/**
 * 切换角色状态
 */
export async function toggleRoleStatusApi(id: number) {
  const response = await requestClient.put<ApiResponse<Role>>(`/roles/${id}/toggle-status`);
  
  if (response && response.code === 200 && response.data) {
    return response.data;
  }
  
  throw new Error(response?.msg || '切换角色状态失败');
}