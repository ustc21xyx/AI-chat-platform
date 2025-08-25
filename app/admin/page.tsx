"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

async function fetchProviders() {
  const res = await fetch('/api/admin/providers')
  if (!res.ok) throw new Error('加载提供商失败')
  return res.json() as Promise<{ providers: any[] }>
}

async function fetchModelsAll() {
  const res = await fetch('/api/admin/models?all=1')
  if (!res.ok) throw new Error('加载模型失败')
  return res.json() as Promise<{ models: any[]; defaults?: any }>
}

async function syncModels() {
  const res = await fetch('/api/admin/models/sync', { method: 'POST' })
  if (!res.ok) throw new Error('同步失败')
  return res.json()
}

export default function AdminHomePage() {
  const [provCount, setProvCount] = useState<number>(0)
  const [modelCount, setModelCount] = useState<{ enabled: number; total: number }>({ enabled: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      const [{ providers }, { models }] = await Promise.all([fetchProviders(), fetchModelsAll()])
      setProvCount(providers.length)
      setModelCount({ total: models.length, enabled: models.filter((m:any) => m.enabled !== false).length })
    } catch (e: any) {
      setError(e?.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleSync = async () => {
    try {
      setSyncing(true)
      await syncModels()
      await load()
      alert('同步完成')
    } catch (e: any) {
      alert(e?.message || '同步失败')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">管理后台</h1>
        <div className="text-sm text-slate-500">受 Basic Auth 保护</div>
      </div>

      {error && <div className="text-red-600">{error}</div>}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="border rounded-xl p-4 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">提供商（Providers）</h2>
            <span className="text-slate-500 text-sm">数量：{loading ? '-' : provCount}</span>
          </div>
          <p className="text-slate-600 text-sm mt-2">配置 AI 提供商的 Base URL、API Key、启用状态等。</p>
          <div className="mt-4 flex gap-2">
            <Link href="/admin/providers" className="px-3 py-1.5 rounded bg-slate-900 text-white">管理提供商</Link>
          </div>
        </div>

        <div className="border rounded-xl p-4 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">模型（Models）</h2>
            <span className="text-slate-500 text-sm">启用 {loading ? '-' : modelCount.enabled} / 总计 {loading ? '-' : modelCount.total}</span>
          </div>
          <p className="text-slate-600 text-sm mt-2">从提供商同步模型；仅对“已发现的模型”进行启用、重命名与排序。</p>
          <div className="mt-4 flex gap-2">
            <button onClick={handleSync} disabled={syncing} className="px-3 py-1.5 rounded bg-slate-900 text-white disabled:opacity-60">{syncing ? '同步中…' : '同步模型'}</button>
            <Link href="/admin/models" className="px-3 py-1.5 rounded bg-slate-900 text-white">管理模型</Link>
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-500">
        <p>提示：若未设置 ENCRYPTION_KEY，API Key 会以 PLAINTEXT: 明文前缀存储，仅用于快速接入测试，请尽快配置。</p>
      </div>
    </main>
  )
}

