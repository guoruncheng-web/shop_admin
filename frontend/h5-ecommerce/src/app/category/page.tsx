'use client';

import React, { useState } from 'react';
import TabBar from '../components/TabBar';

interface SubCategory {
  id: number;
  name: string;
  icon: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: { type: 'hot' | 'discount'; text: string };
}

interface Category {
  id: number;
  name: string;
  icon: string;
  subCategories: SubCategory[];
  products: Product[];
}

const mockCategories: Category[] = [
  {
    id: 1,
    name: '潮流女装',
    icon: '👗',
    subCategories: [
      { id: 1, name: 'T恤/上衣', icon: '👕' },
      { id: 2, name: '外套', icon: '🧥' },
      { id: 3, name: '马甲', icon: '🦺' },
      { id: 4, name: '连衣裙', icon: '👗' },
      { id: 5, name: '裙装', icon: '👗' },
      { id: 6, name: '裤装', icon: '👖' },
    ],
    products: [
      { id: 1, name: '纯色简约衬衫 春季新款', price: 159, image: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=200&h=170&crop=entropy' },
      { id: 2, name: '纯色百搭针织衫', price: 129, image: 'https://images.unsplash.com/photo-1578587018452-892bace6fa90?w=200&h=170&crop=entropy' },
      { id: 3, name: '修身直筒牛仔裤', price: 259, image: 'https://images.unsplash.com/photo-1506634572416-48cdfe530110?w=200&h=170&crop=entropy', badge: { type: 'hot', text: '热卖' } },
      { id: 4, name: '休闲连帽卫衣', price: 169, originalPrice: 212, image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=200&h=170&crop=entropy', badge: { type: 'discount', text: '8折' } },
      { id: 5, name: '简约休闲女式衬衫', price: 139, originalPrice: 185, image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200&h=170&crop=entropy', badge: { type: 'discount', text: '75折' } },
      { id: 6, name: '轻奢风衣外套', price: 299, originalPrice: 459, image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=200&h=170&crop=entropy', badge: { type: 'discount', text: '65折' } },
    ],
  },
  {
    id: 2,
    name: '时尚男装',
    icon: '👔',
    subCategories: [
      { id: 7, name: '衬衫', icon: '👔' },
      { id: 8, name: 'T恤', icon: '👕' },
      { id: 9, name: '夹克', icon: '🧥' },
    ],
    products: [],
  },
  {
    id: 3,
    name: '鞋靴箱包',
    icon: '👞',
    subCategories: [
      { id: 10, name: '运动鞋', icon: '👟' },
      { id: 11, name: '皮鞋', icon: '👞' },
      { id: 12, name: '箱包', icon: '👜' },
    ],
    products: [],
  },
  {
    id: 4,
    name: '运动户外',
    icon: '🏃',
    subCategories: [],
    products: [],
  },
  {
    id: 5,
    name: '内衣美妆',
    icon: '💄',
    subCategories: [],
    products: [],
  },
  {
    id: 6,
    name: '配饰饰品',
    icon: '💎',
    subCategories: [],
    products: [],
  },
  {
    id: 7,
    name: '童装母婴',
    icon: '👶',
    subCategories: [],
    products: [],
  },
  {
    id: 8,
    name: '设计师款',
    icon: '🎨',
    subCategories: [],
    products: [],
  },
];

export default function CategoryPage() {
  const [activeCategory, setActiveCategory] = useState(0);

  const currentCategory = mockCategories[activeCategory];

  return (
    <>
      <div style={{ maxWidth: 375, margin: '0 auto', minHeight: 'calc(100vh - 58px)', background: '#ffffff', paddingBottom: 58 }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          background: 'white',
          borderBottom: '1px solid #f5f5f5',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <div style={{
            fontSize: '1.3rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #e29692, #c57d7a)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            StyleHub
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: '1.1rem', color: '#666' }}>
            <span>🔍</span>
            <span>⚙️</span>
          </div>
        </div>

        {/* Page Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: '12px 8px',
          padding: 12,
          background: 'white',
          borderRadius: 12,
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        }}>
          <div style={{
            fontSize: '1.2rem',
            fontWeight: 600,
            position: 'relative',
            paddingLeft: 10,
          }}>
            <span style={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              height: '65%',
              width: 3,
              background: '#e29692',
              borderRadius: 10,
            }} />
            商品分类
          </div>
          <div style={{ fontSize: '0.85rem', color: '#666' }}>
            筛选 ⚙️
          </div>
        </div>

        {/* Category Container */}
        <div style={{
          display: 'flex',
          height: 'calc(100vh - 58px - 80px)',
          gap: 8,
          padding: '0 8px',
        }}>
          {/* Left: Primary Categories */}
          <div style={{
            width: '30%',
            background: '#fff',
            borderRadius: 12,
            overflowY: 'auto',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
            padding: '8px 0',
          }}>
            {mockCategories.map((category, index) => (
              <div
                key={category.id}
                onClick={() => setActiveCategory(index)}
                style={{
                  padding: '12px 16px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  borderLeft: activeCategory === index ? '3px solid #e29692' : '3px solid transparent',
                  borderRight: '3px solid transparent',
                  background: activeCategory === index ? 'rgba(226, 150, 146, 0.1)' : 'transparent',
                  fontWeight: activeCategory === index ? 500 : 400,
                  color: activeCategory === index ? '#e29692' : '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{category.icon}</span>
                {category.name}
              </div>
            ))}
          </div>

          {/* Right: Subcategories and Products */}
          <div style={{
            width: '70%',
            overflowY: 'auto',
            paddingRight: 4,
          }}>
            {/* Subcategories */}
            {currentCategory.subCategories.length > 0 && (
              <>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  margin: '16px 0 8px',
                }}>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    paddingLeft: 4,
                  }}>
                    {currentCategory.name}热门
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 8,
                }}>
                  {currentCategory.subCategories.map((sub) => (
                    <div
                      key={sub.id}
                      style={{
                        textAlign: 'center',
                        padding: 8,
                        background: '#fff',
                        borderRadius: 8,
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                      }}
                    >
                      <div style={{
                        width: 50,
                        height: 50,
                        margin: '0 auto 8px',
                        borderRadius: '50%',
                        background: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                      }}>
                        {sub.icon}
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        {sub.name}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Products Section */}
            {currentCategory.products.length > 0 && (
              <>
                {/* New Products */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  margin: '24px 0 8px',
                }}>
                  <div style={{ fontSize: '1rem', fontWeight: 600, paddingLeft: 4 }}>
                    新品推荐
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>
                    更多 →
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 8,
                }}>
                  {currentCategory.products.slice(0, 2).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Hot Products */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  margin: '24px 0 8px',
                }}>
                  <div style={{ fontSize: '1rem', fontWeight: 600, paddingLeft: 4 }}>
                    热销排行
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>
                    更多 →
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 8,
                }}>
                  {currentCategory.products.slice(2, 4).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Discount Products */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  margin: '24px 0 8px',
                }}>
                  <div style={{ fontSize: '1rem', fontWeight: 600, paddingLeft: 4 }}>
                    折扣专区
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>
                    更多 →
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 8,
                  marginBottom: 16,
                }}>
                  {currentCategory.products.slice(4, 6).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <TabBar />
    </>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: 10,
      overflow: 'hidden',
      transition: 'all 0.3s',
      cursor: 'pointer',
      boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
      position: 'relative',
    }}>
      {product.badge && (
        <div style={{
          position: 'absolute',
          top: 8,
          left: 8,
          padding: '2px 8px',
          borderRadius: 12,
          fontSize: '0.65rem',
          color: 'white',
          zIndex: 2,
          fontWeight: 500,
          background: product.badge.type === 'hot' ? '#e29692' : '#ff5722',
        }}>
          {product.badge.text}
        </div>
      )}
      <div style={{
        position: 'relative',
        height: 150,
        borderRadius: 10,
        marginBottom: 8,
        overflow: 'hidden',
        background: '#f5f5f5',
      }}>
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
      <div style={{ padding: '0 8px 8px' }}>
        <div style={{
          fontSize: '0.85rem',
          fontWeight: 500,
          marginBottom: 5,
          height: 38,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          lineHeight: 1.4,
        }}>
          {product.name}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 700, color: '#e29692', fontSize: '0.95rem' }}>
            ¥{product.price}
          </div>
          {product.originalPrice && (
            <div style={{
              fontSize: '0.75rem',
              textDecoration: 'line-through',
              color: '#666',
            }}>
              ¥{product.originalPrice}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}