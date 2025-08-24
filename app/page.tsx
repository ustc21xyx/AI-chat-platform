import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <main>
      <section className="py-10">
        <h1 className="text-2xl font-semibold">中文AI聊天公益平台</h1>
        <p className="text-slate-500 mt-1">这是前端应用的起始页。请前往聊天页体验。</p>
        <div className="flex gap-3 mt-4">
          <Link href="/chat"><Button>前往聊天页</Button></Link>
          <a href="https://github.com/" target="_blank" rel="noreferrer"><Button variant="outline">查看文档</Button></a>
        </div>
      </section>
    </main>
  )
}

