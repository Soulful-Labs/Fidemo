import type { ReactNode } from 'react'
import Logo from '../../components/app/Logo'
import TopBar from '../../components/ui/TopBar'
import { cn } from '../../lib/cn'

export interface AuthLayoutProps {
  title: string
  subtitle?: ReactNode
  children?: ReactNode
  /** Buttons under the form, 32px below it as drawn. */
  actions?: ReactNode
  /** Logo title bar (Sign Up, Sign In) instead of a back-arrow title bar. */
  logo?: boolean
  barTitle?: string
  onBack?: () => void
  /** Centred hero layout with a yellow fade, e.g. Check Email!. */
  centered?: boolean
  hero?: ReactNode
  /** The "$100 paid to Jonathan" card pinned to the bottom (PRD 4.2). */
  promo?: boolean
}

/**
 * Shared frame for the eight auth screens, laid out as the Figma frames are:
 * title bar, 24px, heading block, 32px, form, 32px, actions.
 */
export default function AuthLayout({
  title, subtitle, children, actions, logo, barTitle, onBack, centered, hero, promo,
}: AuthLayoutProps) {
  return (
    <div className={cn('flex min-h-full flex-col', centered && 'bg-yellow-fade')}>
      {logo ? (
        <header className="flex h-bar shrink-0 items-center px-4">
          <Logo />
        </header>
      ) : (
        <TopBar title={barTitle} onBack={onBack} className={centered ? 'bg-transparent' : undefined} />
      )}

      <div className={cn('flex flex-1 flex-col px-4 pb-6 pt-6', centered ? 'items-center text-center' : '')}>
        {hero && <div className={cn('flex justify-center', centered ? 'pb-6 pt-5' : 'pb-6')}>{hero}</div>}

        <header className="flex flex-col gap-2">
          <h1 className="text-title-l text-text-title">{title}</h1>
          {subtitle && <p className="text-body-regular text-text-body">{subtitle}</p>}
        </header>

        {children && <div className="flex w-full flex-col gap-4 pt-6">{children}</div>}

        {actions && <div className="flex w-full flex-col gap-4 pt-6">{actions}</div>}

        {promo && (
          <div className="mt-auto flex h-promo items-center justify-center gap-1 rounded-lg bg-green-fade text-label text-text-subtitle">
            <span className="text-brand-secondary">$100</span>
            <span>paid to Jonathan for a product study</span>
            <span className="pl-1 text-text-body">25m</span>
          </div>
        )}
      </div>
    </div>
  )
}
