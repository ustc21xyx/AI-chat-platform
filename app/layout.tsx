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
      <body className="min-h-screen bg-white text-slate-800">
        <header className="border-b sticky top-0 bg-white/70 backdrop-blur">
          <div className="max-w-5xl mx-auto px-4 py-3 font-medium">中文AI聊天公益平台</div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}

