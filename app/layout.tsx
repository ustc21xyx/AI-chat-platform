import './globals.css'
import type { Metadata } from 'next'
import Sidebar from '@/components/layout/Sidebar'

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
        <header className="border-b sticky top-0 bg-white/70 backdrop-blur z-50">
          <div className="max-w-[1200px] mx-auto px-4 py-3 font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
              中文AI聊天公益平台
            </div>
            <div className="text-sm text-slate-500">兼容 OpenAI API · 多提供商</div>
          </div>
        </header>
        <div className="max-w-[1200px] mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
          <Sidebar />
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

