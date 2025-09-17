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
export function getUserListApi(params?: QueryUserParams) {
  return requestClient.get<ApiResponse<UserListResult>>('/users', { params });
}

/**
 * 获取用户详情
 */
export function getUserDetailApi(id: number) {
  return requestClient.get<ApiResponse<User>>(`/users/${id}`);
}

/**
 * 创建用户
 */
export function createUserApi(data: CreateUserParams) {
  return requestClient.post<ApiResponse<User>>('/users', data);
}

/**
 * 更新用户
 */
export function updateUserApi(id: number, data: UpdateUserParams) {
  return requestClient.put<ApiResponse<User>>(`/users/${id}`, data);
}

/**
 * 删除用户
 */
export function deleteUserApi(id: number) {
  return requestClient.delete<ApiResponse>(`/users/${id}`);
}

/**
 * 批量删除用户
 */
export function batchDeleteUserApi(ids: number[]) {
  return requestClient.post<ApiResponse>('/users/batch-delete', { ids });
}

/**
 * 修改密码
 */
export function changePasswordApi(id: number, data: ChangePasswordParams) {
  return requestClient.put<ApiResponse>(`/users/${id}/change-password`, data);
}

/**
 * 重置密码
 */
export function resetPasswordApi(id: number, newPassword: string) {
  return requestClient.put<ApiResponse>(`/users/${id}/reset-password`, { newPassword });
}

/**
 * 切换用户状态
 */
export function toggleUserStatusApi(id: number) {
  return requestClient.put<ApiResponse<User>>(`/users/${id}/toggle-status`);
}

/**
 * 获取当前用户信息
 */
export function getCurrentUserInfoApi() {
  return requestClient.get<ApiResponse<User>>('/users/info');
}