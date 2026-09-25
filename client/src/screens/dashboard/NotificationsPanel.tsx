import SidePanel from '../../components/ui/SidePanel'
import Button from '../../components/ui/Button'
import Tag from '../../components/ui/Tag'
import { CheckCircle, ClockArrow, InvoiceIcon, MessageIcon, NoteIcon, TaskIcon, UsersIcon, VideoIcon } from '../../components/ui/icons'
import type { NotificationRow } from '../../mock/dashboard'
import { cn } from '../../lib/cn'

const GLYPH = {
  study: TaskIcon, respondent: UsersIcon, session: VideoIcon, reminder: ClockArrow,
  completion: NoteIcon, target: CheckCircle, invoice: InvoiceIcon, message: MessageIcon,
}

/** The study or ticket named inside a line is drawn in the title colour. */
function Body({ n }: { n: NotificationRow }) {
  if (!n.emphasis) return <>{n.body}</>
  const [before, after] = n.body.split(n.emphasis)
  return <>{before}<span className="text-text-title">{n.emphasis}</span>{after}</>
}

export function NotificationItem({ n, onAction }: { n: NotificationRow; onAction: (n: NotificationRow) => void }) {
  const Glyph = GLYPH[n.icon]
  return (
    <li className={cn('flex gap-3 border-b-1 border-stroke-1 px-3 pb-[13px] pt-3', n.unread ? 'bg-yellow-30' : 'bg-bg-0')}>
      <span className={cn('flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-md text-brand-primary',
        n.unread ? 'bg-bg-0' : 'bg-bg-1')}>
        <Glyph className="h-6 w-6" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-text-medium text-text-title">{n.title}</p>
        <p className="text-text-regular text-text-subtitle"><Body n={n} /></p>
        <p className="text-label text-text-body">{n.ago}</p>
        {n.action && (
          <span className="pt-1">
            <Button size="row" variant={n.unread ? 'primary' : 'secondary'}
              onClick={() => onAction(n)}>{n.action}</Button>
          </span>
        )}
      </div>
    </li>
  )
}

/**
 * Notifications (1518:71845): the 600px panel the bell opens. The two unread
 * rows carry the warm tint and a primary button; the rest are plain.
 */
export default function NotificationsPanel({
  open, onClose, rows, onMarkAllRead, onAction,
}: { open: boolean; onClose: () => void; rows: NotificationRow[]; onMarkAllRead: () => void; onAction: (n: NotificationRow) => void }) {
  const unread = rows.filter((n) => n.unread).length
  return (
    <SidePanel open={open} onClose={onClose} bodyClassName=""
      title={
        <span className="flex items-center gap-2">
          <span className="text-title-m text-text-title">Notifications</span>
          {unread > 0 && <Tag tone="grey" className="h-7 px-2.5">{unread}</Tag>}
        </span>
      }
      headerAction={
        <Button variant="ghost" className="h-6 px-0 text-text-regular text-text-subtitle" onClick={onMarkAllRead}>
          Mark all as read
        </Button>
      }>
      <ul className="flex flex-col">
        {rows.map((n) => <NotificationItem key={n.id} n={n} onAction={onAction} />)}
      </ul>
    </SidePanel>
  )
}
