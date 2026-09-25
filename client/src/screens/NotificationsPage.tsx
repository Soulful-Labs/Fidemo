import { useState } from 'react'
import AppShell from '../app/AppShell'
import Button from '../components/ui/Button'
import Tag from '../components/ui/Tag'
import { NotificationItem } from './dashboard/NotificationsPanel'
import { NOTIFICATIONS } from '../mock/dashboard'

/**
 * Notifications (1663:104077). The same rows as the 600px panel the bell
 * opens (1518:71845), in a centred 600px column on a page of their own, so
 * the row component is imported rather than drawn twice.
 */
export default function NotificationsPage() {
  const [rows, setRows] = useState(NOTIFICATIONS)
  const unread = rows.filter((n) => n.unread).length

  return (
    <AppShell hideCreate crumbs={[{ label: 'Notifications' }]}>
      <div className="min-h-[1148px] rounded-lg bg-bg-0 p-4">
        <div className="mx-auto w-[600px]">
          <div className="flex h-8 items-center justify-between gap-4">
            <span className="flex items-center gap-2">
              <span className="text-title-m text-text-title">Notifications</span>
              {unread > 0 && <Tag tone="grey" className="h-7 px-2.5">{unread}</Tag>}
            </span>
            <Button variant="ghost" className="h-6 px-0 text-text-regular text-text-subtitle"
              onClick={() => setRows((r) => r.map((n) => ({ ...n, unread: false })))}>
              Mark all as read
            </Button>
          </div>
          <ul className="flex flex-col pt-3">
            {rows.map((n) => <NotificationItem key={n.id} n={n} onAction={() => undefined} />)}
          </ul>
        </div>
      </div>
    </AppShell>
  )
}
