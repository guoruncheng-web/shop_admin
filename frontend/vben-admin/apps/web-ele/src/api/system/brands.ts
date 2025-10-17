import { requestClient } from '#/api/request';

// API 响应包装类型
interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// 品牌类型定义
export interface Brand {
  id: number;
  name: string;
  merchantId: number;
  iconUrl: string;
  status: number;
  isAuth: number;
  isHot: number;
  label?: string[];
  creator?: number;
  createTime?: string;
  updateTime?: string;
}

// 分页查询参数
export interface BrandQueryParams {
  page?: number;
  limit?: number;
  name?: string;
  merchantId?: number;
  status?: number;
  isAuth?: number;
  isHot?: number;
  creator?: string;
}

// 分页响应数据
export interface BrandPageResponse {
  list: Brand[];
  total: number;
  page: number;
  limit: number;
}

// 创建品牌参数
export interface CreateBrandParams {
  name: string;
  iconUrl: string;
  status?: number;
  isAuth?: number;
  isHot?: number;
  label?: string[];
}

// 更新品牌参数
export interface UpdateBrandParams {
  name?: string;
  iconUrl?: string;
  status?: number;
  isAuth?: number;
  isHot?: number;
  label?: string[];
}

// 批量操作参数
export interface BatchOperationParams {
  ids: number[];
  status?: number;
  isAuth?: number;
}

/**
 * 分页查询品牌列表
 */
export async function getBrandList(params: BrandQueryParams) {
  return requestClient.get<ApiResponse<BrandPageResponse>>('/brands', {
    params,
  });
}

/**
 * 查询所有品牌（不分页）
 */
export async function getAllBrands() {
  return requestClient.get<ApiResponse<Brand[]>>('/brands/all');
}

/**
 * 根据ID查询品牌详情
 */
export async function getBrandById(id: number) {
  return requestClient.get<ApiResponse<Brand>>(`/brands/${id}`);
}

/**
 * 创建品牌
 */
export async function createBrand(data: CreateBrandParams) {
  return requestClient.post<ApiResponse<Brand>>('/brands', data);
}

/**
 * 更新品牌
 */
export async function updateBrand(id: number, data: UpdateBrandParams) {
  return requestClient.put<ApiResponse<Brand>>(`/brands/${id}`, data);
}

/**
 * 删除品牌
 */
export async function deleteBrand(id: number) {
  return requestClient.delete<ApiResponse<void>>(`/brands/${id}`);
}

/**
 * 批量更新品牌状态
 */
export async function batchUpdateBrandStatus(params: BatchOperationParams) {
  return requestClient.put<ApiResponse<void>>('/brands/batch/status', params);
}

/**
 * 批量认证品牌
 */
export async function batchAuthBrand(params: BatchOperationParams) {
  return requestClient.put<ApiResponse<void>>('/brands/batch/auth', params);
}

/**
 * 获取品牌统计信息
 */
export async function getBrandStatistics() {
  return requestClient.get<ApiResponse<any>>('/brands/statistics');
}
