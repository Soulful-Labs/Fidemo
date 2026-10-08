import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AppShell from '../../../app/AppShell'
import PanelTabs from '../../../components/app/PanelTabs'
import StudyTypeTag from '../../../components/app/StudyTypeTag'
import Button from '../../../components/ui/Button'
import { AudienceIcon, CalendarIcon, CardIcon, ClipboardIcon, HistoryIcon, InfoIcon, ReceiptIcon, ScreenerIcon, UsersIcon } from '../../../components/ui/icons'
import { SuccessModal } from '../../../components/ui/Overlay'
import { QUESTIONS, REVIEW, SCREENER_LABELS } from '../../../mock/review'
import { STUDY_ROWS } from '../../../mock/studies'
import { AboutTab, AudienceTab } from './AboutAudience'
import ClientCard from './ClientCard'
import { Pill } from './parts'
import { PaymentTab, RevisionsTab } from './PaymentRevisions'
import { QuestionList } from './Questions'
import RequestChanges from './RequestChanges'
import StudyTab from './StudyTab'

const TABS = [
  { key: 'about', label: 'About', Icon: InfoIcon, width: 'w-[101px]' },
  { key: 'audience', label: 'Audience', Icon: AudienceIcon, width: 'w-[125px]' },
  { key: 'screener', label: 'Screener', Icon: ScreenerIcon, width: 'w-[123px]' },
  { key: 'study', label: 'Study', Icon: ClipboardIcon, width: 'w-[100px]' },
  { key: 'payment', label: 'Payment', Icon: CardIcon, width: 'w-[121px]' },
  { key: 'revisions', label: 'Revisions History', Icon: HistoryIcon, width: 'w-[183px]' },
] as const
type Tab = (typeof TABS)[number]['key']

/**
 * Review a new study (section 1982:104844): one screen, six tabs, with the
 * Study tab switched on the study's type. Unlike the list screens it sits 16
 * inside the shell, not 24: a bgAlt-1 header card (thumbnail, title, the type
 * tag, participants, cost, submitted), then an 802 panel of icon tabs beside
 * the 360 client card. The panel fills the window and grows with its content.
 *
 * The two actions live in the title bar: Request Changes opens the 600 panel,
 * Approve to Publish the "published live" dialog. Everything in the tabs is
 * read only.
 */
export default function ReviewStudy() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tab = (TABS.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'about') as Tab
  const setTab = (k: Tab) => setParams(k === 'about' ? {} : { tab: k }, { replace: true })
  const type = STUDY_ROWS.find((r) => r.id === id)?.type ?? 'video'
  const [overlay, setOverlay] = useState<'changes' | 'published' | null>(null)

  return (
    <AppShell className="p-4"
      crumbs={[{ label: 'Studies', to: '/studies' }, { label: 'Review', to: '/studies' }, { label: REVIEW.crumb }]}
      right={<>
        <Button variant="secondary" size="md" className="px-3" onClick={() => setOverlay('changes')}>Request Changes</Button>
        <Button variant="success" size="md" className="px-3" onClick={() => setOverlay('published')}>Approve to Publish</Button>
      </>}>
      <header className="flex gap-4 rounded-lg bg-bgAlt-1 p-4">
        <img src={REVIEW.thumb} alt="" className="h-[62px] w-[83px] rounded-sm object-cover" />
        <div className="flex flex-col gap-2">
          <h1 className="text-body-medium text-text-title">{REVIEW.title}</h1>
          <div className="flex gap-2">
            <StudyTypeTag type={type} filled />
            <Pill className="border-stroke-3 text-text-subtitle" icon={<UsersIcon className="h-4 w-4 text-text-title" />}>{REVIEW.participants}</Pill>
            <Pill className="border-stroke-3 text-text-subtitle" icon={<ReceiptIcon className="h-4 w-4 text-text-title" />}>{REVIEW.cost}</Pill>
            <Pill className="border-stroke-3 text-text-subtitle" icon={<CalendarIcon className="h-4 w-4 text-text-title" />} label="Submitted:">{REVIEW.submitted}</Pill>
          </div>
        </div>
      </header>

      <div className="flex gap-4 pt-4">
        <section className="min-h-[748px] min-w-0 flex-1 overflow-hidden rounded-lg border-1 border-stroke-1">
          <PanelTabs tabs={TABS} value={tab} onChange={(k) => setTab(k as Tab)} />
          <div role="tabpanel" className="p-4">
            {tab === 'about' && <AboutTab type={type} />}
            {tab === 'audience' && <AudienceTab />}
            {tab === 'screener' && <QuestionList labels={SCREENER_LABELS} questions={QUESTIONS} />}
            {tab === 'study' && <StudyTab type={type} />}
            {tab === 'payment' && <PaymentTab onReceipt={() => undefined} />}
            {tab === 'revisions' && <RevisionsTab />}
          </div>
        </section>
        <ClientCard />
      </div>

      <RequestChanges open={overlay === 'changes'} onClose={() => setOverlay(null)} onSend={() => { setOverlay(null); setTab('revisions') }} />
      <SuccessModal tone="green" open={overlay === 'published'} onClose={() => setOverlay(null)}
        title="This study has been published live!" body="It is live on the platform and showing to targeted participants."
        action="Done! View Details" onAction={() => navigate(`/studies/${id}`)} />
    </AppShell>
  )
}
