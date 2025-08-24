import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '中文AI聊天公益平台',
  description: '一个聚合多提供商、兼容OpenAI API的中文AI聊天平台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}

