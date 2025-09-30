'use client';

import React, { useState } from 'react';
import TabBar from '../components/TabBar';

interface CartItem {
  id: number;
  name: string;
  color: string;
  size: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: string;
  discount?: string;
  isFavorite?: boolean;
}

interface Store {
  id: number;
  name: string;
  icon: string;
  notice: string;
  items: CartItem[];
}

const mockStores: Store[] = [
  {
    id: 1,
    name: 'Fashion House',
    icon: 'F',
    notice: '满¥399减¥30',
    items: [
      {
        id: 1,
        name: '法兰西复古方领连衣裙',
        color: '米白',
        size: 'M',
        price: 399,
        originalPrice: 539,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=500&q=80',
        discount: '-25%',
      },
      {
        id: 2,
        name: '设计师款麂皮外套',
        color: '米驼色',
        size: 'L',
        price: 799,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=80',
      },
    ],
  },
  {
    id: 2,
    name: 'Elegant Woman',
    icon: 'E',
    notice: '新用户专享9折',
    items: [
      {
        id: 3,
        name: '纯色修身吊带连衣裙',
        color: '黑色',
        size: 'S',
        price: 459,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80',
      },
    ],
  },
  {
    id: 3,
    name: 'Style Empire',
    icon: 'S',
    notice: '全场包邮',
    items: [
      {
        id: 4,
        name: '缎面蝴蝶结衬衫',
        color: '浅粉',
        size: 'M',
        price: 299,
        originalPrice: 399,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80',
      },
    ],
  },
];

export default function CartPage() {
  const [stores, setStores] = useState(mockStores);

  const updateQuantity = (storeId: number, itemId: number, delta: number) => {
    setStores(stores.map(store => {
      if (store.id === storeId) {
        return {
          ...store,
          items: store.items.map(item => {
            if (item.id === itemId) {
              const newQuantity = Math.max(1, item.quantity + delta);
              return { ...item, quantity: newQuantity };
            }
            return item;
          }),
        };
      }
      return store;
    }));
  };

  const removeItem = (storeId: number, itemId: number) => {
    setStores(stores.map(store => {
      if (store.id === storeId) {
        return {
          ...store,
          items: store.items.filter(item => item.id !== itemId),
        };
      }
      return store;
    }).filter(store => store.items.length > 0));
  };

  const toggleFavorite = (storeId: number, itemId: number) => {
    setStores(stores.map(store => {
      if (store.id === storeId) {
        return {
          ...store,
          items: store.items.map(item => {
            if (item.id === itemId) {
              return { ...item, isFavorite: !item.isFavorite };
            }
            return item;
          }),
        };
      }
      return store;
    }));
  };

  const calculateStoreTotal = (store: Store) => {
    const subtotal = store.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let discount = 0;
    if (store.name === 'Fashion House' && subtotal >= 399) {
      discount = 30;
    } else if (store.name === 'Elegant Woman') {
      discount = subtotal * 0.1;
    }
    return { subtotal, discount, total: subtotal - discount };
  };

  const calculateGrandTotal = () => {
    return stores.reduce((sum, store) => {
      const { total } = calculateStoreTotal(store);
      return sum + total;
    }, 0);
  };

  const getTotalItems = () => {
    return stores.reduce((sum, store) => {
      return sum + store.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);
  };

  return (
    <>
      <div style={{
        maxWidth: 375,
        margin: '0 auto',
        minHeight: '100vh',
        background: '#f8f5f0',
        position: 'relative',
        paddingBottom: 140,
      }}>
        {/* Decorative Element */}
        <div style={{
          position: 'absolute',
          top: 20,
          right: 20,
          width: 120,
          height: 120,
          background: 'linear-gradient(45deg, #e0cda8, #c4a376)',
          opacity: 0.1,
          borderRadius: '50%',
          filter: 'blur(25px)',
        }} />

        {/* Header */}
        <div style={{
          position: 'relative',
          padding: '24px 18px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 2,
          borderBottom: '1px solid rgba(229, 224, 215, 0.4)',
          background: 'rgba(255, 255, 255, 0.98)',
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            // background: 'rgba(196, 163, 118, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#c4a376',
          }}>
            {/* ← */}
          </div>
          <div style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: '1.55rem',
            fontWeight: 600,
            color: '#a78a5c',
          }}>
            购物车
          </div>
          <div style={{
            fontSize: '0.95rem',
            background: 'rgba(196, 163, 118, 0.1)',
            color: '#c4a376',
            padding: '6px 14px',
            borderRadius: 16,
            fontWeight: 500,
          }}>
            编辑
          </div>
        </div>

        {/* Cart Content */}
        <div style={{ padding: '0 15px' }}>
          {stores.map((store) => {
            const { subtotal, discount, total } = calculateStoreTotal(store);

            return (
              <div
                key={store.id}
                style={{
                  background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(245, 242, 236, 0.95))',
                  border: '1px solid rgba(229, 224, 215, 0.6)',
                  borderRadius: 14,
                  marginTop: 20,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  overflow: 'hidden',
                }}
              >
                {/* Store Header */}
                <div style={{
                  padding: 15,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(196, 163, 118, 0.05)',
                  borderBottom: '1px solid rgba(229, 224, 215, 0.4)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: 'linear-gradient(45deg, #e0cda8, #c4a376)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                    }}>
                      {store.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#a78a5c' }}>
                        {store.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#5c5c5c' }}>
                        {store.notice}
                      </div>
                    </div>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>

                {/* Cart Items */}
                {store.items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      padding: 18,
                      borderBottom: '1px solid rgba(229, 224, 215, 0.4)',
                    }}
                  >
                    <div style={{
                      width: 100,
                      height: 120,
                      borderRadius: 12,
                      overflow: 'hidden',
                      marginRight: 15,
                      position: 'relative',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      {item.discount && (
                        <div style={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          background: 'linear-gradient(45deg, #c9333c, #b42828)',
                          color: 'white',
                          fontSize: '0.75rem',
                          padding: '3px 8px',
                          borderRadius: 3,
                          fontWeight: 600,
                        }}>
                          {item.discount}
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: 500,
                        fontSize: '1rem',
                        marginBottom: 6,
                        lineHeight: 1.3,
                      }}>
                        {item.name}
                      </div>
                      <div style={{
                        fontSize: '0.85rem',
                        color: '#5c5c5c',
                        marginBottom: 12,
                      }}>
                        <span style={{ marginRight: 10 }}>颜色: {item.color}</span>
                        <span>尺码: {item.size}</span>
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                          <div>
                            <div style={{
                              fontWeight: 700,
                              fontSize: '1.1rem',
                              color: '#a78a5c',
                            }}>
                              ¥{item.price}
                            </div>
                            {item.originalPrice && (
                              <div style={{
                                fontSize: '0.85rem',
                                color: '#888',
                                textDecoration: 'line-through',
                              }}>
                                ¥{item.originalPrice}
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div
                              onClick={() => updateQuantity(store.id, item.id, -1)}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                border: '1px solid rgba(229, 224, 215, 0.8)',
                                background: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#c4a376',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                              }}
                            >
                              -
                            </div>
                            <div style={{
                              width: 30,
                              textAlign: 'center',
                              fontWeight: 500,
                            }}>
                              {item.quantity}
                            </div>
                            <div
                              onClick={() => updateQuantity(store.id, item.id, 1)}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                border: '1px solid rgba(229, 224, 215, 0.8)',
                                background: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#c4a376',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                              }}
                            >
                              +
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                          <div
                            onClick={() => toggleFavorite(store.id, item.id)}
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: '50%',
                              border: '1px solid rgba(229, 224, 215, 0.8)',
                              background: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: item.isFavorite ? '#e53e3e' : '#c4a376',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                            }}
                          >
                            {item.isFavorite ? '❤️' : '♡'}
                          </div>
                          <div
                            onClick={() => removeItem(store.id, item.id)}
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: '50%',
                              border: '1px solid rgba(229, 224, 215, 0.8)',
                              background: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#c4a376',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                            }}
                          >
                            🗑️
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Store Summary */}
                <div style={{
                  padding: 15,
                  background: 'rgba(196, 163, 118, 0.03)',
                  borderTop: '1px solid rgba(229, 224, 215, 0.4)',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}>
                    <div style={{ color: '#5c5c5c' }}>商品小计</div>
                    <div style={{ fontWeight: 500, color: '#a78a5c' }}>
                      ¥{subtotal.toFixed(2)}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}>
                    <div style={{ color: '#5c5c5c' }}>运费</div>
                    <div style={{ fontWeight: 500, color: '#a78a5c' }}>¥0</div>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}>
                    <div style={{ color: '#5c5c5c' }}>优惠</div>
                    <div style={{ fontWeight: 500, color: '#a78a5c' }}>
                      -¥{discount.toFixed(2)}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 15,
                  }}>
                    <div style={{ color: '#5c5c5c' }}>店铺合计</div>
                    <div style={{ fontWeight: 500, color: '#a78a5c' }}>
                      ¥{total.toFixed(2)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: 8,
                      borderRadius: 12,
                      border: '1px solid rgba(229, 224, 215, 0.8)',
                      background: 'white',
                      color: '#c4a376',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}>
                      优惠券
                    </button>
                    <button style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: 8,
                      borderRadius: 12,
                      border: 'none',
                      background: 'linear-gradient(to right, #e0cda8, #c4a376)',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}>
                      结算
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Checkout Bar */}
        <div style={{
          position: 'fixed',
          bottom: 70,
          left: 0,
          right: 0,
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(245, 242, 236, 0.95))',
          borderTop: '1px solid rgba(229, 224, 215, 0.8)',
          maxWidth: 375,
          margin: '0 auto',
          padding: '15px 20px',
          boxShadow: '0 -5px 20px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '0.9rem',
              color: '#5c5c5c',
              marginBottom: 3,
            }}>
              总计
            </div>
            <div style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              color: '#a78a5c',
              fontFamily: '"Playfair Display", serif',
            }}>
              ¥{calculateGrandTotal().toFixed(2)}
            </div>
          </div>
          <button style={{
            padding: '14px 30px',
            borderRadius: 12,
            background: 'linear-gradient(to right, #e0cda8, #c4a376)',
            color: 'white',
            fontWeight: 600,
            fontSize: '1rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 5px 15px rgba(196, 163, 118, 0.3)',
          }}>
            结算({getTotalItems()}件)
          </button>
        </div>
      </div>
      <TabBar />
    </>
  );
}