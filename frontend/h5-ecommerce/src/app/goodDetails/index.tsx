'use client';

import React, { useMemo, useState } from 'react';
import { Swiper } from 'antd-mobile';

type Sku = { name: string; values: string[] };
type Comment = { user: string; content: string; rate: number; imgs?: string[] };

const bannerImages = [
  'https://picsum.photos/id/1011/800/800',
  'https://picsum.photos/id/1021/800/800',
  'https://picsum.photos/id/1031/800/800',
];

const skus: Sku[] = [
  { name: '颜色', values: ['粉色', '白色', '黑色'] },
  { name: '尺码', values: ['S', 'M', 'L'] },
];

const comments: Comment[] = [
  { user: '小美**', content: '面料舒服，版型显瘦，颜色很正！', rate: 5, imgs: ['https://picsum.photos/id/177/200/200'] },
  { user: '阿杰**', content: '尺码正常，发货很快。', rate: 4 },
];

export default function GoodDetails() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [skuSel, setSkuSel] = useState<Record<string, string>>({});
  const [count, setCount] = useState(1);
  const price = useMemo(() => 129.0, []);
  const stock = 199;

  const handleSelect = (group: string, val: string) => {
    setSkuSel((s) => ({ ...s, [group]: s[group] === val ? '' : val }));
  };

  return (
    <div style={{ background: '#f7f7f7', minHeight: '100vh', paddingBottom: 90, maxWidth: 375, margin: '0 auto', position: 'relative' }}>
      {/* 顶部图片/轮播 */}
      <div style={{ position: 'relative' }}>
        <Swiper
          autoplay
          loop
          style={{ '--height': '360px', '--border-radius': '0px' } as any}
          onIndexChange={setActiveIndex}
        >
          {bannerImages.map((src, idx) => (
            <Swiper.Item key={idx}>
              <div style={{ width: '100%', height: '360px', overflow: 'hidden' }}>
                <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              </div>
            </Swiper.Item>
          ))}
        </Swiper>
        <div
          style={{
            position: 'absolute',
            right: 12,
            bottom: 12,
            background: 'rgba(0,0,0,0.5)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: 12,
            fontSize: 12,
          }}
        >
          {activeIndex + 1}/{bannerImages.length}
        </div>
      </div>

      {/* 标题价格区 */}
      <div style={{ background: '#fff', padding: 12 }}>
        <div style={{ color: '#e63946', fontSize: '1.6rem', fontWeight: 800 }}>¥{price.toFixed(2)}</div>
        <div style={{ marginTop: 8, fontSize: '1rem', color: '#333', lineHeight: 1.5 }}>
          纯棉休闲女士T恤 夏季薄款 舒适亲肤 百搭上衣
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['满300减50', '7天无理由', '退货包运费'].map((t) => (
            <span key={t} style={{ fontSize: 12, color: '#e29692', background: '#f9f0ef', padding: '2px 8px', borderRadius: 10 }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* 选择规格/数量 */}
      <div style={{ background: '#fff', marginTop: 10, padding: 12 }}>
        {skus.map((g) => (
          <div key={g.name} style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{g.name}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {g.values.map((v) => {
                const active = skuSel[g.name] === v;
                return (
                  <button
                    key={v}
                    onClick={() => handleSelect(g.name, v)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 20,
                      border: active ? '2px solid #e29692' : '1px solid #eee',
                      background: active ? '#fff5f4' : '#fff',
                      color: active ? '#e29692' : '#333',
                      cursor: 'pointer',
                    }}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <div style={{ color: '#666' }}>数量</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setCount((c) => Math.max(1, c - 1))}
              style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #eee', background: '#fff' }}
            >
              -
            </button>
            <div style={{ minWidth: 30, textAlign: 'center' }}>{count}</div>
            <button
              onClick={() => setCount((c) => Math.min(stock, c + 1))}
              style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #eee', background: '#fff' }}
            >
              +
            </button>
          </div>
        </div>
        <div style={{ marginTop: 6, color: '#999', fontSize: 12 }}>库存：{stock}</div>
      </div>

      {/* 店铺卡片 */}
      <div style={{ background: '#fff', marginTop: 10, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🛍️</div>
          <div>
            <div style={{ fontWeight: 600 }}>优品牛仔官方店</div>
            <div style={{ fontSize: 12, color: '#999' }}>销量 12.3万 · 好评率 98%</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ padding: '6px 12px', borderRadius: 16, border: '1px solid #eee', background: '#fff' }}>进店</button>
          <button style={{ padding: '6px 12px', borderRadius: 16, border: '1px solid #eee', background: '#fff' }}>关注</button>
        </div>
      </div>

      {/* 评价概览 */}
      <div style={{ background: '#fff', marginTop: 10, padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontWeight: 600 }}>商品评价（{comments.length}）</div>
          <div style={{ color: '#e29692' }}>查看更多 ›</div>
        </div>
        {comments.map((c, i) => (
          <div key={i} style={{ padding: '10px 0', borderTop: i ? '1px solid #f5f5f5' : 'none' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{c.user}</div>
            <div style={{ color: '#333', lineHeight: 1.5 }}>{c.content}</div>
            {c.imgs?.length ? (
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {c.imgs.map((s, idx) => (
                  <img key={idx} src={s} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {/* 图文详情占位 */}
      <div style={{ background: '#fff', marginTop: 10, padding: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>图文详情</div>
        <div style={{ color: '#666', fontSize: 14, lineHeight: 1.6 }}>
          面料成分：100%棉；柔软透气，亲肤舒适。洗涤建议：翻面冷水手洗，避免长时间浸泡。
        </div>
        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <img src="https://picsum.photos/id/211/400/400" style={{ width: '100%', borderRadius: 8 }} />
          <img src="https://picsum.photos/id/212/400/400" style={{ width: '100%', borderRadius: 8 }} />
          <img src="https://picsum.photos/id/213/400/400" style={{ width: '100%', borderRadius: 8 }} />
          <img src="https://picsum.photos/id/214/400/400" style={{ width: '100%', borderRadius: 8 }} />
        </div>
      </div>

      {/* 底部操作条 */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: 375,
            margin: '0 auto',
            background: '#fff',
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            padding: '8px 10px',
            gap: 8,
          }}
        >
          <button
            style={{
              width: 50,
              height: 40,
              background: '#fff',
              border: '1px solid #eee',
              borderRadius: 10,
            }}
          >
            客服
          </button>
          <button
            style={{
              width: 50,
              height: 40,
              background: '#fff',
              border: '1px solid #eee',
              borderRadius: 10,
            }}
          >
            收藏
          </button>
          <button
            onClick={() => alert('已加入购物车')}
            style={{
              flex: 1,
              height: 44,
              background: 'linear-gradient(90deg, #ffd166, #ffca52)',
              border: 'none',
              color: '#7a4f33',
              borderRadius: 12,
              fontWeight: 800,
            }}
          >
            加入购物车
          </button>
          <button
            onClick={() => alert('立即购买')}
            style={{
              flex: 1,
              height: 44,
              background: 'linear-gradient(90deg, #e63946, #d64141)',
              border: 'none',
              color: '#fff',
              borderRadius: 12,
              fontWeight: 800,
            }}
          >
            立即购买
          </button>
        </div>
      </div>
    </div>
  );
}