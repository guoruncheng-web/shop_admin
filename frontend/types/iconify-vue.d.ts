declare module '@iconify/vue' {
  import type { DefineComponent } from 'vue';
  export interface IconProps {
    icon: string;
    width?: string | number;
    height?: string | number;
    color?: string;
    rotate?: number | string;
    inline?: boolean;
    // 允许透传 class 等 HTML 属性
    [key: string]: any;
  }
  export const Icon: DefineComponent<IconProps>;
  export default Icon;
}