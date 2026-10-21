import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AppShell from '../../../app/AppShell'
import PanelTabs from '../../../components/app/PanelTabs'
import StudyTypeTag from '../../../components/app/StudyTypeTag'
import Button from '../../../components/ui/Button'
import { AudienceIcon, CalendarIcon, CardIcon, ClipboardIcon, HistoryIcon, InfoIcon, ReceiptIcon, ScreenerIcon, UsersIcon } from '../../../components/ui/icons'
import { Modal, SuccessModal } from '../../../components/ui/Overlay'
import { ReviewContext, useReviewData } from '../../../mock/review'
import { billing } from '@shared/derive'
import { monthDayYearTime, money } from '@shared/format'
import { platform } from '@shared/store'
import { useManagedStudy } from '../../../mock/manage'
import { TEAM } from '../../../platform'
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
 * Approve to Publish asks first ("Publish live for participants?",
 * 2369:72188) and then shows the "published live" dialog. Everything in the
 * tabs is read only.
 */
export default function ReviewStudy() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tab = (TABS.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'about') as Tab
  const setTab = (k: Tab) => setParams(k === 'about' ? {} : { tab: k }, { replace: true })
  const study = useManagedStudy(id)
  const view = useReviewData(id)
  const type = study.type
  const [why, setWhy] = useState('')
  /** Workflow 7: the team takes the study live, or sends it back (shared/store.ts). */
  const approve = () => { const r = platform().moveStudy(study.id, 'recruiting', TEAM); if (r.ok) setOverlay('published'); else { setOverlay(null); setWhy(r.why) } }
  const [overlay, setOverlay] = useState<'changes' | 'confirm' | 'published' | null>(null)

  return (
    <ReviewContext.Provider value={view}>
    <AppShell className="p-4"
      crumbs={[{ label: 'Studies', to: '/studies' }, { label: 'Review', to: '/studies' }, { label: study.title }]}
      right={<>
        <Button variant="secondary" size="md" className="px-3" onClick={() => setOverlay('changes')}>Request Changes</Button>
        <Button variant="success" size="md" className="px-3" onClick={() => setOverlay('confirm')}>Approve to Publish</Button>
      </>}>
      <header className="flex gap-4 rounded-lg bg-bgAlt-1 p-4">
        <img src={study.thumbnail} alt="" className="h-[62px] w-[83px] rounded-sm object-cover" />
        <div className="flex flex-col gap-2">
          <h1 className="text-body-medium text-text-title">{study.title}</h1>
          {why && <p className="text-text-regular text-state-danger">{why}</p>}
          <div className="flex gap-2">
            <StudyTypeTag type={type} filled />
            <Pill className="border-stroke-3 text-text-subtitle" icon={<UsersIcon className="h-4 w-4 text-text-title" />}>{String(study.raw.required)}</Pill>
            <Pill className="border-stroke-3 text-text-subtitle" icon={<ReceiptIcon className="h-4 w-4 text-text-title" />}>{money(billing(study.raw).totalCost)}</Pill>
            <Pill className="border-stroke-3 text-text-subtitle" icon={<CalendarIcon className="h-4 w-4 text-text-title" />} label="Submitted:">{monthDayYearTime(study.raw.submittedAt)}</Pill>
          </div>
        </div>
      </header>

      <div className="flex gap-4 pt-4">
        <section className="min-h-[748px] min-w-0 flex-1 overflow-hidden rounded-lg border-1 border-stroke-1">
          <PanelTabs tabs={TABS} value={tab} onChange={(k) => setTab(k as Tab)} />
          <div role="tabpanel" className="p-4">
            {tab === 'about' && <AboutTab type={type} />}
            {tab === 'audience' && <AudienceTab />}
            {tab === 'screener' && <QuestionList labels={view.screenerLabels} questions={view.screener} />}
            {tab === 'study' && <StudyTab type={type} />}
            {tab === 'payment' && <PaymentTab onReceipt={() => undefined} />}
            {tab === 'revisions' && <RevisionsTab />}
          </div>
        </section>
        <ClientCard />
      </div>

      <RequestChanges open={overlay === 'changes'} onClose={() => setOverlay(null)} onSend={(text) => { const r = platform().requestChanges(study.id, text, TEAM); setOverlay(null); if (r.ok) setTab('revisions'); else setWhy(r.why) }} />
      <Modal open={overlay === 'confirm'} onClose={() => setOverlay(null)} title="Publish live for participants?"
        footer={<><Button variant="tertiary" onClick={() => setOverlay(null)}>Cancel</Button><Button onClick={approve}>Approve and Publish</Button></>}>
        The study will be published live on the participants app for them to apply for it.
      </Modal>
      <SuccessModal tone="green" open={overlay === 'published'} onClose={() => setOverlay(null)}
        title="This study has been published live!" body="It is live on the platform and showing to targeted participants."
        action="Done! View Details" onAction={() => navigate(`/studies/${id}`)} />
    </AppShell>
    </ReviewContext.Provider>
  )
}
