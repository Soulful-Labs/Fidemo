import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

/**
 * The 32px pill the study screens use throughout (Review 1982:104845, Manage 1952:76819: header facts, audience
 * criteria, question labels, diary setup): Radius/Full, 14 sides, 14px. Ringed
 * (1px stroke-2) or filled bgAlt-2; a grey label can lead the value.
 */
export default function Pill({ label, icon, filled, muted, className, children }: {
  label?: string; icon?: ReactNode; filled?: boolean; muted?: boolean; className?: string; children: ReactNode
}) {
  return (
    <span className={cn('inline-flex h-8 items-center gap-1 whitespace-nowrap rounded-full text-text-regular',
      filled ? 'bg-bgAlt-2 px-[14px]' : 'border-1 border-stroke-2 px-[13px]', muted ? 'text-text-body' : filled ? 'text-text-title' : 'text-text-subtitle', className)}>
      {icon}
      <span>{label && <span className="text-text-body">{label} </span>}{children}</span>
    </span>
  )
}
