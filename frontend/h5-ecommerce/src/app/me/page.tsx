'use client';

import React, { useState } from 'react';
import TabBar from '../components/TabBar';

interface OrderStatus {
  label: string;
  icon: string;
  count?: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  discount?: string;
}

const orderStatuses: OrderStatus[] = [
  { label: '待付款', icon: '💳', count: 2 },
  { label: '待发货', icon: '🚚', count: 1 },
  { label: '待收货', icon: '📦' },
  { label: '待评价', icon: '💬', count: 5 },
  { label: '退款/售后', icon: '↩️' },
];

const recommendProducts: Product[] = [
  {
    id: 1,
    name: '进口羊绒女士大衣 冬季保暖长款风衣 优雅设计师款',
    price: 899,
    originalPrice: 1599,
    image: 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=500&q=80',
    discount: '-45%',
  },
  {
    id: 2,
    name: '经典立领商务衬衫 纯棉舒适透气款 四季可穿',
    price: 389,
    originalPrice: 599,
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&q=80',
    discount: '-35%',
  },
  {
    id: 3,
    name: '薄纱款复古连衣裙 法式时尚方领 夏日度假系列',
    price: 429,
    originalPrice: 699,
    image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=500&q=80',
  },
  {
    id: 4,
    name: '复古方框墨镜 韩版潮流太阳镜 UV400防护',
    price: 689,
    image: 'https://images.unsplash.com/photo-1527215850255-dfe04f8b10ce?w=500&q=80',
    discount: '新品',
  },
];

export default function MePage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <>
      <div style={{
        maxWidth: 420,
        margin: '0 auto',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fcfaf7 0%, #f8f5f0 100%)',
        position: 'relative',
        paddingBottom: 70,
      }}>
        {/* Decorative Element */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: -50,
          width: 200,
          height: 200,
          background: 'linear-gradient(45deg, #e0cda8, #a78a5c)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          opacity: 0.3,
          zIndex: 0,
        }} />

        {/* User Header */}
        <div style={{
          position: 'relative',
          padding: '35px 20px 28px',
          background: 'linear-gradient(to bottom, rgba(248, 245, 240, 0.9) 0%, rgba(255, 255, 255, 1) 90%)',
          borderBottom: '1px solid rgba(229, 224, 215, 0.4)',
          overflow: 'hidden',
          zIndex: 2,
        }}>
          {/* User Info */}
          <div style={{
            display: 'flex',
            gap: 22,
            marginBottom: 30,
            padding: 10,
            position: 'relative',
            zIndex: 1,
          }}>
            {/* Avatar */}
            <div style={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '4px solid transparent',
              background: 'linear-gradient(#f8f5f0, #f8f5f0), linear-gradient(120deg, #a78a5c, #e0cda8, #a78a5c)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'content-box, border-box',
              overflow: 'hidden',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
            }}>
              <div style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: '2.8rem',
                fontWeight: 700,
                color: '#c4a376',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}>
                M
              </div>
              <div style={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #a78a5c, #e0cda8)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.9rem',
                boxShadow: '0 4px 8px rgba(167, 138, 92, 0.25)',
                cursor: 'pointer',
              }}>
                ✏️
              </div>
            </div>

            {/* User Details */}
            <div style={{ flex: 1, paddingTop: 12 }}>
              <div style={{
                fontSize: '1.7rem',
                fontFamily: '"Playfair Display", serif',
                fontWeight: 600,
                marginBottom: 12,
                letterSpacing: '0.5px',
                position: 'relative',
                display: 'inline-block',
              }}>
                张茗月
                <div style={{
                  position: 'absolute',
                  bottom: -6,
                  left: 0,
                  width: 90,
                  height: 2,
                  background: 'linear-gradient(to right, #c4a376, transparent)',
                }} />
              </div>
              <div style={{
                fontFamily: '"Poppins", sans-serif',
                background: 'linear-gradient(45deg, #a78a5c, #c4a376, #e0cda8)',
                color: 'white',
                padding: '6px 16px',
                borderRadius: 20,
                fontSize: '0.8rem',
                fontWeight: 500,
                display: 'inline-block',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 5px 15px rgba(167, 138, 92, 0.25)',
                marginBottom: 15,
              }}>
                铂金会员
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#5c5c5c',
                  fontSize: '0.92rem',
                }}>
                  <span style={{ width: 20, color: '#c4a376', textAlign: 'center' }}>📱</span>
                  138****4567
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#5c5c5c',
                  fontSize: '0.92rem',
                }}>
                  <span style={{ width: 20, color: '#c4a376', textAlign: 'center' }}>✉️</span>
                  mingyue@example.com
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: 14,
            padding: '22px 10px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            gap: 5,
          }}>
            <div style={{ flex: 1, textAlign: 'center', padding: 5 }}>
              <div style={{
                fontSize: '1.3rem',
                fontWeight: 700,
                color: '#a78a5c',
                letterSpacing: '0.5px',
              }}>
                ¥4,289
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: '#888',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginTop: 4,
              }}>
                账户余额
              </div>
            </div>
            <div style={{
              width: 1,
              background: 'linear-gradient(to bottom, transparent, #e5e0d7 30%, #e5e0d7 70%, transparent)',
              margin: '5px 0',
            }} />
            <div style={{ flex: 1, textAlign: 'center', padding: 5 }}>
              <div style={{
                fontSize: '1.3rem',
                fontWeight: 700,
                color: '#a78a5c',
                letterSpacing: '0.5px',
              }}>
                5,680
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: '#888',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginTop: 4,
              }}>
                积分
              </div>
            </div>
            <div style={{
              width: 1,
              background: 'linear-gradient(to bottom, transparent, #e5e0d7 30%, #e5e0d7 70%, transparent)',
              margin: '5px 0',
            }} />
            <div style={{ flex: 1, textAlign: 'center', padding: 5 }}>
              <div style={{
                fontSize: '1.3rem',
                fontWeight: 700,
                color: '#a78a5c',
                letterSpacing: '0.5px',
              }}>
                12
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: '#888',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginTop: 4,
              }}>
                优惠券
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 16, marginTop: 22, padding: '0 10px' }}>
            <div style={{
              flex: 1,
              padding: '16px 0',
              fontFamily: '"Poppins", sans-serif',
              background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(245, 242, 236, 0.95))',
              border: '1px solid rgba(229, 224, 215, 0.8)',
              borderRadius: 14,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              cursor: 'pointer',
            }}>
              <div style={{ fontSize: '1.6rem', color: '#a78a5c', marginBottom: 10 }}>👛</div>
              <span style={{ fontSize: '0.9rem', color: '#5c5c5c' }}>我的钱包</span>
            </div>
            <div style={{
              flex: 1,
              padding: '16px 0',
              fontFamily: '"Poppins", sans-serif',
              background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(245, 242, 236, 0.95))',
              border: '1px solid rgba(229, 224, 215, 0.8)',
              borderRadius: 14,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              cursor: 'pointer',
            }}>
              <div style={{ fontSize: '1.6rem', color: '#a78a5c', marginBottom: 10 }}>⚙️</div>
              <span style={{ fontSize: '0.9rem', color: '#5c5c5c' }}>设置</span>
            </div>
            <div style={{
              flex: 1,
              padding: '16px 0',
              fontFamily: '"Poppins", sans-serif',
              background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(245, 242, 236, 0.95))',
              border: '1px solid rgba(229, 224, 215, 0.8)',
              borderRadius: 14,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              cursor: 'pointer',
            }}>
              <div style={{ fontSize: '1.6rem', color: '#a78a5c', marginBottom: 10 }}>🎧</div>
              <span style={{ fontSize: '0.9rem', color: '#5c5c5c' }}>专属客服</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ padding: '20px 20px' }}>
          {/* Membership Section */}
          <h2 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: '1.45rem',
            fontWeight: 600,
            color: '#a78a5c',
            marginBottom: 28,
            position: 'relative',
            paddingLeft: 15,
            letterSpacing: '0.8px',
          }}>
            <span style={{
              position: 'absolute',
              left: 0,
              top: 6,
              height: 26,
              width: 5,
              background: 'linear-gradient(to bottom, #c4a376, #a78a5c 80%)',
              borderRadius: 3,
            }} />
            会员权益
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
            marginBottom: 35,
          }}>
            <div style={{
              background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(245, 242, 236, 0.95))',
              border: '1px solid rgba(229, 224, 215, 0.8)',
              borderRadius: 14,
              padding: '25px 0 18px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: 3,
                background: 'linear-gradient(to right, #e0cda8, #c4a376, #a78a5c)',
              }} />
              <div style={{ fontSize: '2rem', color: '#a78a5c', marginBottom: 15 }}>🎁</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#a78a5c' }}>8</div>
              <div style={{ fontSize: '0.87rem', color: '#5c5c5c', letterSpacing: '0.5px', marginTop: 5 }}>
                红包
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(245, 242, 236, 0.95))',
              border: '1px solid rgba(229, 224, 215, 0.8)',
              borderRadius: 14,
              padding: '25px 0 18px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: 3,
                background: 'linear-gradient(to right, #e0cda8, #c4a376, #a78a5c)',
              }} />
              <div style={{ fontSize: '2rem', color: '#a78a5c', marginBottom: 15 }}>🎫</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#a78a5c' }}>12</div>
              <div style={{ fontSize: '0.87rem', color: '#5c5c5c', letterSpacing: '0.5px', marginTop: 5 }}>
                优惠券
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(245, 242, 236, 0.95))',
              border: '1px solid rgba(229, 224, 215, 0.8)',
              borderRadius: 14,
              padding: '25px 0 18px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: 3,
                background: 'linear-gradient(to right, #e0cda8, #c4a376, #a78a5c)',
              }} />
              <div style={{ fontSize: '2rem', color: '#a78a5c', marginBottom: 15 }}>💎</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#a78a5c' }}>5,680</div>
              <div style={{ fontSize: '0.87rem', color: '#5c5c5c', letterSpacing: '0.5px', marginTop: 5 }}>
                积分
              </div>
            </div>
          </div>

          {/* Orders Section */}
          <h2 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: '1.45rem',
            fontWeight: 600,
            color: '#a78a5c',
            marginBottom: 28,
            position: 'relative',
            paddingLeft: 15,
            letterSpacing: '0.8px',
          }}>
            <span style={{
              position: 'absolute',
              left: 0,
              top: 6,
              height: 26,
              width: 5,
              background: 'linear-gradient(to bottom, #c4a376, #a78a5c 80%)',
              borderRadius: 3,
            }} />
            我的订单
          </h2>

          <div style={{
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(245, 242, 236, 0.95))',
            border: '1px solid rgba(229, 224, 215, 0.8)',
            borderRadius: 14,
            padding: '25px 18px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            marginBottom: 35,
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 25,
            }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#a78a5c', letterSpacing: '0.5px' }}>
                全部订单
              </div>
              <div style={{ fontSize: '0.9rem', color: '#c4a376', fontWeight: 500, cursor: 'pointer' }}>
                查看全部 →
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 6,
            }}>
              {orderStatuses.map((status, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px 0',
                    borderRadius: 14,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ position: 'relative', marginBottom: 12 }}>
                    <div style={{
                      width: 58,
                      height: 58,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, rgba(247, 243, 237, 0.8) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.05)',
                      border: '2px solid',
                      borderImage: 'linear-gradient(135deg, #e0cda8, #c4a376) 1',
                    }}>
                      <div style={{ fontSize: '1.4rem' }}>{status.icon}</div>
                    </div>
                    {status.count && (
                      <div style={{
                        position: 'absolute',
                        top: -5,
                        right: -5,
                        background: 'linear-gradient(to bottom, #ff5252, #d64141)',
                        color: 'white',
                        fontSize: '0.7rem',
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        boxShadow: '0 3px 8px rgba(214, 65, 65, 0.3)',
                      }}>
                        {status.count}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#5c5c5c' }}>
                    {status.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommend Section */}
          <div style={{ marginTop: 15 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 25,
            }}>
              <h2 style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: '1.45rem',
                fontWeight: 600,
                color: '#a78a5c',
                position: 'relative',
                paddingLeft: 15,
                letterSpacing: '0.8px',
                margin: 0,
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  top: 6,
                  height: 26,
                  width: 5,
                  background: 'linear-gradient(to bottom, #c4a376, #a78a5c 80%)',
                  borderRadius: 3,
                }} />
                猜你喜欢
              </h2>
              <div
                onClick={handleRefresh}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.95rem',
                  color: '#c4a376',
                  background: 'rgba(196, 163, 118, 0.1)',
                  padding: '8px 18px',
                  borderRadius: 50,
                  cursor: 'pointer',
                }}
              >
                <span>{isRefreshing ? '加载中...' : '换一批'}</span>
                <span>{isRefreshing ? '⏳' : '🔄'}</span>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 22,
            }}>
              {recommendProducts.map((product) => (
                <div
                  key={product.id}
                  style={{
                    background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(245, 242, 236, 0.95))',
                    border: '1px solid rgba(229, 224, 215, 0.7)',
                    borderRadius: 14,
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    height: 180,
                    backgroundImage: `url(${product.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                  }}>
                    {product.discount && (
                      <div style={{
                        position: 'absolute',
                        top: 14,
                        right: 14,
                        padding: '4px 14px',
                        background: 'linear-gradient(to right, #c9333c, #b42828)',
                        color: 'white',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        borderRadius: 50,
                        boxShadow: '0 4px 10px rgba(180, 40, 40, 0.25)',
                      }}>
                        {product.discount}
                      </div>
                    )}
                  </div>
                  <div style={{
                    padding: '18px 14px',
                    borderTop: '1px solid rgba(229, 224, 215, 0.4)',
                  }}>
                    <div style={{
                      fontSize: '0.97rem',
                      fontWeight: 500,
                      color: '#2a2a2a',
                      marginBottom: 12,
                      lineHeight: 1.4,
                      height: 45,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {product.name}
                    </div>
                    <div style={{ fontFamily: '"Poppins", sans-serif' }}>
                      <span style={{
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: '#a78a5c',
                      }}>
                        ¥{product.price}
                      </span>
                      {product.originalPrice && (
                        <span style={{
                          fontSize: '0.85rem',
                          color: '#888',
                          textDecoration: 'line-through',
                          marginLeft: 7,
                        }}>
                          ¥{product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <TabBar />
    </>
  );
}