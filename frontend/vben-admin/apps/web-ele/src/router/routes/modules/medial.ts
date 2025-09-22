import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:image',
      order: 1000,
      title: $t('routes.medial.title'),
      hideInMenu: true, // 隐藏整个媒体管理菜单
    },
    name: 'Medial',
    path: '/medial',
    children: [
      {
        name: 'MedialStatic',
        path: '/medial/static',
        component: () => import('#/views/medial/static/index.vue'),
        meta: {
          icon: 'lucide:folder-open',
          title: $t('routes.medial.static'),
        },
      },
      {
        name: 'MedialCategory',
        path: '/medial/category',
        component: () => import('#/views/medial/category/index.vue'),
        meta: {
          icon: 'lucide:folder-tree',
          title: $t('routes.medial.category'),
          hideInMenu: true, // 隐藏在菜单中
        },
      },
    ],
  },
];

export default routes;