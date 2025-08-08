import { Menu } from '../entities/menu.entity';

export const menuSeeds: Partial<Menu>[] = [
  // 系统管理
  {
    name: '系统管理',
    path: '/system',
    component: 'Layout',
    icon: 'system',
    sort: 1,
    visible: true,
    external: false,
    cache: false,
    permissionId: null,
    type: 1, // 目录
    status: true,
  },
  {
    name: '用户管理',
    path: '/system/user',
    component: 'system/user/index',
    icon: 'user',
    sort: 1,
    visible: true,
    external: false,
    cache: true,
    permissionId: 1,
    type: 2, // 菜单
    status: true,
  },
  {
    name: '新增用户',
    path: '',
    component: '',
    icon: 'plus',
    sort: 1,
    visible: true,
    external: false,
    cache: false,
    permissionId: 1,
    type: 3, // 按钮
    status: true,
    buttonKey: 'user:add',
  },
  {
    name: '编辑用户',
    path: '',
    component: '',
    icon: 'edit',
    sort: 2,
    visible: true,
    external: false,
    cache: false,
    permissionId: 1,
    type: 3, // 按钮
    status: true,
    buttonKey: 'user:edit',
  },
  {
    name: '删除用户',
    path: '',
    component: '',
    icon: 'delete',
    sort: 3,
    visible: true,
    external: false,
    cache: false,
    permissionId: 1,
    type: 3, // 按钮
    status: true,
    buttonKey: 'user:delete',
  },
  {
    name: '角色管理',
    path: '/system/role',
    component: 'system/role/index',
    icon: 'role',
    sort: 2,
    visible: true,
    external: false,
    cache: true,
    permissionId: 2,
    type: 2, // 菜单
    status: true,
  },
  {
    name: '菜单管理',
    path: '/system/menu',
    component: 'system/menu/index',
    icon: 'menu',
    sort: 3,
    visible: true,
    external: false,
    cache: true,
    permissionId: 3,
    type: 2, // 菜单
    status: true,
  },
  {
    name: '权限管理',
    path: '/system/permission',
    component: 'system/permission/index',
    icon: 'permission',
    sort: 4,
    visible: true,
    external: false,
    cache: true,
    permissionId: 4,
    type: 2, // 菜单
    status: true,
  },

  // 商品管理
  {
    name: '商品管理',
    path: '/product',
    component: 'Layout',
    icon: 'product',
    sort: 2,
    visible: true,
    external: false,
    cache: false,
    permissionId: null,
    type: 1, // 目录
    status: true,
  },
  {
    name: '商品列表',
    path: '/product/list',
    component: 'product/list/index',
    icon: 'list',
    sort: 1,
    visible: true,
    external: false,
    cache: true,
    permissionId: 5,
    type: 2, // 菜单
    status: true,
  },
  {
    name: '商品分类',
    path: '/product/category',
    component: 'product/category/index',
    icon: 'category',
    sort: 2,
    visible: true,
    external: false,
    cache: true,
    permissionId: 6,
    type: 2, // 菜单
    status: true,
  },

  // 订单管理
  {
    name: '订单管理',
    path: '/order',
    component: 'Layout',
    icon: 'order',
    sort: 3,
    visible: true,
    external: false,
    cache: false,
    permissionId: null,
    type: 1, // 目录
    status: true,
  },
  {
    name: '订单列表',
    path: '/order/list',
    component: 'order/list/index',
    icon: 'list',
    sort: 1,
    visible: true,
    external: false,
    cache: true,
    permissionId: 7,
    type: 2, // 菜单
    status: true,
  },

  // 内容管理
  {
    name: '内容管理',
    path: '/content',
    component: 'Layout',
    icon: 'content',
    sort: 4,
    visible: true,
    external: false,
    cache: false,
    permissionId: null,
    type: 1, // 目录
    status: true,
  },
  {
    name: '轮播图管理',
    path: '/content/banner',
    component: 'content/banner/index',
    icon: 'banner',
    sort: 1,
    visible: true,
    external: false,
    cache: true,
    permissionId: 8,
    type: 2, // 菜单
    status: true,
  },

  // 系统监控
  {
    name: '系统监控',
    path: '/monitor',
    component: 'Layout',
    icon: 'monitor',
    sort: 5,
    visible: true,
    external: false,
    cache: false,
    permissionId: null,
    type: 1, // 目录
    status: true,
  },
  {
    name: '操作日志',
    path: '/monitor/log',
    component: 'monitor/log/index',
    icon: 'log',
    sort: 1,
    visible: true,
    external: false,
    cache: true,
    permissionId: 9,
    type: 2, // 菜单
    status: true,
  },
];
