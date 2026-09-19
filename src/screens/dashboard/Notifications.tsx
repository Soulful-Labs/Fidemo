import { useNavigate } from 'react-router-dom'
import EmptyState from '../../components/app/EmptyState'
import NotificationRow from '../../components/app/NotificationRow'
import TopBar from '../../components/ui/TopBar'
import { useAppNav } from '../../app/useAppNav'
import { useStore } from '../../mock/store'
import NotificationIcon from './notificationIcons'

/** PRD 5.3. The 24 types and their action buttons come from PRD 11. */
export default function Notifications() {
  const navigate = useNavigate()
  const { back } = useAppNav()
  const { notifications, markAllRead, markRead, toast } = useStore()
  const unread = notifications.filter((n) => !n.read).length

  const open = (id: string, to?: string) => {
    markRead(id)
    if (to) navigate(to)
  }

  return (
    <div className="flex min-h-full flex-col">
      <TopBar
        title="Notifications"
        onBack={back}
        right={
          <button
            type="button"
            onClick={() => {
              markAllRead()
              toast(unread > 0 ? 'All notifications marked as read' : 'Nothing unread')
            }}
            className="text-text-medium text-brand-primary"
          >
            Mark all as read
          </button>
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications yet!"
          body="Updates about your studies, payments and rewards will appear here."
          actionLabel="Browse studies"
          onAction={() => navigate('/studies')}
        />
      ) : (
        <ul>
          {notifications.map((n) => (
            <li key={n.id}>
              <NotificationRow
                title={n.title}
                body={n.body}
                at={n.at}
                read={n.read}
                icon={<NotificationIcon kind={n.kind} />}
                actionLabel={n.actionLabel}
                onAction={n.actionLabel ? () => open(n.id, n.to) : undefined}
                secondaryActionLabel={n.secondaryActionLabel}
                onSecondaryAction={n.secondaryActionLabel ? () => open(n.id, n.secondaryTo) : undefined}
                onOpen={() => open(n.id, n.to)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
