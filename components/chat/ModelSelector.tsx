"use client"

import React from 'react'
import { useEffect, useState } from 'react'
import { useConversations } from '@/components/state/conversations'

type Props = {
  value?: string
  onChange?: (val: string) => void
  disabled?: boolean
}

export default function ModelSelector({ value, onChange, disabled }: Props) {
  const { active, setConfigForActive } = useConversations()
  const [models, setModels] = useState<{ provider: string; value: string; label: string }[]>([])

  useEffect(() => {
    fetch('/api/admin/models').then(r => r.json()).then(d => setModels(d.models || [])).catch(()=>setModels([]))
  }, [])

  const current = value ?? (active?.config?.model || '')

  const handleChange = (val: string) => {
    if (onChange) onChange(val)
    else setConfigForActive({ model: val })
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-slate-500">模型</span>
      <select
        className="border rounded-md px-2 py-1 bg-white"
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">系统默认</option>
        {models.map(m => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>
    </div>
  )
}

