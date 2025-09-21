/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    // 自定义 px 转 rem 插件
    'postcss-pxtorem': {
      rootValue: 16, // 根字体大小，对应 1rem = 16px
      unitPrecision: 5, // rem 值的小数位数
      propList: ['*'], // 需要转换的属性，'*' 表示所有
      selectorBlackList: [
        // 不转换的选择器
        /^\.adm-/, // Antd Mobile 的类名不转换
        /^html$/, 
        /^body$/,
        /^\.no-rem/, // 添加 .no-rem 类名可以避免转换
      ],
      replace: true, // 直接替换而不是添加备用属性
      mediaQuery: false, // 是否转换媒体查询中的 px
      minPixelValue: 1, // 最小转换的 px 值
      exclude: /node_modules/i, // 排除 node_modules 文件夹
      // 自定义转换函数
      transformUnit: (input, unit) => {
        if (unit === 'px') {
          // 对于设计稿 1200px，计算转换比例
          const designWidth = 1200;
          const baseFontSize = 16;
          
          // 这里使用简单的比例转换
          // 实际的动态计算在运行时由 rem.ts 工具处理
          return input / baseFontSize;
        }
        return input;
      }
    },
    // 自动添加浏览器前缀
    autoprefixer: {
      overrideBrowserslist: [
        'Android >= 4.0',
        'iOS >= 8',
        'Chrome >= 35',
        'Safari >= 8',
        '> 1%',
        'last 2 versions'
      ]
    }
  }
};

module.exports = config;