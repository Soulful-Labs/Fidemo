import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { SideNav } from '../../app/AppShell'
import Button from '../../components/ui/Button'
import { DiaryIcon, Info, PoolIcon, StudiesIcon } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { useToast } from '../../components/ui/Toast'
import { useDraft } from '../../mock/createStore'
import { useStudies } from '../../platform'

export type CreateStep = 'about' | 'audience' | 'screener' | 'study' | 'publish'

/** The four step chips in the Create top bar, with the rule between them. */
const STEPS: { key: CreateStep; label: string; Icon: typeof Info; to: string }[] = [
  { key: 'about', label: 'About', Icon: Info, to: '/studies/create/about' },
  { key: 'audience', label: 'Audience', Icon: PoolIcon, to: '/studies/create/audience' },
  { key: 'screener', label: 'Screener', Icon: StudiesIcon, to: '/studies/create/screener' },
  { key: 'study', label: 'Study', Icon: DiaryIcon, to: '/studies/create/study' },
]

/**
 * Save Draft & Exit, on every step. The form as it stands is kept whole on a
 * draft study (shared/store.ts saveStudyDraft), so it reopens from Drafts with
 * everything in it. Saving again from a reopened draft saves over it.
 */
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
export default function CreateShell({ step, action, children }: { step: CreateStep; action?: ReactNode; children: ReactNode }) {
  const index = STEPS.findIndex((s) => s.key === step)
  const next = STEPS[index + 1]
  const navigate = useNavigate()
  const { draft } = useDraft()

  return (
    <div className="flex min-h-screen bg-yellow-20">
      <SideNav />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[69px] shrink-0 items-center justify-between gap-6 border-b-1 border-stroke-input bg-yellow-20 px-4">
          <span className="text-body-regular text-text-subtitle">Create Study / <span className="text-text-title">{draft.title.trim() || 'Study Name'}</span></span>

          <ol className="flex items-center">
            {STEPS.map((s, i) => {
              const on = s.key === step
              const done = i < index
              return (
                <li key={s.key} className="flex items-center">
                  {i > 0 && <span className="h-px w-4 bg-neutral-700" />}
                  <span className={cn('flex h-7 items-center gap-1.5 rounded-full px-3 text-text-medium',
                    on ? 'bg-bgAlt-2 text-brand-secondary'
                      : done ? 'bg-bg-0 text-text-subtitle' : 'bg-bg-0 text-text-body')}>
                    <s.Icon className="h-4 w-4" />
                    {s.label}
                  </span>
                </li>
              )
            })}
          </ol>

          <div className="flex items-center gap-3">
            {action ?? (
              <>
                <SaveDraftButton />
                <Button size="row" onClick={() => next && navigate(next.to)}>Continue</Button>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 px-2 pb-2 pt-[9px]">{children}</main>
      </div>
    </div>
  )
}
