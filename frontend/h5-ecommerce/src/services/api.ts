import request from '@/utils/request';

type LoginPayload = { username: string; password: string };

export const authAPI = {
  // 登录（由 mock or 后端提供）
  login(payload: LoginPayload) {
    return request.post('/auth/login', payload);
  },
  getCurrentUser() {
    return request.get('/auth/me');
  },
};

export const productAPI = {
  list() {
    return request.get('/products');
  },
};