import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
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
};

export default nextConfig;