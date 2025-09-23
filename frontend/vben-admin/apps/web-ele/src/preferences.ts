import { defineOverridesPreferences } from '@vben/preferences';

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    name: import.meta.env.VITE_APP_TITLE,
    accessMode: 'mixed', // 混合模式：同时支持前端静态路由和后端动态菜单
    defaultHomePath: '/analytics', // 恢复默认首页为analytics
  },
  navigation: {
    split: false, // 禁用菜单分割，确保显示完整菜单
  },
});
