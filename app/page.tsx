import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <main>
      <section className="py-10">
        <h1 className="text-2xl font-semibold">欢迎使用中文AI聊天公益平台</h1>
        <p className="text-slate-500 mt-1">一个聚合多提供商、兼容 OpenAI API 的中文聊天平台。</p>
        <div className="flex gap-3 mt-4">
          <Link href="/chat"><Button>新建聊天</Button></Link>
          <a href="https://github.com/" target="_blank" rel="noreferrer"><Button variant="outline">查看文档</Button></a>
        </div>
      </section>
    </main>
  )
}

