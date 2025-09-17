import type { User } from '#/api/system/user';
import type { Role } from '#/api/system/role';

// 测试用的角色数据
export const mockRoles: Role[] = [
  {
    id: 1,
    name: '超级管理员',
    code: 'super_admin',
    description: '系统超级管理员，拥有所有权限',
    status: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: '管理员',
    code: 'admin',
    description: '系统管理员，拥有大部分权限',
    status: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    name: '普通用户',
    code: 'user',
    description: '普通用户，拥有基本权限',
    status: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 4,
    name: '访客',
    code: 'guest',
    description: '访客用户，只有查看权限',
    status: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// 测试用的用户数据
export const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    realName: '系统管理员',
    email: 'admin@example.com',
    phone: '13800138000',
    avatar: '',
    status: 1,
    lastLoginTime: '2024-09-17T12:00:00Z',
    lastLoginIp: '192.168.1.100',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-09-17T12:00:00Z',
    roles: [mockRoles[0]],
  },
  {
    id: 2,
    username: 'user001',
    realName: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138001',
    avatar: '',
    status: 1,
    lastLoginTime: '2024-09-17T10:30:00Z',
    lastLoginIp: '192.168.1.101',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-09-17T10:30:00Z',
    roles: [mockRoles[2]],
  },
  {
    id: 3,
    username: 'user002',
    realName: '李四',
    email: 'lisi@example.com',
    phone: '13800138002',
    avatar: '',
    status: 0,
    lastLoginTime: '2024-09-16T15:20:00Z',
    lastLoginIp: '192.168.1.102',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-09-16T15:20:00Z',
    roles: [mockRoles[2]],
  },
  {
    id: 4,
    username: 'manager',
    realName: '王五',
    email: 'wangwu@example.com',
    phone: '13800138003',
    avatar: '',
    status: 1,
    lastLoginTime: '2024-09-17T09:15:00Z',
    lastLoginIp: '192.168.1.103',
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-09-17T09:15:00Z',
    roles: [mockRoles[1]],
  },
  {
    id: 5,
    username: 'guest001',
    realName: '访客用户',
    email: 'guest@example.com',
    phone: '',
    avatar: '',
    status: 1,
    lastLoginTime: '2024-09-17T08:00:00Z',
    lastLoginIp: '192.168.1.104',
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-09-17T08:00:00Z',
    roles: [mockRoles[3]],
  },
];

// 生成更多测试数据的函数
export function generateMockUsers(count: number = 50): User[] {
  const users: User[] = [...mockUsers];
  
  for (let i = 6; i <= count; i++) {
    const randomRole = mockRoles[Math.floor(Math.random() * mockRoles.length)];
    const user: User = {
      id: i,
      username: `user${i.toString().padStart(3, '0')}`,
      realName: `用户${i}`,
      email: `user${i}@example.com`,
      phone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      avatar: '',
      status: Math.random() > 0.2 ? 1 : 0, // 80% 启用，20% 禁用
      lastLoginTime: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
      lastLoginIp: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
      updatedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
      roles: [randomRole],
    };
    users.push(user);
  }
  
  return users;
}