"use client"

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import MessageBubble from '@/components/chat/MessageBubble'
import { IconCopy as Copy, IconSend as Send, IconStop as Square } from '@/components/ui/icons'

 type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return
    const userMsg: ChatMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '' }])
    setInput('')

    setIsStreaming(true)
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/mock-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
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
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data:')) continue
          const data = trimmed.replace(/^data:\s*/, '')
          if (data === '[DONE]') {
            setIsStreaming(false)
            abortRef.current = null
            return
          }
          try {
            const delta = JSON.parse(data) as { content?: string }
            const text = delta.content ?? ''
            setMessages(prev => {
              const copyArr = [...prev]
              const last = copyArr[copyArr.length - 1]
              if (last && last.role === 'assistant') {
                last.content += text
              }
              return copyArr
            })
          } catch {}
        }
      }
    } catch (e) {
      setIsStreaming(false)
      abortRef.current = null
    }
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
        <Button variant="outline" onClick={copyAll} className="gap-2"><Copy size={16}/> 复制全部</Button>
      </div>

      <div className="border rounded-xl min-h-[520px] bg-white overflow-hidden">
        <div className="p-4 h-[420px] overflow-auto bg-slate-50/60">
          {messages.length === 0 && (
            <div className="text-slate-400">开始对话吧～</div>
          )}
          {messages.map((m, idx) => (
            <MessageBubble key={idx} role={m.role} content={m.content} />
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

