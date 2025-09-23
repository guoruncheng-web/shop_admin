import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:layout-dashboard',
      order: -1,
      title:"静态资源",
    },
    name: 'Medial',
    path: '/medial',
    children: [
      {
        name: 'Category',
        path: '/medial/category',
        component: () => import('#/views/medial/category/index.vue'),
        meta: {
          affixTab: true,
          icon: 'lucide:area-chart',
          title: "分类管理",
        },
      },
    ],
  },
];

export default routes;
