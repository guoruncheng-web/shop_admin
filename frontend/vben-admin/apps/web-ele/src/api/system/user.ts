import { requestClient } from '#/api/request';

// API 响应包装类型
interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg: string;
}

// 用户相关的类型定义
export interface User {
  id: number;
  username: string;
  realName: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: number;
  lastLoginTime?: string;
  lastLoginIp?: string;
  createdAt: string;
  updatedAt: string;
  roles?: Role[];
}

export interface Role {
  id: number;
  name: string;
  code: string;
}

export interface CreateUserParams {
  username: string;
  password: string;
  realName: string;
  email: string;
  phone?: string;
  avatar?: string;
  status?: number;
  roleIds?: number[];
}

export interface UpdateUserParams {
  username?: string;
  realName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status?: number;
  roleIds?: number[];
}

export interface QueryUserParams {
  page?: number;
  pageSize?: number;
  username?: string;
  realName?: string;
  email?: string;
  status?: number;
}

export interface UserListResult {
  list: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
}

// API 函数
/**
 * 获取用户列表
 */
export async function getUserListApi(params?: QueryUserParams) {
  const response = await requestClient.get<ApiResponse<UserListResult>>('/users', { params });
  
  if (response && response.code === 200 && response.data) {
    return response.data;
  }
  
  throw new Error(response?.msg || '获取用户列表失败');
}

/**
 * 获取用户详情
 */
export async function getUserDetailApi(id: number) {
  const response = await requestClient.get<ApiResponse<User>>(`/users/${id}`);
  
  if (response && response.code === 200 && response.data) {
    return response.data;
  }
  
  throw new Error(response?.msg || '获取用户详情失败');
}

/**
 * 创建用户
 */
export async function createUserApi(data: CreateUserParams) {
  const response = await requestClient.post<ApiResponse<User>>('/users', data);
  
  if (response && response.code === 200 && response.data) {
    return response.data;
  }
  
  throw new Error(response?.msg || '创建用户失败');
}

/**
 * 更新用户
 */
export async function updateUserApi(id: number, data: UpdateUserParams) {
  const response = await requestClient.put<ApiResponse<User>>(`/users/${id}`, data);
  
  if (response && response.code === 200 && response.data) {
    return response.data;
  }
  
  throw new Error(response?.msg || '更新用户失败');
}

/**
 * 删除用户
 */
export async function deleteUserApi(id: number) {
  const response = await requestClient.delete<ApiResponse<void>>(`/users/${id}`);
  
  if (response && response.code === 200) {
    return;
  }
  
  throw new Error(response?.msg || '删除用户失败');
}

/**
 * 批量删除用户
 */
export async function batchDeleteUserApi(ids: number[]) {
  const response = await requestClient.post<ApiResponse<void>>('/users/batch-delete', { ids });
  
  if (response && response.code === 200) {
    return;
  }
  
  throw new Error(response?.msg || '批量删除用户失败');
}

/**
 * 修改密码
 */
export async function changePasswordApi(id: number, data: ChangePasswordParams) {
  const response = await requestClient.put<ApiResponse<void>>(`/users/${id}/change-password`, data);
  
  if (response && response.code === 200) {
    return;
  }
  
  throw new Error(response?.msg || '修改密码失败');
}

/**
 * 重置密码
 */
export async function resetPasswordApi(id: number, newPassword: string) {
  const response = await requestClient.put<ApiResponse<void>>(`/users/${id}/reset-password`, { newPassword });
  
  if (response && response.code === 200) {
    return;
  }
  
  throw new Error(response?.msg || '重置密码失败');
}

/**
 * 切换用户状态
 */
export async function toggleUserStatusApi(id: number) {
  const response = await requestClient.put<ApiResponse<User>>(`/users/${id}/toggle-status`);
  
  if (response && response.code === 200 && response.data) {
    return response.data;
  }
  
  throw new Error(response?.msg || '切换用户状态失败');
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUserInfoApi() {
  const response = await requestClient.get<ApiResponse<User>>('/users/info');
  
  if (response && response.code === 200 && response.data) {
    return response.data;
  }
  
  throw new Error(response?.msg || '获取用户信息失败');
}