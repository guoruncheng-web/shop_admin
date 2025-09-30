'use client';

import React from 'react';
import { AuthGuard } from '@/providers/AuthGuard';
import { ReduxProvider } from '@/providers/ReduxProvider';

/**
 * 启用 Mock 策略：
 * - 显式设置 NEXT_PUBLIC_ENABLE_MOCK=true 时启用
 * - 或在开发环境（NODE_ENV=development）默认启用
 */
const enableMock =
  process.env.NEXT_PUBLIC_ENABLE_MOCK === 'true' ||
  process.env.NODE_ENV === 'development';

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