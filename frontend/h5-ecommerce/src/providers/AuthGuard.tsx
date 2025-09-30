'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface Props {
  children: React.ReactNode;
  enabled?: boolean; // 可选：允许在某些情况下关闭守卫
}

/**
 * AuthGuard：简单的客户端守卫
 * - 若本地无 token，则跳转到 /login?redirect=当前路径
 */
export function AuthGuard({ children, enabled = true }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!enabled) return;
    // 仅在浏览器环境检查
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    // 已在登录页则不拦截
    if (!token && pathname !== '/login') {
      const redirect = encodeURIComponent(pathname || '/');
      router.replace(`/login?redirect=${redirect}`);
    }
  }, [enabled, pathname, router]);

  return <>{children}</>;
}