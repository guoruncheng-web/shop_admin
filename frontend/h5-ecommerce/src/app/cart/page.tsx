'use client';

import React, { useMemo, useState } from 'react';
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
  selected?: boolean;
}

interface Store {
  id: number;
  name: string;
  icon: string;
  notice: string;
  items: CartItem[];
  selected?: boolean;
}

const mockStores: Store[] = [
  {
    id: 1,
    name: 'StyleHub官方店',
    icon: 'S',
    notice: '满¥300减¥30',
    selected: true,
    items: [
      {
        id: 1,
        name: '简约字母印花卫衣 春秋新款',
        color: '黄色',
        size: 'M',
        price: 169,
        quantity: 1,
        image:
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80',
        selected: true,
      },
      {
        id: 2,
        name: '纯棉休闲女士衬衫 夏季薄款',
        color: '白色',
        size: 'L',
        price: 129,
        quantity: 1,
        image:
          'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=300&q=80',
        selected: true,
      },
    ],
  },
  {
    id: 2,
    name: '优品牛仔官方店',
    icon: 'J',
    notice: '全店满200享95折',
    selected: true,
    items: [
      {
        id: 3,
        name: '修身直筒牛仔裤 显瘦百搭',
        color: '蓝色',
        size: '30',
        price: 199,
        quantity: 1,
        image:
          'https://images.unsplash.com/photo-1541099649105-f69ad21a3246?auto=format&fit=crop&w=300&q=80',
        selected: true,
      },
    ],
  },
];

// 自定义方形勾选框（视觉与设计稿一致）
function Checkbox({
  active,
  onClick,
  size = 22,
}: {
  active: boolean;
  onClick: () => void;
  size?: number;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        border: '1px solid #e0e0e0',
        borderRadius: 4,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        background: '#fff',
      }}
    >
      {active ? (
        <div
          style={{
            width: Math.round(size * 0.55),
            height: Math.round(size * 0.3),
            borderLeft: '2px solid #e29692',
            borderBottom: '2px solid #e29692',
            transform: 'rotate(-45deg)',
          }}
        />
      ) : null}
    </div>
  );
}

export default function CartPage() {
  const [stores, setStores] = useState<Store[]>(mockStores);
  const [editing, setEditing] = useState(false);

  // 选择逻辑
  const allSelected = useMemo(() => {
    if (stores.length === 0) return false;
    return stores.every((s) => s.items.length > 0 && s.items.every((i) => !!i.selected));
  }, [stores]);

  const selectedItemCount = useMemo(() => {
    // 设计稿的“全选(3)”是选中的件数（不按数量叠加），此处与之对齐
    return stores.reduce(
      (acc, s) => acc + s.items.filter((i) => !!i.selected).length,
      0,
    );
  }, [stores]);

  const selectedQuantityCount = useMemo(() => {
    // 底部“结算(件)”一般按数量汇总，更贴近实际结算
    return stores.reduce(
      (acc, s) =>
        acc + s.items.filter((i) => !!i.selected).reduce((a, i) => a + i.quantity, 0),
      0,
    );
  }, [stores]);

  const toggleAllSelected = () => {
    const target = !allSelected;
    setStores((prev) =>
      prev.map((s) => ({
        ...s,
        items: s.items.map((i) => ({ ...i, selected: target })),
      })),
    );
  };

  const toggleStoreSelected = (storeId: number) => {
    setStores((prev) =>
      prev.map((s) => {
        if (s.id !== storeId) return s;
        const storeAllSelected = s.items.every((i) => !!i.selected);
        const target = !storeAllSelected;
        return { ...s, items: s.items.map((i) => ({ ...i, selected: target })) };
      }),
    );
  };

  const toggleItemSelected = (storeId: number, itemId: number) => {
    setStores((prev) =>
      prev.map((s) => {
        if (s.id !== storeId) return s;
        return {
          ...s,
          items: s.items.map((i) =>
            i.id === itemId ? { ...i, selected: !i.selected } : i,
          ),
        };
      }),
    );
  };

  // 数量与删除/收藏
  const updateQuantity = (storeId: number, itemId: number, delta: number) => {
    setStores((prev) =>
      prev.map((store) => {
        if (store.id !== storeId) return store;
        return {
          ...store,
          items: store.items.map((item) =>
            item.id === itemId
              ? { ...item, quantity: Math.max(1, item.quantity + delta) }
              : item,
          ),
        };
      }),
    );
  };

  const removeItem = (storeId: number, itemId: number) => {
    setStores((prev) =>
      prev
        .map((store) => {
          if (store.id !== storeId) return store;
          const items = store.items.filter((i) => i.id !== itemId);
          return { ...store, items };
        })
        .filter((s) => s.items.length > 0),
    );
  };

  const toggleFavorite = (storeId: number, itemId: number) => {
    setStores((prev) =>
      prev.map((store) => {
        if (store.id !== storeId) return store;
        return {
          ...store,
          items: store.items.map((item) =>
            item.id === itemId ? { ...item, isFavorite: !item.isFavorite } : item,
          ),
        };
      }),
    );
  };

  // 金额计算（仅统计选中）
  const calculateStoreTotal = (store: Store) => {
    const subtotal = store.items
      .filter((i) => !!i.selected)
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
    let discount = 0;
    // 与设计稿类似的示例优惠
    if (store.name.includes('StyleHub') && subtotal >= 300) {
      discount = 30;
    } else if (store.name.includes('牛仔')) {
      discount = Math.round(subtotal * 0.05 * 100) / 100;
    }
    return { subtotal, discount, total: subtotal - discount };
  };

  const grand = useMemo(() => {
    return stores.reduce(
      (acc, s) => {
        const { subtotal, discount, total } = calculateStoreTotal(s);
        acc.subtotal += subtotal;
        acc.discount += discount;
        acc.total += total;
        return acc;
      },
      { subtotal: 0, discount: 0, total: 0 },
    );
  }, [stores]);

  // UI
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
          paddingBottom: 140,
          paddingTop: 60, // 头部固定高度预留
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
          <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>购物车</div>
          <button
            onClick={() => setEditing((prev) => !prev)}
            style={{
              background: 'rgba(226,150,146,0.12)',
              border: 'none',
              color: '#e29692',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '6px 14px',
              borderRadius: 16,
            }}
          >
            {editing ? '完成' : '编辑'}
          </button>
        </div>

        {/* 顶部操作栏（全选 + 编辑） */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 12,
            margin: '12px',
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Checkbox active={allSelected} onClick={toggleAllSelected} />
            <span>全选({selectedItemCount})</span>
          </div>
          <button
            onClick={() => setEditing((prev) => !prev)}
            style={{
              color: '#e29692',
              background: 'none',
              border: 'none',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: 4,
            }}
          >
            {editing ? '完成' : '编辑'}
          </button>
        </div>

        {/* 店铺与商品区 */}
        <div style={{ padding: '0 12px' }}>
          {stores.map((store) => {
            const { subtotal, discount, total } = calculateStoreTotal(store);
            const storeAllSelected = store.items.every((i) => !!i.selected);

            return (
              <div
                key={store.id}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                  marginBottom: 16,
                  overflow: 'hidden',
                }}
              >
                {/* 店铺头 */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: 12,
                    borderBottom: '1px solid #f5f5f5',
                  }}
                >
                  <div style={{ marginRight: 10 }}>
                    <Checkbox active={storeAllSelected} onClick={() => toggleStoreSelected(store.id)} />
                  </div>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      background: '#f9f0ef',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 8,
                      fontSize: '0.9rem',
                      color: '#e29692',
                    }}
                  >
                    {store.icon}
                  </div>
                  <div style={{ fontWeight: 500, flex: 1 }}>{store.name}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      style={{
                        color: '#666',
                        background: 'none',
                        border: 'none',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: 4,
                      }}
                    >
                      关注
                    </button>
                    <button
                      style={{
                        color: '#666',
                        background: 'none',
                        border: 'none',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: 4,
                      }}
                    >
                      进店
                    </button>
                  </div>
                </div>

                {/* 商品项 */}
                {store.items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      padding: 12,
                      borderBottom: '1px solid #f5f5f5',
                      alignItems: 'stretch',
                      gap: 10,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Checkbox
                        active={!!item.selected}
                        onClick={() => toggleItemSelected(store.id, item.id)}
                      />
                    </div>

                    <div
                      style={{
                        width: 90,
                        height: 110,
                        borderRadius: 8,
                        overflow: 'hidden',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f5f5f5',
                        position: 'relative',
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                        onError={(e) => {
                          (e.currentTarget.style.display = 'none');
                        }}
                        onMouseOver={(e) => ((e.currentTarget.style.transform = 'scale(1.05)'))}
                        onMouseOut={(e) => ((e.currentTarget.style.transform = 'none'))}
                      />
                      {item.discount ? (
                        <div
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            background: 'linear-gradient(45deg, #c9333c, #b42828)',
                            color: '#fff',
                            fontSize: '0.75rem',
                            padding: '3px 8px',
                            borderRadius: 3,
                            fontWeight: 600,
                          }}
                        >
                          {item.discount}
                        </div>
                      ) : null}
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 500, marginBottom: 6, lineHeight: 1.3 }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: 8 }}>
                          <span style={{ marginRight: 10 }}>颜色: {item.color}</span>
                          <span>尺码: {item.size}</span>
                        </div>
                        <div style={{ fontWeight: 700, color: '#e29692', fontSize: '1rem' }}>
                          ¥{item.price}
                        </div>
                        {item.originalPrice ? (
                          <div style={{ fontSize: '0.85rem', color: '#888', textDecoration: 'line-through' }}>
                            ¥{item.originalPrice}
                          </div>
                        ) : null}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid #e0e0e0',
                            borderRadius: 20,
                            overflow: 'hidden',
                          }}
                        >
                          <button
                            onClick={() => updateQuantity(store.id, item.id, -1)}
                            style={{
                              width: 32,
                              height: 32,
                              background: '#fff',
                              border: 'none',
                              fontSize: '1rem',
                              color: '#333',
                              cursor: 'pointer',
                            }}
                          >
                            -
                          </button>
                          <div style={{ padding: '0 8px', minWidth: 30, textAlign: 'center', fontWeight: 500 }}>
                            {item.quantity}
                          </div>
                          <button
                            onClick={() => updateQuantity(store.id, item.id, 1)}
                            style={{
                              width: 32,
                              height: 32,
                              background: '#fff',
                              border: 'none',
                              fontSize: '1rem',
                              color: '#333',
                              cursor: 'pointer',
                            }}
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => (editing ? removeItem(store.id, item.id) : toggleFavorite(store.id, item.id))}
                          style={{
                            color: '#666',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.3s',
                          }}
                          onMouseOver={(e) => ((e.currentTarget.style.background = '#f5f5f5'))}
                          onMouseOut={(e) => ((e.currentTarget.style.background = 'transparent'))}
                        >
                          {editing ? '🗑️' : item.isFavorite ? '❤️' : '♡'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 店铺汇总（只统计选中） */}
                <div
                  style={{
                    padding: 12,
                    background: '#f9f9f9',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ color: '#666' }}>商品小计</div>
                    <div style={{ fontWeight: 500, color: '#e29692' }}>¥{subtotal.toFixed(2)}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ color: '#666' }}>运费</div>
                    <div style={{ fontWeight: 500, color: '#e29692' }}>¥0.00</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ color: '#666' }}>优惠</div>
                    <div style={{ fontWeight: 500, color: '#e29692' }}>-¥{discount.toFixed(2)}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ color: '#666' }}>店铺合计</div>
                    <div style={{ fontWeight: 600, color: '#e29692' }}>¥{total.toFixed(2)}</div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        padding: 8,
                        borderRadius: 12,
                        border: '1px solid #e0e0e0',
                        background: '#fff',
                        color: '#e29692',
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      优惠券
                    </button>
                    <button
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        padding: 8,
                        borderRadius: 12,
                        border: 'none',
                        background: 'linear-gradient(to right, #f0b7b3, #e29692)',
                        color: '#fff',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      结算本店
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 优惠信息区（整体） */}
        <div
          style={{
            padding: 12,
            background: '#fff',
            borderRadius: 12,
            margin: '0 12px 16px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <div
              style={{
                width: 24,
                height: 24,
                background: '#e29692',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
                color: '#fff',
                fontSize: '0.8rem',
              }}
            >
              🏷️
            </div>
            <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>优惠信息</div>
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 12,
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ flex: 1, fontSize: '0.9rem' }}>店铺满300减30优惠券</div>
              <div style={{ color: '#e29692', fontWeight: 500, marginRight: 12 }}>未使用</div>
              <button
                style={{
                  padding: '4px 12px',
                  borderRadius: 16,
                  background: '#f9f0ef',
                  color: '#e29692',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                去使用
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 12,
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ flex: 1, fontSize: '0.9rem' }}>平台满500减50</div>
              <div style={{ color: '#e29692', fontWeight: 500, marginRight: 12 }}>已满足</div>
              <button
                style={{
                  padding: '4px 12px',
                  borderRadius: 16,
                  background: '#f9f0ef',
                  color: '#e29692',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                选择
              </button>
            </div>
          </div>
        </div>

        {/* 底部结算栏（固定） */}
        <div
          style={{
            position: 'fixed',
            bottom: 55,
            left: 0,
            right: 0,
            width: '100%',
            maxWidth: 375,
            margin: '0 auto',
            background: '#fff',
            padding: 12,
            borderTop: '1px solid #f5f5f5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 100,
            boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Checkbox active={allSelected} onClick={toggleAllSelected} />
            <span style={{ fontSize: '0.9rem', color: '#666' }}>全选</span>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.9rem' }}>
              总计: <span style={{ fontWeight: 700, color: '#e29692', fontSize: '1.2rem' }}>¥{grand.total.toFixed(2)}</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>已优惠: ¥{grand.discount.toFixed(2)}</div>
          </div>

          <button
            disabled={selectedQuantityCount === 0}
            style={{
              background: selectedQuantityCount === 0 ? '#ddd' : '#e29692',
              color: '#fff',
              border: 'none',
              padding: '12px 20px',
              borderRadius: 24,
              fontWeight: 600,
              cursor: selectedQuantityCount === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'transform 0.3s, box-shadow 0.3s',
              boxShadow: selectedQuantityCount === 0 ? 'none' : '0 5px 15px rgba(226, 150, 146, 0.4)',
            }}
          >
            🛒 结算({selectedQuantityCount}件)
          </button>
        </div>
      </div>

      {/* 固定底部 TabBar（项目组件） */}
      <TabBar />
    </>
  );
}