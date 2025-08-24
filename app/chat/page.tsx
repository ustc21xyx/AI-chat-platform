"use client"

import { useEffect, useRef, useState } from 'react'

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
        // 解析形如: data: xxx\n\n 的行
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
              const copy = [...prev]
              const last = copy[copy.length - 1]
              if (last && last.role === 'assistant') {
                last.content += text
              }
              return copy
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

  return (
    <main style={{maxWidth: 960, margin: '0 auto', padding: '24px 16px'}}>
      <h1 style={{fontSize: 20, marginBottom: 12}}>聊天</h1>

      <div style={{border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, minHeight: 240}}>
        {messages.length === 0 && (
          <div style={{color: '#94a3b8'}}>开始对话吧～</div>
        )}
        {messages.map((m, idx) => (
          <div key={idx} style={{whiteSpace: 'pre-wrap', padding: '6px 0'}}>
            <b>{m.role === 'user' ? '你' : '助手'}：</b> {m.content}
          </div>
        ))}
      </div>

      <div style={{display: 'flex', gap: 8, marginTop: 12}}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入你的问题..."
          rows={3}
          style={{flex: 1, padding: 8, border: '1px solid #e5e7eb', borderRadius: 8}}
        />
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          <button onClick={handleSend} disabled={isStreaming} style={{padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb'}}>
            发送
          </button>
          <button onClick={handleStop} disabled={!isStreaming} style={{padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb'}}>
            停止
          </button>
        </div>
      </div>
    </main>
  )
}

