import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "../config/theme";
import { RemProvider } from "@/components/RemProvider";
import "../styles/globals.css";
// import "./globals.css"; // 注释掉原有的全局样式

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "H5 电商商城",
  description: "专业的移动电商平台，提供优质商品和服务",
  keywords: "电商,购物,移动商城,H5商城",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
