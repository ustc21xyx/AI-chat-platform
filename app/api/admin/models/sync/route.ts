import { NextRequest } from 'next/server'
import { kv } from '@/lib/kv'
import { decryptString } from '@/lib/crypto'

export const runtime = 'nodejs'

type Provider = { id: string; slug: string; displayName: string; baseUrl: string; apiKeyEncrypted?: string; isActive?: boolean }

type AdminModels = {
  models: { provider: string; value: string; label: string; enabled?: boolean; sort?: number; description?: string }[]
  defaults?: { model?: string; temperature?: number; maxTokens?: number }
}

function keyForProviders() { const env = process.env.VERCEL_ENV || process.env.NODE_ENV || 'development'; return `admin:providers:${env}` }
function keyForModels() { const env = process.env.VERCEL_ENV || process.env.NODE_ENV || 'development'; return `admin:models:${env}` }

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const slug = url.searchParams.get('provider')
    const providers = (await kv.get<Provider[]>(keyForProviders())) || []
    const targets = slug ? providers.filter(p => p.slug === slug) : providers.filter(p => p.isActive !== false)
    if (targets.length === 0) throw new Error('未找到可用提供商')

    // 读取现有 models，以便保留启用状态/自定义名/排序
    const existing = (await kv.get<AdminModels>(keyForModels())) || { models: [], defaults: {} }
    const currentMap = new Map(existing.models.map(m => [`${m.provider}:${m.value}`, m]))

    for (const p of targets) {
      const apiKey = p.apiKeyEncrypted ? await decryptString(p.apiKeyEncrypted) : ''
      if (!apiKey) continue
      const base = p.baseUrl.replace(/\/+$/,'')
      const res = await fetch(`${base}/models`, { headers: { Authorization: `Bearer ${apiKey}` } })
      if (!res.ok) continue
      const data = await res.json().catch(() => null) as any
      const items = (data?.data || []).map((x: any) => ({
        provider: p.slug,
        value: x.id as string,
        label: x.id as string,
        enabled: currentMap.get(`${p.slug}:${x.id}`)?.enabled ?? false,
        sort: currentMap.get(`${p.slug}:${x.id}`)?.sort ?? 0,
        description: currentMap.get(`${p.slug}:${x.id}`)?.description || '',
      }))

      // 合并：保留同 provider:value 的既有自定义；新发现的默认禁用
      const nextMap = new Map(currentMap)
      for (const it of items) {
        const key = `${it.provider}:${it.value}`
        const prev = nextMap.get(key)
        nextMap.set(key, prev ? { ...prev, ...it, label: prev.label || it.label } : it)
      }
      // 删掉已不可用的？MVP：暂不删除，仅保留
      const merged = Array.from(nextMap.values())
      existing.models = merged
    }

    await kv.set(keyForModels(), existing)
    return Response.json({ ok: true, total: existing.models.length })
  } catch (e:any) {
    return Response.json({ ok: false, error: e?.message || 'sync failed' }, { status: 400 })
  }
}

