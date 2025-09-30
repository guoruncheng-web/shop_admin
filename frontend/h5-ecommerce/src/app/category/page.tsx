'use client';

import React, { useMemo, useState } from 'react';
import TabBar from '../components/TabBar';

type PrimaryCategory = {
  key: string;
  name: string;
  icon: string;
};

type SubCategory = {
  key: string;
  name: string;
  icon: string;
};

type Product = {
  id: number;
  name: string;
  price: string;
  image: string;
  badge?: 'hot' | 'new' | 'boom';
};

const primaryCategories: PrimaryCategory[] = [
  { key: 'women', name: '女装', icon: '👗' },
  { key: 'men', name: '男装', icon: '👔' },
  { key: 'shoe', name: '鞋靴箱包', icon: '👜' },
  { key: 'sport', name: '运动户外', icon: '🏃' },
  { key: 'beauty', name: '内衣美妆', icon: '💄' },
  { key: 'jewel', name: '配饰饰品', icon: '💍' },
  { key: 'kids', name: '童装母婴', icon: '👶' },
  { key: 'designer', name: '设计师款', icon: '🎨' },
  { key: 'luxury', name: '奢侈品牌', icon: '👑' },
  { key: 'plus', name: '大码专区', icon: '➕' },
  { key: 'homewear', name: '居家服饰', icon: '🏠' },
  { key: 'deal', name: '特惠专区', icon: '⭐' },
  { key: 'new', name: '新品首发', icon: '🔥' },
];

const defaultSubcategories: SubCategory[] = [
  { key: 'tops', name: 'T恤/上衣', icon: '👕' },
  { key: 'coat', name: '外套', icon: '🧥' },
  { key: 'vest', name: '马甲', icon: '🦺' },
  { key: 'dress', name: '连衣裙', icon: '👗' },
  { key: 'skirt', name: '裙装', icon: '🧣' },
  { key: 'pants', name: '裤装', icon: '🩳' },
];

const hotProducts: Product[] = [
  { id: 1, name: '纯色百搭针织衫 秋冬款', price: '¥129.00', image: 'https://picsum.photos/id/100/300/300', badge: 'hot' },
  { id: 2, name: '修身直筒牛仔裤 显瘦百搭', price: '¥199.00', image: 'https://picsum.photos/id/101/300/300', badge: 'new' },
  { id: 3, name: '字母印花连帽卫衣', price: '¥169.00', image: 'https://picsum.photos/id/102/300/300', badge: 'hot' },
  { id: 4, name: '休闲款风衣外套 秋季', price: '¥299.00', image: 'https://picsum.photos/id/103/300/300', badge: 'boom' },
];

export default function CategoryPage() {
  const [active, setActive] = useState<string>('women');

  const banner = useMemo(() => {
    const name = primaryCategories.find((c) => c.key === active)?.name ?? '女装';
    return {
      image: 'https://picsum.photos/id/237/600/300',
      label: `精选${name} 满300减50`,
    };
  }, [active]);

  const subcats = useMemo(() => defaultSubcategories, [active]);

  return (
    <>
      <div
        style={{
          backgroundColor: '#f7f7f7',
          color: '#333',
          maxWidth: 375,
          margin: '0 auto',
          position: 'relative',
          minHeight: '100vh',
          paddingBottom: 70,
          paddingTop: 60,
        }}
      >
        {/* 页头（固定） */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 12,
            background: '#fff',
            position: 'fixed',
            left: 0,
            right: 0,
            top: 0,
            zIndex: 100,
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
            borderBottom: '1px solid #f5f5f5',
            maxWidth: 375,
            margin: '0 auto',
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
          <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>商品分类</div>
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
            aria-label="筛选"
          >
            {/* ☰ */}
          </button>
        </div>

        {/* 搜索按钮条 */}
        <div
          style={{
            background: '#f9f9f9',
            border: '1px solid #e0e0e0',
            borderRadius: 20,
            padding: '8px 15px',
            display: 'flex',
            alignItems: 'center',
            width: '80%',
            minWidth: 160,
            margin: '12px auto',
            color: '#666',
          }}
        >
          <span style={{ marginRight: 8 }}>🔍</span>
          <span>搜索商品</span>
        </div>

        {/* 分类容器：左侧一级 + 右侧内容 */}
        <div
          style={{
            display: 'flex',
            height: 'calc(100vh - 150px)',
            overflow: 'hidden',
          }}
        >
          {/* 左侧一级分类 */}
          <div
            style={{
              width: '30%',
              background: '#fff',
              overflowY: 'auto',
              borderRight: '1px solid #f5f5f5',
              padding: '12px 0',
            }}
          >
            {primaryCategories.map((c) => {
              const isActive = c.key === active;
              return (
                <div
                  key={c.key}
                  onClick={() => setActive(c.key)}
                  style={{
                    padding: '12px 16px',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    borderLeft: isActive ? '3px solid #e29692' : '3px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    background: isActive ? 'rgba(226,150,146,0.1)' : 'transparent',
                    color: isActive ? '#e29692' : '#333',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  <span style={{ marginRight: 8, fontSize: '1.1rem', color: '#e29692' }}>{c.icon}</span>
                  <span>{c.name}</span>
                </div>
              );
            })}
          </div>

          {/* 右侧内容 */}
          <div
            style={{
              width: '70%',
              padding: 12,
              overflowY: 'auto',
            }}
          >
            {/* Banner */}
            <div
              style={{
                height: 120,
                borderRadius: 12,
                overflow: 'hidden',
                marginBottom: 16,
                position: 'relative',
              }}
            >
              <img
                src={banner.image}
                alt="分类Banner"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  (e.currentTarget.style.display = 'none');
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'rgba(0,0,0,0.5)',
                  color: '#fff',
                  padding: '8px 12px',
                  fontSize: '0.9rem',
                }}
              >
                {banner.label}
              </div>
            </div>

            {/* 女装热门 */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: '20px 0 12px',
              }}
            >
              <div
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  position: 'relative',
                  paddingLeft: 10,
                }}
              >
                女装热门
                <span
                  style={{
                    content: '""',
                    position: 'absolute' as const,
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
            </div>

            {/* 二级分类网格 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
                marginBottom: 20,
              }}
            >
              {subcats.map((s) => (
                <div
                  key={s.key}
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: '16px 12px',
                    textAlign: 'center' as const,
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
                  onClick={() => {
                    // 可替换为路由跳转/筛选逻辑
                    alert(`显示${s.name}分类的商品`);
                  }}
                >
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      margin: '0 auto 12px',
                      background: '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      color: '#e29692',
                    }}
                  >
                    {s.icon}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{s.name}</div>
                </div>
              ))}
            </div>

            {/* 热销推荐 */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: '20px 0 12px',
              }}
            >
              <div
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  position: 'relative',
                  paddingLeft: 10,
                }}
              >
                热销推荐
                <span
                  style={{
                    content: '""',
                    position: 'absolute' as const,
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
              <div style={{ fontSize: '0.9rem', color: '#666' }}>更多</div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12,
              }}
            >
              {hotProducts.map((p) => (
                <div
                  key={p.id}
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    overflow: 'hidden',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    position: 'relative',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.08)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.05)';
                  }}
                  onClick={() => alert('跳转到商品详情')}
                >
                  {/* badge */}
                  {p.badge ? (
                    <div
                      style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        padding: '3px 10px',
                        borderRadius: 12,
                        fontSize: '0.7rem',
                        color: '#fff',
                        zIndex: 2,
                        fontWeight: 500,
                        background:
                          p.badge === 'hot'
                            ? '#e29692'
                            : p.badge === 'new'
                            ? '#2196f3'
                            : '#ff6b6b',
                      }}
                    >
                      {p.badge === 'hot' ? '热卖' : p.badge === 'new' ? '新款' : '爆款'}
                    </div>
                  ) : null}

                  <div style={{ height: 160, overflow: 'hidden' }}>
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
                        marginBottom: 5,
                        height: 40,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical' as const,
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
        </div>
      </div>

      {/* 固定底部 TabBar（项目组件） */}
      <TabBar />
    </>
  );
}