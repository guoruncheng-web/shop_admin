'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.scss';
import { AuthGuard } from '@/providers/AuthGuard';

// Simple Carousel Component
function SimpleCarousel({ items }: { items: Array<{ image: string; title: string; buttonText: string }> }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isTransitioning) {
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev + 1) % items.length);
        setTimeout(() => setIsTransitioning(false), 500);
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [items.length, isTransitioning]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden' }}>
      {items.map((item, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url('${item.image}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: currentIndex === index ? 1 : 0,
            transition: 'opacity 500ms ease-in-out',
          }}
        >
          <div className={styles.bannerSlideContent}>
            <h3>{item.title}</h3>
            <button className={styles.bannerSlideBtn}>{item.buttonText}</button>
          </div>
        </div>
      ))}

      {/* Indicator Dots */}
      <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
        {items.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentIndex(index)}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: currentIndex === index ? '#c4a376' : 'rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'category' | 'cart' | 'me'>('home');

  const bannerItems = [
    {
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'New Season Styles',
      buttonText: '立即查看'
    },
    {
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Summer Collection',
      buttonText: '立即购买'
    },
    {
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Limited Edition',
      buttonText: '立即查看'
    }
  ];

  return (
    <AuthGuard>
      <div className={styles.phoneContainer}>
        {/* Header */}
        <div className={styles.appHeader}>
          <div className={styles.logo}>Elegance</div>
          <div className={styles.icons}>
            <i className="fa-regular fa-bell" />
            <i className="fa-regular fa-heart" />
          </div>
        </div>

        {/* Search Bar */}
        <div className={styles.searchBar}>
          <i className={`fa-solid fa-magnifying-glass ${styles.searchIcon}`} />
          <input type="text" placeholder="搜索商品、品牌、品类" />
        </div>

        {/* Page Content */}
        <div className={styles.pageContent}>
          {activeTab === 'home' ? (<>
          {/* Banner Carousel */}
          <div className={styles.bannerCarousel}>
            <div className={styles.bannerInner}>
              <SimpleCarousel items={bannerItems} />
            </div>
          </div>

          {/* Brands Section */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <h2>品牌精选</h2>
              <span className={styles.viewAll}>查看全部</span>
            </div>
            <div className={styles.brandsGrid}>
              <div className={styles.brandItem}>
                <img src="/brands/zara.svg" alt="ZARA" />
                <p>ZARA</p>
              </div>
              <div className={styles.brandItem}>
                <img src="/brands/hm.svg" alt="H&M" />
                <p>HM</p>
              </div>
              <div className={styles.brandItem}>
                <img src="/brands/uniqlo.svg" alt="UNIQLO" />
                <p>UNIQLO</p>
              </div>
              <div className={styles.brandItem}>
                <img src="/brands/nike.svg" alt="NIKE" />
                <p>NIKE</p>
              </div>
            </div>
          </div>

          {/* Discount Section */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <h2>折扣专区</h2>
              <span className={styles.viewAll}>查看全部</span>
            </div>
            <div className={styles.productGrid}>
              {[
                {
                  tag: 'SALE',
                  img: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                  name: '女式丝质衬衫',
                  vendor: 'By Fashion Hub',
                  price: '¥189',
                  original: '¥329',
                  off: '42% OFF',
                },
                {
                  tag: 'SALE',
                  img: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                  name: '休闲束腰连衣裙',
                  vendor: 'By Designers Co.',
                  price: '¥279',
                  original: '¥499',
                  off: '44% OFF',
                },
                {
                  tag: 'SALE',
                  img:'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                  name: '男士休闲裤',
                  vendor: "By Men's Choice",
                  price: '¥229',
                  original: '¥399',
                  off: '42% OFF',
                },
                {
                  tag: 'SALE',
                  img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                  name: '秋季外套女',
                  vendor: 'By Style Empire',
                  price: '¥319',
                  original: '¥549',
                  off: '42% OFF',
                },
              ].map((p, idx) => (
                <div key={idx} className={styles.productCard} onClick={() => (window.location.href = '/goodDetails')} style={{ cursor: 'pointer' }}>
                  <div className={`${styles.tagRibbon} ${styles.discountTag}`}>{p.tag}</div>
                  <div className={styles.productImg}>
                    <img
                      src={p.img}
                      alt={p.name}
                      onError={(e) => {
                        e.currentTarget.src = '/images/placeholder.svg';
                      }}
                    />
                  </div>
                  <div className={styles.productDetails}>
                    <div className={styles.productName}>{p.name}</div>
                    <div className={styles.vendorName}>{p.vendor}</div>
                    <div className={styles.productPrice}>
                      <div className={styles.currentPrice}>{p.price}</div>
                      <div className={styles.originalPrice}>{p.original}</div>
                      <div className={styles.discountPercent}>{p.off}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hot Sale Section */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <h2>热销专区</h2>
              <span className={styles.viewAll}>查看全部</span>
            </div>
            <div className={styles.productGrid}>
              {[
                {
                  tag: 'HOT',
                  img: 'https://images.unsplash.com/photo-1620799139652-715e4d5b232d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                  name: '牛仔裤休闲款男',
                  vendor: 'By Denim Co.',
                  price: '¥259',
                },
                {
                  tag: 'HOT',
                  img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                  name: '修身连衣裙女',
                  vendor: 'By Fashion House',
                  price: '¥289',
                },
                {
                  tag: 'HOT',
                  img: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                  name: '运动鞋休闲款',
                  vendor: 'By Sports Gear Inc',
                  price: '¥349',
                },
                {
                  tag: 'HOT',
                  img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                  name: '女士手提包',
                  vendor: 'By Accessories Co.',
                  price: '¥399',
                },
              ].map((p, idx) => (
                <div key={idx} className={styles.productCard} onClick={() => (window.location.href = '/goodDetails')} style={{ cursor: 'pointer' }}>
                  <div className={`${styles.tagRibbon} ${styles.hotTag}`}>{p.tag}</div>
                  <div className={styles.productImg}>
                    <img
                      src={p.img}
                      alt={p.name}
                      onError={(e) => {
                        e.currentTarget.src = '/images/placeholder.svg';
                      }}
                    />
                  </div>
                  <div className={styles.productDetails}>
                    <div className={styles.productName}>{p.name}</div>
                    <div className={styles.vendorName}>{p.vendor}</div>
                    <div className={styles.productPrice}>
                      <div className={styles.currentPrice}>{p.price}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </>) : activeTab === 'category' ? (
            <div className={styles.section}>
              <h2>分类</h2>
              <p>这里是分类页占位内容，可替换为真实组件。</p>
            </div>
          ) : activeTab === 'cart' ? (
            <div className={styles.section}>
              <h2>购物车</h2>
              <p>这里是购物车占位内容，可替换为真实组件。</p>
            </div>
          ) : (
            <div className={styles.section}>
              <h2>我的</h2>
              <p>这里是我的页占位内容，可替换为真实组件。</p>
            </div>
          )}
        </div>
        {/* Bottom Tab Bar */}
        <div className={styles.tabBar}>
          <div
            className={`${styles.tabItem} ${activeTab === 'home' ? styles.tabItemActive : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <i className="fa-solid fa-house"></i>
            <span>首页</span>
          </div>
          <div
            className={`${styles.tabItem} ${activeTab === 'category' ? styles.tabItemActive : ''}`}
            onClick={() => setActiveTab('category')}
          >
            <i className="fa-solid fa-list"></i>
            <span>分类</span>
          </div>
          <div
            className={`${styles.tabItem} ${activeTab === 'cart' ? styles.tabItemActive : ''}`}
            onClick={() => setActiveTab('cart')}
          >
            <i className="fa-solid fa-cart-shopping"></i>
            <span>购物车</span>
          </div>
          <div
            className={`${styles.tabItem} ${activeTab === 'me' ? styles.tabItemActive : ''}`}
            onClick={() => setActiveTab('me')}
          >
            <i className="fa-solid fa-user"></i>
            <span>我的</span>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}