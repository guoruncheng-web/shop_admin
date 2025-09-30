import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  // 明确指定项目根目录，修复 monorepo 问题
  outputFileTracingRoot: __dirname,
  
  // 图片优化配置
  images: {
    domains: ['localhost', 'your-cdn-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },

  // 编译器配置
  compiler: {
    // 生产环境移除 console
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Sass 配置
  sassOptions: {
    includePaths: [path.join(__dirname, 'src/styles')],
  },
};

export default nextConfig;