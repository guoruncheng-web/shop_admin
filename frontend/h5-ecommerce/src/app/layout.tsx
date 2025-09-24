import type { Metadata } from "next";
import { ThemeProvider } from "../config/theme";
import { RemProvider } from "@/components/RemProvider";
import "antd-mobile/es/global";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "H5 电商商城",
  description: "专业的移动电商平台，提供优质商品和服务",
  keywords: "电商,购物,移动商城,H5商城",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className="antialiased"
        style={{ 
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
          margin: 0,
          padding: 0,
          backgroundColor: '#fff'
        }}
      >
        <RemProvider designWidth={1200} baseFontSize={16}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </RemProvider>
      </body>
    </html>
  );
}