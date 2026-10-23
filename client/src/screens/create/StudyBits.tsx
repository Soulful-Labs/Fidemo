import type { ReactNode } from 'react'

/*
 * The Study step's Incentive Payments, Costing Summary and Payment were removed
 * on 23 Oct 2026: the client is priced at one cost per interview per
 * participant, with the incentive inside it, set by the team per study
 * (Change CPI Rate in the console). What the client pays is on Payment &
 * Publish (PaymentSummary.tsx).
 */

/** The warm card each type's own settings section is built around. */
export function SettingsCard({ title, sub, children, tone = 'warm', titleClass = 'text-body-medium' }: {
  title: string; sub?: string; children?: ReactNode; tone?: 'warm' | 'plain'
  /** The diary's card draws its title at 14 (1518:94742). */
  titleClass?: string
}) {
  return (
    <div className={`flex flex-col rounded-lg p-4 ${sub ? 'gap-4' : 'gap-3'} ${tone === 'warm' ? 'bg-yellow-30' : 'bg-bg-1'}`}>
      <span className="flex flex-col gap-0.5">
        <span className={`${titleClass} text-text-title`}>{title}</span>
        {sub && <span className="text-text-regular text-text-subtitle">{sub}</span>}
      </span>
      {children}
    </div>
  )
}
