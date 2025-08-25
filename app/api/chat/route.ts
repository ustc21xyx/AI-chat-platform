import { NextRequest } from 'next/server'
import { kv } from '@/lib/kv'
import { decryptString } from '@/lib/crypto'

export const runtime = 'nodejs'

function keyForProviders() { const env = process.env.VERCEL_ENV || process.env.NODE_ENV || 'development'; return `admin:providers:${env}` }

export async function POST(req: NextRequest) {
  const { model, messages, temperature, max_tokens, stream = true } = await req.json()

  // Fallback to mock when no model provided
  if (!model) {
    return fetch(new URL('/api/mock-chat', req.url)).then(r => r)
  }

  // model is "provider:model_id"
  const [providerSlug, modelId] = String(model).split(':', 2)
  const providers = (await kv.get<any[]>(keyForProviders())) || []
  const p = providers.find(x => x.slug === providerSlug && x.isActive !== false)
  if (!p) return new Response(JSON.stringify({ error: { code: 'MODEL_NOT_FOUND', message: '未找到可用的提供商' } }), { status: 400 })

  const apiKey = p.apiKeyEncrypted ? await decryptString(p.apiKeyEncrypted) : ''
  if (!apiKey) return new Response(JSON.stringify({ error: { code: 'INVALID_API_KEY', message: '提供商未配置 API Key' } }), { status: 400 })

  const base = String(p.baseUrl || '').replace(/\/+$/, '')
  const url = `${base}/chat/completions`

  const upstreamBody = JSON.stringify({
    model: modelId,
    messages,
    temperature,
    max_tokens,
    stream: true,
  })

  const upstreamRes = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: upstreamBody,
  })

  if (!upstreamRes.ok || !upstreamRes.body) {
    // Fallback to mock when upstream not available
    return fetch(new URL('/api/mock-chat', req.url)).then(r => r)
  }

  return new Response(upstreamRes.body, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}

