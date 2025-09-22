// 资源类型枚举
export enum ResourceType {
  IMAGE = 'image',
  VIDEO = 'video'
}

// 资源状态枚举
export enum ResourceStatus {
  DELETED = -1,
  DISABLED = 0,
  ACTIVE = 1
}

// 资源分类接口
export interface ResourceCategory {
  id: number;
  name: string;
  parentId?: number;
  level: number;
  sortOrder: number;
  status: number;
  createdAt: string;
  updatedAt: string;
  children?: ResourceCategory[];
  parent?: ResourceCategory;
}

// 资源接口
export interface Resource {
  id: number;
  name: string;
  url: string;
  type: ResourceType;
  fileSize?: number;
  fileExtension?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  duration?: number;
  categoryId: number;
  uploaderId: number;
  uploaderName: string;
  description?: string;
  tags?: string;
  tagList?: string[];
  downloadCount: number;
  viewCount: number;
  status: ResourceStatus;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
  category?: ResourceCategory;
}

// 创建资源分类DTO
export interface CreateResourceCategoryDto {
  name: string;
  parentId?: number;
  level: number;
  sortOrder?: number;
  status?: number;
}

// 创建资源DTO
export interface CreateResourceDto {
  name: string;
  url: string;
  type: ResourceType;
  fileSize?: number;
  fileExtension?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  duration?: number;
  categoryId: number;
  uploaderId: number;
  uploaderName: string;
  description?: string;
  tags?: string[];
}

// 查询资源DTO
export interface QueryResourceDto {
  page?: number;
  pageSize?: number;
  name?: string;
  type?: ResourceType;
  categoryId?: number;
  uploaderId?: number;
  status?: ResourceStatus;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// 分页结果接口
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 统计信息接口
export interface ResourceStatistics {
  totalResources: number;
  imageCount: number;
  videoCount: number;
  totalSize: number;
  totalDownloads: number;
}