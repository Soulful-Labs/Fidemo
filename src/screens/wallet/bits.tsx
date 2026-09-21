import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import Tag from '../../components/ui/Tag'
import { ChevronRight } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { dateLong, dateTime, money } from '../../lib/format'
import type { Payout, Transaction } from '../../mock/types'

/** "$ in a circle" icon used across the wallet screens. */
export function CoinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" className={cn('shrink-0', className)}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7.5v9M14.5 9.5c0-1-1.1-1.5-2.5-1.5s-2.5.6-2.5 1.5 1.1 1.5 2.5 1.5 2.5.6 2.5 1.5-1.1 1.5-2.5 1.5-2.5-.6-2.5-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function PayoutsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" className={cn('shrink-0', className)}>
      <rect x="2.5" y="7" width="19" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="13" r="2.8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 4.5h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/** One earning row: title, "date • time • #tx", amount in green (PRD 10.1). */
export function EarningRow({ tx, alt = true }: { tx: Transaction; alt?: boolean }) {
  const d = new Date(tx.at)
  return (
    <Link to={`/wallet/earnings/${tx.id}`} className={cn('flex items-start justify-between gap-3 border-b-1 py-3', alt ? 'border-stroke-3' : 'border-stroke-2')}>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="truncate text-text-medium text-text-title">{tx.title}</span>
        <span className="text-label text-text-body">
          {dateLong(tx.at)} • {d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} • {tx.txNumber}
        </span>
      </span>
      <span className="text-body-medium text-brand-secondary">{money(tx.amount)}</span>
    </Link>
  )
}

/** One payout row: date, amount, destination, id and status chip. */
export function PayoutRow({ payout }: { payout: Payout }) {
  return (
    <Link to={`/wallet/payouts/${payout.id}`} className="flex flex-col gap-1 border-b-1 border-stroke-3 py-3">
      <span className="flex items-center justify-between gap-3">
        <span className="text-body-regular text-text-title">{dateTime(payout.at)}</span>
        <span className="text-body-medium text-text-title">{money(payout.amount)}</span>
      </span>
      <span className="flex items-center justify-between gap-3">
        <span className="text-text-regular text-text-subtitle">To {payout.destination}</span>
        <StatusChip status={payout.status} />
      </span>
      <span className="text-label text-text-body">{payout.txId}</span>
    </Link>
  )
}

export function StatusChip({ status }: { status: Payout['status'] }) {
  return status === 'completed'
    ? <Tag tone="green" size="md">Completed</Tag>
    : <Tag tone="yellow" size="md">Processing</Tag>
}

/** A tappable row card with an icon, label and chevron (Reward Points, Payouts). */
export function RowCard({ to, icon, label, value, alt = true }: { to: string; icon: ReactNode; label: string; value?: ReactNode; alt?: boolean }) {
  return (
    <Link to={to} className={cn('flex h-btn items-center gap-3 rounded-lg px-4', alt ? 'bg-bgAlt-2' : 'bg-bg-1')}>
      <span className="text-brand-primary">{icon}</span>
      <span className="text-body-medium text-text-title">{label}</span>
      <span className="ml-auto flex items-center gap-1 text-body-medium text-brand-primary">
        {value}
        <ChevronRight className="text-text-title" />
      </span>
    </Link>
  )
}

/** Label over value, used on the details screens. */
export function KeyValue({ label, value, icon }: { label: string; value: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-2 text-text-regular text-text-body">{icon}{label}</span>
      <span className="text-body-medium text-text-title">{value}</span>
    </div>
  )
}

/** The Withdrawal Amount / Processing Fees / You will receive breakdown. */
export function Breakdown({ amount, fee, net, title, lastLabel = 'You will receive', alt = true }: { amount: number; fee: number; net: number; title?: string; lastLabel?: string; alt?: boolean }) {
  const row = (label: string, value: string, strong = false) => (
    <div className={cn('flex items-center justify-between py-2', strong ? 'text-body-medium text-text-title' : 'text-text-regular text-text-body')}>
      <span>{label}</span>
      <span className={strong ? 'text-text-title' : 'text-text-subtitle'}>{value}</span>
    </div>
  )
  return (
    <div className={cn('flex flex-col rounded-lg px-4 py-2', alt ? 'bg-bgAlt-2' : 'bg-bg-1')}>
      {title && <p className="py-2 text-text-regular text-text-body">{title}</p>}
      {row('Withdrawal Amount', money(amount))}
      <span className="h-px w-full bg-stroke-3" />
      {row('Processing Fees', money(fee))}
      <span className="h-px w-full bg-stroke-3" />
      {row(lastLabel, money(net), true)}
    </div>
  )
}
