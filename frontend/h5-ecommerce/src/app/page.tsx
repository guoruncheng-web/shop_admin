'use client';

import { Button, Card, Grid, List, NavBar, Space, Tag } from 'antd-mobile';
import { 
  UserOutline, 
  SearchOutline,
  GiftOutline 
} from 'antd-mobile-icons';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  const categories = [
    { icon: '📱', name: '数码电子', color: '#ff6b6b' },
    { icon: '👔', name: '服装鞋帽', color: '#4ecdc4' },
    { icon: '🏠', name: '家居用品', color: '#45b7d1' },
    { icon: '🍎', name: '生鲜食品', color: '#96ceb4' },
    { icon: '🎮', name: '运动户外', color: '#ffeaa7' },
    { icon: '💄', name: '美妆个护', color: '#fab1a0' },
    { icon: '📚', name: '图书文具', color: '#a29bfe' },
    { icon: '🚗', name: '汽配用品', color: '#fd79a8' },
  ];

  const hotProducts = [
    {
      id: 1,
      name: 'iPhone 15 Pro Max 256GB 黑色铛金',
      price: 9999,
      originalPrice: 10999,
      image: '/placeholder-phone.jpg',
      tag: '热销'
    },
    {
      id: 2,
      name: '华为 Mate 60 Pro 白色 512GB',
      price: 6999,
      originalPrice: 7999,
      image: '/placeholder-phone2.jpg',
      tag: '新品'
    },
  ];

  return (
    <div className={styles.container}>
      {/* 导航栏 */}
      <NavBar 
        className={styles.navbar}
        right={
          <Space>
            <SearchOutline fontSize={20} />
            <span style={{ fontSize: '20px' }}>🛒</span>
            <UserOutline fontSize={20} />
          </Space>
        }
      >
        H5 电商商城
      </NavBar>

      {/* 搜索栏 */}
      <div className={styles.searchBar}>
        <div className={styles.searchInput}>
          <SearchOutline className={styles.searchIcon} />
          <span className={styles.searchPlaceholder}>搜索商品</span>
        </div>
      </div>

      {/* Banner 区域 */}
      <div className={styles.banner}>
        <div className={styles.bannerContent}>
          <h2>欢迎来到 H5 电商商城</h2>
          <p>品质生活，优选购物</p>
        </div>
      </div>

      {/* 分类网格 */}
      <Card className={styles.categoryCard} title="商品分类">
        <Grid columns={4} gap={16}>
          {categories.map((category, index) => (
            <Grid.Item key={index}>
              <div className={styles.categoryItem}>
                <div 
                  className={styles.categoryIcon}
                  style={{ backgroundColor: category.color }}
                >
                  {category.icon}
                </div>
                <span className={styles.categoryName}>{category.name}</span>
              </div>
            </Grid.Item>
          ))}
        </Grid>
      </Card>

      {/* 热销商品 */}
      <Card 
        className={styles.productCard} 
        title={
          <div className={styles.cardTitle}>
            <span className={styles.titleIcon}>🔥</span>
            热销商品
          </div>
        }
        extra={<Button size="small" fill="none">更多</Button>}
      >
        <div className={styles.productList}>
          {hotProducts.map((product) => (
            <div key={product.id} className={styles.productItem}>
              <div className={styles.productImage}>
                <div className={styles.imagePlaceholder}>
                  📱
                </div>
                <Tag className={styles.productTag} color="danger" fill="solid">
                  {product.tag}
                </Tag>
              </div>
              <div className={styles.productInfo}>
                <h4 className={styles.productName}>{product.name}</h4>
                <div className={styles.productPrice}>
                  <span className={styles.currentPrice}>¥{product.price}</span>
                  <span className={styles.originalPrice}>¥{product.originalPrice}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 优惠信息 */}
      <Card 
        className={styles.promoCard}
        title={
          <div className={styles.cardTitle}>
            <GiftOutline className={styles.titleIcon} />
            优惠活动
          </div>
        }
      >
        <List>
          <List.Item prefix={<Tag color="success">新人</Tag>}>
            新用户专享 100 元优惠券
          </List.Item>
          <List.Item prefix={<Tag color="warning">限时</Tag>}>
            全场满 299 减 50，满 599 减 120
          </List.Item>
          <List.Item prefix={<Tag color="primary">免运费</Tag>}>
            满 99 元全国包邮
          </List.Item>
        </List>
      </Card>

      {/* rem 适配测试 */}
      <Card className={styles.testCard} title="开发工具">
        <Space direction="vertical" block>
          <Link href="/test-rem">
            <Button color="primary" block>
              🔧 测试 rem 适配功能
            </Button>
          </Link>
          <Link href="/login">
            <Button color="default" block>
              🔑 测试登录页面
            </Button>
          </Link>
        </Space>
        <div className={styles.testDescription}>
          <p>点击上方按钮测试 px 到 rem 的自动转换功能</p>
          <p>基于 1200px 设计稿的响应式适配</p>
        </div>
      </Card>

      {/* 底部安全区 */}
      <div className={styles.safeArea} />
    </div>
  );
}
