import { NextRequest } from 'next/server'
import { kv } from '@/lib/kv'
import { encryptString } from '@/lib/crypto'

export const runtime = 'nodejs'

type Provider = {
  id: string
  slug: string // 唯一标识，如 openai, openrouter
  displayName: string
  baseUrl: string
  apiKeyEncrypted?: string // 仅存密文，不回显
  isActive?: boolean
  notes?: string
}

type ProviderInput = Omit<Provider, 'id' | 'apiKeyEncrypted'> & { apiKey?: string }

function keyForEnv() {
  const env = process.env.VERCEL_ENV || process.env.NODE_ENV || 'development'
  return `admin:providers:${env}`
}

function genId() { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}` }

export async function GET(req: NextRequest) {
  const list = (await kv.get<Provider[]>(keyForEnv())) || []
  // 不回显 apiKeyEncrypted
  const sanitized = list.map(({ apiKeyEncrypted, ...rest }) => rest)
  return Response.json({ providers: sanitized })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ProviderInput
    if (!body.slug || !body.displayName || !body.baseUrl) throw new Error('缺少必要字段')
    const list = (await kv.get<Provider[]>(keyForEnv())) || []
    if (list.some(p => p.slug === body.slug)) throw new Error('slug 已存在')
    const apiKeyEncrypted = body.apiKey ? await encryptString(body.apiKey) : undefined
    const prov: Provider = { id: genId(), slug: body.slug, displayName: body.displayName, baseUrl: body.baseUrl, apiKeyEncrypted, isActive: body.isActive ?? true, notes: body.notes }
    await kv.set(keyForEnv(), [prov, ...list])
    return Response.json({ ok: true })
  } catch (e:any) {
    return Response.json({ ok: false, error: e?.message || 'invalid request' }, { status: 400 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json() as ProviderInput & { id: string }
    const list = (await kv.get<Provider[]>(keyForEnv())) || []
    const idx = list.findIndex(p => p.id === body.id)
    if (idx < 0) throw new Error('not found')
    const apiKeyEncrypted = body.apiKey ? await encryptString(body.apiKey) : list[idx].apiKeyEncrypted
    const updated: Provider = {
      ...list[idx],
      slug: body.slug ?? list[idx].slug,
      displayName: body.displayName ?? list[idx].displayName,
      baseUrl: body.baseUrl ?? list[idx].baseUrl,
      isActive: body.isActive ?? list[idx].isActive,
      notes: body.notes ?? list[idx].notes,
      apiKeyEncrypted,
    }
    list[idx] = updated
    await kv.set(keyForEnv(), list)
    return Response.json({ ok: true })
  } catch (e:any) {
    return Response.json({ ok: false, error: e?.message || 'invalid request' }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) throw new Error('missing id')
    const list = (await kv.get<Provider[]>(keyForEnv())) || []
    const next = list.filter(p => p.id !== id)
    await kv.set(keyForEnv(), next)
    return Response.json({ ok: true })
  } catch (e:any) {
    return Response.json({ ok: false, error: e?.message || 'invalid request' }, { status: 400 })
  }
}

