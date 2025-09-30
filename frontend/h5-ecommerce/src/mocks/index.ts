import MockAdapter from 'axios-mock-adapter';
import request from '@/utils/request';

// 仅初始化一次
let inited = false;

if (!inited) {
  const mock = new MockAdapter(request, { delayResponse: 300 });
  inited = true;

  // 简单的内存用户
  const mockUser = {
    id: '1',
    username: 'demo_user',
    email: 'demo@example.com',
    avatar: '/images/avatar.jpg',
  };

  // 登录
  mock.onPost(/\/auth\/login$/).reply((config: any) => {
    try {
      const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      const { username } = body || {};
      const user = { ...mockUser, username: username || mockUser.username };
      const token = 'mock_token_' + Date.now();
      return [200, { token, user }];
    } catch {
      return [400, { message: 'Bad Request' }];
    }
  });

  // 获取当前用户（需携带 Authorization）
  mock.onGet(/\/auth\/me$/).reply((config: any) => {
    const auth = config.headers?.Authorization || config.headers?.authorization;
    if (!auth) {
      return [401, { message: 'Unauthorized' }];
    }
    return [200, { user: mockUser }];
  });

  // 商品列表
  mock.onGet(/\/products$/).reply(200, {
    list: [
      { id: '1', name: 'iPhone 15', price: 5999, image: '/images/iphone.jpg', category: '手机', stock: 10 },
      { id: '2', name: 'MacBook Pro', price: 12999, image: '/images/macbook.jpg', category: '电脑', stock: 5 },
      { id: '3', name: 'AirPods Pro', price: 1999, image: '/images/airpods.jpg', category: '耳机', stock: 20 },
    ],
  });
}

export {};