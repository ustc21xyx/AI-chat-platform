"use client"

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import MessageBubble from '@/components/chat/MessageBubble'
import ModelSelector from '@/components/chat/ModelSelector'
import { IconCopy as Copy, IconSend as Send, IconStop as Square } from '@/components/ui/icons'
import { useConversations, type ChatMessage } from '@/components/state/conversations'
import { useParams, useRouter } from 'next/navigation'

const copyText = async (text: string) => {
  try { await navigator.clipboard.writeText(text) } catch {}
}

export default function ChatPageById() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { conversations, active, isReady, setActive, setMessagesForActive, appendToLastAssistant, generateTitleForActive, setConfigForActive } = useConversations()

  // 强制同步：URL 的 id 必须与 active 一致，避免"已在深链但显示空白"
  useEffect(() => {
    if (!id || !isReady) return
    const exists = conversations.some(c => c.id === id)
    if (exists) {
      // 无论 active 是什么，都强制切到 URL 对应的会话
      setActive(id)
    } else {
      router.replace('/chat')
    }
  }, [id, isReady, conversations.length])


  // 若刚创建还未可见，短暂重试一次，避免误回空白页
  useEffect(() => {
    let t: any
    if (id && isReady) {
      const exists = conversations.some(c => c.id === id)
      if (!exists) {
        t = setTimeout(() => {
          const exists2 = conversations.some(c => c.id === id)
          if (!exists2) router.replace('/chat')
        }, 60)
      }
    }
    return () => t && clearTimeout(t)
  }, [id, isReady, conversations.length])

  const messages = active?.messages ?? []
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  // 首次用户消息进入后命名（只看第一条用户消息）
  useEffect(() => {
    if (!active) return
    const need = !active.title || active.title === '新会话'
    const hasUser = (messages || []).some(m => m.role === 'user')
    if (need && hasUser) generateTitleForActive()
  }, [active?.id, messages.length])

  const streamFrom = async (base: ChatMessage[]) => {
    setIsStreaming(true)
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/mock-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: base }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) throw new Error('网络错误')

      const reader = res.body.getReader()
      const decoder = new TextDecoder('utf-8')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        // 调试：输出解析到的行数和首行（仅开发环境使用）
        try { if (process.env.NODE_ENV !== 'production') console.log('[SSE chunk]', { linesCount: lines.length, first: lines[0] }) } catch {}
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data:')) continue
          const data = trimmed.replace(/^data:\s*/, '')
          try { if (process.env.NODE_ENV !== 'production') console.log('[SSE data]', data) } catch {}
          if (data === '[DONE]') {
            setIsStreaming(false)
            abortRef.current = null
            return
          }
          try {
            const delta = JSON.parse(data) as { content?: string }
            const text = delta.content ?? ''
            appendToLastAssistant(text)
          } catch (err) {
            try { if (process.env.NODE_ENV !== 'production') console.warn('[SSE parse error]', err) } catch {}
          }
        }
      }
      setIsStreaming(false)
      abortRef.current = null
    } catch (e) {
      setIsStreaming(false)
      abortRef.current = null
    }
  }

  // 处理从 /chat 带过来的首发 pendingStream（包含 base；可选预选模型）
  useEffect(() => {
    if (!isReady || !active?.id) return
    try {
      const raw = sessionStorage.getItem('pendingStream')
      if (!raw) return
      const ps = JSON.parse(raw) as { id: string; base: ChatMessage[]; config?: { model?: string } }
      if (ps.id !== active.id) return
      // 确保助手空占位存在
      if (!active.messages.find(m => m.role === 'assistant')) {
        setMessagesForActive([...ps.base, { role: 'assistant', content: '' }])
      }
      // 应用预选模型
      if (ps.config?.model) setConfigForActive({ model: ps.config.model })
      // 清理并立即启动流式
      sessionStorage.removeItem('pendingStream')
      streamFrom(ps.base)
    } catch {}
  }, [isReady, active?.id])

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return
    const userMsg: ChatMessage = { role: 'user', content: input }
    const base = [...messages, userMsg]
    setMessagesForActive([...base, { role: 'assistant', content: '' }])
    setInput('')
    streamFrom(base)
  }

  const handleStop = () => {
    abortRef.current?.abort()
    setIsStreaming(false)
    abortRef.current = null
  }

  const copyAll = async () => {
    const text = messages.map(m => `${m.role === 'user' ? '你' : '助手'}：${m.content}`).join('\n')

    try { await navigator.clipboard.writeText(text) } catch {}
  }

  return (
    <main>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">聊天</h1>
        <div className="flex items-center gap-3">
          <ModelSelector />
          <Button variant="outline" onClick={copyAll} className="gap-2"><Copy size={16}/> 复制全部</Button>
        </div>
      </div>

      <div className="border rounded-xl min-h-[520px] bg-white overflow-hidden">
        <div className="p-4 h-[420px] overflow-auto bg-slate-50/60">
          {messages.length === 0 && (
            <div className="text-slate-400">开始对话吧～</div>
          )}
          {messages.map((m, idx) => (
            <MessageBubble
              key={idx}
              role={m.role}
              content={m.content}
              onCopy={() => copyText(m.content)}
              onRetry={() => {
                if (m.role === 'assistant') {
                  const until = messages.slice(0, idx)
                  setMessagesForActive([...until, { role: 'assistant', content: '' }])
                  streamFrom(until)
                }
              }}
              onDelete={() => {
                const cp = [...messages]
                cp.splice(idx,1)
                setMessagesForActive(cp)
              }}
            />
          ))}
        </div>
        <div className="border-t p-3">
          <div className="flex gap-2 items-start">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="输入你的问题... (Enter 发送, Shift+Enter 换行)"
              rows={3}
              className="flex-1 p-3 border rounded-lg"
            />
            <div className="flex flex-col gap-2 w-28">
              <Button onClick={handleSend} disabled={isStreaming} className="gap-2"><Send size={16}/> 发送</Button>
              <Button onClick={handleStop} disabled={!isStreaming} variant="outline" className="gap-2"><Square size={16}/> 停止</Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

