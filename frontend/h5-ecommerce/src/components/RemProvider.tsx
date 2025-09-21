'use client';

import { useRemAdaptation } from '@/utils/rem';

interface RemProviderProps {
  children: React.ReactNode;
  designWidth?: number;
  baseFontSize?: number;
}

/**
 * rem 适配提供者组件
 * 负责初始化和维护 rem 适配逻辑
 */
export function RemProvider({ 
  children, 
  designWidth = 1200, 
  baseFontSize = 16 
}: RemProviderProps) {
  // 使用 rem 适配 Hook
  useRemAdaptation(designWidth, baseFontSize);
  
  return <>{children}</>;
}