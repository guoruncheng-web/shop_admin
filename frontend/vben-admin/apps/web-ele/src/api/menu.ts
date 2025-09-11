import { requestClient } from './request';

// 菜单类型枚举
export enum MenuType {
  DIRECTORY = 'directory', // 目录
  MENU = 'menu',          // 菜单
  BUTTON = 'button'       // 按钮
}

// 菜单状态枚举
export enum MenuStatus {
  ENABLED = 'enabled',   // 启用
  DISABLED = 'disabled'  // 禁用
}

// 菜单信息接口
export interface MenuInfo {
  id: number;
  name: string;
  path?: string;
  component?: string;
  icon?: string;
  type: MenuType;
  status: MenuStatus;
  sort: number;
  parentId?: number;
  permission?: string;
  isHidden: boolean;
  isKeepAlive: boolean;
  isAffix: boolean;
  children?: MenuInfo[];
  createdAt: string;
  updatedAt: string;
}

// 创建菜单DTO
export interface CreateMenuDto {
  name: string;
  path?: string;
  component?: string;
  icon?: string;
  type: MenuType;
  status: MenuStatus;
  sort: number;
  parentId?: number;
  permission?: string;
  isHidden: boolean;
  isKeepAlive: boolean;
  isAffix: boolean;
}

// 更新菜单DTO
export interface UpdateMenuDto extends Partial<CreateMenuDto> {}

// 查询菜单DTO
export interface QueryMenuDto {
  name?: string;
  type?: MenuType;
  status?: MenuStatus;
  parentId?: number;
  page?: number;
  limit?: number;
}

// API响应格式
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 分页响应格式
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// 获取菜单树
export const getMenuTreeApi = (): Promise<ApiResponse<MenuInfo[]>> => {
  return requestClient.get('/menus/tree');
};

// 获取菜单列表（分页）
export const getMenuListApi = (params: QueryMenuDto): Promise<ApiResponse<PaginatedResponse<MenuInfo>>> => {
  return requestClient.get('/menus', { params });
};

// 获取菜单详情
export const getMenuDetailApi = (id: number): Promise<ApiResponse<MenuInfo>> => {
  return requestClient.get(`/menus/${id}`);
};

// 创建菜单
export const createMenuApi = (data: CreateMenuDto): Promise<ApiResponse<MenuInfo>> => {
  return requestClient.post('/menus', data);
};

// 更新菜单
export const updateMenuApi = (id: number, data: UpdateMenuDto): Promise<ApiResponse<MenuInfo>> => {
  return requestClient.put(`/menus/${id}`, data);
};

// 更新菜单状态
export const updateMenuStatusApi = (id: number, status: MenuStatus): Promise<ApiResponse<MenuInfo>> => {
  return requestClient.put(`/menus/${id}/status`, { status });
};

// 更新菜单排序
export const updateMenuSortApi = (id: number, sort: number): Promise<ApiResponse<MenuInfo>> => {
  return requestClient.put(`/menus/${id}/sort`, { sort });
};

// 删除菜单
export const deleteMenuApi = (id: number): Promise<ApiResponse<void>> => {
  return requestClient.delete(`/menus/${id}`);
};

// 批量删除菜单
export const batchDeleteMenuApi = (ids: number[]): Promise<ApiResponse<void>> => {
  return requestClient.delete('/menus/batch', { data: { ids } });
};

// 获取用户菜单（用于导航）
export const getUserMenusApi = (): Promise<ApiResponse<MenuInfo[]>> => {
  return requestClient.get('/menus/user');
};