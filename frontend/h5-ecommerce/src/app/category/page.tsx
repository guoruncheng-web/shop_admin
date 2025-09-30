'use client';

import React from 'react';
import TabBar from '../components/TabBar';

export default function CategoryPage() {
  return (
    <>
      <div style={{ maxWidth: 375, margin: '0 auto', minHeight: 'calc(100vh - 70px)', background: '#faf7f2', padding: 16 }}>
        <h2 style={{ margin: '16px 0' }}>分类</h2>
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          敬请期待：分类内容
        </div>
      </div>
      <TabBar />
    </>
  );
}