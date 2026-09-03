import type { Metadata, Viewport } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { siteUrl } from '@/lib/tomb';
import '@/styles/globals.scss';

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
});

/**
 * CRA의 public/index.html에 있던 viewport 메타를 Next 이관 때 빠뜨렸다.
 * 없으면 모바일이 980px 폭으로 그린 뒤 축소해서, 모든 화면이 잘리고
 * 작게 보인다. 이 앱은 사실상 모바일 전용이라 치명적이다.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: '묘비log',
  description: '당신을 아는 존재에게 물어, 당신의 묘비를 세웁니다.',
  openGraph: {
    title: '묘비log',
    description: '당신을 아는 존재에게 물어, 당신의 묘비를 세웁니다.',
    url: '/',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: '묘비log',
    description: '당신을 아는 존재에게 물어, 당신의 묘비를 세웁니다.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={notoSansKr.variable}>
      <body>
        <div className="app-container bg-black min-h-screen max-w-3xl mx-auto">
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  );
}
