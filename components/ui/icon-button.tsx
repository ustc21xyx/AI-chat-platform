import * as React from 'react'
import { cn } from '@/lib/utils'

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'xs' | 'sm' | 'md'
  variant?: 'ghost' | 'outline'
  circle?: boolean
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = 'sm', variant = 'ghost', circle = false, ...props }, ref) => {
    const sizing = size === 'xs' ? 'h-7 w-7' : size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'
    const shape = circle ? 'rounded-full' : 'rounded-md'
    const base = 'inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 text-slate-600 hover:text-slate-800'
    const style = variant === 'outline' ? 'border border-slate-200 bg-white hover:bg-slate-50 shadow-sm' : ''
    return (
      <button
        ref={ref}
        className={cn(base, shape, sizing, style, className)}
        {...props}
      />
    )
  }
)
IconButton.displayName = 'IconButton'

