"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type ChatMessage = { role: 'user' | 'assistant'; content: string }
export type Conversation = {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

export type ConversationsContextValue = {
  conversations: Conversation[]
  activeId: string | null
  active: Conversation | null
  isReady: boolean
  // actions
  createConversation: (title?: string) => Conversation
  setActive: (id: string | null) => void
  renameConversation: (id: string, title: string) => void
  deleteConversation: (id: string) => void
  // message operations on active conversation
  setMessagesForActive: (messages: ChatMessage[]) => void
  pushMessage: (msg: ChatMessage) => void
  appendToLastAssistant: (delta: string) => void
  // title generation
  generateTitleForActive: () => Promise<void>
}

const ConversationsContext = createContext<ConversationsContextValue | null>(null)
const STORAGE_KEY = 'conversations:v1'

function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function ConversationsProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isReady, setIsReady] = useState(false)

  const [activeId, setActiveId] = useState<string | null>(null)

  // load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as { conversations: Conversation[]; activeId: string | null }
        setConversations(parsed.conversations || [])
        setActiveId(parsed.activeId ?? null)
      } else {
        // 初始保持空列表与空激活，首页显示空白会话
        setConversations([])
        setActiveId(null)
      }
      setIsReady(true)
    } catch {}
  }, [])

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ conversations, activeId }))
    } catch {}
  }, [conversations, activeId])

  const active = useMemo(() => conversations.find(c => c.id === activeId) || null, [conversations, activeId])

  const createConversation = (title = '新会话') => {
    const conv: Conversation = { id: genId(), title, messages: [], createdAt: Date.now(), updatedAt: Date.now() }
    setConversations(prev => [conv, ...prev])
    setActiveId(conv.id)
    return conv
  }

  const setActive = (id: string | null) => {
    setActiveId(id)
  }

  const renameConversation = (id: string, title: string) => {
    setConversations(prev => prev.map(c => (c.id === id ? { ...c, title, updatedAt: Date.now() } : c)))
  }

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id))
    setActiveId(prevId => {
      if (prevId === id) {
        const remain = conversations.filter(c => c.id !== id)
        return remain[0]?.id || null
      }
      return prevId
    })
  }

  const setMessagesForActive = (messages: ChatMessage[]) => {
    if (!active) return
    setConversations(prev => prev.map(c => (c.id === active.id ? { ...c, messages, updatedAt: Date.now() } : c)))
  }

  const pushMessage = (msg: ChatMessage) => {
    if (!active) return
    setConversations(prev => prev.map(c => (c.id === active.id ? { ...c, messages: [...c.messages, msg], updatedAt: Date.now() } : c)))
  }

  const appendToLastAssistant = (delta: string) => {
    if (!active) return
    setConversations(prev =>
      prev.map(c => {
        if (c.id !== active.id) return c
        const msgs = [...c.messages]
        const last = msgs[msgs.length - 1]
        if (last && last.role === 'assistant') {
          msgs[msgs.length - 1] = { ...last, content: last.content + delta }
        }
        return { ...c, messages: msgs, updatedAt: Date.now() }
      })
    )
  }

  async function generateTitleForActive() {
    if (!active) return
    // 规则：只取第一条“用户”消息的前 20 个字符
    const firstUser = (active.messages || []).find(m => m.role === 'user')
    const fallback = firstUser ? firstUser.content.trim().slice(0, 20) : '新会话'

    // 预留：管理员可接入后端/模型生成标题
    // try {
    //   const res = await fetch('/api/admin/generate-title', { method: 'POST', body: JSON.stringify({ messages: active.messages }) })
    //   const { title } = await res.json()
    //   if (title) { renameConversation(active.id, title) ; return }
    // } catch {}

    if (!active.title || active.title === '新会话') {
      renameConversation(active.id, fallback)
    }
  }

  const value: ConversationsContextValue = {
    conversations,
    activeId,
    active,
    isReady,
    createConversation,
    setActive,
    renameConversation,
    deleteConversation,
    setMessagesForActive,
    pushMessage,
    appendToLastAssistant,
    generateTitleForActive,
  }

  return <ConversationsContext.Provider value={value}>{children}</ConversationsContext.Provider>
}

export function useConversations() {
  const ctx = useContext(ConversationsContext)
  if (!ctx) throw new Error('useConversations must be used within ConversationsProvider')
  return ctx
}

