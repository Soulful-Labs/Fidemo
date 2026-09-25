import SidePanel from '../../components/ui/SidePanel'
import Button from '../../components/ui/Button'
import TierChip from '../../components/client/TierChip'
import { Avatar } from '../../components/client/RespondentCard'
import type { Respondent } from '../../components/client/RespondentCard'
import { ChevronRight, Info, VerifiedMark } from '../../components/ui/icons'
import { PROFILE } from '../../mock/dashboard'
import { useToast } from '../../components/ui/Toast'
import { useWorkspace } from '../../mock/workspace'

/** One card of the panel body: a heading and its rows. */
function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border-1 border-stroke-input bg-bg-0 p-4">
      <h3 className="text-text-medium text-text-subtitle">{title}</h3>
      {children}
    </section>
  )
}

/** The Trust Score gauge: an open ring with the score inside it. */
function Gauge({ score }: { score: number }) {
  const r = 50
  const circ = 2 * Math.PI * r
  return (
    <svg viewBox="0 0 116 100" width="116" height="100" aria-hidden="true">
      <circle cx="58" cy="58" r={r} fill="none" stroke="#f3f2f1" strokeWidth="11" strokeLinecap="round"
        strokeDasharray={`${circ * 0.75} ${circ}`} transform="rotate(135 58 58)" />
      <circle cx="58" cy="58" r={r} fill="none" stroke="#fca311" strokeWidth="11" strokeLinecap="round"
        strokeDasharray={`${circ * 0.75 * (score / 100)} ${circ}`} transform="rotate(135 58 58)" />
    </svg>
  )
}

/**
 * Respondent Profile Details (1704:141690): the 600px panel a respondent's
 * View Profile opens. The frame fills it for Ferry L.
 */
export default function RespondentPanel({
  open, onClose, respondent, onReviews, title,
}: { open: boolean; onClose: () => void; respondent: Respondent | null
  /** The Pool frames title it "Profile of …" and wire Reviews to a second page. */
  onReviews?: () => void; title?: string }) {
  const { panels, addToPanel } = useWorkspace()
  const toast = useToast()
  if (!respondent) return null
  const d = PROFILE

  return (
    <SidePanel open={open} onClose={onClose} title={title ?? respondent.name} headerClassName="h-[50px]" bodyClassName="flex flex-col gap-3 p-4"
      footer={
        <div className="flex gap-3 [&_button]:h-12 [&_button]:flex-1 [&_button]:text-body-medium">
          <Button onClick={() => toast('Invitation sent')}>Invite To Study</Button>
          <Button variant="secondary" onClick={() => {
            const target = panels[0]
            if (!target) { toast('Build a micro-panel first, then save people into it'); return }
            const res = addToPanel(target.id, respondent?.id ?? '')
            toast(res.ok ? `Saved to ${target.title}` : res.why!)
          }}>Save To Micropanel</Button>
        </div>
      }>
      <div className="flex items-start gap-3 px-1 pb-[11px]">
        <Avatar name={respondent.name} size={56} />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-title-s text-text-title">{respondent.role}</p>
          <p className="text-text-regular text-text-subtitle">{d.meta}</p>
        </div>
      </div>

      <div className="flex items-stretch gap-3">
        <div className="flex w-[278px] shrink-0 flex-col items-center gap-4 rounded-lg bg-bgAlt-1 p-4">
          <div className="flex w-full items-center justify-between">
            <span className="text-text-regular text-text-subtitle">Trust Score</span>
            <button type="button" onClick={onReviews} className="inline-flex items-center gap-1 text-text-medium text-text-title hover:text-brand-primary">
              Reviews <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <span className="relative flex items-center justify-center">
            <Gauge score={d.trustScore} />
            <span className="absolute flex flex-col items-center">
              <span className="text-[40px] font-semibold leading-none text-brand-primary">{d.trustScore}</span>
              <span className="pt-1 text-text-regular text-text-subtitle">/100</span>
            </span>
          </span>
          <span className="pt-2.5"><TierChip tier={respondent.tier} /></span>
        </div>

        <div className="flex w-[278px] shrink-0 flex-col gap-3 rounded-lg bg-bg-1 p-4">
          <h3 className="text-text-medium text-text-subtitle">Performance Ratings</h3>
          <div className="flex flex-col gap-4">
          {d.ratings.map((r) => {
            const [bar, text] = r.tone.split(' ')
            return (
              <div key={r.label} className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-text-regular text-text-subtitle">
                    {r.label} <Info className="h-4 w-4 text-text-body" />
                  </span>
                  <span className={`text-text-medium ${text}`}>{r.value}</span>
                </div>
                <span className="h-1 w-full rounded-full bg-bg-3">
                  <span className={`block h-full rounded-full ${bar}`} style={{ width: r.value }} />
                </span>
              </div>
            )
          })}
          </div>
        </div>
      </div>

      <Block title="About">
        <dl className="grid grid-cols-3 gap-x-4 gap-y-4">
          {d.about.map((a) => (
            <div key={a.label} className="flex flex-col gap-1">
              <dt className="text-text-regular text-text-subtitle">{a.label}</dt>
              <dd className="text-text-regular text-text-title">{a.value}</dd>
            </div>
          ))}
        </dl>
      </Block>

      <Block title="Verified">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
          {d.verified.map((v) => (
            <li key={v} className="inline-flex items-center gap-2 text-text-regular text-text-title">
              <VerifiedMark className="h-5 w-5 text-brand-secondary" />{v}
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Metrics">
        <dl className="grid grid-cols-3 gap-4">
          {d.metrics.map((m) => (
            <div key={m.label} className="flex flex-col gap-1">
              <dt className="text-text-regular text-text-subtitle">{m.label}</dt>
              <dd className="text-title-s text-brand-primary">{m.value}</dd>
            </div>
          ))}
        </dl>
      </Block>
    </SidePanel>
  )
}
