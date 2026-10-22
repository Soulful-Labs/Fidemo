import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { SideNav } from '../../app/AppShell'
import Button from '../../components/ui/Button'
import { DiaryIcon, Info, PaymentsIcon, PoolIcon, StudiesIcon } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { useToast } from '../../components/ui/Toast'
import { useDraft } from '../../mock/createStore'
import { useStudies } from '../../platform'

export type CreateStep = 'about' | 'audience' | 'screener' | 'study' | 'pricing' | 'publish'

/**
 * The step chips in the Create top bar, with the rule between them. Study
 * setup and pricing are two steps (15 Oct 2026): the type's own settings,
 * then Incentive Payments, Costing Summary and the Payment card.
 */
const STEPS: { key: CreateStep; label: string; Icon: typeof Info; to: string }[] = [
  { key: 'about', label: 'About', Icon: Info, to: '/studies/create/about' },
  { key: 'audience', label: 'Audience', Icon: PoolIcon, to: '/studies/create/audience' },
  { key: 'screener', label: 'Screener', Icon: StudiesIcon, to: '/studies/create/screener' },
  { key: 'study', label: 'Study', Icon: DiaryIcon, to: '/studies/create/study' },
  { key: 'pricing', label: 'Pricing', Icon: PaymentsIcon, to: '/studies/create/pricing' },
]

/**
 * Save Draft & Exit, on every step. The form as it stands is kept whole on a
 * draft study (shared/store.ts saveStudyDraft), so it reopens from Drafts with
 * everything in it. Saving again from a reopened draft saves over it.
 */
/**
 * Edit Study (19 Oct 2026, Edit Survey Study): the open draft is a study
 * already sent to the team, so the flow edits it rather than creating one.
 */
export function useEditing(): boolean {
  const { draftId } = useDraft()
  const { study } = useStudies()
  return study(draftId)?.state === 'in_review'
}

/** Edit Study's two actions: Cancel leaves it as it was submitted; Publish sends the changes back to the team. */
function EditActions() {
  const navigate = useNavigate()
  const toast = useToast()
  const { form, draftId, reset } = useDraft()
  const { submitStudy } = useStudies()
  return (
    <>
      <Button variant="tertiary" size="row" onClick={() => { const id = draftId; reset(); navigate(id ? `/studies/${id}` : '/studies') }}>Cancel</Button>
      <Button size="row" onClick={() => {
        const res = submitStudy(form(), draftId)
        if (!res.ok) { toast(res.why); return }
        reset()
        navigate(`/studies/create/published?edited=${res.id}`)
      }}>Publish</Button>
    </>
  )
}

export function SaveDraftButton() {
  const navigate = useNavigate()
  const toast = useToast()
  const { form, draftId, reset } = useDraft()
  const { saveStudyDraft } = useStudies()
  const save = () => {
    const saved = saveStudyDraft(form(), draftId)
    if (!saved.ok) { toast(saved.why); return }
    reset()
    toast('Draft saved')
    navigate('/studies/drafts')
  }
  return <Button variant="tertiary" size="row" onClick={save}>Save Draft &amp; Exit</Button>
}

/**
 * The Create Study frame: the same left navigation, but the top bar carries
 * "Create Study / Study Name", the four step chips and the Save Draft & Exit
 * and Publish Study buttons instead of the bell and Create Study.
 */
export default function CreateShell({ step, action, children, check }: {
  step: CreateStep; action?: ReactNode; children: ReactNode
  /** Asked before Continue moves on: what still needs filling on this step, or nothing. */
  check?: () => string | undefined
}) {
  const index = STEPS.findIndex((s) => s.key === step)
  const next = STEPS[index + 1]
  const navigate = useNavigate()
  const toast = useToast()
  const { draft, set } = useDraft()
  const editing = useEditing()
  /** Every step up to the furthest one reached can be clicked; so can any earlier step (22 Oct 2026). */
  const reached = Math.max(draft.reached ?? 0, index)
  useEffect(() => { if ((draft.reached ?? 0) < index) set('reached', index) }, [draft.reached, index, set])

  return (
    <div className="flex min-h-screen bg-yellow-20">
      <SideNav />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Three parts, as 1622:81504 draws it: the title on the left (truncated, never stretching), the stepper
            in the centre, the actions on the right. */}
        <header className="sticky top-0 z-30 grid h-[69px] shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-6 border-b-1 border-stroke-input bg-yellow-20 px-4">
          <span className="min-w-0 truncate text-body-regular text-text-subtitle" title={draft.title.trim() || undefined}>{editing ? 'Edit Study' : 'Create Study'} / <span className="text-text-title">{draft.title.trim() || 'Study Name'}</span></span>

          <ol className="flex items-center rounded-full bg-bg-0 p-1">
            {STEPS.map((s, i) => {
              const on = s.key === step
              const open = !on && i <= reached
              const chip = cn('flex h-7 items-center gap-1.5 rounded-full border-1 px-3 text-text-medium',
                on ? 'border-stroke-2 bg-bgAlt-2 text-brand-secondary' : 'border-stroke-2 bg-bg-0', !on && (i < index ? 'text-text-subtitle' : 'text-text-body'))
              return (
                <li key={s.key} className="flex items-center">
                  {i > 0 && <span className="h-px w-4 bg-stroke-2" />}
                  {open ? (
                    <button type="button" onClick={() => navigate(s.to)} className={cn(chip, 'hover:border-stroke-3 hover:text-text-title')}>
                      <s.Icon className="h-4 w-4" />{s.label}
                    </button>
                  ) : (
                    <span aria-current={on ? 'step' : undefined} className={chip}><s.Icon className="h-4 w-4" />{s.label}</span>
                  )}
                </li>
              )
            })}
          </ol>

          <div className="flex items-center justify-end gap-3">
            {editing && !action ? <EditActions /> : action ?? (
              <>
                <SaveDraftButton />
                <Button size="row" onClick={() => {
                  const fault = check?.()
                  if (fault) { toast(fault); return }
                  if (next) navigate(next.to)
                }}>Continue</Button>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 px-2 pb-2 pt-[9px]">{children}</main>
      </div>
    </div>
  )
}
