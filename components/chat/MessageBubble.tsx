"use client"

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github.css'

type Props = {
  role: 'user' | 'assistant'
  content: string
}

export default function MessageBubble({ role, content }: Props) {
  const isUser = role === 'user'
  return (
    <div className={`flex gap-3 py-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs select-none ${isUser ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
        {isUser ? '你' : 'AI'}
      </div>
      <div className="flex-1">
        <div className={`prose prose-slate max-w-none text-slate-800 text-[15px] leading-7 ${isUser ? 'text-right' : ''}`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm as any]}
            rehypePlugins={[rehypeHighlight as any]}
            components={{
              pre: ({node, ...props}) => (
                <pre className="not-prose" {...props} />
              ),
              code: ({node, inline, className, children, ...props}: any) => (
                <code className={`rounded-md ${className || ''}`} {...props}>{children}</code>
              )
            }}
          >
            {content || '…'}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}

