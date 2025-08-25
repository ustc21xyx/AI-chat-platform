"use client"

import React, { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import MessageBubble from '@/components/chat/MessageBubble'
import ModelSelector from '@/components/chat/ModelSelector'
import { IconCopy as Copy, IconSend as Send, IconStop as Square } from '@/components/ui/icons'
import { useConversations, type ChatMessage } from '@/components/state/conversations'

const copyText = async (text: string) => { try { await navigator.clipboard.writeText(text) } catch {} }

export default function ChatPage() {
  const { createConversation, setActive, setMessagesById, generateTitleForActive } = useConversations()
  const router = useRouter()
  // 临时消息：未入库的“空白会话”内容
  const [tempMessages, setTempMessages] = useState<ChatMessage[]>([])
  // 如果用户在 /chat 页面但 activeId 被外部切空（例如删除当前深链会话后返回），保持停留在空白页
  // 不做任何重定向，避免“突然切回空白”的抖动

  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [preModel, setPreModel] = useState('')

  const abortRef = useRef<AbortController | null>(null)

  const streamFrom = async (base: ChatMessage[]) => {
    setIsStreaming(true)
    const controller = new AbortController()
    abortRef.current = controller
    try {
      const res = await fetch('/api/mock-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: base }), signal: controller.signal })
      if (!res.ok || !res.body) throw new Error('网络错误')
      const reader = res.body.getReader(); const decoder = new TextDecoder('utf-8')
      while (true) {
        const { done, value } = await reader.read(); if (done) break
        const chunk = decoder.decode(value, { stream: true }); const lines = chunk.split('\n')
        for (const line of lines) {
          const trimmed = line.trim(); if (!trimmed.startsWith('data:')) continue
          const data = trimmed.replace(/^data:\s*/, '')
          if (data === '[DONE]') { setIsStreaming(false); abortRef.current = null; return }
          try {
            const delta = JSON.parse(data) as { content?: string }
            const text = delta.content ?? ''
            // 临时会话期间，直接拼接最后一个助手消息
            setTempMessages(prev => {
              const copy = [...prev]
              const last = copy[copy.length - 1]
              if (last && last.role === 'assistant') last.content += text
              return copy
            })
          } catch {}
        }
      }
    } catch {
      setIsStreaming(false); abortRef.current = null
    }
  }

  const ensureRealConversation = (base: ChatMessage[]) => {
    // 创建真实会话，把 base（含首条用户消息）灌入 Provider，并无感跳转到深链
    const conv = createConversation()
    // Provider 中写入：base + 助手空占位
    const withAssistant: ChatMessage[] = [...base, { role: 'assistant', content: '' } as ChatMessage]
    // 如果预选了模型，把它写入会话配置
    // 预选模型记录到 pendingStream，由深链页应用
    flushSync(() => {
      setActive(conv.id)
      setMessagesById(conv.id, withAssistant)
    })
    // 将待流式的 base 暂存，交给深链页启动流式，并带上预选模型
    try { sessionStorage.setItem('pendingStream', JSON.stringify({ id: conv.id, base, config: preModel ? { model: preModel } : undefined })) } catch {}
    // 触发命名（基于第一条用户消息）
    setTimeout(() => generateTitleForActive(), 0)
    router.replace(`/chat/${conv.id}`)
    return conv
  }

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return
    const userMsg: ChatMessage = { role: 'user', content: input }
    const base = [...tempMessages, userMsg]
    setTempMessages([...base, { role: 'assistant', content: '' }])
    setInput('')
    // 首次发送时，创建“真实会话”并把当前临时消息同步进去
    ensureRealConversation(base)
    // 不在 /chat 页进行流式，交由深链页根据 pendingStream 继续
  }

  const handleStop = () => { abortRef.current?.abort(); setIsStreaming(false); abortRef.current = null }

  const copyAll = async () => {
    const text = tempMessages.map(m => `${m.role === 'user' ? '你' : '助手'}：${m.content}`).join('\n')
    try { await navigator.clipboard.writeText(text) } catch {}
  }

  return (
    <main>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">聊天</h1>
        <div className="flex items-center gap-3">
          <ModelSelector value={preModel} onChange={setPreModel} />
          <Button variant="outline" onClick={copyAll} className="gap-2"><Copy size={16}/> 复制全部</Button>
        </div>
      </div>

      <div className="border rounded-xl min-h-[520px] bg-white overflow-hidden">
        <div className="p-4 h-[420px] overflow-auto bg-slate-50/60">
          {tempMessages.length === 0 && (
            <div className="text-slate-400">开始对话吧～</div>
          )}
          {tempMessages.map((m, idx) => (
            <MessageBubble
              key={idx}
              role={m.role}
              content={m.content}
              onCopy={() => copyText(m.content)}
              onRetry={() => {
                if (m.role === 'assistant') {
                  const until = tempMessages.slice(0, idx)
                  setTempMessages([...until, { role: 'assistant', content: '' }])
                  streamFrom(until)
                }
              }}
              onDelete={() => {
                const cp = [...tempMessages]
                cp.splice(idx,1)
                setTempMessages(cp)
              }}
            />
          ))}
        </div>
        <div className="border-t p-3">
          <div className="flex gap-2 items-start">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
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

