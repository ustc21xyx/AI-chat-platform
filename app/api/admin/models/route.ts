import { NextRequest } from 'next/server'
import { kv } from '@/lib/kv'

export const runtime = 'nodejs'

type AdminModels = {
  models: { provider: string; value: string; label: string; enabled?: boolean }[]
  defaults?: { model?: string; temperature?: number; maxTokens?: number }
}

const FALLBACK: AdminModels = {
  models: [
    { provider: 'openai', value: 'gpt-4o-mini', label: 'OpenAI - gpt-4o-mini', enabled: true },
    { provider: 'openai', value: 'gpt-4o', label: 'OpenAI - gpt-4o', enabled: true },
    { provider: 'anthropic', value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet', enabled: true },
    { provider: 'openrouter', value: 'deepseek/deepseek-chat', label: 'DeepSeek Chat (OpenRouter)', enabled: true },
  ],
  defaults: { model: 'gpt-4o-mini', temperature: 0.7, maxTokens: 2048 }
}

function keyForEnv() {
  const env = process.env.VERCEL_ENV || process.env.NODE_ENV || 'development'
  return `admin:models:${env}`
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const all = url.searchParams.get('all')
  const data = (await kv.get<AdminModels>(keyForEnv())) || FALLBACK
  const models = all ? (data.models || []) : (data.models || []).filter(m => m.enabled !== false)
  return Response.json({ models, defaults: data.defaults || FALLBACK.defaults })
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json() as AdminModels
    if (!Array.isArray(body.models)) throw new Error('invalid models')
    await kv.set(keyForEnv(), body)
    return Response.json({ ok: true })
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || 'invalid request' }, { status: 400 })
  }
}

