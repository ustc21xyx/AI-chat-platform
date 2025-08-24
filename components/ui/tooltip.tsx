import * as React from 'react'

export function Tooltip({ content, children, side = 'top' }: { content: React.ReactNode; children: React.ReactNode; side?: 'top' | 'bottom' | 'left' | 'right' }) {
  const sideClass =
    side === 'top'
      ? 'bottom-full mb-2 left-1/2 -translate-x-1/2'
      : side === 'bottom'
      ? 'top-full mt-2 left-1/2 -translate-x-1/2'
      : side === 'left'
      ? 'right-full mr-2 top-1/2 -translate-y-1/2'
      : 'left-full ml-2 top-1/2 -translate-y-1/2'

  return (
    <span className="relative inline-flex group">
      {children}
      <span className={`pointer-events-none absolute ${sideClass} whitespace-nowrap rounded-md border bg-white px-2 py-1 text-xs text-slate-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity`}> 
        {content}
      </span>
    </span>
  )
}

