"use client"

import React, { useEffect, useMemo, useState } from 'react'

async function fetchModels() {
  const res = await fetch('/api/admin/models')
  if (!res.ok) throw new Error('加载失败')
  return res.json() as Promise<{ models: any[]; defaults?: any }>
}

async function saveModels(payload: any) {
  const res = await fetch('/api/admin/models', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('保存失败')
  return res.json()
}

export default function AdminModelsPage() {
  const [models, setModels] = useState<any[]>([])
  const [defaults, setDefaults] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { (async () => {
    try {
      setLoading(true)
      const data = await fetchModels()
      setModels(data.models)
      setDefaults(data.defaults || {})
    } catch (e:any) {
      setError(e?.message || '加载失败')
    } finally { setLoading(false) }
  })() }, [])

  const addRow = () => setModels(prev => [...prev, { provider: '', value: '', label: '', enabled: true }])
  const removeRow = (idx: number) => setModels(prev => prev.filter((_, i) => i !== idx))

  const save = async () => {
    try {
      setSaving(true)
      await saveModels({ models, defaults })
      alert('已保存')
    } catch (e:any) {
      alert(e?.message || '保存失败')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="p-6">加载中...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">管理员：模型配置</h1>
      <p className="text-slate-500 text-sm">配置会保存到 KV，并即时生效。此页面受 Basic Auth 保护。</p>

      <section className="space-y-3">
        <h2 className="font-medium">可用模型</h2>
        {models.map((m, idx) => (
          <div key={idx} className="flex items-center gap-2 border rounded p-2">
            <input className="border rounded px-2 py-1 w-28" placeholder="provider" value={m.provider} onChange={e=>{
              const v = e.target.value; setModels(prev => prev.map((x,i)=> i===idx ? { ...x, provider: v } : x))
            }} />
            <input className="border rounded px-2 py-1 flex-1" placeholder="value" value={m.value} onChange={e=>{
              const v = e.target.value; setModels(prev => prev.map((x,i)=> i===idx ? { ...x, value: v } : x))
            }} />
            <input className="border rounded px-2 py-1 flex-1" placeholder="label" value={m.label} onChange={e=>{
              const v = e.target.value; setModels(prev => prev.map((x,i)=> i===idx ? { ...x, label: v } : x))
            }} />
            <label className="text-sm text-slate-600 flex items-center gap-1">
              <input type="checkbox" checked={m.enabled !== false} onChange={e=>{
                const v = e.target.checked; setModels(prev => prev.map((x,i)=> i===idx ? { ...x, enabled: v } : x))
              }} /> 启用
            </label>
            <button className="text-sm text-red-600" onClick={()=>removeRow(idx)}>删除</button>
          </div>
        ))}
        <button className="text-sm text-blue-600" onClick={addRow}>+ 添加模型</button>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">默认参数</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">默认模型</label>
          <select className="border rounded px-2 py-1" value={defaults.model || ''} onChange={e=> setDefaults((d:any)=>({ ...d, model: e.target.value }))}>
            <option value="">（不指定）</option>
            {models.filter(m=>m.enabled!==false).map(m=> (
              <option key={m.value} value={m.value}>{m.label || m.value}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">温度</label>
          <input className="border rounded px-2 py-1 w-24" type="number" step="0.1" min="0" max="2" value={defaults.temperature ?? ''} onChange={e=> setDefaults((d:any)=>({ ...d, temperature: e.target.value === '' ? undefined : Number(e.target.value) }))} />
          <label className="text-sm text-slate-600">最大Tokens</label>
          <input className="border rounded px-2 py-1 w-24" type="number" min="1" step="1" value={defaults.maxTokens ?? ''} onChange={e=> setDefaults((d:any)=>({ ...d, maxTokens: e.target.value === '' ? undefined : Number(e.target.value) }))} />
        </div>
      </section>

      <div className="pt-2">
        <button onClick={save} disabled={saving} className="px-3 py-1.5 rounded bg-slate-900 text-white disabled:opacity-60">{saving ? '保存中…' : '保存'}</button>
      </div>
    </main>
  )
}

