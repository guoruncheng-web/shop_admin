import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:image',
      order: 1,
      title:"静态资源",
    },
    name: 'Medial',
    path: '/medial',
    redirect: '/medial/category',
    children: [
      {
        name: 'Category',
        path: 'category',
        component: () => import('#/views/medial/category/index.vue'),
        meta: {
          icon: 'lucide:folder-tree',
          title: "分类管理",
        },
      },
    ],
  },
];

export default routes;
