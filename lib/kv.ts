import { kv as vercelKV } from '@vercel/kv'

// Fallback to Upstash REST if @vercel/kv is not configured
const REST_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

export type KVClient = {
  get: <T=any>(key: string) => Promise<T | null>
  set: (key: string, value: any) => Promise<void>
}

async function restGet<T=any>(key: string): Promise<T | null> {
  if (!REST_URL || !REST_TOKEN) return null
  const res = await fetch(`${REST_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${REST_TOKEN}` },
    cache: 'no-store',
  })
  if (!res.ok) return null
  const text = await res.text()
  try { return JSON.parse(text) as T } catch { return text as any }
}

async function restSet(key: string, value: any): Promise<void> {
  if (!REST_URL || !REST_TOKEN) return
  const body = typeof value === 'string' ? value : JSON.stringify(value)
  await fetch(`${REST_URL}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REST_TOKEN}`, 'Content-Type': 'application/json' },
    body,
  })
}

export const kv: KVClient = {
  async get(key) {
    try { return await vercelKV.get(key) as any } catch {}
    return await restGet(key)
  },
  async set(key, value) {
    try { await vercelKV.set(key, value) } catch { await restSet(key, value) }
  }
}

