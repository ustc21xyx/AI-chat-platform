"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useConversations } from '@/components/state/conversations'

export default function ChatPage() {
  const router = useRouter()
  const { active, createConversation } = useConversations()

  useEffect(() => {
    if (active?.id) {
      router.replace(`/chat/${active.id}`)
    } else {
      const conv = createConversation()
      router.replace(`/chat/${conv.id}`)
    }
  }, [active?.id])

  return null
}

