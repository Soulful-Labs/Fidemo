import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import Sidebar from './Sidebar'
import TitleBar from './TitleBar'
import type { Crumb } from './TitleBar'

/**
 * Every console screen: the fixed 230px sidebar, the 70px title bar beside
 * it, and the content area 24px inside both (x 254, y 94), 1162 wide at 1440.
 */
export default function AppShell({ crumbs, centre, right, children, className }: {
  crumbs: Crumb[]; centre?: ReactNode; right?: ReactNode; children?: ReactNode; className?: string
}) {
  return (
    <div className="min-h-full bg-bg-0">
      <Sidebar />
      <div className="ml-nav flex min-h-full flex-col">
        <TitleBar crumbs={crumbs} centre={centre} right={right} />
        <main className={cn('flex-1 p-6', className)}>{children}</main>
      </div>
    </div>
  )
}
