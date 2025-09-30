'use client';

import React, { useMemo, useState } from 'react';
import TabBar from '../components/TabBar';

type OrderStatus = '全部' | '待付款' | '待发货' | '待收货' | '待评价' | '已完成' | '已取消';

interface OrderProduct {
  id: string;
  name: string;
  price: number;
  qty: number;
  img: string;
}
interface OrderItem {
  id: string;
  status: Exclude<OrderStatus, '全部'>;
  products: OrderProduct[];
  total: number;
}

const COLORS = {
  primary: '#e29692',
  primaryLight: '#f9f0ef',
  primaryDark: '#c57d7a',
  light: '#f9f9f9',
  lightGray: '#f5f5f5',
  gray: '#e0e0e0',
  dark: '#333',
  darkGray: '#666',
  shadowSm: '0 2px 6px rgba(0,0,0,0.05)',
  shadowMd: '0 4px 10px rgba(0,0,0,0.08)',
  radius: 12,
};

const statusPillStyle: Record<OrderItem['status'], React.CSSProperties> = {
  待付款: { background: '#ffecb3', color: '#8d6e00' },
  待发货: { background: '#c8e6c9', color: '#33691e' },
  待收货: { background: '#bbdefb', color: '#0d47a1' },
  待评价: { background: '#ffe0b2', color: '#e65100' },
  已完成: { background: '#d7ccc8', color: '#5d4037' },
  已取消: { background: '#ffccbc', color: '#bf360c' },
};

const initialOrders: OrderItem[] = [
  {
    id: 'OD202309151234',
    status: '待付款',
    products: [
      { id: 'p230', name: '休闲格纹西装外套 2023新款时尚气质宽松百搭', price: 389, qty: 1, img: 'https://picsum.photos/id/230/200/200' },
      { id: 'p231', name: '修身直筒牛仔裤 显瘦百搭', price: 199, qty: 1, img: 'https://picsum.photos/id/231/200/200' },
    ],
    total: 588,
  },
  {
    id: 'OD202309150987',
    status: '待发货',
    products: [{ id: 'p232', name: '法式气质长袖连衣裙 2023秋季新款', price: 289, qty: 1, img: 'https://picsum.photos/id/232/200/200' }],
    total: 289,
  },
  {
    id: 'OD202309141235',
    status: '待收货',
    products: [
      { id: 'p233', name: '字母印花连帽卫衣 男女款 2023新款', price: 169, qty: 2, img: 'https://picsum.photos/id/233/200/200' },
      { id: 'p234', name: '纯棉休闲女士衬衫 夏季款', price: 129, qty: 1, img: 'https://picsum.photos/id/234/200/200' },
    ],
    total: 467,
  },
  {
    id: 'OD202309101234',
    status: '已完成',
    products: [{ id: 'p235', name: '中长款风衣外套 秋季新款时尚气质', price: 399, qty: 1, img: 'https://picsum.photos/id/235/200/200' }],
    total: 399,
  },
];

export default function MyOrderPage() {
  const [active, setActive] = useState<OrderStatus>('全部');

  const tabs: OrderStatus[] = ['全部', '待付款', '待发货', '待收货', '待评价', '已完成', '已取消'];

  const counts = useMemo(() => {
    const map = new Map<OrderStatus, number>();
    map.set('全部', initialOrders.length);
    tabs.forEach((t) => {
      if (t !== '全部') {
        map.set(t, initialOrders.filter((o) => o.status === t).length);
      }
    });
    return map;
  }, []);

  const filteredOrders = useMemo(() => {
    if (active === '全部') return initialOrders;
    return initialOrders.filter((o) => o.status === active);
  }, [active]);

  const goOrderDetail = (orderId: string) => {
    // 可替换为 /orderDetail?id=xxx
    alert(`跳转到订单详情: ${orderId}`);
  };

  const onAction = (action: string) => {
    // 这里可以接入真实流程
    if (action === '立即支付') {
      // 模拟处理
      alert('支付成功！');
    } else if (action === '查看物流') {
      alert('查看物流');
    } else if (action === '确认收货') {
      alert('确认收货');
    } else if (action === '申请售后') {
      alert('申请售后');
    } else if (action === '再次购买') {
      alert('再次购买');
    } else if (action === '评价商品') {
      alert('评价商品');
    } else if (action === '联系客服') {
      alert('联系客服');
    } else if (action === '提醒发货') {
      alert('已提醒商家尽快发货');
    } else if (action === '取消订单') {
      alert('订单已取消');
    }
  };

  return (
    <div
      style={{
        background: '#f7f7f7',
        color: COLORS.dark,
        maxWidth: 375,
        margin: '0 auto',
        paddingBottom: 'env(safe-area-inset-bottom, 16px)',
        minHeight: '100vh',
      }}
    >
      {/* 页头 固定 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          maxWidth: 375,
          margin: '0 auto',
          zIndex: 100,
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 12,
          boxShadow: COLORS.shadowSm as any,
          borderBottom: `1px solid ${COLORS.lightGray}`,
        }}
      >
        <button
          style={{ background: 'transparent', border: 0, cursor: 'pointer' }}
          aria-label="返回"
          onClick={() => (window.location.href = '/me')}
        >
          <i className="fa-solid fa-arrow-left" />
        </button>
        <div style={{ fontSize: 19, fontWeight: 600, color: COLORS.dark, flex: 1, textAlign: 'center' }}>我的订单</div>
        <button style={{ background: 'transparent', border: 0 }}>
          <i className="fa-solid fa-magnifying-glass" />
        </button>
      </div>

      {/* 顶部占位，避免被固定头遮挡 */}
      <div style={{ height: 56 }} />

      {/* 订单筛选（置顶，横向滚动） */}
      <div
        style={{
          position: 'sticky',
          top: 56,
          zIndex: 90,
          background: '#fff',
          boxShadow: COLORS.shadowSm as any,
          marginBottom: 12,
          padding: 12,
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        <div style={{ display: 'flex', gap: 1 }}>
          {tabs.map((tab) => {
            const isActive = active === tab;
            return (
              <div
                key={tab}
                onClick={() => setActive(tab)}
                style={{
                  padding: '12px 16px',
                  fontSize: 14,
                  minWidth: 70,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  cursor: 'pointer',
                  color: isActive ? COLORS.primary : COLORS.dark,
                  fontWeight: isActive ? 600 : 400,
                  position: 'relative',
                  textAlign: 'center' as const,
                }}
              >
                {tab}
                <span style={{ fontSize: 12, color: isActive ? COLORS.primary : COLORS.darkGray, marginLeft: 5 }}>
                  {counts.get(tab) ?? 0}
                </span>
                {isActive && (
                  <span
                    style={{
                      content: "''",
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: 3,
                      background: COLORS.primary,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 订单列表 */}
      <div style={{ padding: 12 }}>
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 16px' }}>
            <div
              style={{
                width: 100,
                height: 100,
                margin: '0 auto 16px',
                borderRadius: '50%',
                background: COLORS.primaryLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 40,
                color: COLORS.primary,
              }}
            >
              <i className="fa-solid fa-box-open" />
            </div>
            <div style={{ fontSize: 18, marginBottom: 12, fontWeight: 500 }}>您还没有相关订单</div>
            <div style={{ color: COLORS.darkGray, marginBottom: 20 }}>去商城逛逛，发现心仪的商品吧</div>
            <button
              style={{
                background: COLORS.primary,
                color: '#fff',
                border: 'none',
                padding: '12px 32px',
                borderRadius: 24,
                fontWeight: 500,
                fontSize: 16,
                cursor: 'pointer',
              }}
              onClick={() => (window.location.href = '/')}
            >
              去逛逛
            </button>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="order-card"
              style={{
                background: '#fff',
                borderRadius: COLORS.radius,
                padding: 16,
                marginBottom: 12,
                boxShadow: COLORS.shadowSm as any,
                transition: 'all .3s',
              }}
              onClick={(e) => {
                // 非按钮区域点击，跳详情
                const target = e.target as HTMLElement;
                if (!target.closest('button')) goOrderDetail(order.id);
              }}
            >
              {/* 头部 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: 12,
                  marginBottom: 12,
                  borderBottom: `1px solid ${COLORS.lightGray}`,
                }}
              >
                <div style={{ fontSize: 13, color: COLORS.darkGray }}>订单号: {order.id}</div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    padding: '3px 10px',
                    borderRadius: 15,
                    ...statusPillStyle[order.status],
                  }}
                >
                  {order.status}
                </div>
              </div>

              {/* 明细 */}
              <div style={{ display: 'flex', marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  {order.products.map((p, idx) => (
                    <div key={p.id} style={{ display: 'flex', marginBottom: idx === order.products.length - 1 ? 0 : 12 }}>
                      <div
                        style={{
                          width: 70,
                          height: 70,
                          borderRadius: 8,
                          background: COLORS.lightGray,
                          overflow: 'hidden',
                          marginRight: 12,
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={p.img}
                          alt={p.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => ((e.currentTarget.src = '/images/placeholder.svg'))}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, marginBottom: 3, lineHeight: 1.4 }}>{p.name}</div>
                        <div style={{ fontSize: 13, color: COLORS.darkGray }}>¥{p.price} × {p.qty}</div>
                      </div>
                    </div>
                  ))}
                  <span style={{ fontSize: 13, color: COLORS.primary, marginLeft: 12 }}>
                    共{order.products.reduce((s, p) => s + p.qty, 0)}件商品
                  </span>
                </div>
              </div>

              {/* 汇总与操作 */}
              <div style={{ borderTop: `1px dashed ${COLORS.lightGray}`, paddingTop: 12, textAlign: 'right' as const }}>
                <div style={{ fontSize: 17, fontWeight: 600, color: COLORS.primary, marginBottom: 12 }}>
                  合计: ¥{order.total.toFixed(2)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  {order.status === '待付款' && (
                    <>
                      <button
                        style={actionBtn()}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction('取消订单');
                        }}
                      >
                        取消订单
                      </button>
                      <button
                        style={actionBtn(true)}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction('立即支付');
                        }}
                      >
                        立即支付
                      </button>
                    </>
                  )}
                  {order.status === '待发货' && (
                    <>
                      <button
                        style={actionBtn()}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction('联系客服');
                        }}
                      >
                        联系客服
                      </button>
                      <button
                        style={actionBtn()}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction('提醒发货');
                        }}
                      >
                        提醒发货
                      </button>
                    </>
                  )}
                  {order.status === '待收货' && (
                    <>
                      <button
                        style={actionBtn()}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction('查看物流');
                        }}
                      >
                        查看物流
                      </button>
                      <button
                        style={actionBtn(true)}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction('确认收货');
                        }}
                      >
                        确认收货
                      </button>
                    </>
                  )}
                  {order.status === '已完成' && (
                    <>
                      <button
                        style={actionBtn()}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction('申请售后');
                        }}
                      >
                        申请售后
                      </button>
                      <button
                        style={actionBtn()}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction('再次购买');
                        }}
                      >
                        再次购买
                      </button>
                      <button
                        style={actionBtn()}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction('评价商品');
                        }}
                      >
                        评价商品
                      </button>
                    </>
                  )}
                  {order.status === '已取消' && (
                    <button
                      style={actionBtn()}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction('再次购买');
                      }}
                    >
                      再次购买
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>


    </div>
  );
}

function actionBtn(primary = false): React.CSSProperties {
  return {
    padding: '8px 15px',
    borderRadius: 15,
    fontSize: 13.5,
    cursor: 'pointer',
    transition: 'all .3s',
    border: `1px solid ${primary ? COLORS.primary : COLORS.gray}`,
    background: primary ? COLORS.primary : '#fff',
    color: primary ? '#fff' : COLORS.dark,
  };
}