import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

// 管理员可配置的模型列表（示例/占位）。后续可改为从环境变量或数据库读取
const ADMIN_MODELS = [
  { provider: 'openai', value: 'gpt-4o-mini', label: 'OpenAI - gpt-4o-mini' },
  { provider: 'openai', value: 'gpt-4o', label: 'OpenAI - gpt-4o' },
  { provider: 'anthropic', value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
  { provider: 'openrouter', value: 'deepseek/deepseek-chat', label: 'DeepSeek Chat (OpenRouter)' },
]

export async function GET(req: NextRequest) {
  return Response.json({ models: ADMIN_MODELS })
}

