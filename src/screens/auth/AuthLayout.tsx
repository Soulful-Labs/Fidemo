import type { ReactNode } from 'react'
import TopBar from '../../components/ui/TopBar'

export interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
  /** Pinned under the form, e.g. "Already have an account? Log In". */
  footer?: ReactNode
  onBack?: () => void
  barTitle?: string
}

/** Shared frame for the eight auth screens. */
export default function AuthLayout({
  title, subtitle, children, footer, onBack, barTitle,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-full flex-col">
      {(onBack || barTitle) && <TopBar title={barTitle} onBack={onBack} />}

      <div className="flex flex-1 flex-col gap-6 px-4 py-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-title-l text-text-title">{title}</h1>
          {subtitle && <p className="text-text-regular text-text-body">{subtitle}</p>}
        </header>

        <div className="flex flex-1 flex-col gap-4">{children}</div>

        {footer && <div className="flex flex-col gap-4">{footer}</div>}
      </div>
    </div>
  )
}
