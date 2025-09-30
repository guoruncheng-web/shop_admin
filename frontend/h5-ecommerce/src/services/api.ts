import request from '@/utils/request';

type LoginPayload = { username: string; password: string };

export const authAPI = {
  // 模拟登录：如果提供用户名/密码则返回一个 mock token 和用户
  login(payload: LoginPayload) {
    return new Promise<{ data: { token: string; user: any } }>((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            token: 'mock_token_' + Date.now(),
            user: {
              id: '1',
              username: payload.username || 'demo_user',
              email: `${payload.username || 'demo'}@example.com`,
              avatar: '/images/avatar.jpg',
            },
          },
        });
      }, 500);
    });
  },

  // 模拟获取当前用户信息（示例：使用 axios 实例，以便演示 request 拦截器）
  getCurrentUser() {
    return request.get('/auth/me'); // 若后端未提供，此请求可按需屏蔽或由 dev server 代理
  },
};