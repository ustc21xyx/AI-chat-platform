import * as React from 'react'
import { cn } from '@/lib/utils'

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md'
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const sizing = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400',
          sizing,
          className,
        )}
        {...props}
      />
    )
  }
)
IconButton.displayName = 'IconButton'

