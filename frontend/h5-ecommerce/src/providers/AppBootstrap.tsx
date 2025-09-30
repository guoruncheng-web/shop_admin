'use client';

import React from 'react';
import { AuthGuard } from '@/providers/AuthGuard';
import { ReduxProvider } from '@/providers/ReduxProvider';

/**
 * 启用 Mock 策略：
 * - 显式设置 NEXT_PUBLIC_ENABLE_MOCK=false 时禁用
 * - 没有配置后端 API 时默认启用
 * - 开发环境默认启用
 */
const hasBackendApi = process.env.NEXT_PUBLIC_API_BASE_URL &&
  !process.env.NEXT_PUBLIC_API_BASE_URL.includes('localhost');

const enableMock =
  process.env.NEXT_PUBLIC_ENABLE_MOCK === 'false'
    ? false
    : (process.env.NEXT_PUBLIC_ENABLE_MOCK === 'true' ||
       process.env.NODE_ENV === 'development' ||
       !hasBackendApi);

export function AppBootstrap({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    if (enableMock && typeof window !== 'undefined') {
      // 动态导入以避免影响 SSR
      import('@/mocks')
        .then(() => {
          // eslint-disable-next-line no-console
          console.log('[mock] enabled');
        })
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.warn('[mock] load failed', e);
        });
    }
  }, []);

  // 全局路由守卫，未登录自动跳转到 /login
  return (
    <ReduxProvider>
      <AuthGuard>{children}</AuthGuard>
    </ReduxProvider>
  );
}

export default AppBootstrap;