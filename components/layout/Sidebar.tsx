"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconPlus as Plus, IconSearch as Search, IconClock as Clock, IconSettings as Settings } from '@/components/ui/icons'

export default function Sidebar() {
  const pathname = usePathname()

  const Item = ({ icon: Icon, label, href = '#', active = false }: { icon: any; label: string; href?: string; active?: boolean }) => (
    <Link
      href={href}
      className={`group relative flex items-center gap-2 px-3 py-2 rounded-md text-slate-700 hover:bg-white hover:shadow-sm transition ${active ? 'bg-white shadow-sm' : ''}`}
    >
      <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full ${active ? 'bg-slate-400' : 'bg-transparent'} transition`} />
      <Icon size={16} className="text-slate-500 group-hover:text-slate-700" />
      <span className="text-sm">{label}</span>
    </Link>
  )

  return (
    <aside className="hidden lg:flex lg:flex-col border-r bg-slate-50/60">
      <div className="p-3 border-b bg-white/60">
        <Item icon={Plus} label="新聊天" href="/chat" active={pathname === '/chat'} />
      </div>
      <div className="p-3 space-y-2 flex-1 overflow-auto">
        <div className="px-3">
          <div className="flex items-center gap-2 rounded-md bg-white border px-2 py-1.5 text-slate-500">
            <Search size={14} />
            <input placeholder="搜索" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
          </div>
        </div>
        <div className="pt-2 text-xs uppercase tracking-wider text-slate-400 px-3">最近</div>
        <Item icon={Clock} label="（占位）昨天的对话" />
        <Item icon={Clock} label="（占位）上周的对话" />
      </div>
      <div className="p-3 border-t bg-white/60">
        <Item icon={Settings} label="设置" />
      </div>
    </aside>
  )
}
