"use client"

import React, { useEffect, useState } from 'react'

async function fetchProviders() {
  const res = await fetch('/api/admin/providers')
  if (!res.ok) throw new Error('加载失败')
  return res.json() as Promise<{ providers: any[] }>
}

async function addProvider(payload: any) {
  const res = await fetch('/api/admin/providers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('保存失败')
  return res.json()
}

async function updateProvider(payload: any) {
  const res = await fetch('/api/admin/providers', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('保存失败')
  return res.json()
}

async function deleteProvider(id: string) {
  const res = await fetch(`/api/admin/providers?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('删除失败')
  return res.json()
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { (async () => {
    try {
      setLoading(true)
      const data = await fetchProviders()
      setProviders(data.providers)
    } catch (e:any) {
      setError(e?.message || '加载失败')
    } finally { setLoading(false) }
  })() }, [])

  const addRow = async () => {
    const slug = prompt('Provider 标识（如 openai）')?.trim(); if (!slug) return
    const displayName = prompt('显示名称（如 OpenAI）')?.trim() || slug
    const baseUrl = prompt('Base URL（如 https://api.openai.com/v1）')?.trim() || ''
    const apiKey = prompt('API Key（仅写入，不回显）')?.trim() || ''
    try {
      setSaving(true)
      await addProvider({ slug, displayName, baseUrl, apiKey, isActive: true })
      const data = await fetchProviders(); setProviders(data.providers)
    } catch (e:any) { alert(e?.message || '保存失败') } finally { setSaving(false) }
  }

  const saveRow = async (idx: number) => {
    const p = providers[idx]
    try {
      setSaving(true)
      await updateProvider(p)
      alert('已保存')
    } catch (e:any) { alert(e?.message || '保存失败') } finally { setSaving(false) }
  }

  const updateField = (idx: number, key: string, value: any) => {
    setProviders(prev => prev.map((x,i) => i===idx ? { ...x, [key]: value } : x))
  }

  if (loading) return <div className="p-6">加载中...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">管理员：提供商管理</h1>
      <p className="text-slate-500 text-sm">仅保存密文，不回显 API Key；若未配置 ENCRYPTION_KEY，将以 PLAINTEXT: 前缀明文存储（请尽快配置）。</p>

      <div className="space-y-2">
        {providers.map((p, idx) => (
          <div key={p.id || idx} className="border rounded p-3 space-y-2">
            <div className="flex gap-2">
              <input className="border rounded px-2 py-1 w-40" placeholder="slug" value={p.slug} onChange={e=>updateField(idx,'slug',e.target.value)} />
              <input className="border rounded px-2 py-1 flex-1" placeholder="显示名称" value={p.displayName} onChange={e=>updateField(idx,'displayName',e.target.value)} />
            </div>
            <div className="flex gap-2">
              <input className="border rounded px-2 py-1 flex-1" placeholder="Base URL" value={p.baseUrl} onChange={e=>updateField(idx,'baseUrl',e.target.value)} />
            </div>
            <div className="flex gap-2 items-center">
              <label className="text-sm text-slate-600 flex items-center gap-1">
                <input type="checkbox" checked={p.isActive !== false} onChange={e=>updateField(idx,'isActive',e.target.checked)} /> 启用
              </label>
              <button className="text-sm px-2 py-1 bg-slate-900 text-white rounded" onClick={()=>saveRow(idx)} disabled={saving}>保存</button>
              <button className="text-sm px-2 py-1 bg-red-600 text-white rounded" onClick={async()=>{ if(!confirm('确定删除?')) return; setSaving(true); try{ await deleteProvider(p.id); const data=await fetchProviders(); setProviders(data.providers) } catch(e:any){ alert(e?.message||'删除失败') } finally{ setSaving(false) } }}>删除</button>
            </div>
            <div className="text-xs text-slate-500">更新 API Key：请点击“保存”时输入</div>
          </div>
        ))}
      </div>

      <div>
        <button className="text-sm text-blue-600" onClick={addRow} disabled={saving}>+ 添加提供商</button>
      </div>
    </main>
  )
}

