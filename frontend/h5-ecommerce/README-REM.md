# px 到 rem 自动转换实现文档

## 功能概述

本项目实现了基于 1200px 设计稿的 px 到 rem 自动转换功能，支持在不同分辨率下设置不同的根字体大小，实现真正的响应式适配。

## 核心特性

- ✅ **基于 1200px 设计稿**: 以 1200px 作为设计基准宽度
- ✅ **自动 px 转 rem**: 通过 PostCSS 插件自动转换 CSS 中的 px 单位
- ✅ **动态根字体**: 根据屏幕尺寸动态调整根字体大小
- ✅ **多断点适配**: 支持手机、平板、桌面等多种设备
- ✅ **组件库兼容**: Antd Mobile 组件样式不受影响
- ✅ **实时响应**: 窗口大小变化时自动重新计算

## 技术实现

### 1. PostCSS 配置 (`postcss.config.js`)

```javascript
'postcss-pxtorem': {
  rootValue: 16,           // 基准字体大小 16px
  unitPrecision: 5,        // rem 值精度
  propList: ['*'],         // 转换所有属性
  selectorBlackList: [     // 排除 Antd Mobile 类名
    /^\.adm-/,
    /^\.no-rem/
  ],
  replace: true,
  mediaQuery: false,
  minPixelValue: 1,
  exclude: /node_modules/i
}
```

### 2. rem 适配工具 (`src/utils/rem.ts`)

核心功能：
- `setRemUnit()`: 动态设置根字体大小
- `pxToRem()`: px 转 rem 计算函数
- `useRemAdaptation()`: React Hook 封装
- `getCurrentBreakpoint()`: 获取当前断点

响应式断点设计：
- **xs (≤375px)**: 小手机，字体放大 1.2 倍
- **sm (≤750px)**: 大手机，字体放大 1.1 倍
- **md (≤1024px)**: 平板，正常比例
- **lg (≤1440px)**: 小桌面，字体缩小 0.9 倍
- **xl (>1440px)**: 大桌面，字体缩小 0.8 倍

### 3. React 组件封装 (`src/components/RemProvider.tsx`)

```typescript
<RemProvider designWidth={1200} baseFontSize={16}>
  {children}
</RemProvider>
```

### 4. 全局集成 (`src/app/layout.tsx`)

在根布局中集成 RemProvider，确保整个应用都支持 rem 适配。

## 使用方法

### 1. 基础使用

直接在 CSS 中使用 px 单位，会自动转换为 rem：

```css
.container {
  width: 300px;        /* 自动转换为 rem */
  height: 200px;       /* 自动转换为 rem */
  font-size: 16px;     /* 自动转换为 rem */
}
```

### 2. 阻止转换

使用 `.no-rem` 类名或 Antd Mobile 组件不会被转换：

```css
.no-rem {
  width: 100px;        /* 保持 px 单位 */
}
```

### 3. JavaScript 中使用

```typescript
import { px2rem, pxToRem, getCurrentBreakpoint } from '@/utils/rem';

// 转换为 rem 字符串
const remValue = px2rem(100); // "6.25rem"

// 转换为数值
const remNumber = pxToRem(100); // 6.25

// 获取当前断点
const breakpoint = getCurrentBreakpoint(); // 'md'
```

## 测试页面

访问 `/test-rem` 路径可以查看：
- 实时屏幕信息显示
- 不同尺寸元素的适配效果
- 响应式字体大小演示
- Antd Mobile 组件兼容性

## 文件结构

```
src/
├── utils/
│   └── rem.ts                 # rem 适配核心工具
├── components/
│   └── RemProvider.tsx        # React 组件封装
├── app/
│   ├── layout.tsx            # 全局布局集成
│   ├── page.tsx              # 首页示例
│   └── test-rem/
│       ├── page.tsx          # rem 测试页面
│       └── page.module.css   # 测试页面样式
├── styles/
│   └── globals.css           # 全局样式
└── postcss.config.js         # PostCSS 配置
```

## 最佳实践

1. **设计稿标注**: 直接使用设计稿上的 px 值，无需手动计算
2. **响应式设计**: 利用断点系统实现不同设备的最佳显示效果
3. **组件隔离**: Antd Mobile 等第三方组件保持原有样式
4. **性能优化**: 使用防抖处理窗口大小变化事件
5. **类型安全**: 完整的 TypeScript 类型定义

## 兼容性

- ✅ 现代浏览器 (Chrome, Firefox, Safari, Edge)
- ✅ 移动端浏览器
- ✅ 微信小程序 WebView
- ✅ 各种屏幕尺寸和分辨率

## 注意事项

1. 根字体大小限制在 12px - 24px 之间，确保可读性
2. Antd Mobile 组件样式不会被转换，保持原有设计
3. 页面加载时会有短暂的字体大小调整过程
4. 建议在组件中使用相对单位，避免硬编码像素值