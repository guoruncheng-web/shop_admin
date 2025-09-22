import { defHttp } from '#/utils/http';
import type { 
  Resource, 
  CreateResourceDto, 
  QueryResourceDto, 
  PaginatedResult, 
  ResourceStatistics 
} from './types';

enum Api {
  RESOURCE_BASE = '/resources',
  POPULAR = '/resources/popular',
  LATEST = '/resources/latest',
  SEARCH = '/resources/search',
  STATISTICS = '/resources/statistics',
  DOWNLOAD = '/resources/:id/download',
}

// 创建资源
export function createResource(data: CreateResourceDto) {
  return defHttp.post<Resource>({
    url: Api.RESOURCE_BASE,
    data,
  });
}

// 分页查询资源
export function getResourceList(params: QueryResourceDto) {
  return defHttp.get<PaginatedResult<Resource>>({
    url: Api.RESOURCE_BASE,
    params,
  });
}

// 获取资源详情
export function getResourceDetail(id: number) {
  return defHttp.get<Resource>({
    url: `${Api.RESOURCE_BASE}/${id}`,
  });
}

// 更新资源
export function updateResource(id: number, data: Partial<CreateResourceDto>) {
  return defHttp.put<Resource>({
    url: `${Api.RESOURCE_BASE}/${id}`,
    data,
  });
}

// 删除资源
export function deleteResource(id: number) {
  return defHttp.delete<{ message: string }>({
    url: `${Api.RESOURCE_BASE}/${id}`,
  });
}

// 获取热门资源
export function getPopularResources(limit: number = 20) {
  return defHttp.get<Resource[]>({
    url: Api.POPULAR,
    params: { limit },
  });
}

// 获取最新资源
export function getLatestResources(limit: number = 20) {
  return defHttp.get<Resource[]>({
    url: Api.LATEST,
    params: { limit },
  });
}

// 搜索资源
export function searchResources(keyword: string, limit: number = 50) {
  return defHttp.get<Resource[]>({
    url: Api.SEARCH,
    params: { keyword, limit },
  });
}

// 获取统计信息
export function getResourceStatistics() {
  return defHttp.get<ResourceStatistics>({
    url: Api.STATISTICS,
  });
}

// 记录下载
export function recordDownload(id: number) {
  return defHttp.post<{ message: string }>({
    url: Api.DOWNLOAD.replace(':id', id.toString()),
  });
}