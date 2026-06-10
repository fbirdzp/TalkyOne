import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'TalkyOne - 找到你的专属私教',
    template: '%s | TalkyOne',
  },
  description: '多品类私教约课平台 - 英语、法语、对外汉语、法律咨询等多领域专家1对1教学',
  keywords: ['私教', '在线教育', '语言学习', '法语', '英语', '法律咨询', '约课'],
  authors: [{ name: 'TalkyOne Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#4A5BFF' },
    { media: '(prefers-color-scheme: dark)', color: '#7B3FF2' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
