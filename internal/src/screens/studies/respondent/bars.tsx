import type { ReactNode } from 'react'
import Button from '../../../components/ui/Button'
import { CloseIcon, VerifiedIcon } from '../../../components/ui/icons'
import { cn } from '../../../lib/cn'

const TONE = { neutral: 'text-text-subtitle', good: 'text-state-success', bad: 'text-state-danger' }

/**
 * The bar along the bottom of a result or screener panel: 80 tall on bgAlt-1,
 * two 14px lines on the left (the first in the state's colour), the state's
 * controls on the right.
 */
function Bar({ tone, title, line, muted, children }: { tone: keyof typeof TONE; title: string; line: string; muted?: boolean; children: ReactNode }) {
  return (
    <div className="flex h-20 items-center justify-between gap-4 bg-bgAlt-1 px-4 text-text-regular leading-5">
      <div><p className={TONE[tone]}>{title}</p><p className={cn('pt-0.5', muted ? 'text-text-subtitle' : 'text-text-title')}>{line}</p></div>
      <div className="flex shrink-0 items-center gap-4">{children}</div>
    </div>
  )
}

const Outcome = ({ good, children }: { good: boolean; children: string }) => (
  <span className={cn('flex h-12 items-center gap-1 rounded-md px-5 text-body-regular', good ? 'bg-state-successBg text-state-success' : 'bg-red-50 text-state-danger')}>
    {good ? <VerifiedIcon className="h-5 w-5" /> : <CloseIcon className="h-5 w-5" />}{children}
  </span>
)
const SmallOutcome = ({ good, children }: { good: boolean; children: string }) => (
  <span className={cn('flex h-[38px] items-center gap-1 rounded-md px-3 text-text-regular', good ? 'bg-state-successBg text-state-success' : 'bg-red-50 text-state-danger')}>
    {good ? <VerifiedIcon className="h-4 w-4" /> : <CloseIcon className="h-4 w-4" />}{children}
  </span>
)

export type ScreenerState = 'todo' | 'qualified' | 'disqualified'
const UNDO = 'The action can be undone within 1 hour only after it is taken.'

/**
 * Qualify / Disqualify ("Screener CTAs", 1932:110903), under the screener of a
 * respondent who has applied. Four states are drawn: to decide; qualified
 * with Undo; qualified with the Undo gone; disqualified with Undo. The state
 * is the participation's own (shared/store.ts decide), and Undo shows only
 * while the store still allows it: within the hour.
 */
export function ScreenerBar({ state, canUndo, onDecide }: { state: ScreenerState; canUndo: boolean; onDecide: (to: 'qualified' | 'disqualified' | 'applied') => void }) {
  if (state === 'todo') return (
    <Bar tone="neutral" title="Choose Qualify for further study or Disqualify to reject from here." line={UNDO}>
      <button type="button" onClick={() => onDecide('disqualified')} className="flex h-12 items-center gap-1 rounded-md bg-red-50 px-5 text-body-regular text-state-danger"><CloseIcon className="h-5 w-5" />Disqualify</button>
      <Button className="px-5" leftIcon={<VerifiedIcon className="h-5 w-5" />} onClick={() => onDecide('qualified')}>Qualify</Button>
    </Bar>
  )
  const good = state === 'qualified'
  return (
    <Bar tone={good ? 'good' : 'bad'} title={`You have ${good ? 'qualified' : 'disqualified'} this respondent for the further study.`} line={UNDO} muted={!canUndo}>
      {canUndo && <Button variant="tertiary" className="px-5" onClick={() => onDecide('applied')}>Undo</Button>}
      <Outcome good={good}>{good ? 'Qualified' : 'Disqualified'}</Outcome>
    </Bar>
  )
}

export type CompletionState = 'todo' | 'completed' | 'settled' | 'noshow'

/**
 * The one-to-one study's completion bar ("Marked Completed", 1952:83058):
 * Mark No-show / Mark Completed; then "Marked John as completed!" with or
 * without Undo, or "Marked John as No-show." with Undo. `label` is the first
 * line before a decision: video draws "Final Completion Confirmation",
 * in-person "Completion Confirmation". The state is the participation's.
 * Since 22 Oct 2026 the actions follow it, as on the group session's rows
 * (1952:79377): completed, Mark No-show beside a green read-back; a no-show,
 * Mark Completed beside a red one. A read-back is not a button, and once the
 * payout is approved only the read-back is left.
 */
export function CompletionBar({ label, name, state, byParticipant, onNoShow, onComplete }: {
  label: string; name: string; state: CompletionState; byParticipant?: boolean; onNoShow: () => void; onComplete: () => void
}) {
  const first = name.split(' ')[0]
  if (state === 'todo') return (
    <Bar tone="neutral" title={label} line="Mark as completed for an additional confirmation">
      <Button variant="tertiary" size="md" className="px-3" leftIcon={<CloseIcon className="h-4 w-4" />} onClick={onNoShow}>Mark No-show</Button>
      <Button variant="secondary" size="md" className="px-3" leftIcon={<VerifiedIcon className="h-4 w-4" />} onClick={onComplete}>Mark Completed</Button>
    </Bar>
  )
  const good = state !== 'noshow'
  return (
    <Bar tone={good ? 'good' : 'bad'} muted title={good ? `Marked ${first} as completed!` : `Marked ${first} as No-show.`}
      line={good ? `This study has been successfully marked as completed with PIN by the ${name}.` : `You have marked ${first} as no-show (absent) and it wll be confirmed by team.`}>
      {state === 'completed' && <Button variant="tertiary" size="md" className="px-3" leftIcon={<CloseIcon className="h-4 w-4" />} onClick={onNoShow}>Mark No-show</Button>}
      {state === 'noshow' && <Button variant="secondary" size="md" className="px-3" leftIcon={<VerifiedIcon className="h-4 w-4" />} onClick={onComplete}>Mark Completed</Button>}
      <SmallOutcome good={good}>{good ? (byParticipant ? 'Marked completed by participant' : 'Marked as completed') : 'Marked as No-show'}</SmallOutcome>
    </Bar>
  )
}

/** The group session's bar (1952:80442): "Mark all as Completed", then "Marked all as completed". No undo is drawn. */
export function GroupCompletionBar({ done, onAll }: { done: boolean; onAll: () => void }) {
  return done ? (
    <Bar tone="good" muted title="Marked as completed!" line="This study has been successfully marked as completed with PIN by the participant."><SmallOutcome good>Marked all as completed</SmallOutcome></Bar>
  ) : (
    <Bar tone="neutral" title="Completion Confirmation" line="Mark as completed for an additional confirmation">
      <Button variant="secondary" size="md" className="px-3" leftIcon={<VerifiedIcon className="h-4 w-4" />} onClick={onAll}>Mark all as Completed</Button>
    </Bar>
  )
}

/** Under a finished survey or diary (1932:108609): nothing to decide, only the outcome. */
export const CompletedBar = ({ closed, kind, name, noShow }: { closed?: boolean; kind: 'survey' | 'diary'; name: string; noShow?: boolean }) => noShow
  ? <Bar tone="bad" muted title="Marked as No-show" line={`${name} did not complete this ${kind} study and is not paid for it.`}><SmallOutcome good={false}>No-show</SmallOutcome></Bar>
  : closed
    ? <Bar tone="good" muted title="Marked as completed" line={`The ${kind} study has been successfully completed by the respondent.`}><SmallOutcome good>Completed</SmallOutcome></Bar>
    : <Bar tone="good" muted title="Marked as completed!" line={`The ${kind} study has been successfully completed by ${name}.`}><SmallOutcome good>Completed</SmallOutcome></Bar>
