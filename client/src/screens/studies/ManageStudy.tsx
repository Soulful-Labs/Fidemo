import { useNavigate } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import { StudyFrame } from '../../components/client/StudyFrame'
import { Edit, Info, PoolIcon, StudiesIcon } from '../../components/ui/icons'
import { MANAGED_STUDY } from '../../mock/studies'

const FORM = (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
    <path d="M4 6h10M4 12h16M4 18h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const PEOPLE = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
    <circle cx="9.5" cy="9" r="2.8" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="17" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M4.5 19c0-2.9 2.3-4.6 5-4.6s5 1.7 5 4.6M16 13.6c2.2.2 3.9 1.6 3.9 4"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const PIN = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
    <path d="M12 21s7-5.3 7-11a7 7 0 1 0-14 0c0 5.7 7 11 7 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)
const ICON: Record<string, React.ReactNode> = { people: PEOPLE, pin: PIN }

/** A summary chip: a grey label and the value in the title colour. */
function Chip({ label, value, icon }: { label?: string; value: string; icon?: React.ReactNode }) {
  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-full border-1 border-stroke-input bg-bg px-3 text-text-regular">
      {icon && <span className="text-text-subtitle">{icon}</span>}
      {label && <span className="text-text-subtitle">{label}:</span>}
      <span className="text-text-title">{value}</span>
    </span>
  )
}

/** One step of the study, read back with a way to edit it. */
function Step({ icon, title, chip, onEdit, children }: {
  icon: React.ReactNode; title: string; chip?: React.ReactNode; onEdit: () => void; children: React.ReactNode
}) {
  return (
    <section className="rounded-lg bg-bg-1">
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="text-text-subtitle">{icon}</span>
        <h2 className="text-body-medium text-text-title">{title}</h2>
        {chip}
        <span className="flex-1" />
        <Button variant="secondary" size="none" className="h-[38px] px-4" leftIcon={<Edit className="h-4 w-4" />}
          onClick={onEdit}>Edit</Button>
      </div>
      <div className="border-t-1 border-stroke-input px-4 py-4">{children}</div>
    </section>
  )
}

/** A labelled value in the About step. */
function Read({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-text-regular text-text-subtitle">{label}</span>
      <span className="text-body-regular text-text-title">{value}</span>
    </div>
  )
}

/**
 * Manage Study (1627:96085): the study's definition read back as the four
 * Create steps, each with an Edit. Its sibling tab, Study Overview, holds
 * how the study is running; this one holds what the study is.
 */
export default function ManageStudy() {
  const navigate = useNavigate()
  const s = MANAGED_STUDY
  const r = s.review

  return (
    <AppShell crumbs={[{ label: 'Studies', to: '/studies' }, { label: s.breadcrumb }]}>
      <StudyFrame study={s} active="manage" minH="min-h-[1315px]" bodyMinH="min-h-[1057px]">
        <div className="flex flex-col gap-4 p-4">
          <Step icon={<Info className="h-5 w-5" />} title="About" onEdit={() => navigate('/studies/create/about')}>
            <div className="flex flex-col gap-3.5">
              <Read label="Title" value={s.title} />
              <Read label="Description" value={s.description} />
              <Read label="Study Time" value={r.studyTime} />
              <div className="flex flex-col gap-0.5">
                <span className="text-text-regular text-text-subtitle">Thumbnail</span>
                <span className="mt-1 h-[100px] w-40 overflow-hidden rounded-md bg-bg-2">
                  <img src={s.image} alt="" className="h-full w-full object-cover" />
                </span>
              </div>
            </div>
          </Step>

          <Step icon={<PoolIcon className="h-5 w-5" />} title="Audience"
            chip={
              <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-bg-2 px-3 text-text-regular text-text-subtitle">
                Estimated Audience: <span className="text-text-title">{r.estimatedAudience}</span>
                <Info className="h-4 w-4 text-text-body" />
              </span>
            }
            onEdit={() => navigate('/studies/create/audience')}>
            <div className="flex flex-wrap gap-3">
              {r.audience.map((a, i) => (
                <Chip key={i} label={a.label} value={a.value} icon={a.icon ? ICON[a.icon] : undefined} />
              ))}
            </div>
          </Step>

          <Step icon={<StudiesIcon className="h-5 w-5" />} title="Screener" onEdit={() => navigate('/studies/create/screener')}>
            <Chip label={r.screener.label} value={r.screener.value} />
          </Step>

          <Step icon={FORM} title="Study" onEdit={() => navigate('/studies/create/study')}>
            <div className="flex flex-wrap gap-3">
              <Chip label={r.studyRow.label} value={r.studyRow.value} />
              <Chip label={r.incentive.label} value={r.incentive.value} />
            </div>
          </Step>
        </div>
      </StudyFrame>
    </AppShell>
  )
}
