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

  // 新增表单
  const [form, setForm] = useState<any>({ slug: '', displayName: '', baseUrl: '', apiKey: '', isActive: true, notes: '' })
  // 行内“新API Key”输入，不回显旧值
  const [apiKeyInputs, setApiKeyInputs] = useState<Record<string, string>>({})

  // 批量导入
  const [importText, setImportText] = useState('')
  const [importing, setImporting] = useState(false)

  useEffect(() => { (async () => {
    try {
      setLoading(true)
      const data = await fetchProviders()
      setProviders(data.providers)
    } catch (e:any) {
      setError(e?.message || '加载失败')
    } finally { setLoading(false) }
  })() }, [])

  const createProvider = async () => {
    if (!form.slug.trim() || !form.baseUrl.trim()) { alert('请填写 slug 与 Base URL'); return }
    try {
      setSaving(true)
      await addProvider(form)
      const data = await fetchProviders(); setProviders(data.providers)
      setForm({ slug: '', displayName: '', baseUrl: '', apiKey: '', isActive: true, notes: '' })
    } catch (e:any) { alert(e?.message || '保存失败') } finally { setSaving(false) }
  }

  const saveRow = async (idx: number) => {
    const p = providers[idx]
    try {
      setSaving(true)
      const apiKey = apiKeyInputs[p.id] || undefined
      await updateProvider({ ...p, apiKey })
      setApiKeyInputs(prev => ({ ...prev, [p.id]: '' }))
      alert('已保存')
    } catch (e:any) { alert(e?.message || '保存失败') } finally { setSaving(false) }
  }

  const updateField = (idx: number, key: string, value: any) => {
    setProviders(prev => prev.map((x,i) => i===idx ? { ...x, [key]: value } : x))
  }

  const bulkImport = async () => {
    if (!importText.trim()) return
    setImporting(true)
    try {
      let payload: any = null
      try { payload = JSON.parse(importText) } catch { alert('请粘贴 JSON（对象或数组）'); setImporting(false); return }
      const arr = Array.isArray(payload) ? payload : [payload]
      for (const it of arr) {
        const item = {
          slug: it.slug || it.name || '',
          displayName: it.displayName || it.name || it.slug || '',
          baseUrl: it.baseUrl || it.endpoint || '',
          apiKey: it.apiKey || '',
          isActive: it.isActive !== false,
          notes: it.notes || ''
        }
        if (!item.slug || !item.baseUrl) continue
        try { await addProvider(item) } catch {}
      }
      const data = await fetchProviders(); setProviders(data.providers)
      setImportText('')
      alert('导入完成')
    } finally {
      setImporting(false)
    }
  }

  if (loading) return <div className="p-6">加载中...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">管理员：提供商管理</h1>
      <p className="text-slate-500 text-sm">仅保存密文，不回显 API Key；若未配置 ENCRYPTION_KEY，将以 PLAINTEXT: 前缀明文存储（请尽快配置）。</p>

      {/* 新增提供商 */}
      <section className="space-y-2 border rounded p-3">
        <h2 className="font-medium">新增提供商</h2>
        <div className="flex flex-wrap gap-2">
          <input className="border rounded px-2 py-1 w-40" placeholder="slug (如 openai)" value={form.slug} onChange={e=>setForm((f:any)=>({...f, slug:e.target.value}))} />
          <input className="border rounded px-2 py-1 w-56" placeholder="显示名称" value={form.displayName} onChange={e=>setForm((f:any)=>({...f, displayName:e.target.value}))} />
          <input className="border rounded px-2 py-1 flex-1 min-w-[240px]" placeholder="Base URL (https://...)" value={form.baseUrl} onChange={e=>setForm((f:any)=>({...f, baseUrl:e.target.value}))} />
          <input className="border rounded px-2 py-1 w-72" placeholder="API Key (仅写入)" value={form.apiKey} onChange={e=>setForm((f:any)=>({...f, apiKey:e.target.value}))} />
          <input className="border rounded px-2 py-1 flex-1" placeholder="备注 (可选)" value={form.notes} onChange={e=>setForm((f:any)=>({...f, notes:e.target.value}))} />
          <label className="text-sm text-slate-600 flex items-center gap-1">
            <input type="checkbox" checked={form.isActive} onChange={e=>setForm((f:any)=>({...f, isActive:e.target.checked}))} /> 启用
          </label>
          <button className="text-sm px-3 py-1.5 bg-slate-900 text-white rounded" onClick={createProvider} disabled={saving}>创建</button>
        </div>
      </section>

      {/* 批量导入 */}
      <section className="space-y-2 border rounded p-3">
        <h2 className="font-medium">批量导入（粘贴 JSON，支持对象或数组）</h2>
        <textarea className="w-full border rounded p-2 font-mono text-sm" rows={5} placeholder='例如：[{"slug":"openai","displayName":"OpenAI","baseUrl":"https://api.openai.com/v1","apiKey":"sk-..."}]' value={importText} onChange={e=>setImportText(e.target.value)} />
        <div>
          <button className="text-sm px-3 py-1.5 bg-slate-900 text-white rounded" disabled={importing} onClick={bulkImport}>{importing ? '导入中…' : '导入'}</button>
        </div>
      </section>

      {/* 列表编辑 */}
      <section className="space-y-2">
        <h2 className="font-medium">已配置的提供商</h2>
        {providers.length === 0 && <div className="text-slate-500 text-sm">暂无，请先新增或导入</div>}
        {providers.map((p, idx) => (
          <div key={p.id || idx} className="border rounded p-3 space-y-2">
            <div className="flex flex-wrap gap-2">
              <input className="border rounded px-2 py-1 w-40" placeholder="slug" value={p.slug} onChange={e=>updateField(idx,'slug',e.target.value)} />
              <input className="border rounded px-2 py-1 w-56" placeholder="显示名称" value={p.displayName} onChange={e=>updateField(idx,'displayName',e.target.value)} />
              <input className="border rounded px-2 py-1 flex-1 min-w-[240px]" placeholder="Base URL" value={p.baseUrl} onChange={e=>updateField(idx,'baseUrl',e.target.value)} />
              <input className="border rounded px-2 py-1 flex-1" placeholder="备注 (可选)" value={p.notes || ''} onChange={e=>updateField(idx,'notes',e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <input className="border rounded px-2 py-1 w-72" type="password" placeholder="新 API Key（可选，不回显）" value={apiKeyInputs[p.id] || ''} onChange={e=>setApiKeyInputs(prev=>({ ...prev, [p.id]: e.target.value }))} />
              <label className="text-sm text-slate-600 flex items-center gap-1">
                <input type="checkbox" checked={p.isActive !== false} onChange={e=>updateField(idx,'isActive',e.target.checked)} /> 启用
              </label>
              <button className="text-sm px-2 py-1 bg-slate-900 text-white rounded" onClick={()=>saveRow(idx)} disabled={saving}>保存</button>
              <button className="text-sm px-2 py-1 bg-red-600 text-white rounded" onClick={async()=>{ if(!confirm('确定删除?')) return; setSaving(true); try{ await deleteProvider(p.id); const data=await fetchProviders(); setProviders(data.providers) } catch(e:any){ alert(e?.message||'删除失败') } finally{ setSaving(false) } }}>删除</button>
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}

