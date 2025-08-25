"use client"

import React, { useEffect, useState } from 'react'

async function fetchModels(all=false) {
  const res = await fetch(`/api/admin/models${all ? '?all=1' : ''}`)
  if (!res.ok) throw new Error('加载失败')
  return res.json() as Promise<{ models: any[]; defaults?: any }>
}

async function saveModels(payload: any) {
  const res = await fetch('/api/admin/models', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('保存失败')
  return res.json()
}

async function syncModels(provider?: string) {
  const url = provider ? `/api/admin/models/sync?provider=${encodeURIComponent(provider)}` : '/api/admin/models/sync'
  const res = await fetch(url, { method: 'POST' })
  if (!res.ok) throw new Error('同步失败')
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
      const data = await fetchModels(true) // 显示全部（含未启用）
      setModels(data.models)
      setDefaults(data.defaults || {})
    } catch (e:any) {
      setError(e?.message || '加载失败')
    } finally { setLoading(false) }
  })() }, [])

  const save = async () => {
    try {
      setSaving(true)
      await saveModels({ models, defaults })
      alert('已保存')
    } catch (e:any) {
      alert(e?.message || '保存失败')
    } finally { setSaving(false) }
  }

  const doSync = async () => {
    try {
      setSaving(true)
      await syncModels()
      const data = await fetchModels(true)
      setModels(data.models)
      alert('同步完成')
    } catch (e:any) { alert(e?.message || '同步失败') } finally { setSaving(false) }
  }

  const updateField = (idx: number, key: string, value: any) => {
    setModels(prev => prev.map((x,i) => i===idx ? { ...x, [key]: value } : x))
  }

  if (loading) return <div className="p-6">加载中...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">管理员：模型管理</h1>
      <p className="text-slate-500 text-sm">模型来源于“提供商同步”，这里只能启用/禁用、修改显示名和排序。</p>

      <div className="flex items-center gap-2">
        <button onClick={doSync} className="px-3 py-1.5 rounded bg-slate-900 text-white disabled:opacity-60" disabled={saving}>同步模型</button>
        <button onClick={save} disabled={saving} className="px-3 py-1.5 rounded bg-slate-900 text-white disabled:opacity-60">{saving ? '保存中…' : '保存'}</button>
      </div>

      <section className="space-y-3">
        <h2 className="font-medium">模型（全部）</h2>
        {models.length === 0 && <div className="text-slate-500 text-sm">暂无模型，请先同步</div>}
        {models.map((m, idx) => (
          <div key={`${m.provider}:${m.value}:${idx}`} className="flex items-center gap-2 border rounded p-2">
            <div className="w-32 text-xs text-slate-500">{m.provider}</div>
            <div className="w-64 font-mono text-xs truncate" title={m.value}>{m.value}</div>
            <input className="border rounded px-2 py-1 flex-1" placeholder="显示名称" value={m.label || ''} onChange={e=>updateField(idx,'label',e.target.value)} />
            <input className="border rounded px-2 py-1 w-24" type="number" placeholder="排序" value={m.sort ?? 0} onChange={e=>updateField(idx,'sort', Number(e.target.value))} />
            <label className="text-sm text-slate-600 flex items-center gap-1">
              <input type="checkbox" checked={m.enabled !== false} onChange={e=>updateField(idx,'enabled',e.target.checked)} /> 启用
            </label>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">默认参数</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">默认模型</label>
          <select className="border rounded px-2 py-1" value={defaults.model || ''} onChange={e=> setDefaults((d:any)=>({ ...d, model: e.target.value }))}>
            <option value="">（不指定）</option>
            {models.filter(m=>m.enabled!==false).map(m=> (
              <option key={`${m.provider}:${m.value}`} value={m.value}>{m.label || m.value}</option>
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
    </main>
  )
}

