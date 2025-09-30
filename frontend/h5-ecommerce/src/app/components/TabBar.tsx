'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './TabBar.module.scss';

export default function TabBar() {
  const pathname = usePathname() || '/';
  const isActive = (p: string) =>
    (pathname === '/' && p === '/') || (p !== '/' && pathname.startsWith(p));

  return (
    <div className={styles.tabBar}>
      <Link href="/" className={`${styles.tabItem} ${isActive('/') ? styles.tabItemActive : ''}`}>
        <i className="fa-solid fa-house" />
        <span>首页</span>
      </Link>
      <Link href="/category" className={`${styles.tabItem} ${isActive('/category') ? styles.tabItemActive : ''}`}>
        <i className="fa-solid fa-list" />
        <span>分类</span>
      </Link>
      <Link href="/cart" className={`${styles.tabItem} ${isActive('/cart') ? styles.tabItemActive : ''}`}>
        <i className="fa-solid fa-cart-shopping" />
        <span>购物车</span>
      </Link>
      <Link href="/me" className={`${styles.tabItem} ${isActive('/me') ? styles.tabItemActive : ''}`}>
        <i className="fa-solid fa-user" />
        <span>我的</span>
      </Link>
    </div>
  );
}