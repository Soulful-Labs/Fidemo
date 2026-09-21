import { useState } from 'react'
import EmptyState from '../../components/app/EmptyState'
import NotificationRow from '../../components/app/NotificationRow'
import ProgressBar from '../../components/app/ProgressBar'
import ScoreDial from '../../components/app/ScoreDial'
import StatTile from '../../components/app/StatTile'
import Timeline from '../../components/app/Timeline'
import Tag from '../../components/ui/Tag'
import { Bell, Wallet } from './bitsIcons'
import { SAMPLE } from './fixtures'
import Section, { Row } from './Section'

export default function AppBitsSection({ toast }: { toast: (msg: string) => void }) {
  const [read, setRead] = useState(false)

  return (
    <Section title="ScoreDial, StatTile, NotificationRow, EmptyState, ProgressBar, Timeline">
      <Row label="ScoreDial — Trust Score and tiers">
        <ScoreDial score={50} size="sm" />
        <ScoreDial score={72} />
        <ScoreDial score={92} size="lg" />
        <div className="flex flex-col gap-1">
          <Tag tone="silver">Silver, Trust Score 50+</Tag>
          <Tag tone="gold">Gold, Trust Score 70+</Tag>
          <Tag tone="platinum">Platinum, Trust Score 90+</Tag>
        </div>
      </Row>

      <Row label="StatTile — the dashboard overview">
        <div className="grid w-full grid-cols-2 gap-3">
          <StatTile label="Wallet Balance" value="$624.48" icon={<Wallet />} onClick={() => toast('Go to Wallet')} />
          <StatTile label="This Month" value="$950" delta="+$260" onClick={() => toast('Go to Wallet')} />
          <StatTile label="Studies In Review" value="2" onClick={() => toast('Go to Applied')} />
          <StatTile label="All Time Studies" value="128" onClick={() => toast('Go to History')} />
        </div>
      </Row>

      <Row label="ProgressBar">
        <div className="flex w-full flex-col gap-4">
          <ProgressBar label="Monthly Goal" caption="$342.60 of $500" value={342.6} max={500} />
          <ProgressBar label="Profile" caption="40% completed" value={40} />
          <ProgressBar label="Diary" caption="1/5 days completed" value={1} max={5} tone="green" size="sm" />
        </div>
      </Row>

      <Row label="NotificationRow — with and without an action">
        <div className="w-full overflow-hidden rounded-lg border-1 border-stroke-2">
          <NotificationRow
            title="You've been selected to complete!"
            body="You are qualified for GLP-1 Care Plans. Book your session to earn your reward."
            at={new Date(Date.now() - 2 * 3600 * 1000).toISOString()}
            read={read}
            icon={<Bell />}
            actionLabel="Schedule Now"
            onAction={() => toast('Schedule Now')}
            onOpen={() => toast('Open related screen')}
          />
          <NotificationRow
            title="You've received $150!"
            body="Your payment for Inclusive education practices has been added to your wallet."
            at={new Date(Date.now() - 3 * 86400 * 1000).toISOString()}
            read
            icon={<Wallet />}
            onOpen={() => toast('Open Wallet')}
          />
        </div>
        <button type="button" onClick={() => { setRead((r) => !r); toast(read ? 'Marked unread' : 'Marked all as read') }} className="text-text-medium text-brand-primary">
          {read ? 'Mark as unread' : 'Mark all as read'}
        </button>
      </Row>

      <Row label="Timeline — study updates">
        <div className="w-full rounded-lg border-1 border-stroke-2 bg-bg-1 p-4">
          <Timeline entries={SAMPLE.timeline} />
        </div>
      </Row>

      <Row label="EmptyState — exact PRD copy">
        <div className="w-full rounded-lg border-1 border-stroke-2 bg-bg-1">
          <EmptyState
            title="No payouts made yet!"
            body="Browse the studies and start earning now!"
            icon={<Wallet />}
            actionLabel="Participate in studies and earn"
            onAction={() => toast('Go to Explore')}
          />
        </div>
      </Row>
    </Section>
  )
}
