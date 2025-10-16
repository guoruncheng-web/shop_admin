import { requestClient } from '#/api/request';

// API 响应包装类型
interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg: string;
}

// 发货地址类型定义
export interface MerchantShippingAddress {
  id: number;
  merchantId: number;
  contactName: string;
  contactPhone: string;
  provinceCode: string;
  provinceName: string;
  cityCode: string;
  cityName: string;
  districtCode: string;
  districtName: string;
  detailAddress: string;
  postalCode?: string;
  isDefault: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingAddressParams {
  contactName: string;
  contactPhone: string;
  provinceCode: string;
  provinceName: string;
  cityCode: string;
  cityName: string;
  districtCode: string;
  districtName: string;
  detailAddress: string;
  postalCode?: string;
}

// 商户相关的类型定义
export interface Merchant {
  id: number;
  merchantCode: string;
  merchantName: string;
  merchantType: number; // 1-超级商户，2-普通商户
  legalPerson?: string;
  businessLicense?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  logo?: string;
  description?: string;
  certificationStatus: number; // 0-未认证，1-审核中，2-已认证，3-认证失败
  certificationTime?: string;
  certificationDocs?: string[];
  businessScope?: string;
  categoryIds?: number[];
  settlementAccount?: string;
  settlementBank?: string;
  status: number; // 0-禁用，1-启用，2-冻结
  expireTime?: string;
  maxProducts: number;
  maxAdmins: number;
  maxStorage: number;
  commissionRate: number;
  balance: number;
  frozenBalance: number;
  totalSales: number;
  config?: Record<string, any>;
  apiKey: string;
  apiSecret: string;
  webhookUrl?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  updatedBy?: number;
  // 发货地址
  shippingAddress?: MerchantShippingAddress;
  // 自动创建的超级管理员信息（仅创建时返回）
  superAdmin?: {
    username: string;
    password: string;
    email: string;
  };
}

export interface CreateMerchantParams {
  merchantCode: string;
  merchantName: string;
  merchantType?: number;
  legalPerson?: string;
  businessLicense?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  logo?: string;
  description?: string;
  businessScope?: string;
  categoryIds?: number[];
  settlementAccount?: string;
  settlementBank?: string;
  status?: number;
  maxProducts?: number;
  maxAdmins?: number;
  maxStorage?: number;
  commissionRate?: number;
  config?: Record<string, any>;
  webhookUrl?: string;
  shippingAddress?: ShippingAddressParams;
}

export interface UpdateMerchantParams {
  merchantName?: string;
  legalPerson?: string;
  businessLicense?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  logo?: string;
  description?: string;
  businessScope?: string;
  categoryIds?: number[];
  settlementAccount?: string;
  settlementBank?: string;
  maxProducts?: number;
  maxAdmins?: number;
  maxStorage?: number;
  commissionRate?: number;
  config?: Record<string, any>;
  webhookUrl?: string;
  shippingAddress?: ShippingAddressParams;
}

export interface QueryMerchantParams {
  page?: number;
  pageSize?: number;
  merchantCode?: string;
  merchantName?: string;
  merchantType?: number;
  status?: number;
  certificationStatus?: number;
  contactPhone?: string;
  contactEmail?: string;
}

export interface MerchantListResult {
  items: Merchant[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface MerchantStatistics {
  merchantId: number;
  merchantName: string;
  balance: string;
  frozenBalance: string;
  totalSales: string;
  maxProducts: number;
  maxAdmins: number;
  maxStorage: number;
  currentProducts: number;
  currentAdmins: number;
  usedStorage: number;
}

// API 函数
/**
 * 获取商户列表
 */
export async function getMerchantListApi(params?: QueryMerchantParams) {
  const response = await requestClient.get<ApiResponse<MerchantListResult>>('/merchants', { params });

  if (response && response.code === 200 && response.data) {
    return response;
  }

  throw new Error(response?.msg || '获取商户列表失败');
}

/**
 * 获取所有商户（用于下拉选择）
 */
export async function getAllMerchantsForSelectApi() {
  const response = await requestClient.get<ApiResponse<Merchant[]>>('/merchants/all');

  if (response && response.code === 200 && response.data) {
    return response;
  }

  throw new Error(response?.msg || '获取商户列表失败');
}

/**
 * 获取商户详情
 */
export async function getMerchantDetailApi(id: number) {
  const response = await requestClient.get<ApiResponse<Merchant>>(`/merchants/${id}`);

  if (response && response.code === 200 && response.data) {
    return response.data;
  }

  throw new Error(response?.msg || '获取商户详情失败');
}

/**
 * 根据商户编码获取商户
 */
export async function getMerchantByCodeApi(merchantCode: string) {
  const response = await requestClient.get<ApiResponse<Merchant>>(`/merchants/code/${merchantCode}`);

  if (response && response.code === 200 && response.data) {
    return response.data;
  }

  throw new Error(response?.msg || '获取商户详情失败');
}

/**
 * 创建商户（会自动创建超级管理员）
 */
export async function createMerchantApi(data: CreateMerchantParams) {
  const response = await requestClient.post<ApiResponse<Merchant>>('/merchants', data);

  if (response && response.code === 200) {
    return response;
  }

  throw new Error(response?.msg || '创建商户失败');
}

/**
 * 更新商户信息
 */
export async function updateMerchantApi(id: number, data: UpdateMerchantParams) {
  const response = await requestClient.put<ApiResponse<Merchant>>(`/merchants/${id}`, data);

  if (response && response.code === 200) {
    return response;
  }

  throw new Error(response?.msg || '更新商户失败');
}

/**
 * 删除商户
 */
export async function deleteMerchantApi(id: number) {
  const response = await requestClient.delete<ApiResponse<null>>(`/merchants/${id}`);

  if (response && response.code === 200) {
    return response;
  }

  throw new Error(response?.msg || '删除商户失败');
}

/**
 * 更新商户状态
 */
export async function updateMerchantStatusApi(id: number, status: number) {
  const response = await requestClient.put<ApiResponse<Merchant>>(`/merchants/${id}/status`, { status });

  if (response && response.code === 200) {
    return response;
  }

  throw new Error(response?.msg || '更新商户状态失败');
}

/**
 * 更新商户认证状态
 */
export async function updateMerchantCertificationApi(id: number, certificationStatus: number) {
  const response = await requestClient.put<ApiResponse<Merchant>>(`/merchants/${id}/certification`, { certificationStatus });

  if (response && response.code === 200) {
    return response;
  }

  throw new Error(response?.msg || '更新认证状态失败');
}

/**
 * 获取商户统计信息
 */
export async function getMerchantStatisticsApi(id: number) {
  const response = await requestClient.get<ApiResponse<MerchantStatistics>>(`/merchants/${id}/statistics`);

  if (response && response.code === 200 && response.data) {
    return response.data;
  }

  throw new Error(response?.msg || '获取统计信息失败');
}

/**
 * 重新生成商户API密钥
 */
export async function regenerateMerchantKeysApi(id: number) {
  const response = await requestClient.post<ApiResponse<{ apiKey: string; apiSecret: string }>>(`/merchants/${id}/regenerate-keys`, {});

  if (response && response.code === 200 && response.data) {
    return response.data;
  }

  throw new Error(response?.msg || '重新生成密钥失败');
}

/**
 * 获取商户超级管理员信息
 */
export async function getMerchantSuperAdminApi(id: number) {
  const response = await requestClient.get<ApiResponse<any>>(`/merchants/${id}/super-admin`);

  if (response && response.code === 200 && response.data) {
    return response.data;
  }

  throw new Error(response?.msg || '获取超级管理员信息失败');
}

/**
 * 重置商户超级管理员密码
 */
export async function resetSuperAdminPasswordApi(id: number) {
  const response = await requestClient.post<ApiResponse<{ username: string; password: string; email: string }>>(`/merchants/${id}/reset-super-admin-password`, {});

  if (response && response.code === 200 && response.data) {
    return response.data;
  }

  throw new Error(response?.msg || '重置密码失败');
}
