import { useState } from 'react'
import AppShell from '../../../app/AppShell'
import Pill from '../../../components/app/Pill'
import StudyTypeTag from '../../../components/app/StudyTypeTag'
import Button, { IconButton } from '../../../components/ui/Button'
import { AudienceIcon, ClipboardIcon, ClockIcon, CopyIcon, DotsIcon, LinkIcon, ScreenerIcon } from '../../../components/ui/icons'
import { UnderlineTabs } from '../../../components/ui/Tabs'
import { FIGURES as F } from '../../../mock/manage'
import type { ManagedStudy } from '../../../mock/manage'
import { BillLine } from '../review/PaymentRevisions'
import { AudiencePills, Block, EstimatedAudience } from './ManageTab'
import { ClientCard } from './OverviewTab'
import { Billing, Money, Transaction } from './PayTab'
import ResultsTab from './ResultsTab'

type Tab = 'overview' | 'results' | 'payments'
const TABS = [{ key: 'overview', label: 'Overview' }, { key: 'results', label: 'Results' }, { key: 'payments', label: 'Payments' }]
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1"><p className="text-text-regular leading-5 text-text-subtitle">{label}</p>{children}</div>
)
const Stat = ({ label, value, rest, ring }: { label: string; value: string; rest?: string; ring?: boolean }) => (
  <div className="flex h-[77px] flex-1 items-center justify-between rounded-md bg-bg-1 px-3">
    <div>
      <p className="text-text-regular leading-5 text-text-subtitle">{label}</p>
      <p className="flex items-baseline gap-0.5 pt-0.5 text-title-l leading-[31px] text-text-title">{value}{rest && <span className="text-body-medium leading-[22px]">{rest}</span>}</p>
    </div>
    {ring && <span aria-hidden="true" className="h-[45px] w-[45px] rounded-full border-[6px] border-brand-secondary" />}
  </div>
)

/**
 * A completed study (Completed Study Flow, 1932:96425; only the survey is
 * drawn): a shorter header with the status "Completed" and a two-item menu
 * (Copy Study Link, Download All Data), and three underline tabs with no
 * panel around them.
 * - Overview (1932:96426): Success, Completed, Qualified, Closed; description,
 *   share link, Duration; the Audience, Screener and Study blocks; About Client.
 * - Results (1932:96711): the running study's Results with 30 /30 required.
 * - Payments (1932:97043): Total Paid, the bill as paid, and both receipts.
 *   The frame lights "Results" over this content; the tab is lit by route.
 * No Manage Study, Matched or Recruited: nothing is left to run.
 */
export default function CompletedStudy({ study, tab, onTab }: { study: ManagedStudy; tab: Tab; onTab: (t: Tab) => void }) {
  const [menu, setMenu] = useState(false)
  const copy = () => { void navigator.clipboard?.writeText(F.shareLink) }
  return (
    <AppShell className="flex flex-col pb-8" crumbs={[{ label: 'Studies', to: '/studies' }, { label: 'Completed', to: '/studies?tab=completed' }, { label: study.title }]}>
      <header className="flex gap-6 rounded-lg bg-bgAlt-1 p-4">
        <img src={study.image} alt="" className="h-[117px] w-[156px] shrink-0 rounded-md object-cover" />
        <div className="min-w-0 flex-1">
          <div className="relative flex h-[38px] items-center">
            <StudyTypeTag type={study.type} filled />
            <div className="ml-auto flex items-center gap-3">
              <span className="flex h-8 items-center rounded-full bg-bgAlt-2 px-[14px] text-text-regular text-text-title">Completed</span>
              <IconButton label="Copy study link" onClick={copy}><LinkIcon className="h-5 w-5" /></IconButton>
              <IconButton label="Study options" aria-expanded={menu} onClick={() => setMenu((m) => !m)}><DotsIcon className="h-5 w-5" /></IconButton>
            </div>
            {menu && (
              <ul role="menu" className="absolute right-0 top-[46px] z-30 w-[200px] rounded-lg bg-bg-0 p-2 shadow-[0_4px_16px_rgba(32,30,25,0.12)]">
                {['Copy Study Link', 'Download All Data'].map((item) => (
                  <li key={item} role="none"><button role="menuitem" type="button" onClick={() => { setMenu(false); if (item === 'Copy Study Link') copy() }}
                    className="flex h-[38px] w-full items-center rounded-sm px-3 text-body-regular text-text-title hover:bg-bg-1">{item}</button></li>
                ))}
              </ul>
            )}
          </div>
          <h1 className="pt-3 text-title-l leading-[31px] text-text-title">{study.title}</h1>
          <div className="flex gap-2 pt-2">
            <span className="flex h-7 items-center gap-1 rounded-full border-1 border-stroke-3 px-2 text-text-regular text-text-subtitle"><ClockIcon className="h-4 w-4 text-text-title" />{study.time}</span>
            <span className="flex h-7 items-center rounded-full border-1 border-stroke-3 px-2 text-text-regular text-text-subtitle">{study.industry}</span>
          </div>
        </div>
      </header>
      <UnderlineTabs className="mt-5" items={TABS} value={tab} onChange={(k) => onTab(k as Tab)} />

      {tab === 'overview' && (
        <div className="flex gap-6 pt-4">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <div className="flex gap-2">
              <Stat label="Success" value="100%" ring /><Stat label="Completed" value="30" rest="/30 required" />
              <Stat label="Qualified" value="35" rest="/60 applied" /><Stat label="Closed" value="15th Aug" />
            </div>
            <Field label="Study Description"><p className="text-body-regular leading-[22px] text-text-title">{study.description}</p></Field>
            <Field label="Share Link">
              <div className="flex gap-3">
                <p className="flex h-12 min-w-0 flex-1 items-center truncate rounded-md border-1 border-stroke-input bg-bg-1 px-3 text-body-regular text-text-subtitle">{F.shareLink}</p>
                <Button variant="tertiary" className="w-[103px] px-0" leftIcon={<CopyIcon className="h-5 w-5" />} onClick={copy}>Copy</Button>
              </div>
            </Field>
            <Field label="Duration"><p className="flex gap-3 text-body-regular leading-[22px] text-text-subtitle">From July 10, 2026, 02:30 PM<span aria-hidden="true">•</span>To July 10, 2026, 02:30 PM</p></Field>
            <div className="-mt-2 flex flex-col gap-4">
              <Block Icon={AudienceIcon} title="Audience" head="h-[52px]" body="pb-[26px]" extra={<EstimatedAudience />}><AudiencePills roles="Physician, General Doctor, Nutritionist, Therapist, Medical Practitioner" /></Block>
              <Block Icon={ScreenerIcon} title="Screener" head="h-12" body="pb-[30px]"><Pill label="Screening:">{F.screening}</Pill></Block>
              <Block Icon={ClipboardIcon} title="Study" head="h-12" body="pb-[30px]"><div className="flex gap-2"><Pill label={study.summary[0]}>{study.summary[1]}</Pill><Pill label="Incentive:">{F.incentive}</Pill></div></Block>
            </div>
          </div>
          <ClientCard className="w-[338px] p-3" />
        </div>
      )}
      {tab === 'results' && <div className="pt-4"><ResultsTab study={study} completed /></div>}
      {tab === 'payments' && (
        <div className="pt-4">
          <h2 className="text-title-s leading-[25px] text-text-title">Payment Overview</h2>
          <div className="flex pt-2"><Money short label="Total Paid" value="$3,350" /></div>
          <div className="grid grid-cols-2 items-start gap-6 pt-5">
            <div>
              <h2 className="pb-2 text-title-s leading-[25px] text-text-title">Billing</h2>
              <Billing>
                <BillLine bold line={{ label: 'Total cost paid', amount: '$3,350' }} />
                <BillLine line={{ label: 'Paid: Incentive Deposit', detail: '$100 x 30 participants', amount: '-$3000' }} />
                <BillLine line={{ label: 'Paid: Due Payment', amount: '-$350' }} />
              </Billing>
            </div>
            <div>
              <h2 className="pb-3 text-title-s leading-[25px] text-text-title">Transactions</h2>
              <div className="flex flex-col gap-2">
                <Transaction title="Incentive Deposit - Paid" amount="$3,000" detail="$20 x 30 participants" />
                <Transaction title="Billed Invoice - Paid" amount="$350" detail="$350" />
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
