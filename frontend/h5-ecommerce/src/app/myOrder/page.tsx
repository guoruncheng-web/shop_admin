'use client';

import React from 'react';

export default function MyOrderPage() {
  const orders = [
    { id: 'A20250930001', status: '待付款', date: '2025-09-30 12:01', items: 2, amount: 289.0 },
    { id: 'A20250928015', status: '待收货', date: '2025-09-28 18:20', items: 1, amount: 159.0 },
  ];

  return (
    <div style={{ background: '#f7f7f7', minHeight: '100vh', maxWidth: 375, margin: '0 auto', paddingTop: 56, paddingBottom: 24 }}>
      {/* 头部 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 12,
          borderBottom: '1px solid #f0f0f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        }}
      >
        <button
          onClick={() => history.back()}
          style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer' }}
          aria-label="返回"
        >
          ←
        </button>
        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>我的订单</div>
        <div style={{ width: 44 }} />
      </div>

      {/* 筛选 tabs 占位 */}
      <div style={{ background: '#fff', padding: '10px 12px', display: 'flex', gap: 12, position: 'sticky', top: 56, zIndex: 50 }}>
        {['全部', '待付款', '待发货', '待收货', '待评价', '退款/售后'].map((t) => (
          <button
            key={t}
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              border: '1px solid #eee',
              background: t === '全部' ? '#f9f0ef' : '#fff',
              color: t === '全部' ? '#e29692' : '#333',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 订单列表 */}
      <div style={{ padding: '12px' }}>
        {orders.map((o) => (
          <div key={o.id} style={{ background: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontWeight: 600 }}>订单号 {o.id}</div>
              <div style={{ color: '#e29692', fontWeight: 600 }}>{o.status}</div>
            </div>
            <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>{o.date}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: '#333' }}>共 {o.items} 件商品</div>
              <div style={{ fontWeight: 700, color: '#e29692' }}>¥{o.amount.toFixed(2)}</div>
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #eee', background: '#fff', cursor: 'pointer' }}>查看详情</button>
              <button style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: 'linear-gradient(90deg,#ff9a44,#ff6b35)', color: '#fff', cursor: 'pointer' }}>
                再次购买
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}