import { NextRequest } from 'next/server'
import { kv } from '@/lib/kv'

export const runtime = 'nodejs'

type AdminModels = {
  models: { provider: string; value: string; label?: string; enabled?: boolean; sort?: number }[]
  defaults?: { model?: string; temperature?: number; maxTokens?: number }
}

type PublicModel = { id: string; label: string; provider: string; value: string; sort?: number }
function keyForModels() { const env = process.env.VERCEL_ENV || process.env.NODE_ENV || 'development'; return `admin:models:${env}` }

export async function GET(req: NextRequest) {
  const data = (await kv.get<AdminModels>(keyForModels())) || { models: [], defaults: {} }
  const enabled = (data.models || []).filter(m => m.enabled !== false)
  const list: PublicModel[] = enabled
    .map(m => ({ id: `${m.provider}:${m.value}`, label: m.label || m.value, provider: m.provider, value: m.value, sort: m.sort }))
    .sort((a, b) => (a.sort || 0) - (b.sort || 0) || a.label.localeCompare(b.label))

  // 默认模型：将 KV 中的 defaults.model（可能是 provider模型的 value）尝试映射到组合ID
  let defaultModelId: string | undefined = undefined
  if (data.defaults?.model) {
    const match = list.find(x => x.value === data.defaults!.model)
    if (match) defaultModelId = match.id
  }

  return Response.json({ models: list, defaults: { ...data.defaults, model: defaultModelId } })
}

