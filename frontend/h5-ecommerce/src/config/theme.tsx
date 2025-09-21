'use client';

// Antd Mobile 主题配置
import React from 'react';

// 黑色主题变量
export const theme = {
  // 主色调 - 黑色主题色彩
  '--adm-color-primary': '#ff5757',          // 珊瑚红
  '--adm-color-success': '#51cf66',          // 绿色
  '--adm-color-warning': '#ffd43b',          // 黄色
  '--adm-color-danger': '#ff5757',           // 红色
  
  // 文字颜色
  '--adm-color-text': '#ffffff',             // 主文字 - 白色
  '--adm-color-text-secondary': '#c1c2c5',   // 次要文字 - 浅灰
  '--adm-color-weak': '#909296',             // 弱文字 - 中灰
  
  // 背景色
  '--adm-color-background': '#1a1b1e',       // 主背景 - 深黑
  '--adm-color-background-light': '#25262b', // 浅背景 - 浅黑
  '--adm-color-border': '#42454b',           // 边框色 - 灰色
  '--adm-color-box': '#373a40',              // 卡片背景 - 深灰
  
  // 圆角
  '--adm-border-radius': '8px',
  '--adm-border-radius-large': '12px',
  
  // 阴影
  '--adm-shadow-elevation-light': '0 2px 8px rgba(0, 0, 0, 0.25)',
  '--adm-shadow-elevation-medium': '0 4px 16px rgba(0, 0, 0, 0.35)',
};

// 深色主题 - 更深的黑色模式
export const darkTheme = {
  ...theme,
  '--adm-color-text': '#e9ecef',
  '--adm-color-text-secondary': '#adb5bd',
  '--adm-color-weak': '#6c757d',
  '--adm-color-background': '#0d1117',        // 更深的黑色
  '--adm-color-background-light': '#161b22',  // 深黑背景
  '--adm-color-border': '#30363d',            // 深灰边框
  '--adm-color-box': '#21262d',               // 深黑卡片
};

// 主题提供者组件
export function ThemeProvider({ 
  children, 
  isDark = false 
}: { 
  children: React.ReactNode;
  isDark?: boolean;
}) {
  // 应用主题变量到根元素
  React.useEffect(() => {
    const root = document.documentElement;
    const currentTheme = isDark ? darkTheme : theme;
    
    Object.entries(currentTheme).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    return () => {
      // 清理时移除自定义属性
      Object.keys(currentTheme).forEach(key => {
        root.style.removeProperty(key);
      });
    };
  }, [isDark]);

  return <>{children}</>;
}