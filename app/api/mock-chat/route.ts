import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const chunks = ['你好', '，', '这是', '一个', '演示', '流式', '输出', '。']
      for (const part of chunks) {
        const payload = JSON.stringify({ content: part })
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`))
        await new Promise(r => setTimeout(r, 200))
      }
      controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}

