'use client';

import React, { useState } from 'react';
import { Modal } from 'antd-mobile';
import TabBar from '../components/TabBar';

type OrderStatus = {
  label: string;
  icon: React.ReactNode;
  count?: number;
};

type Product = {
  id: number;
  name: string;
  price: number | string;
  image: string;
};

const orderStatuses: OrderStatus[] = [
  { label: '待付款', icon: '💳', count: 2 },
  { label: '待发货', icon: '📦', count: 1 },
  { label: '待收货', icon: '🚚' },
  { label: '待评价', icon: '💬', count: 3 },
  { label: '退款/售后', icon: '↩️' },
];

const recommendProducts: Product[] = [
  { id: 1, name: '修身休闲时尚夹克 2023新款', price: '¥289.00', image: 'https://picsum.photos/id/1004/300/300' },
  { id: 2, name: '纯棉字母连帽卫衣女款', price: '¥159.00', image: 'https://picsum.photos/id/1013/300/300' },
  { id: 3, name: '直筒修身弹力牛仔裤', price: '¥229.00', image: 'https://picsum.photos/id/1028/300/300' },
  { id: 4, name: '春夏女士V领百搭连衣裙', price: '¥199.00', image: 'https://picsum.photos/id/1033/300/300' },
];

export default function MePage() {
  const [confirm1, setConfirm1] = useState(false);
  const [confirm2, setConfirm2] = useState(false);
  return (
    <>
      {/* 页面容器 */}
      <div
        style={{
          backgroundColor: '#f7f7f7',
          color: '#333',
          maxWidth: 375,
          margin: '0 auto',
          position: 'relative',
          minHeight: '100vh',
          paddingBottom: 100,
          paddingTop: 60,
        }}
      >
        {/* 页头 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
            background: '#fff',
            position: 'fixed',
            left: 0,
            right: 0,
            top: 0,
            top: 0,
            zIndex: 100,
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
            borderBottom: '1px solid #f5f5f5',
          }}
        >
          <button
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.1rem',
              cursor: 'pointer',
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background 0.3s',
            }}
            onMouseOver={(e) => ((e.currentTarget.style.background = '#f5f5f5'))}
            onMouseOut={(e) => ((e.currentTarget.style.background = 'transparent'))}
            aria-label="返回"
          >
            {/* ← */}
          </button>
          <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>个人中心</div>
          <button
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.1rem',
              cursor: 'pointer',
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background 0.3s',
            }}
            onMouseOver={(e) => ((e.currentTarget.style.background = '#f5f5f5'))}
            onMouseOut={(e) => ((e.currentTarget.style.background = 'transparent'))}
            aria-label="通知"
          >
            🔔
          </button>
        </div>

        {/* 用户信息卡片 */}
        <div
          style={{
            background: 'linear-gradient(135deg, #e29692, #c57d7a)',
            padding: 24,
            color: '#fff',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: 24,
          }}
        >
          <div
            style={{
              content: '""',
              position: 'absolute',
              top: -50,
              right: -50,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
            }}
          />
          <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 12px' }}>
            <img
              src="https://picsum.photos/id/64/200/200"
              alt="用户头像"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '3px solid rgba(255,255,255,0.3)',
                objectFit: 'cover',
                background: '#fff',
              }}
              onError={(e) => {
                (e.currentTarget.style.display = 'none');
              }}
            />
            {/* 占位 */}
            {/* <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#f0f0f0',
                color: '#999',
                fontSize: '2rem',
                borderRadius: '50%',
              }}
            >
              👤
            </div> */}
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>张美丽</div>
            <div>138****1234</div>
            <div
              style={{
                background: '#ffd700',
                color: '#333',
                padding: '6px 16px',
                borderRadius: 20,
                fontSize: '0.9rem',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                margin: '10px auto',
                gap: 6,
              }}
            >
              👑 铂金会员
            </div>
          </div>
        </div>

        {/* 会员卡片 3列 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            padding: '0 16px',
            marginBottom: 24,
          }}
        >
          {[
            { icon: '🎁', title: '我的红包', value: '5个未使用' },
            { icon: '🎫', title: '我的优惠券', value: '3张可用' },
            { icon: '🪙', title: '我的积分', value: '1250分' },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: 12,
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                transition: 'transform 0.3s, box-shadow 0.3s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.08)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.05)';
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: '#f9f0ef',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  fontSize: '1.3rem',
                  color: '#e29692',
                }}
              >
                {item.icon}
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 500, marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: '0.85rem', color: '#666' }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* 我的订单状态 */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: 16,
            margin: '0 16px 24px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, position: 'relative', paddingLeft: 10 }}>
              我的订单
              <span
                style={{
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  height: '65%',
                  width: 3,
                  background: '#e29692',
                  borderRadius: 10,
                }}
              />
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>查看全部</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {orderStatuses.map((status, idx) => (
              <div
                key={idx}
                style={{
                  textAlign: 'center',
                  borderRadius: 12,
                  padding: '8px 0',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px',
                      background: '#f5f5f5',
                      borderRadius: '50%',
                      fontSize: '1.1rem',
                      color: '#e29692',
                    }}
                  >
                    {status.icon}
                  </div>
                  {status.count ? (
                    <div
                      style={{
                        position: 'absolute',
                        top: -5,
                        right: 15,
                        background: '#ff5500',
                        color: '#fff',
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        fontSize: '0.7rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {status.count}
                    </div>
                  ) : null}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#333' }}>{status.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 功能导航列表 */}
        <div style={{ background: '#fff', borderRadius: 12, margin: '0 16px 24px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
          {[
            { icon: '❤️', name: '我的收藏' },
            { icon: '📍', name: '地址管理' },
            { icon: '🛡️', name: '账户安全' },
            { icon: '🎧', name: '客服中心' },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 16,
                borderBottom: idx === 3 ? 'none' : '1px solid #f5f5f5',
                cursor: 'pointer',
                transition: 'background 0.3s',
              }}
              onMouseOver={(e) => ((e.currentTarget.style.background = '#f5f5f5'))}
              onMouseOut={(e) => ((e.currentTarget.style.background = 'transparent'))}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    background: '#f9f0ef',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                    color: '#e29692',
                  }}
                >
                  {item.icon}
                </div>
                <div style={{ fontWeight: 500 }}>{item.name}</div>
              </div>
              <div>›</div>
            </div>
          ))}
        </div>



        {/* 退出登录 */}
        <div style={{ padding: '0 16px 16px' }}>
          <button
            onClick={() => {
              setConfirm1(true);
            }}
            style={{
              width: '100%',
              padding: 14,
              border: 'none',
              borderRadius: 12,
              fontSize: '1rem',
              fontWeight: 700,
              color: '#fff',
              cursor: 'pointer',
              background: 'linear-gradient(90deg, #e63946, #d64141)',
              boxShadow: '0 8px 20px rgba(230, 57, 70, 0.25)',
            }}
          >
            退出登录
          </button>
        </div>

        {/* 确认退出 - 受控弹窗（适配 React 19） */}
        <Modal
          visible={typeof confirm1 !== 'undefined' ? confirm1 : false}
          onClose={() => setConfirm1(false)}
          closeOnAction={false}
          maskStyle={{
            background: 'linear-gradient(135deg, rgba(255,153,102,0.55), rgba(230,57,70,0.6))',
          }}
          bodyStyle={{
            background: '#1f1f1f',
            color: '#fff',
            borderRadius: 16,
          }}
          title={
            <div style={{ fontWeight: 800, color: '#ff6b35', textAlign: 'center', paddingTop: 8 }}>
              确定要退出登录吗？
            </div>
          }
          content={
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 1.6, textAlign: 'center' }}>
              退出后将无法接收订单更新与消息提醒
              <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setConfirm1(false)}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    border: 'none',
                    borderRadius: 10,
                    background: 'linear-gradient(90deg, #ffd166, #ffca52)',
                    color: '#7a4f33',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  再想想
                </button>
                <button
                  onClick={() => {
                    setConfirm1(false);
                    setConfirm2(true);
                  }}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    border: 'none',
                    borderRadius: 10,
                    background: 'linear-gradient(90deg, #e63946, #d64141)',
                    color: '#fff',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  继续退出
                </button>
              </div>
            </div>
          }
        />
        <Modal
          visible={typeof confirm2 !== 'undefined' ? confirm2 : false}
          onClose={() => setConfirm2(false)}
          closeOnAction={false}
          maskStyle={{
            background: 'linear-gradient(135deg, rgba(255,153,102,0.55), rgba(230,57,70,0.6))',
          }}
          bodyStyle={{
            background: '#1f1f1f',
            color: '#fff',
            borderRadius: 16,
          }}
          title={
            <div style={{ fontWeight: 800, color: '#ff6b35', textAlign: 'center', paddingTop: 8 }}>
              再次确认
            </div>
          }
          content={
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 1.6, textAlign: 'center' }}>
              退出后需要重新登录，是否继续？
              <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setConfirm2(false)}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    border: 'none',
                    borderRadius: 10,
                    background: 'linear-gradient(90deg, #ffd166, #ffca52)',
                    color: '#7a4f33',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    try { localStorage.removeItem('token'); sessionStorage.removeItem('token'); } catch {}
                    window.location.href = '/login';
                  }}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    border: 'none',
                    borderRadius: 10,
                    background: 'linear-gradient(90deg, #e63946, #d64141)',
                    color: '#fff',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  确认退出
                </button>
              </div>
            </div>
          }
        />

        {/* 猜你喜欢 */}
        <div style={{ padding: '0 16px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, position: 'relative', paddingLeft: 10 }}>
              猜你喜欢
              <span
                style={{
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  height: '65%',
                  width: 3,
                  background: '#e29692',
                  borderRadius: 10,
                }}
              />
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>更多推荐</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {recommendProducts.map((p) => (
              <div
                key={p.id}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.08)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.05)';
                }}
              >
                <div style={{ height: 150, position: 'relative', overflow: 'hidden', background: '#f5f5f5' }}>
                  <img
                    src={p.image}
                    alt={p.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                    onError={(e) => {
                      (e.currentTarget.style.display = 'none');
                    }}
                    onMouseOver={(e) => ((e.currentTarget.style.transform = 'scale(1.05)'))}
                    onMouseOut={(e) => ((e.currentTarget.style.transform = 'none'))}
                  />
                </div>
                <div style={{ padding: 12 }}>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      marginBottom: 4,
                      height: 40,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.4,
                    }}
                  >
                    {p.name}
                  </div>
                  <div style={{ fontWeight: 'bold', color: '#e29692' }}>{p.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 固定底部导航（项目已有 TabBar 组件） */}
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 100 }}>
          <div style={{ maxWidth: 375, margin: '0 auto' }}>
            <TabBar />
          </div>
        </div>
      </div>
    </>
  );
}