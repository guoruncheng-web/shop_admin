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
    const isFirstLogin = localStorage.getItem('isFirstLogin') === 'true';

    // 登录页、注册页、个人信息设置页不拦截
    const publicPaths = ['/login', '/register', '/profile-setup'];

    // 未登录且不在公开路径，跳转到登录页
    if (!token && !publicPaths.includes(pathname)) {
      const redirect = encodeURIComponent(pathname || '/');
      router.replace(`/login?redirect=${redirect}`);
      return;
    }

    // 已登录但是首次登录，且不在设置页面，强制跳转到设置页面
    if (token && isFirstLogin && pathname !== '/profile-setup') {
      router.replace('/profile-setup');
    }
  }, [enabled, pathname, router]);

  return <>{children}</>;
}