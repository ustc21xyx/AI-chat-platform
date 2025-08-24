"use client"

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import MessageBubble from '@/components/chat/MessageBubble'
import { Copy } from 'lucide-react'
import copy from 'copy-to-clipboard'

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

  const copyAll = () => {
    const text = messages.map(m => `${m.role === 'user' ? '你' : '助手'}：${m.content}`).join('\n')
    copy(text)
  }

  return (
    <main>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">聊天</h1>
        <Button variant="outline" onClick={copyAll} className="gap-2"><Copy size={16}/> 复制全部</Button>
      </div>

      <div className="border rounded-lg p-3 min-h-[320px] bg-white">
        {messages.length === 0 && (
          <div className="text-slate-400">开始对话吧～</div>
        )}
        {messages.map((m, idx) => (
          <MessageBubble key={idx} role={m.role} content={m.content} />
        ))}
      </div>

      <div className="flex gap-2 mt-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入你的问题..."
          rows={3}
          className="flex-1 p-3 border rounded-lg"
        />
        <div className="flex flex-col gap-2">
          <Button onClick={handleSend} disabled={isStreaming}>发送</Button>
          <Button onClick={handleStop} disabled={!isStreaming} variant="outline">停止</Button>
        </div>
      </div>
    </main>
  )
}

