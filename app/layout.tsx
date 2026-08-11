import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import Cursor from '@/components/Cursor'
import Intro from '@/components/Intro'
import ClientEffects from '@/components/ClientEffects'

export const metadata: Metadata = {
  title: 'TOMOB — 브랜드부터 봅니다.',
  description: '브랜딩, 웹사이트, 마케팅을 아우르는 AI 에이전시, 토모브',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/variable/woff2/SUIT-Variable.css"
          rel="stylesheet"
        />
        {/* /ax 랜딩 폰트 — Pretendard 하나만 쓴다.
            2026-08-11: 첫 페인트 9.8초를 잡으면서 렌더 블로킹 스타일시트를 줄였다.
              Geist          — /ax가 Pretendard 단독으로 바뀌어 미사용 (Wordmark.tsx 되살릴 때만 필요)
              Instrument Serif / Nanum Myeongjo — 히어로 진술문 제거로 미사용
            둘 다 링크를 뺐다. 되살릴 일이 생기면 여기에 다시 넣는다. */}
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <Cursor />
        <Intro />
        {children}
        <ClientEffects />
        {/* Meta Pixel */}
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '1306757994927109');
          fbq('track', 'PageView');
        `}</Script>
        <noscript><img height="1" width="1" style={{display:'none'}}
          src="https://www.facebook.com/tr?id=1306757994927109&ev=PageView&noscript=1"
        /></noscript>
      </body>
    </html>
  )
}
