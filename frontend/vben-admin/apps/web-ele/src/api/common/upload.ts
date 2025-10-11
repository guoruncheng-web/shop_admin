import { requestClient } from '#/api/request';
import { useAccessStore } from '@vben/stores';

// API 响应包装类型
interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg: string;
}

// 上传结果类型
export interface UploadResult {
  url: string;
  key: string;
  size: number;
  originalName: string;
  mimeType: string;
}

/**
 * 上传图片
 */
export async function uploadImageApi(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  // 从用户存储中获取 token
  const token = (() => {
    try {
      const accessStore = useAccessStore();
      return accessStore?.accessToken;
    } catch {
      return '';
    }
  })();

  const response = await requestClient.post<ApiResponse<UploadResult>>(
    '/upload/image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );

  if (response && response.code === 200 && response.data) {
    return response.data;
  }

  throw new Error(response?.msg || '图片上传失败');
}

/**
 * 上传文件
 */
export async function uploadFileApi(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  // 从用户存储中获取 token
  const token2 = (() => {
    try {
      const accessStore = useAccessStore();
      return accessStore?.accessToken;
    } catch {
      return '';
    }
  })();

  const response = await requestClient.post<ApiResponse<UploadResult>>(
    '/upload/single',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token2 ? { Authorization: `Bearer ${token2}` } : {}),
      },
    },
  );

  if (response && response.code === 200 && response.data) {
    return response.data;
  }

  throw new Error(response?.msg || '文件上传失败');
}
