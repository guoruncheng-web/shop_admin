import { requestClient } from '#/api/request';

// 菜单权限接口类型定义（与后端保持一致）
export interface MenuPermission {
  id: number;
  name: string;
  title?: string; // 菜单标题（显示名称）
  path?: string;
  component?: string;
  redirect?: string;
  icon?: string;
  activeIcon?: string;
  orderNum: number; // 排序号
  hideInMenu?: number; // 是否在菜单中隐藏：0-显示，1-隐藏
  hideChildrenInMenu?: number;
  hideInBreadcrumb?: number;
  hideInTab?: number;
  keepAlive?: number; // 是否开启KeepAlive缓存：0-关闭，1-开启
  ignoreAccess?: number;
  affixTab?: number;
  affixTabOrder?: number;
  isExternal?: number; // 是否外链：0-否，1-是
  externalLink?: string;
  iframeSrc?: string;
  openInNewWindow?: number;
  badge?: string;
  badgeType?: 'dot' | 'normal';
  badgeVariants?: string;
  authority?: string[];
  menuVisibleWithForbidden?: number;
  activePath?: string;
  maxNumOfOpenTab?: number;
  fullPathKey?: number;
  noBasicLayout?: number;
  type: number; // 菜单类型：1-目录，2-菜单，3-按钮
  status: boolean; // 状态：false-禁用，true-启用
  parentId?: number; // 父菜单ID
  level?: number;
  pathIds?: string;
  permissionId?: number;
  buttonKey?: string;
  queryParams?: Record<string, any>;
  createdBy?: number;
  updatedBy?: number;
  createdByName?: string;
  updatedByName?: string;
  createdAt?: string;
  updatedAt?: string;
  children?: MenuPermission[];
  hasChildren?: boolean;
  
  // 兼容前端字段
  code?: string; // 权限标识（前端使用）
  sort_order?: number; // 兼容字段
  parent_id?: number; // 兼容字段
  created_at?: string; // 兼容字段
  updated_at?: string; // 兼容字段
}

// 菜单表单数据类型
export interface MenuFormData {
  id?: number;
  parent_id?: number;
  parentId?: number; // 兼容后端字段
  name: string;
  title?: string;
  code?: string; // 权限标识（前端使用）
  buttonKey?: string; // 按钮权限标识（后端使用）
  permission?: string; // 权限标识（后端使用）
  type: number;
  path?: string;
  component?: string;
  icon?: string;
  sort_order?: number;
  orderNum?: number; // 后端使用的排序字段
  sort?: number; // 兼容字段
  status: boolean;
  visible?: boolean; // 是否显示
  external?: boolean; // 是否外链
  cache?: boolean; // 是否缓存
  permissionId?: number;
  remark?: string;
}

// 菜单搜索参数类型
export interface MenuSearchParams {
  name?: string;
  type?: number;
  status?: boolean; // 后端使用布尔值
  visible?: boolean;
  page?: number;
  limit?: number;
}

// API 响应类型
interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg: string;
}

/**
 * 获取菜单列表
 */
export async function getMenuListApi(params?: MenuSearchParams): Promise<MenuPermission[]> {
  try {
    console.log('🚀 调用菜单API: /menus');
    console.log('📋 请求参数:', params);
    
    const response = await requestClient.get<ApiResponse<MenuPermission[]>>('/menus', { params });
    console.log('✅ 菜单API响应:', response);
    
    // 检查响应数据结构
    if (response && typeof response === 'object') {
      // 如果响应直接是数组
      if (Array.isArray(response)) {
        console.log('📊 响应是数组格式，直接返回');
        return response;
      }
      
      // 如果响应有data字段且是数组
      if (response.data && Array.isArray(response.data)) {
        console.log('📊 响应有data字段，返回data');
        return response.data;
      }
      
      // 如果响应有其他可能的数据字段
      if (response.result && Array.isArray(response.result)) {
        console.log('📊 响应有result字段，返回result');
        return response.result;
      }
    }
    
    console.warn('⚠️ 菜单API响应格式异常:', response);
    return [];
  } catch (error: any) {
    console.error('❌ 菜单API调用失败:', error);
    
    // 如果是401错误，尝试从用户信息中获取菜单
    if (error.status === 401 || error.message?.includes('Unauthorized')) {
      console.log('🔄 尝试从用户信息中获取菜单数据...');
      try {
        const { getProfile } = await import('#/api/core/user');
        const userInfo = await getProfile();
        
        if (userInfo.menus && Array.isArray(userInfo.menus)) {
          console.log('✅ 从用户信息中获取到菜单数据:', userInfo.menus);
          // 转换菜单数据格式以匹配前端期望
          return transformUserMenusToMenuPermissions(userInfo.menus);
        }
      } catch (profileError) {
        console.error('❌ 获取用户信息也失败:', profileError);
      }
    }
    
    throw error;
  }
}

/**
 * 转换用户菜单数据为MenuPermission格式
 */
function transformUserMenusToMenuPermissions(menus: any[]): MenuPermission[] {
  return menus.map(menu => ({
    id: menu.id,
    name: menu.name || menu.title,
    title: menu.title || menu.name,
    path: menu.path,
    component: menu.component,
    icon: menu.icon,
    orderNum: menu.orderNum || menu.sort_order || 0,
    type: menu.type || 1,
    status: menu.status !== false,
    parentId: menu.parentId || menu.parent_id || 0,
    createdAt: menu.createdAt || menu.created_at,
    updatedAt: menu.updatedAt || menu.updated_at,
    children: menu.children ? transformUserMenusToMenuPermissions(menu.children) : undefined,
    // 兼容字段
    code: menu.permission || menu.buttonKey || menu.code,
    sort_order: menu.orderNum || menu.sort_order || 0,
    parent_id: menu.parentId || menu.parent_id || 0,
    created_at: menu.createdAt || menu.created_at,
    updated_at: menu.updatedAt || menu.updated_at,
  }));
}

/**
 * 获取菜单树
 */
export async function getMenuTreeApi(params?: MenuSearchParams): Promise<MenuPermission[]> {
  const response = await requestClient.get<ApiResponse<MenuPermission[]>>('/menus/tree', { params });
  return response.data;
}

/**
 * 根据ID获取菜单详情
 */
export async function getMenuByIdApi(id: number): Promise<MenuPermission> {
  const response = await requestClient.get<ApiResponse<MenuPermission>>(`/menus/${id}`);
  return response.data;
}

/**
 * 创建菜单
 */
export async function createMenuApi(data: MenuFormData): Promise<MenuPermission> {
  // 转换前端数据格式为后端格式
  const backendData = {
    name: data.name,
    title: data.title || data.name,
    path: data.path,
    component: data.component,
    icon: data.icon,
    orderNum: data.sort_order || data.orderNum || 0,
    type: data.type,
    status: data.status,
    parentId: data.parent_id || data.parentId || 0,
    permission: data.code || data.permission,
    buttonKey: data.type === 3 ? (data.code || data.buttonKey) : undefined,
    visible: data.visible !== false,
    external: data.external || false,
    cache: data.cache || false,
    permissionId: data.permissionId,
    remark: data.remark,
  };
  
  const response = await requestClient.post<ApiResponse<MenuPermission>>('/menus', backendData);
  return response.data;
}

/**
 * 更新菜单
 */
export async function updateMenuApi(id: number, data: MenuFormData): Promise<MenuPermission> {
  // 转换前端数据格式为后端格式
  const backendData = {
    name: data.name,
    title: data.title || data.name,
    path: data.path,
    component: data.component,
    icon: data.icon,
    orderNum: data.sort_order || data.orderNum || 0,
    type: data.type,
    status: data.status,
    parentId: data.parent_id || data.parentId || 0,
    permission: data.code || data.permission,
    buttonKey: data.type === 3 ? (data.code || data.buttonKey) : undefined,
    visible: data.visible !== false,
    external: data.external || false,
    cache: data.cache || false,
    permissionId: data.permissionId,
    remark: data.remark,
  };
  
  const response = await requestClient.patch<ApiResponse<MenuPermission>>(`/menus/${id}`, backendData);
  return response.data;
}

/**
 * 删除菜单
 */
export async function deleteMenuApi(id: number): Promise<void> {
  await requestClient.delete(`/menus/${id}`);
}

/**
 * 批量删除菜单
 */
export async function batchDeleteMenuApi(ids: number[]): Promise<void> {
  await requestClient.post('/menus/batch-delete', { ids });
}

/**
 * 更新菜单状态
 */
export async function updateMenuStatusApi(id: number, status: number | boolean): Promise<MenuPermission> {
  const response = await requestClient.patch<ApiResponse<MenuPermission>>(`/menus/${id}/status`, { 
    status: typeof status === 'number' ? status === 1 : status
  });
  return response.data;
}

/**
 * 更新菜单排序
 */
export async function updateMenuSortApi(id: number, sort: number): Promise<MenuPermission> {
  const response = await requestClient.patch<ApiResponse<MenuPermission>>(`/menus/${id}/sort`, { sort });
  return response.data;
}

/**
 * 检查菜单权限标识是否唯一
 */
export async function checkMenuCodeApi(code: string, excludeId?: number): Promise<boolean> {
  try {
    const params: any = { code };
    if (excludeId) {
      params.excludeId = excludeId;
    }
    const response = await requestClient.get<ApiResponse<{ isUnique: boolean }>>('/menus/check-code', { params });
    return response.data.isUnique;
  } catch (error) {
    console.warn('权限标识验证失败:', error);
    return true; // 验证失败时默认通过
  }
}

/**
 * 获取用户菜单（根据权限）
 */
export async function getUserMenusApi(permissions?: string[]): Promise<MenuPermission[]> {
  const params = permissions ? { permissions: permissions.join(',') } : {};
  const response = await requestClient.get<ApiResponse<MenuPermission[]>>('/menus/user', { params });
  return response.data;
}

/**
 * 根据用户ID获取菜单
 */
export async function getUserMenusByUserIdApi(userId: number): Promise<MenuPermission[]> {
  const response = await requestClient.get<ApiResponse<MenuPermission[]>>(`/menus/user/${userId}`);
  return response.data;
}

/**
 * 获取用户按钮权限
 */
export async function getUserButtonsApi(userId: number): Promise<string[]> {
  const response = await requestClient.get<ApiResponse<string[]>>(`/menus/user/${userId}/buttons`);
  return response.data;
}