'use client';

import { useState, useEffect } from 'react';
import { Button, Space, Card } from 'antd-mobile';
import { px2rem, getCurrentBreakpoint, getResponsiveFontSize } from '@/utils/rem';
import styles from './page.module.css';

export default function TestRemPage() {
  const [screenInfo, setScreenInfo] = useState({
    width: 0,
    height: 0,
    rootFontSize: '16px',
    breakpoint: 'md' as keyof typeof import('@/utils/rem').breakpoints,
    remValue: '1rem'
  });

  useEffect(() => {
    const updateScreenInfo = () => {
      const rootFontSize = window.getComputedStyle(document.documentElement).fontSize;
      const breakpoint = getCurrentBreakpoint();
      
      setScreenInfo({
        width: window.innerWidth,
        height: window.innerHeight,
        rootFontSize,
        breakpoint,
        remValue: px2rem(100) // 测试100px转rem
      });
    };

    updateScreenInfo();
    window.addEventListener('resize', updateScreenInfo);
    
    return () => window.removeEventListener('resize', updateScreenInfo);
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>rem 适配测试页面</h1>
      
      <Card title="屏幕信息" className={styles.card}>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.label}>屏幕宽度：</span>
            <span className={styles.value}>{screenInfo.width}px</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>屏幕高度：</span>
            <span className={styles.value}>{screenInfo.height}px</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>根字体大小：</span>
            <span className={styles.value}>{screenInfo.rootFontSize}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>当前断点：</span>
            <span className={styles.value}>{screenInfo.breakpoint}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.label}>100px 转 rem：</span>
            <span className={styles.value}>{screenInfo.remValue}</span>
          </div>
        </div>
      </Card>

      <Card title="尺寸测试" className={styles.card}>
        <div className={styles.sizeTest}>
          <div className={styles.box100}>
            100px × 100px (应该转为rem)
          </div>
          <div className={styles.box200}>
            200px × 200px (应该转为rem)
          </div>
          <div className={styles.box300}>
            300px × 300px (应该转为rem)
          </div>
        </div>
      </Card>

      <Card title="响应式字体测试" className={styles.card}>
        <div className={styles.fontTest}>
          <p className={styles.text14}>14px 字体大小</p>
          <p className={styles.text16}>16px 字体大小</p>
          <p className={styles.text18}>18px 字体大小</p>
          <p className={styles.text20}>20px 字体大小</p>
          <p className={styles.text24}>24px 字体大小</p>
        </div>
      </Card>

      <Card title="Antd Mobile 组件测试" className={styles.card}>
        <Space direction="vertical" block>
          <Button color="primary" block>
            主要按钮 (Antd Mobile - 不转换)
          </Button>
          <Button color="default" block>
            默认按钮 (Antd Mobile - 不转换)
          </Button>
          <div className={styles.customButton}>
            自定义按钮 (会转换为rem)
          </div>
        </Space>
      </Card>

      <div className={styles.instructions}>
        <h3>测试说明：</h3>
        <ul>
          <li>调整浏览器窗口大小观察根字体大小变化</li>
          <li>不同屏幕尺寸下元素大小会自动适配</li>
          <li>Antd Mobile 组件保持原有样式</li>
          <li>自定义样式会自动转换为rem</li>
        </ul>
      </div>
    </div>
  );
}