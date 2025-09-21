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

  return requestClient.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * 上传视频到腾讯云
 */
export async function uploadVideo(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  return requestClient.post('/upload/video', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
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