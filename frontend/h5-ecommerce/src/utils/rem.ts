// rem 适配工具函数
'use client';

import { useEffect } from 'react';

// 设计稿基准宽度
const DESIGN_WIDTH = 1200;

// 基准字体大小
const BASE_FONT_SIZE = 16;

/**
 * 计算并设置根字体大小
 * @param designWidth 设计稿宽度，默认 1200px
 * @param baseFontSize 基准字体大小，默认 16px
 */
export function setRemUnit(designWidth = DESIGN_WIDTH, baseFontSize = BASE_FONT_SIZE) {
  const doc = document;
  const win = window;
  const docEl = doc.documentElement;
  
  // 获取当前视口宽度
  const clientWidth = docEl.clientWidth || win.innerWidth || doc.body.clientWidth;
  
  if (!clientWidth) return;
  
  // 计算根字体大小
  // 公式：根字体大小 = (当前设备宽度 / 设计稿宽度) * 基准字体大小
  let fontSize;
  
  if (clientWidth <= 375) {
    // 小屏手机
    fontSize = (clientWidth / designWidth) * baseFontSize * 1.2;
  } else if (clientWidth <= 750) {
    // 中等手机/小平板
    fontSize = (clientWidth / designWidth) * baseFontSize * 1.1;
  } else if (clientWidth <= 1024) {
    // 平板
    fontSize = (clientWidth / designWidth) * baseFontSize;
  } else if (clientWidth <= 1440) {
    // 小桌面
    fontSize = (clientWidth / designWidth) * baseFontSize * 0.9;
  } else {
    // 大桌面
    fontSize = (clientWidth / designWidth) * baseFontSize * 0.8;
  }
  
  // 限制字体大小范围
  fontSize = Math.max(12, Math.min(24, fontSize));
  
  docEl.style.fontSize = fontSize + 'px';
  
  // 在 document 上存储当前的 rem 单位值，方便其他地方使用
  (doc as Document & { remUnit?: number }).remUnit = fontSize;
}

/**
 * px 转 rem 函数
 * @param px 像素值
 * @param designWidth 设计稿宽度，默认 1200px
 * @param baseFontSize 基准字体大小，默认 16px
 * @returns rem 值
 */
export function pxToRem(px: number, designWidth = DESIGN_WIDTH, baseFontSize = BASE_FONT_SIZE): number {
  // 计算比例
  const ratio = px / designWidth;
  return ratio * baseFontSize;
}

/**
 * px 转 rem 字符串（带单位）
 * @param px 像素值
 * @param designWidth 设计稿宽度
 * @param baseFontSize 基准字体大小
 * @returns rem 字符串，如 "1.5rem"
 */
export function px2rem(px: number, designWidth = DESIGN_WIDTH, baseFontSize = BASE_FONT_SIZE): string {
  return `${pxToRem(px, designWidth, baseFontSize)}rem`;
}

/**
 * rem 适配 Hook
 * @param designWidth 设计稿宽度
 * @param baseFontSize 基准字体大小
 */
export function useRemAdaptation(designWidth = DESIGN_WIDTH, baseFontSize = BASE_FONT_SIZE) {
  useEffect(() => {
    // 初始设置
    setRemUnit(designWidth, baseFontSize);
    
    // 监听窗口大小变化
    const handleResize = () => {
      setRemUnit(designWidth, baseFontSize);
    };
    
    // 防抖处理
    let resizeTimer: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 100);
    };
    
    window.addEventListener('resize', debouncedResize);
    window.addEventListener('orientationchange', debouncedResize);
    
    // 页面可见性变化时重新计算（解决一些浏览器的兼容问题）
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setTimeout(() => setRemUnit(designWidth, baseFontSize), 100);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('orientationchange', debouncedResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(resizeTimer);
    };
  }, [designWidth, baseFontSize]);
}

/**
 * 响应式断点工具
 */
export const breakpoints = {
  xs: 375,   // 小手机
  sm: 750,   // 大手机
  md: 1024,  // 平板
  lg: 1440,  // 小桌面
  xl: 1920   // 大桌面
};

/**
 * 获取当前断点
 */
export function getCurrentBreakpoint(): keyof typeof breakpoints {
  const width = window.innerWidth;
  
  if (width <= breakpoints.xs) return 'xs';
  if (width <= breakpoints.sm) return 'sm';
  if (width <= breakpoints.md) return 'md';
  if (width <= breakpoints.lg) return 'lg';
  return 'xl';
}

/**
 * 响应式字体大小
 * @param sizes 不同断点的字体大小配置
 */
export function getResponsiveFontSize(sizes: Partial<Record<keyof typeof breakpoints, number>>) {
  const currentBreakpoint = getCurrentBreakpoint();
  const fontSize = sizes[currentBreakpoint] || sizes.md || 16;
  return px2rem(fontSize);
}