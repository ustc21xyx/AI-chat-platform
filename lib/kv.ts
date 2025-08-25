// Minimal Upstash REST client (no extra deps)
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
  // Upstash REST returns JSON like { result: "..." }
  const data = await res.json().catch(() => null) as any
  const raw = data?.result
  if (raw == null) return null
  try { return JSON.parse(raw) as T } catch { return raw as any }
}

async function restSet(key: string, value: any): Promise<void> {
  if (!REST_URL || !REST_TOKEN) return
  const raw = typeof value === 'string' ? value : JSON.stringify(value)
  // Upstash REST supports /set/{key}/{value} (GET or POST). Use GET for simplicity.
  await fetch(`${REST_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(raw)}`, {
    headers: { Authorization: `Bearer ${REST_TOKEN}` },
    cache: 'no-store',
  })
}

export const kv: KVClient = {
  async get(key) {
    return await restGet(key)
  },
  async set(key, value) {
    await restSet(key, value)
  }
}

