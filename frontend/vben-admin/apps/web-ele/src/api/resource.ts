import { requestClient } from '#/api/request';

// 设置API基础URL
const API_BASE_URL = 'http://localhost:3000/api';

// 资源相关接口
export interface Resource {
  id: number;
  name: string;
  url: string;
  type: 'image' | 'video';
  fileSize: number;
  categoryId: number;
  uploaderId: number;
  uploadedAt: string;
  description?: string;
  tags?: string;
  viewCount: number;
  downloadCount: number;
  status: number;
  category?: ResourceCategory;
  thumbnail?: string; // 视频缩略图
  duration?: number; // 视频时长（秒）
  width?: number; // 图片/视频宽度
  height?: number; // 图片/视频高度
}

export interface ResourceCategory {
  id: number;
  name: string;
  parentId?: number;
  level: number;
  parent?: ResourceCategory;
  children?: ResourceCategory[];
}

export interface CreateResourceDto {
  name: string;
  url: string;
  type: 'image' | 'video';
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

export interface QueryResourceDto {
  page?: number;
  pageSize?: number;
  name?: string;
  type?: 'image' | 'video';
  categoryId?: number;
  uploaderId?: number;
  status?: number;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ResourceStatistics {
  totalResources: number;
  imageCount: number;
  videoCount: number;
  totalSize: number;
  totalDownloads: number;
}

// 资源管理API
export namespace ResourceApi {
  // 创建资源
  export function createResource(data: CreateResourceDto) {
    return requestClient.post<Resource>('/resources', data);
  }

  // 分页查询资源
  export function getResources(params: QueryResourceDto) {
    return requestClient.get<PaginatedResult<Resource>>('/resources', { params });
  }

  // 获取资源详情
  export function getResource(id: number) {
    return requestClient.get<Resource>(`/resources/${id}`);
  }

  // 更新资源
  export function updateResource(id: number, data: Partial<CreateResourceDto>) {
    return requestClient.put<Resource>(`/resources/${id}`, data);
  }

  // 删除资源
  export function deleteResource(id: number) {
    return requestClient.delete(`/resources/${id}`);
  }

  // 获取热门资源
  export function getPopularResources(limit: number = 20) {
    return requestClient.get<Resource[]>('/resources/popular', { params: { limit } });
  }

  // 获取最新资源
  export function getLatestResources(limit: number = 20) {
    return requestClient.get<Resource[]>('/resources/latest', { params: { limit } });
  }

  // 搜索资源
  export function searchResources(keyword: string, limit: number = 50) {
    return requestClient.get<Resource[]>('/resources/search', { 
      params: { keyword, limit } 
    });
  }

  // 获取统计信息
  export function getStatistics() {
    return requestClient.get<ResourceStatistics>('/resources/statistics');
  }

  // 记录下载
  export function recordDownload(id: number) {
    return requestClient.post(`/resources/${id}/download`);
  }

  // 上传图片文件
  export function uploadImage(formData: FormData) {
    return requestClient.post<Resource>('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  // 上传视频文件
  export function uploadVideo(formData: FormData) {
    return requestClient.post<Resource>('/upload/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  // 通用上传资源文件（根据文件类型自动选择接口）
  export function uploadResource(formData: FormData, fileType: 'image' | 'video' = 'image') {
    if (fileType === 'video') {
      return uploadVideo(formData);
    }
    return uploadImage(formData);
  }

  // 分片上传相关接口
  
  // 初始化分片上传
  export function initChunkUpload(data: {
    fileName: string;
    fileSize: number;
    fileMD5: string;
    chunkSize: number;
    totalChunks: number;
  }) {
    return requestClient.post<{ uploadId: string }>('/upload/chunk/init', data);
  }

  // 检查已上传的分片
  export function checkUploadedChunks(uploadId: string) {
    return requestClient.get<{ uploadedChunks: number[] }>(`/upload/chunk/check/${uploadId}`);
  }

  // 上传单个分片
  export function uploadChunk(formData: FormData) {
    return requestClient.post('/upload/chunk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  // 完成分片上传
  export function completeChunkUpload(data: {
    uploadId: string;
    fileMD5: string;
  }) {
    return requestClient.post<{ url: string; size: number }>('/upload/chunk/complete', data);
  }

  // 取消分片上传
  export function cancelChunkUpload(uploadId: string) {
    return requestClient.delete(`/upload/chunk/${uploadId}`);
  }
}

// 创建分类的数据接口
export interface CreateResourceCategoryDto {
  name: string;
  level: number;
  parentId?: number;
  sortOrder?: number;
}

// 资源分类管理API
export namespace ResourceCategoryApi {
  // 创建分类
  export function createCategory(data: CreateResourceCategoryDto) {
    return requestClient.post<ResourceCategory>('/resource-categories', data);
  }

  // 获取分类树
  export function getCategoryTree() {
    return requestClient.get<ResourceCategory[]>('/resource-categories/tree');
  }

  // 获取二级分类列表
  export function getSecondLevelCategories() {
    return requestClient.get<ResourceCategory[]>('/resource-categories/second-level');
  }

  // 更新分类
  export function updateCategory(id: number, data: Partial<CreateResourceCategoryDto>) {
    return requestClient.put<ResourceCategory>(`/resource-categories/${id}`, data);
  }

  // 删除分类
  export function deleteCategory(id: number) {
    return requestClient.delete(`/resource-categories/${id}`);
  }
}