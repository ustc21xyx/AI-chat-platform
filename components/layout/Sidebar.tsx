"use client"

import { useConversations } from '@/components/state/conversations'
import { IconPlus as Plus, IconSearch as Search, IconClock as Clock, IconSettings as Settings } from '@/components/ui/icons'

export default function Sidebar() {
  const { conversations, activeId, createConversation, setActive, renameConversation, deleteConversation } = useConversations()

  return (
    <aside className="hidden lg:flex lg:flex-col border-r bg-slate-50/60">
      <div className="p-3 border-b bg-white/60">
        <button
          onClick={() => createConversation()}
          className="group relative flex items-center gap-2 px-3 py-2 rounded-md text-slate-700 hover:bg-white hover:shadow-sm transition"
        >
          <Plus size={16} className="text-slate-500 group-hover:text-slate-700" />
          <span className="text-sm">新会话</span>
        </button>
      </div>
      <div className="p-3 space-y-2 flex-1 overflow-auto">
        <div className="px-3">
          <div className="flex items-center gap-2 rounded-md bg-white border px-2 py-1.5 text-slate-500">
            <Search size={14} />
            <input placeholder="搜索" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
          </div>
        </div>
        <div className="pt-2 text-xs uppercase tracking-wider text-slate-400 px-3">最近</div>
        <div className="space-y-1">
          {conversations.map((c) => (
            <div key={c.id} className={`group relative flex items-center justify-between gap-2 px-3 py-2 rounded-md hover:bg-white hover:shadow-sm transition cursor-pointer ${activeId === c.id ? 'bg-white shadow-sm' : ''}`}>
              <div className="flex items-center gap-2 min-w-0" onClick={() => setActive(c.id)}>
                <Clock size={16} className="text-slate-500 group-hover:text-slate-700" />
                <span className="text-sm truncate">{c.title || '未命名会话'}</span>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                <button className="text-xs text-slate-500 hover:text-slate-700" onClick={() => {
                  const t = prompt('重命名会话', c.title)
                  if (t != null) renameConversation(c.id, t)
                }}>改名</button>
                <button className="text-xs text-red-500 hover:text-red-600" onClick={() => deleteConversation(c.id)}>删除</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="p-3 border-t bg-white/60">
        <div className="flex items-center gap-2 px-3 py-2 text-slate-700">
          <Settings size={16} className="text-slate-500" />
          <span className="text-sm">设置</span>
        </div>
      </div>
    </aside>
  )
}
