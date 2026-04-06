import type { Metadata } from 'next'
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
      </head>
      <body>
        <Cursor />
        <Intro />
        {children}
        <ClientEffects />
      </body>
    </html>
  )
}
