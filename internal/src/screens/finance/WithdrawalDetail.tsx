import { withdrawals } from '@shared/derive'
import { dayMonthYear, money } from '@shared/format'
import { WAITS } from '@shared/platform'
import { platform } from '@shared/store'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import { ExternalIcon } from '../../components/ui/icons'
import { Modal, SuccessModal } from '../../components/ui/Overlay'
import { Avatar } from '../../components/ui/Tag'
import { cn } from '../../lib/cn'
import { useProfile } from '../../mock/profile'
import { photoFor } from '../../mock/participants'
import { TEAM, say, usePlatform } from '../../platform'
import PersonLink from '../../components/app/PersonLink'

const Tile = ({ label, value, green }: { label: string; value: string; green?: boolean }) => (
  <div className={cn('flex h-[91px] flex-1 flex-col justify-center rounded-md border-1 border-stroke-1 px-3', green && 'bg-bgAlt-1')}>
    <p className="text-text-regular leading-5 text-text-subtitle">{label}</p>
    <p className={cn('pt-1.5 text-title-l leading-[31px]', green ? 'text-brand-secondary' : 'text-text-title')}>{value}</p>
  </div>
)

/**
 * A withdrawal to release (2317:160127), and the same once released
 * (2317:162065): who asked, the amount, when, the reference and the account
 * it goes to. Release Payout asks first (2317:160440), then says so
 * (2317:160459). Releasing is the only move drawn; held, failed and retry are
 * in the shared lifecycle with no screen yet.
 */
export default function WithdrawalDetail() {
  const { personId = '', payoutId = '' } = useParams()
  const nav = useNavigate()
  const row = withdrawals(usePlatform()).find((r) => r.person.id === personId && r.payout.id === payoutId)!
  const { PERSON } = useProfile(personId)
  const [asking, setAsking] = useState(false)
  const [done, setDone] = useState(false)
  const amount = money(row.payout.amount)
  const short = `${row.person.name.split(' ')[0]} ${row.person.name.split(' ')[1]?.[0] ?? ''}.`.replace(' .', '')
  const released = row.state !== 'pending'
  const release = () => { setAsking(false); if (say(platform().releasePayout(personId, payoutId, TEAM))) setDone(true) }

  return (
    <AppShell className="flex flex-col gap-4 pb-8" crumbs={[{ label: 'Payouts', to: '/finance/payouts' }, { label: row.person.name }]}>
      <header className="flex items-start gap-4 rounded-lg border-1 border-stroke-1 p-4">
        <Avatar src={photoFor(row.person)} name={row.person.name} size={64} />
        <div className="flex flex-1 flex-col gap-1">
          <PersonLink id={row.person.id} className="text-title-s text-text-title">{row.person.name}</PersonLink>
          <p className="text-text-regular text-text-subtitle">{[PERSON.role, PERSON.place, PERSON.cert].filter(Boolean).join('  •  ')}</p>
          <p className="text-text-regular text-text-body">{PERSON.lastActive}</p>
        </div>
        <Button variant="tertiary" size="md" leftIcon={<ExternalIcon className="h-4 w-4" />} onClick={() => nav(`/participants/${personId}`)}>Go To Full Profile</Button>
      </header>

      <div className={cn('flex items-center justify-between gap-6 rounded-lg px-4 py-4', released ? 'bg-bg-1' : 'bg-state-warningBg')}>
        <div className="flex flex-col gap-1">
          <p className="text-body-medium text-text-title">Confirm Withdrawal Payout</p>
          <p className="text-text-regular text-text-subtitle">{released
            ? `The transaction of ${amount} has been initiated for withdrawal payout to ${short} Participant will receive the funds within ${WAITS.WITHDRAWAL}.`
            : `Once confirmed, the transaction of ${amount} will be initiated to the participant’s payout account for withdrawal as requested.`}</p>
          {released && row.payout.releasedAt && <p className="text-text-regular text-text-body">{dayMonthYear(row.payout.releasedAt)}</p>}
        </div>
        {released
          ? <span className="flex h-7 shrink-0 items-center rounded-full bg-green-100 px-3 text-text-regular text-state-success">Payout Released!</span>
          : <Button size="lg" className="shrink-0 px-4" onClick={() => setAsking(true)}>Release Payout</Button>}
      </div>

      <h2 className="pt-2 text-title-s leading-[25px] text-text-title">Payment Overview</h2>
      <div className="flex gap-3">
        <Tile green label="Amount" value={amount} />
        <Tile label="Date Requested" value={dayMonthYear(row.payout.at)} />
        <Tile label="Reference ID" value={row.payout.txId} />
      </div>
      <dl className="flex flex-col gap-3 rounded-lg border-1 border-stroke-1 p-4">
        {[['Bank Name', row.method?.bankName ?? 'Not on record'], ['Account Number', row.method?.accountNumber ?? row.payout.destination], ['Account Type', row.method?.type ?? 'Not on record']].map(([k, v]) => (
          <div key={k} className="flex flex-col gap-1"><dt className="text-text-regular text-text-subtitle">{k}</dt><dd className="text-body-regular text-text-title">{v}</dd></div>
        ))}
      </dl>

      <Modal open={asking} onClose={() => setAsking(false)} title={`Release ${amount} Payout?`}
        footer={<><Button variant="tertiary" onClick={() => setAsking(false)}>Cancel</Button><Button onClick={release}>Release Payout</Button></>}>
        <p className="text-body-regular text-text-subtitle">Confirm a withdrawal payout of {amount} withdrawal payout to be released for {short.replace(/\.$/, '')}?</p>
      </Modal>
      <SuccessModal open={done} onClose={() => setDone(false)} onAction={() => setDone(false)} action="Done" title="Withdrawal Payout Released!"
        body={`The transaction of ${amount} has been initiated for withdrawal payout to ${short} Participant will receive the funds within ${WAITS.WITHDRAWAL}.`} />
    </AppShell>
  )
}
