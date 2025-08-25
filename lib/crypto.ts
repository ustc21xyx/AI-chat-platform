const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

function b64ToBytes(b64: string): Uint8Array {
  if (typeof Buffer !== 'undefined') return Buffer.from(b64, 'base64')
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return arr
}

function bytesToB64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') return Buffer.from(bytes).toString('base64')
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i])
  return btoa(s)
}

async function getKey(): Promise<CryptoKey | null> {
  const b64 = process.env.ENCRYPTION_KEY || ''
  if (!b64) return null
  try {
    const raw = b64ToBytes(b64)
    return await crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
  } catch {
    return null
  }
}

export async function encryptString(plain: string): Promise<string> {
  const key = await getKey()
  if (!key) return `PLAINTEXT:${plain}`
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, textEncoder.encode(plain))
  return `v1:${bytesToB64(iv)}:${bytesToB64(new Uint8Array(cipher))}`
}

export async function decryptString(enc: string): Promise<string> {
  if (enc.startsWith('PLAINTEXT:')) return enc.slice('PLAINTEXT:'.length)
  if (!enc.startsWith('v1:')) throw new Error('bad format')
  const [, ivB64, dataB64] = enc.split(':')
  const key = await getKey()
  if (!key) throw new Error('no key')
  const iv = b64ToBytes(ivB64)
  const data = b64ToBytes(dataB64)
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
  return textDecoder.decode(plain)
}

