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
  // actions
  createConversation: (title?: string) => Conversation
  setActive: (id: string) => void
  renameConversation: (id: string, title: string) => void
  deleteConversation: (id: string) => void
  // message operations on active conversation
  setMessagesForActive: (messages: ChatMessage[]) => void
  pushMessage: (msg: ChatMessage) => void
  appendToLastAssistant: (delta: string) => void
}

const ConversationsContext = createContext<ConversationsContextValue | null>(null)
const STORAGE_KEY = 'conversations:v1'

function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function ConversationsProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  // load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as { conversations: Conversation[]; activeId: string | null }
        setConversations(parsed.conversations || [])
        setActiveId(parsed.activeId || (parsed.conversations?.[0]?.id ?? null))
      } else {
        // initialize with an empty conversation
        const conv: Conversation = {
          id: genId(),
          title: '新会话',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        setConversations([conv])
        setActiveId(conv.id)
      }
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

  const setActive = (id: string) => {
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

  const value: ConversationsContextValue = {
    conversations,
    activeId,
    active,
    createConversation,
    setActive,
    renameConversation,
    deleteConversation,
    setMessagesForActive,
    pushMessage,
    appendToLastAssistant,
  }

  return <ConversationsContext.Provider value={value}>{children}</ConversationsContext.Provider>
}

export function useConversations() {
  const ctx = useContext(ConversationsContext)
  if (!ctx) throw new Error('useConversations must be used within ConversationsProvider')
  return ctx
}

