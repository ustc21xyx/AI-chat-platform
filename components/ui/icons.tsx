import * as React from 'react'

export const Icon = ({ children, size = 16, className = 'text-slate-600' }: { children: React.ReactNode; size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
)

export const IconPlus = (props: any) => (
  <Icon {...props}><path d="M12 5v14M5 12h14"/></Icon>
)
export const IconSearch = (props: any) => (
  <Icon {...props}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></Icon>
)
export const IconClock = (props: any) => (
  <Icon {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v6l3 2"/></Icon>
)
export const IconSettings = (props: any) => (
  <Icon {...props}><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.2a2 2 0 1 1-2.8 2.8l-.2-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.2.1a2 2 0 1 1-2.8-2.8l.1-.2a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.2a2 2 0 1 1 2.8-2.8l.2.1a1.7 1.7 0 0 0 1.8.3h.1A1.7 1.7 0 0 0 9 3.1V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h.1a1.7 1.7 0 0 0 1.8-.3l.2-.1a2 2 0 1 1 2.8 2.8l-.1.2a1.7 1.7 0 0 0-.3 1.8v.1A1.7 1.7 0 0 0 21 11h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></Icon>
)
export const IconCopy = (props: any) => (
  <Icon {...props}><rect x="9" y="9" width="13" height="13" rx="2"/><rect x="2" y="2" width="13" height="13" rx="2"/></Icon>
)
export const IconSend = (props: any) => (
  <Icon {...props}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></Icon>
)
export const IconStop = (props: any) => (
  <Icon {...props}><rect x="6" y="6" width="12" height="12" rx="2"/></Icon>
)
export const IconRefresh = (props: any) => (
  <Icon {...props}><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v4h4"/></Icon>
)
export const IconTrash = (props: any) => (
  <Icon {...props}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></Icon>
)

