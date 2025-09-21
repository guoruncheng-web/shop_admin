# H5 电商项目接入说明

## 🎉 集成完成

恭喜！您的 H5 项目已经成功接入了 **CSS Modules (Less)** 和 **Antd Mobile**。

## 📋 已完成的配置

### 1. 技术栈配置
- ✅ **Next.js 14** + App Router
- ✅ **TypeScript 5.x** 
- ✅ **Antd Mobile 5.37.1** (UI组件库)
- ✅ **Less 4.2.0** + Less Loader (CSS预处理器)
- ✅ **CSS Modules** 支持 (.module.less)
- ✅ **clsx** (类名工具库)

### 2. 项目结构
```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 首页组件 (展示 Antd Mobile 使用)
│   ├── page.module.less   # 首页样式 (CSS Modules)
│   └── layout.tsx         # 根布局 (集成主题配置)
├── components/            # 可复用组件
│   └── ProductCard/       # 示例组件
│       ├── index.tsx      # 组件逻辑
│       └── index.module.less  # 组件样式
├── config/
│   └── theme.tsx          # Antd Mobile 主题配置
├── styles/
│   └── globals.css        # 全局样式
├── types/
│   └── global.d.ts        # TypeScript 声明文件
└── utils/
    └── index.ts           # 工具函数库
```

### 3. 核心功能
- ✅ **移动端适配** - 响应式设计，支持各种屏幕尺寸
- ✅ **主题定制** - 支持亮色/暗色模式切换
- ✅ **CSS Modules** - 样式隔离，避免样式冲突
- ✅ **TypeScript 支持** - 完整的类型安全
- ✅ **工具函数** - 常用功能函数封装

## 🚀 开发服务器

项目已启动在：**http://localhost:3002**

```bash
# 启动开发服务器
npm run dev

# 构建生产版本  
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

## 💡 使用示例

### CSS Modules 使用方法

```typescript
// 组件文件：components/MyComponent/index.tsx
import styles from './index.module.less';
import clsx from 'clsx';

export function MyComponent({ className, active }) {
  return (
    <div className={clsx(styles.container, className, {
      [styles.active]: active
    })}>
      <h2 className={styles.title}>标题</h2>
      <p className={styles.content}>内容</p>
    </div>
  );
}
```

```less
// 样式文件：components/MyComponent/index.module.less
.container {
  padding: 16px;
  background: white;
  border-radius: 8px;
  
  &.active {
    border: 2px solid #1890ff;
  }
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.content {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}
```

### Antd Mobile 组件使用

```typescript
import { Button, Card, List, Toast } from 'antd-mobile';
import { SearchOutline } from 'antd-mobile-icons';

export function ExampleComponent() {
  const handleClick = () => {
    Toast.show('按钮被点击了！');
  };

  return (
    <Card title="示例卡片">
      <List>
        <List.Item 
          prefix={<SearchOutline />}
          onClick={handleClick}
        >
          列表项
        </List.Item>
      </List>
      
      <Button 
        color="primary" 
        size="large" 
        block
        onClick={handleClick}
      >
        主要按钮
      </Button>
    </Card>
  );
}
```

### 主题定制

```typescript
// 在 layout.tsx 中使用主题
import { ThemeProvider } from '@/config/theme';

export default function Layout({ children }) {
  return (
    <ThemeProvider isDark={false}>
      {children}
    </ThemeProvider>
  );
}
```

## 🛠️ 开发建议

### 1. 样式组织
- 每个组件使用单独的 `.module.less` 文件
- 全局样式放在 `src/styles/globals.css`
- 主题变量在 `src/config/theme.tsx` 中定义

### 2. 组件开发
- 使用 TypeScript 定义组件 Props 接口
- 利用 `clsx` 处理条件类名
- 遵循移动端设计原则

### 3. 性能优化
- 使用 Next.js 的图片优化组件
- 合理使用 CSS Modules 避免样式冲突
- 利用 Antd Mobile 的按需加载

## 📱 移动端特性

### 1. 响应式设计
- 支持各种屏幕尺寸适配
- 使用 CSS Modules 的媒体查询
- 安全区域适配 (iPhone X 等)

### 2. 触摸优化
- 合适的点击区域大小
- 触摸反馈效果
- 防止误触优化

### 3. 性能优化
- 图片懒加载
- 代码分割
- 缓存策略

## 🔧 故障排除

### 常见问题
1. **样式不生效** - 检查文件命名是否为 `.module.less`
2. **TypeScript 错误** - 确保导入了正确的类型声明
3. **Antd Mobile 组件样式异常** - 检查主题配置是否正确

### 调试技巧
- 使用浏览器开发者工具检查样式
- 查看 Next.js 编译输出
- 检查 CSS Modules 类名映射

## 📚 相关文档

- [Next.js 官方文档](https://nextjs.org/docs)
- [Antd Mobile 组件库](https://mobile.ant.design/)
- [Less CSS 预处理器](https://lesscss.org/)
- [CSS Modules 规范](https://github.com/css-modules/css-modules)

---

**开发愉快！** 🎉