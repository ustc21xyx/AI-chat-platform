"use client"

import Link from 'next/link'
import { Plus, Search, Clock, Settings } from 'lucide-react'

export default function Sidebar() {
  const Item = ({ icon: Icon, label, href = '#' }: { icon: any; label: string; href?: string }) => (
    <Link href={href} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700">
      <Icon size={16} />
      <span className="text-sm">{label}</span>
    </Link>
  )

  return (
    <aside className="hidden lg:flex lg:flex-col border-r bg-slate-50/60">
      <div className="p-3 border-b">
        <Item icon={Plus} label="新聊天" href="/chat" />
      </div>
      <div className="p-3 space-y-1 flex-1 overflow-auto">
        <Item icon={Search} label="搜索聊天" />
        <div className="pt-2 text-xs uppercase tracking-wider text-slate-400 px-3">最近</div>
        <Item icon={Clock} label="（占位）昨天的对话" />
        <Item icon={Clock} label="（占位）上周的对话" />
      </div>
      <div className="p-3 border-t">
        <Item icon={Settings} label="设置" />
      </div>
    </aside>
  )
}

