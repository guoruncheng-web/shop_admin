import { requestClient } from '#/api/request';

export interface UploadResponse {
  success: boolean;
  data: {
    url: string;
    key: string;
    size: number;
    originalName: string;
  };
  message: string;
}

export interface DeleteFileResponse {
  success: boolean;
  message: string;
}

/**
 * 上传图片到腾讯云
 */
export async function uploadImage(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  // 从存储获取 token 并附加到请求头
  const { useAccessStore } = await import('@vben/stores');
  const accessStore = useAccessStore();
  const token = accessStore?.accessToken;

  return requestClient.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

/**
 * 上传视频到腾讯云
 */
export async function uploadVideo(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  // 从存储获取 token 并附加到请求头
  const { useAccessStore } = await import('@vben/stores');
  const accessStore = useAccessStore();
  const token = accessStore?.accessToken;

  return requestClient.post('/upload/video', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

/**
 * 删除腾讯云文件
 */
export async function deleteFile(key: string): Promise<DeleteFileResponse> {
  return requestClient.delete(`/upload/files/${encodeURIComponent(key)}`);
}

/**
 * 批量删除腾讯云文件
 */
export async function deleteFiles(keys: string[]): Promise<DeleteFileResponse> {
  return requestClient.delete('/upload/files', {
    data: { keys },
  });
}