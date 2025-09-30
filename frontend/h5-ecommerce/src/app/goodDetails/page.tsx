'use client';

import React, { useMemo, useState } from 'react';
import { Swiper } from 'antd-mobile';

type Sku = { name: string; values: string[] };
type Comment = { user: string; content: string; date?: string; rate: number; imgs?: string[] };

const bannerImages = [
  'https://picsum.photos/id/103/800/800',
  'https://picsum.photos/id/104/800/800',
  'https://picsum.photos/id/105/800/800',
];

const skus: Sku[] = [
  { name: '颜色', values: ['黑色', '灰色', '卡其色'] },
  { name: '尺码', values: ['S', 'M', 'L', 'XL'] },
];

const comments: Comment[] = [
  { user: '张*用户', content: '这件外套超出我的预期！质量非常好，穿着合身，颜色和图片完全一致。', date: '2023-09-15', rate: 5, imgs: ['https://picsum.photos/id/110/200/200', 'https://picsum.photos/id/111/200/200'] },
  { user: '李*用户', content: '质量很好，穿着很显气质。M号刚好合身。', date: '2023-09-10', rate: 5, imgs: ['https://picsum.photos/id/112/200/200'] },
];

export default function GoodDetails() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [skuSel, setSkuSel] = useState<Record<string, string>>({ 颜色: '黑色', 尺码: 'M' });
  const [count, setCount] = useState(1);
  const price = useMemo(() => 389.0, []);
  const original = 499.0;
  const discount = '78折';
  const ratingScore = 4.8;
  const ratingUsers = 235;
  const monthSales = 568;
  const cartCount = 3;

  const handleSelect = (group: string, val: string) => {
    setSkuSel((s) => ({ ...s, [group]: val }));
  };

  const starRow = (v: number) => {
    const full = Math.floor(v);
    const half = v - full >= 0.5;
    const arr = Array.from({ length: 5 }).map((_, i) => {
      if (i < full) return '★';
      if (i === full && half) return '☆';
      return '☆';
    });
    return arr.join('');
  };

  return (
    <div style={{ background: '#f7f7f7', minHeight: '100vh', paddingBottom: 100, maxWidth: 375, margin: '0 auto', position: 'relative' }}>
      {/* 顶部导航栏（固定） */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: '#fff',
          padding: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        }}
      >
        <button
          onClick={() => history.back()}
          aria-label="返回"
          style={{
            background: 'none',
            border: 'none',
            width: 44,
            height: 44,
            borderRadius: '50%',
            fontSize: '1.1rem',
            cursor: 'pointer',
          }}
        >
          ←
        </button>
        <div style={{ fontSize: '1rem', fontWeight: 600, flex: 1, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          休闲格纹西装外套
        </div>
        <button
          aria-label="分享"
          style={{
            background: 'none',
            border: 'none',
            width: 44,
            height: 44,
            borderRadius: '50%',
            fontSize: '1.1rem',
            cursor: 'pointer',
          }}
        >
          ⤴
        </button>
      </div>

      {/* 商品图片轮播（角标/收藏/圆点） */}
      <div style={{ position: 'relative', background: '#fff', height: 380, marginBottom: 8, overflow: 'hidden' }}>
        <Swiper
          autoplay
          loop
          style={{ '--height': '380px', '--border-radius': '0px' } as any}
          onIndexChange={setActiveIndex}
        >
          {bannerImages.map((src, idx) => (
            <Swiper.Item key={idx}>
              <div style={{ width: '100%', height: 380, position: 'relative', overflow: 'hidden', background: '#f5f5f5' }}>
                {/* 角标仅首图展示 */}
                {idx === 0 ? (
                  <span
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      background: '#ff5722',
                      color: '#fff',
                      padding: '5px 12px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                      zIndex: 2,
                    }}
                  >
                    新品上市
                  </span>
                ) : null}
                {/* 收藏按钮 */}
                <button
                  onClick={() => setLiked((v) => !v)}
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.85)',
                    border: 'none',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    zIndex: 2,
                  }}
                >
                  {liked ? '❤' : '🤍'}
                </button>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            </Swiper.Item>
          ))}
        </Swiper>
        {/* 底部圆点 */}
        <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
          {bannerImages.map((_, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: i === activeIndex ? '#fff' : 'rgba(255,255,255,0.6)',
              }}
            />
          ))}
        </div>
      </div>

      {/* 商品信息（标题/价格/优惠/统计/店铺） */}
      <div className="product-info" style={{ background: '#fff', padding: 16, marginBottom: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
        <div className="product-title" style={{ fontSize: '1.2rem', fontWeight: 600, lineHeight: 1.4, marginBottom: 12 }}>
          休闲格纹西装外套 2023秋季新款时尚气质宽松百搭
        </div>
        <div className="product-price" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div className="current-price" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#e29692' }}>¥{price.toFixed(2)}</div>
          <div className="original-price" style={{ fontSize: '1rem', color: '#666', textDecoration: 'line-through' }}>¥{original.toFixed(2)}</div>
          <div className="discount" style={{ background: '#ffebee', color: '#e53935', padding: '3px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
            {discount}
          </div>
        </div>
        <div className="promotions" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {[
            { icon: '🏷️', text: '满200减30' },
            { icon: '🚚', text: '包邮' },
            { icon: '↩️', text: '7天无理由' },
          ].map((p, i) => (
            <span key={i} className="promotion-tag" style={{ background: '#f9f0ef', color: '#e29692', padding: '4px 8px', borderRadius: 4, fontSize: 12 }}>
              {p.icon} {p.text}
            </span>
          ))}
        </div>
        <div className="stats" style={{ display: 'flex', gap: 16, color: '#666', fontSize: 12, padding: '8px 0', borderTop: '1px solid #f5f5f5', borderBottom: '1px solid #f5f5f5', marginBottom: 12 }}>
          <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>⭐ <span>{ratingScore}分</span></div>
          <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>💬 <span>{ratingUsers}条评价</span></div>
          <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>📈 <span>月销{monthSales}</span></div>
        </div>
        {/* 店铺信息 */}
        <div className="shop-info" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="shop-avatar" style={{ width: 50, height: 50, borderRadius: '50%', background: '#f5f5f5', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="https://picsum.photos/id/64/100/100" alt="品牌店铺" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="shop-details" style={{ flex: 1 }}>
            <div className="shop-name" style={{ fontWeight: 600, marginBottom: 4 }}>StyleHub精品女装旗舰店</div>
            <div className="shop-rating" style={{ fontSize: 12, color: '#666', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#ffc107' }}>{starRow(4.5)}</span>
              <span>4.8分</span>
            </div>
            <button
              style={{
                marginTop: 8,
                background: '#f9f0ef',
                color: '#e29692',
                border: 'none',
                padding: '6px 10px',
                borderRadius: 6,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              进店逛逛 ›
            </button>
          </div>
        </div>
      </div>

      {/* 规格选择 */}
      <div className="spec-section" style={{ background: '#fff', padding: 16, marginBottom: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.05)', borderRadius: 12 }}>
        <div className="section-title" style={{ fontSize: '1rem', fontWeight: 600, position: 'relative', paddingLeft: 10, marginBottom: 12 }}>
          规格选择
          <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', height: '65%', width: 3, background: '#e29692', borderRadius: 10 }} />
        </div>

        {skus.map((g) => (
          <div key={g.name} className="spec-group" style={{ marginBottom: 16 }}>
            <div className="spec-label" style={{ fontSize: 13, marginBottom: 8, color: '#666' }}>{g.name}</div>
            <div className="spec-options" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {g.values.map((v) => {
                const active = skuSel[g.name] === v;
                return (
                  <div
                    key={v}
                    onClick={() => handleSelect(g.name, v)}
                    className={`spec-option${active ? ' selected' : ''}`}
                    style={{
                      border: active ? '1px solid #e29692' : '1px solid #e0e0e0',
                      background: active ? '#f9f0ef' : '#fff',
                      color: active ? '#e29692' : '#333',
                      padding: '8px 15px',
                      borderRadius: 20,
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    {v}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="quantity-selector" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="quantity-label" style={{ flex: 1, color: '#333' }}>数量</div>
          <div className="quantity-control" style={{ display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: 20, overflow: 'hidden' }}>
            <button
              className="qty-btn"
              onClick={() => setCount((c) => Math.max(1, c - 1))}
              style={{ width: 40, height: 40, background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              -
            </button>
            <div className="qty-value" style={{ minWidth: 30, textAlign: 'center' }}>{count}</div>
            <button
              className="qty-btn"
              onClick={() => setCount((c) => c + 1)}
              style={{ width: 40, height: 40, background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* 图文详情 */}
      <div className="detail-section" style={{ background: '#fff', padding: 16, marginBottom: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.05)', borderRadius: 12 }}>
        <div className="section-title" style={{ fontSize: '1rem', fontWeight: 600, position: 'relative', paddingLeft: 10, marginBottom: 12 }}>
          图文详情
          <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', height: '65%', width: 3, background: '#e29692', borderRadius: 10 }} />
        </div>
        <p style={{ lineHeight: 1.8, marginBottom: 16 }}>
          这款休闲格纹西装外套采用优质混纺面料，手感柔软舒适，具有良好的垂坠感和挺括度。经典格纹图案设计，时尚百搭。
        </p>
        <div className="detail-images">
          {['106/600/400', '107/600/600', '108/600/600', '109/600/500'].map((id, i) => (
            <img key={i} className="detail-img" src={`https://picsum.photos/id/${id}`} alt="详情图" style={{ width: '100%', marginBottom: 12, borderRadius: 8 }} />
          ))}
        </div>
      </div>

      {/* 用户评价 */}
      <div className="reviews-section" style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
        <div className="reviews-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="section-title" style={{ fontSize: '1rem', fontWeight: 600, position: 'relative', paddingLeft: 10 }}>
            用户评价 ({ratingUsers})
            <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', height: '65%', width: 3, background: '#e29692', borderRadius: 10 }} />
          </div>
          <button style={{ background: '#f9f0ef', color: '#e29692', border: 'none', borderRadius: 6, padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}>
            查看全部 ›
          </button>
        </div>
        {/* 评分概览 */}
        <div className="rating-overview" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div className="rating-score" style={{ fontSize: '2rem', fontWeight: 700, color: '#e29692' }}>{ratingScore}</div>
          <div>
            <div className="rating-stars" style={{ color: '#ffc107', marginBottom: 4 }}>{starRow(4.5)}</div>
            <div style={{ fontSize: 12, color: '#666' }}>98% 用户推荐</div>
          </div>
        </div>
        {/* 两条示例评价 */}
        {comments.map((c, i) => (
          <div key={i} className="review-item" style={{ borderBottom: i === comments.length - 1 ? 'none' : '1px solid #f0f0f0', padding: '12px 0' }}>
            <div className="review-header" style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <div className="review-avatar" style={{ width: 40, height: 40, borderRadius: '50%', background: '#f5f5f5', overflow: 'hidden', marginRight: 10 }}>
                <img src={`https://picsum.photos/id/${65 + i}/100/100`} alt="用户头像" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <div className="reviewer-name" style={{ fontWeight: 600, marginBottom: 2 }}>{c.user}</div>
                <div className="review-rating" style={{ fontSize: 12, color: '#ffc107' }}>{starRow(c.rate)}</div>
                <div className="review-date" style={{ fontSize: 12, color: '#999' }}>{c.date}</div>
              </div>
            </div>
            <div className="review-text" style={{ lineHeight: 1.6, marginBottom: 8, color: '#333' }}>{c.content}</div>
            {c.imgs?.length ? (
              <div className="review-images" style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '5px 0' }}>
                {c.imgs.map((s, idx) => (
                  <div key={idx} className="review-image" style={{ width: 80, height: 80, borderRadius: 4, overflow: 'hidden', background: '#f5f5f5', flexShrink: 0 }}>
                    <img src={s} alt="买家秀" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {/* 底部操作栏 */}
      <div className="action-bar" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, display: 'flex', background: '#fff', boxShadow: '0 -2px 10px rgba(0,0,0,0.08)', maxWidth: 375, margin: '0 auto', zIndex: 100 }}>
        <button className="action-btn" style={{ flex: 1, background: 'none', border: 'none', padding: '10px 0', fontSize: 12, color: '#666', position: 'relative' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>🏠</div>
          <span>首页</span>
        </button>
        <button className="action-btn" style={{ flex: 1, background: 'none', border: 'none', padding: '10px 0', fontSize: 12, color: '#666', position: 'relative' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>🛒</div>
          <span>购物车</span>
          <span className="cart-counter" style={{ position: 'absolute', top: 5, right: 20, background: '#ff5500', color: '#fff', width: 20, height: 20, borderRadius: '50%', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {cartCount}
          </span>
        </button>
        <button className="action-btn" style={{ flex: 1, background: 'none', border: 'none', padding: '10px 0', fontSize: 12, color: '#666', position: 'relative' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>👤</div>
          <span>我的</span>
        </button>
        <div className="primary-action" style={{ flex: 2, display: 'flex', color: '#fff', fontWeight: 600, fontSize: '1rem' }}>
          <div
            className="add-to-cart"
            onClick={() => alert('商品已成功加入购物车!')}
            style={{ flex: 1, background: '#e29692', padding: '15px 0', textAlign: 'center', cursor: 'pointer' }}
          >
            加入购物车
          </div>
          <div
            className="buy-now"
            onClick={() => alert('即将跳转到订单确认页面!')}
            style={{ flex: 1, background: '#c57d7a', padding: '15px 0', textAlign: 'center', cursor: 'pointer' }}
          >
            立即购买
          </div>
        </div>
      </div>
    </div>
  );
}