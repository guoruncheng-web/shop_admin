import { NextResponse } from 'next/server';

export const revalidate = 0; // always fresh in dev

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function GET() {
  // 模拟网络延迟
  await delay(300);

  const data = {
    banners: [
      { id: 'b1', img: 'https://picsum.photos/id/1011/750/300', link: '/goodDetails' },
      { id: 'b2', img: 'https://picsum.photos/id/1015/750/300', link: '/goodDetails' },
      { id: 'b3', img: 'https://picsum.photos/id/1025/750/300', link: '/goodDetails' },
    ],
    categories: [
      { id: 'c1', name: '女装', icon: 'https://picsum.photos/id/237/80/80' },
      { id: 'c2', name: '男装', icon: 'https://picsum.photos/id/238/80/80' },
      { id: 'c3', name: '鞋包', icon: 'https://picsum.photos/id/239/80/80' },
      { id: 'c4', name: '美妆', icon: 'https://picsum.photos/id/240/80/80' },
      { id: 'c5', name: '母婴', icon: 'https://picsum.photos/id/241/80/80' },
      { id: 'c6', name: '家居', icon: 'https://picsum.photos/id/242/80/80' },
      { id: 'c7', name: '数码', icon: 'https://picsum.photos/id/243/80/80' },
      { id: 'c8', name: '生鲜', icon: 'https://picsum.photos/id/244/80/80' },
      { id: 'c9', name: '运动', icon: 'https://picsum.photos/id/245/80/80' },
      { id: 'c10', name: '图书', icon: 'https://picsum.photos/id/246/80/80' },
    ],
    recommends: [
      { id: 'p101', title: '法式长袖连衣裙', price: 289, originPrice: 399, img: 'https://picsum.photos/id/302/400/400' },
      { id: 'p102', title: '格纹西装外套', price: 389, originPrice: 499, img: 'https://picsum.photos/id/303/400/400' },
      { id: 'p103', title: '修身直筒牛仔裤', price: 199, originPrice: 259, img: 'https://picsum.photos/id/304/400/400' },
      { id: 'p104', title: '字母印花连帽卫衣', price: 169, originPrice: 229, img: 'https://picsum.photos/id/305/400/400' },
      { id: 'p105', title: '中长款风衣外套', price: 399, originPrice: 529, img: 'https://picsum.photos/id/306/400/400' },
      { id: 'p106', title: '轻薄跑步运动鞋', price: 299, originPrice: 399, img: 'https://picsum.photos/id/307/400/400' },
    ],
    notice: '秋季新款限时优惠，满200减30，包邮！',
    ts: Date.now(),
  };

  return NextResponse.json({ code: 0, msg: 'ok', data });
}