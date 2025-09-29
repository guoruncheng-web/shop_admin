import { requestClient } from '#/api/request';

// API 响应包装类型
interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg: string;
}

// 权限相关的类型定义
export interface Permission {
  id: number;
  name: string;
  code: string;
  type: 'menu' | 'button' | 'api';
  parentId?: number;
  path?: string;
  component?: string;
  icon?: string;
  sort?: number;
  status: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
  children?: Permission[];
}

export interface CreatePermissionParams {
  name: string;
  code: string;
  type: 'menu' | 'button' | 'api';
  parentId?: number;
  path?: string;
  component?: string;
  icon?: string;
  sort?: number;
  status?: number;
  description?: string;
}

export interface UpdatePermissionParams {
  name?: string;
  code?: string;
  type?: 'menu' | 'button' | 'api';
  parentId?: number;
  path?: string;
  component?: string;
  icon?: string;
  sort?: number;
  status?: number;
  description?: string;
}

export interface QueryPermissionParams {
  page?: number;
  pageSize?: number;
  name?: string;
  code?: string;
  type?: string;
  status?: number;
  parentId?: number;
}

export interface PermissionListResult {
  list: Permission[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 角色权限关联
export interface RolePermission {
  roleId: number;
  permissionId: number;
  permission?: Permission;
}

export interface AssignRolePermissionsParams {
  roleId: number;
  permissionIds: number[];
}

// API 函数

/**
 * 获取权限列表（分页）
 */
export async function getPermissionListApi(params?: QueryPermissionParams) {
  const response = await requestClient.get<ApiResponse<PermissionListResult>>('/permissions', { params });
  
  if (response && response.code === 200 && response.data) {
    return response.data;
  }
  
  throw new Error(response?.msg || '获取权限列表失败');
}

/**
 * 获取所有权限（树形结构，不分页）
 */
export async function getAllPermissionsApi() {
  const response = await requestClient.get<ApiResponse<Permission[]>>('/permissions/all');
  
  if (response && response.code === 200 && response.data) {
    return response.data;
  }
  
  throw new Error(response?.msg || '获取权限列表失败');
}

/**
 * 获取权限树形结构
 */
export async function getPermissionTreeApi(params?: QueryPermissionParams) {
  const response = await requestClient.get<ApiResponse<Permission[]>>('/permissions/tree', { params });
  
  // 检查响应格式，确保正确提取数据
  if (response && response.code === 200 && response.data) {
    return response.data;
  }
  
  // 如果响应格式不符合预期，尝试直接返回响应（可能是数组格式）
  if (Array.isArray(response)) {
    return response;
  }
  
  throw new Error(response?.msg || '获取权限树失败');
}

/**
 * 获取权限详情
 */
export async function getPermissionDetailApi(id: number) {
  const response = await requestClient.get<ApiResponse<Permission>>(`/permissions/${id}`);
  
  if (response && response.code === 200 && response.data) {
    return response.data;
  }
  
  throw new Error(response?.msg || '获取权限详情失败');
}

/**
 * 创建权限
 */
export async function createPermissionApi(data: CreatePermissionParams) {
  const response = await requestClient.post<ApiResponse<Permission>>('/permissions', data);
  
  if (response && response.code === 200 && response.data) {
    return response.data;
  }
  
  throw new Error(response?.msg || '创建权限失败');
}

/**
 * 更新权限
 */
export async function updatePermissionApi(id: number, data: UpdatePermissionParams) {
  const response = await requestClient.put<ApiResponse<Permission>>(`/permissions/${id}`, data);
  
  if (response && response.code === 200 && response.data) {
    return response.data;
  }
  
  throw new Error(response?.msg || '更新权限失败');
}

/**
 * 删除权限
 */
export async function deletePermissionApi(id: number) {
  const response = await requestClient.delete<ApiResponse<void>>(`/permissions/${id}`);
  
  if (response && response.code === 200) {
    return;
  }
  
  throw new Error(response?.msg || '删除权限失败');
}

/**
 * 批量删除权限
 */
export async function batchDeletePermissionApi(ids: number[]) {
  const response = await requestClient.post<ApiResponse<void>>('/permissions/batch-delete', { ids });
  
  if (response && response.code === 200) {
    return;
  }
  
  throw new Error(response?.msg || '批量删除权限失败');
}

/**
 * 切换权限状态
 */
export async function togglePermissionStatusApi(id: number) {
  const response = await requestClient.put<ApiResponse<Permission>>(`/permissions/${id}/toggle-status`);
  
  if (response && response.code === 200 && response.data) {
    return response.data;
  }
  
  throw new Error(response?.msg || '切换权限状态失败');
}

// 角色权限相关 API

/**
 * 获取角色的权限列表
 */
export async function getRolePermissionsApi(roleId: number) {
  const response = await requestClient.get<ApiResponse<Permission[]>>(`/roles/${roleId}/permissions`);
  
  // 检查响应格式，确保正确提取数据
  if (response && response.code === 200 && response.data) {
    return response.data;
  }
  
  // 如果响应格式不符合预期，尝试直接返回响应（可能是数组格式）
  if (Array.isArray(response)) {
    return response;
  }
  
  throw new Error(response?.msg || '获取角色权限失败');
}

/**
 * 分配角色权限
 */
export async function assignRolePermissionsApi(roleId: number, permissionIds: number[]) {
  const response = await requestClient.post<ApiResponse<void>>(`/roles/${roleId}/permissions`, {
    permissionIds,
  });
  
  if (response && response.code === 200) {
    return;
  }
  
  throw new Error(response?.msg || '分配角色权限失败');
}

/**
 * 移除角色权限
 */
export async function removeRolePermissionsApi(roleId: number, permissionIds: number[]) {
  const response = await requestClient.delete<ApiResponse<void>>(`/roles/${roleId}/permissions`, {
    data: { permissionIds },
  });
  
  if (response && response.code === 200) {
    return;
  }
  
  throw new Error(response?.msg || '移除角色权限失败');
}

/**
 * 获取用户的权限列表
 */
export async function getUserPermissionsApi(userId: number) {
  const response = await requestClient.get<ApiResponse<Permission[]>>(`/users/${userId}/permissions`);
  
  if (response && response.code === 200 && response.data) {
    return response.data;
  }
  
  throw new Error(response?.msg || '获取用户权限失败');
}

/**
 * 检查用户是否有指定权限
 */
export async function checkUserPermissionApi(userId: number, permissionCode: string) {
  const response = await requestClient.get<ApiResponse<{ hasPermission: boolean }>>(`/users/${userId}/permissions/check`, {
    params: { permissionCode },
  });

  if (response && response.code === 200 && response.data) {
    return response.data.hasPermission;
  }

  return false;
}

// ==================== 新增：菜单权限管理 API ====================

// 菜单权限树节点类型（符合前端树组件要求）
export interface MenuPermissionNode {
  id: number;
  label: string;
  value: number;
  key: string;
  title: string;
  type: number;
  icon?: string;
  disabled?: boolean;
  children?: MenuPermissionNode[];
}

/**
 * 获取菜单权限树（用于角色权限分配）
 */
export async function getMenuPermissionTreeApi() {
  const response = await requestClient.get<ApiResponse<MenuPermissionNode[]>>('/role-permissions/menu-tree');

  if (response && response.code === 200 && response.data) {
    return response.data;
  }

  // 如果响应格式不符合预期，尝试直接返回响应
  if (Array.isArray(response)) {
    return response;
  }

  throw new Error(response?.msg || '获取菜单权限树失败');
}

/**
 * 获取角色已选中的菜单ID列表
 */
export async function getRoleSelectedMenuIdsApi(roleId: number) {
  const response = await requestClient.get<ApiResponse<number[]>>(`/role-permissions/role/${roleId}/selected-menu-ids`);

  if (response && response.code === 200 && response.data) {
    return response.data;
  }

  // 如果响应格式不符合预期，尝试直接返回响应
  if (Array.isArray(response)) {
    return response;
  }

  throw new Error(response?.msg || '获取角色菜单权限失败');
}

/**
 * 保存角色菜单权限
 */
export async function saveRoleMenuPermissionsApi(roleId: number, menuIds: number[]) {
  const response = await requestClient.post<ApiResponse<void>>(`/role-permissions/role/${roleId}/save-permissions`, {
    menuIds,
  });

  if (response && response.code === 200) {
    return;
  }

  throw new Error(response?.msg || '保存角色菜单权限失败');
}