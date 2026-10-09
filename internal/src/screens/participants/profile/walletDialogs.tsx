import { useState } from 'react'
import type { ReactNode } from 'react'
import StudyTypeTag from '../../../components/app/StudyTypeTag'
import Button from '../../../components/ui/Button'
import { OptionTile } from '../../../components/ui/controls'
import { CalendarIcon, ChevronRight, DownloadIcon, ReceiptIcon } from '../../../components/ui/icons'
import { Modal } from '../../../components/ui/Overlay'

type Props = { open: boolean; onClose: () => void }
const Fact = ({ icon, label, children }: { icon?: ReactNode; label: string; children: ReactNode }) => (
  <div><p className="flex items-center gap-1 text-text-regular leading-5 text-text-subtitle">{icon}{label}</p><p className="pt-1 text-body-medium leading-[22px] text-text-title">{children}</p></div>
)

/** Transaction Details (2021:165045, 460 x 389): the study an earning came from, the amount, when, and its number. */
export function TransactionDetails({ open, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} layout="titled" title="Transaction Details">
      <div className="flex flex-col gap-5 pb-2">
        <div className="rounded-lg bg-bg-1 p-3">
          <p className="flex items-center justify-between text-body-medium leading-[22px] text-text-title">Online Learning Engagement Strategies<ChevronRight className="h-5 w-5" /></p>
          <div className="flex gap-2 pt-3"><StudyTypeTag type="survey" filled /><span className="flex h-8 items-center rounded-full border-1 border-stroke-3 px-3 text-text-regular text-text-subtitle">Healthcare</span></div>
        </div>
        <Fact icon={<ReceiptIcon className="h-4 w-4 text-brand-primary" />} label="Amount">$120</Fact>
        <Fact icon={<CalendarIcon className="h-4 w-4 text-brand-primary" />} label="Date and Time">July 22, 2026 &nbsp;•&nbsp; 11:00 PM</Fact>
        <Fact icon={<span className="text-brand-primary">#</span>} label="Transaction Number">#260-552</Fact>
      </div>
    </Modal>
  )
}

/** A track with two knobs, as drawn: decorative, since no behaviour is specified. */
const Range = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="flex items-end justify-between"><span className="text-text-regular text-text-subtitle">{label}</span><span className="text-body-medium text-text-title">{value}</span></p>
    <div className="relative mt-3 h-2 rounded-full bg-bg-2"><div className="absolute inset-y-0 left-0 w-[70%] rounded-full bg-yellow-200" />
      <span className="absolute -top-1 left-0 h-4 w-4 rounded-full bg-brand-primary" /><span className="absolute -top-1 left-[69%] h-4 w-4 rounded-full bg-brand-primary" /></div>
  </div>
)

function Filters({ open, onClose, heading, tiles, cols, range }: Props & { heading: string; tiles: string[]; cols: string; range: [string, string] }) {
  const [picked, setPicked] = useState('All')
  return (
    <Modal open={open} onClose={onClose} layout="titled" title="Filters"
      footer={<><Button variant="secondary" onClick={() => setPicked('All')}>Reset</Button><Button onClick={onClose}>Apply</Button></>}>
      <div className="flex flex-col gap-6 pb-4 pt-1">
        <div>
          <p className="pb-1.5 text-text-regular text-text-subtitle">{heading}</p>
          <div className={`grid gap-2 ${cols}`}>{tiles.map((t) => <div key={t} className={t === 'One-time bonuses' ? 'col-span-2' : undefined}><OptionTile selected={t === picked} onClick={() => setPicked(t)}>{t}</OptionTile></div>)}</div>
        </div>
        <Range label={range[0]} value={range[1]} />
      </div>
    </Modal>
  )
}

/** Earnings "Filters" (2021:164690): Category tiles and a Price range. */
export const EarningsFilters = (p: Props) => <Filters {...p} heading="Category" cols="grid-cols-3 [&_button]:w-full" tiles={['All', 'Interview', 'Focus Group', 'Survey', 'In-Person', 'Redeem Points']} range={['Price', '$0-1000+']} />
/** Reward Points "Filters" (2022:167856): Type tiles and a Points range. */
export const PointsFilters = (p: Props) => <Filters {...p} heading="Type" cols="grid-cols-2 [&_button]:w-full" tiles={['All', 'Referral', 'Study', 'Streaks', 'One-time bonuses']} range={['Points', '0-500']} />

/** Payout Details (2022:166340, 460 x 615): a withdrawal, its status and expected date, the breakdown, and the receipt. */
export function PayoutDetails({ open, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} layout="titled" title="Payout Details">
      <div className="flex flex-col gap-4 text-text-regular leading-5">
        <h3 className="text-title-s leading-[25px] text-text-title">Bank Transfer 2149</h3>
        <div className="grid grid-cols-2 gap-y-4">
          <div><p className="text-text-body">Withdrawal Amount</p><p className="pt-1 text-body-medium text-text-title">$500</p></div>
          <div><p className="text-text-body">Date</p><p className="pt-1 text-text-title">Jul 23, 2026, 11:00 PM</p></div>
          <div><p className="text-text-body">Transaction ID</p><p className="pt-1 text-text-title">#152356789107</p></div>
        </div>
        <div>
          <p className="pb-1.5 text-text-subtitle">Status</p>
          <span className="inline-flex h-8 items-center rounded-full bg-yellow-50 px-3.5 text-brand-primary">Processing</span>
          <p className="mt-2 rounded-md bg-yellow-40 px-3 py-2 text-text-title">Expected in bank by <span className="text-text-medium">July 25, 2026</span></p>
        </div>
        <dl className="rounded-md border-1 border-stroke-1 px-3 pb-1 pt-3">
          <dt className="pb-2 text-text-body">Payout Breakdown</dt>
          {[['Withdrawal Amount', '$500'], ['Processing Fees', '$2']].map(([l, v]) => <div key={l} className="flex justify-between border-b-1 border-stroke-1 py-2 text-text-subtitle"><span>{l}</span><span>{v}</span></div>)}
          <div className="flex justify-between py-2 text-text-medium text-text-title"><span>Receivable Amount</span><span>$498</span></div>
        </dl>
        <Button variant="tertiary" fullWidth leftIcon={<DownloadIcon className="h-5 w-5" />}>Download Receipt PDF</Button>
      </div>
    </Modal>
  )
}
