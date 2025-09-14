import { requestClient } from '#/api/request';

// 菜单类型枚举
export enum MenuType {
  DIRECTORY = 1, // 目录
  MENU = 2,      // 菜单
  BUTTON = 3,    // 按钮
}

// 菜单数据接口
export interface MenuData {
  id: number;
  name: string;
  path: string;
  component: string;
  icon?: string;
  orderNum: number;
  sort?: number; // 兼容字段
  visible: boolean;
  external: boolean;
  cache: boolean;
  permission?: string;
  type: MenuType | string | number; // 兼容不同类型
  status: boolean;
  parentId?: number;
  buttonKey?: string;
  children?: MenuData[];
  hasChildren?: boolean; // 用于el-table树形表格
  createdAt: string;
  updatedAt: string;
  // 新增创建者和更新者字段
  createdBy?: number;
  updatedBy?: number;
  createdByName?: string;
  updatedByName?: string;
}

// 创建菜单DTO
export interface CreateMenuDto {
  name: string;
  path: string;
  component?: string;
  icon?: string;
  orderNum?: number;
  sort?: number; // 兼容字段
  visible?: boolean;
  external?: boolean;
  cache?: boolean;
  permission?: string;
  type: MenuType | string | number;
  status?: boolean;
  parentId?: number | null;
  buttonKey?: string;
  isHidden?: boolean;
  isKeepAlive?: boolean;
  isAffix?: boolean;
  remark?: string;
}

// 更新菜单DTO
export interface UpdateMenuDto extends Partial<CreateMenuDto> {}

// 查询菜单DTO
export interface QueryMenuDto {
  name?: string;
  type?: MenuType;
  status?: boolean;
}

// API响应格式
interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
}

/**
 * 获取菜单树
 */
export function getMenuTreeApi(params?: QueryMenuDto): Promise<ApiResponse<MenuData[]>> {
  return requestClient.get('/menus/tree', { params });
}

/**
 * 获取菜单列表
 */
export function getMenuListApi(params?: QueryMenuDto): Promise<ApiResponse<MenuData[]>> {
  return requestClient.get('/menus', { params });
}

/**
 * 根据ID获取菜单详情
 */
export function getMenuByIdApi(id: number): Promise<ApiResponse<MenuData>> {
  return requestClient.get(`/menus/${id}`);
}

/**
 * 创建菜单
 */
export function createMenuApi(data: CreateMenuDto): Promise<ApiResponse<MenuData>> {
  return requestClient.post('/menus', data);
}

/**
 * 更新菜单
 */
export function updateMenuApi(id: number, data: UpdateMenuDto): Promise<ApiResponse<MenuData>> {
  return requestClient.put(`/menus/${id}`, data);
}

/**
 * 删除菜单
 */
export function deleteMenuApi(id: number): Promise<ApiResponse<{}>> {
  return requestClient.delete(`/menus/${id}`);
}

/**
 * 批量删除菜单
 */
export function batchDeleteMenuApi(ids: number[]): Promise<ApiResponse<{}>> {
  return requestClient.post('/menus/batch-delete', { ids });
}

/**
 * 更新菜单状态
 */
export function updateMenuStatusApi(id: number, status: boolean): Promise<ApiResponse<MenuData>> {
  return requestClient.put(`/menus/${id}/status`, { status });
}

/**
 * 更新菜单排序
 */
export function updateMenuSortApi(id: number, sort: number): Promise<ApiResponse<MenuData>> {
  return requestClient.put(`/menus/${id}/sort`, { sort });
}