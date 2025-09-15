import type { RouteRecordRaw } from 'vue-router';

// 注释掉静态路由，使用纯动态路由从后端获取
const routes: RouteRecordRaw[] = [
  // 移除静态系统管理路由，改为从后端动态获取
  // {
  //   meta: {
  //     icon: 'lucide:settings',
  //     order: 1000,
  //     title: '系统管理',
  //   },
  //   name: 'System',
  //   path: '/system',
  //   children: [
  //     {
  //       name: 'MenuManagement',
  //       path: '/menu',
  //       component: () => import('#/views/system/menu/index.vue'),
  //       meta: {
  //         icon: 'lucide:menu',
  //         title: '菜单管理',
  //       },
  //     },
  //     {
  //       name: 'UserManagement',
  //       path: '/user',
  //       component: () => import('#/views/system/user/index.vue'),
  //       meta: {
  //         icon: 'lucide:users',
  //         title: '用户管理',
  //       },
  //     },
  //   ],
  // },
];

export default routes;