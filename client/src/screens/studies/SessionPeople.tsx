import { useState } from 'react'
import Button from '../../components/ui/Button'
import { CheckCircle, Close } from '../../components/ui/icons'
import { ScoreCell, Th, useScoreSort } from '../../components/client/RespondentTable'
import { PersonName } from '../../app/ProfileHost'
import { useToast } from '../../components/ui/Toast'
import { useStudies } from '../../platform'
import type { Recruit } from '@shared/derive'
import NoShowModal from './NoShowModal'

/**
 * The participants of a group session: Name, Role and Score (1627:105750).
 * Once the session has run (1627:106074) each row carries its attendance, as
 * the client's frames draw it: nothing recorded, Mark No-show and Mark
 * Completed; completed, a green read-back; a no-show, Undo beside a red one.
 * A completion marked by the client, not yet paid, also has Undo (1769:86063).
 */
export default function SessionPeople({ study, people, anyone, done }: {
  study: { id: string }; people: Recruit[]; anyone: boolean; done: boolean
}) {
  const { moveRespondent, enterCode, undoAttendance } = useStudies()
  const toast = useToast()
  const [noShow, setNoShow] = useState<Recruit | null>(null)
  const [sorted, scoreSort] = useScoreSort(people)

  /** Workflow 42: no code, no payment. The client enters the session's code on the participant's behalf, then completes. */
  const complete = (r: Recruit) => {
    const c = r.participation.code
    if (c && !c.byClient) enterCode(study.id, r.id, c.value)
    const res = moveRespondent(study.id, r.id, 'completed')
    toast(res.ok ? `${r.name} marked completed` : res.why)
  }
  const NoShowButton = ({ r }: { r: Recruit }) => (
    <Button variant="tertiary" size="none" className="h-[38px] px-3" leftIcon={<Close className="h-4 w-4" />} onClick={() => setNoShow(r)}>Mark No-show</Button>
  )
  const CompleteButton = ({ r }: { r: Recruit }) => (
    <Button variant="secondary" size="none" className="h-[38px] px-3" leftIcon={<CheckCircle className="h-4 w-4" />} onClick={() => complete(r)}>Mark Completed</Button>
  )
  const UndoButton = ({ r }: { r: Recruit }) => (
    <Button variant="tertiary" size="none" className="h-[38px] px-4" onClick={() => {
      const res = undoAttendance(study.id, r.id)
      toast(res.ok ? `${r.name}: undone` : res.why)
    }}>Undo</Button>
  )
  const actions = (r: Recruit) => {
    if (r.state === 'completed' || r.state === 'rated') {
      return (
        <>
          {!r.participation.paidAt && !r.participation.code?.byParticipant && <UndoButton r={r} />}
          <span className="flex h-[38px] items-center gap-1.5 rounded-md bg-green-50 px-3 text-text-regular text-brand-secondary">
            <CheckCircle className="h-4 w-4" />{r.participation.code?.byParticipant ? 'Marked completed by participant' : 'Marked completed'}
          </span>
        </>
      )
    }
    if (r.state === 'no_show') {
      return (
        <>
          <UndoButton r={r} />
          <span className="flex h-[38px] items-center gap-1.5 rounded-md bg-red-50 px-3 text-text-regular text-red-600"><Close className="h-4 w-4" />Marked as No-show</span>
        </>
      )
    }
    return <><NoShowButton r={r} /><CompleteButton r={r} /></>
  }

  return (
    <div className="overflow-hidden rounded-md border-1 border-stroke-input">
      <table className="w-full table-fixed border-collapse text-left">
        <thead>
          <tr className="border-b-1 border-stroke-input bg-bg-1">
            <Th label="Name" className="w-[16%]" />
            <Th label="Role" className="w-[26%]" />
            <Th label="Score" sortable className={done ? 'w-[18%]' : 'w-[58%]'} {...scoreSort} />
            {done && <Th label="" className="w-[40%]" />}
          </tr>
        </thead>
        <tbody>
          {people.length === 0 && (
            <tr><td colSpan={done ? 4 : 3} className="h-[52px] px-[18px] text-center text-text-regular text-text-subtitle">
              {anyone ? 'No one matches this filter.' : 'No one has booked a seat in this session yet.'}
            </td></tr>
          )}
          {sorted.map((r) => (
            <tr key={r.id} className="border-b-1 border-stroke-input last:border-b-0">
              <td className={`${done ? 'h-[60px]' : 'h-[52px]'} px-[18px] text-text-regular text-text-title`}><PersonName id={r.id}>{r.name}</PersonName></td>
              <td className="px-[18px] text-text-regular text-text-title">{r.role}</td>
              <td className="px-[18px]"><ScoreCell score={r.score} tier={r.tier} /></td>
              {done && <td className="px-[18px]"><span className="flex items-center justify-end gap-3">{actions(r)}</span></td>}
            </tr>
          ))}
        </tbody>
      </table>
      <NoShowModal open={noShow !== null} scope="one" onClose={() => setNoShow(null)}
        name={noShow?.name.split(' ')[0]} full={noShow?.name}
        onConfirm={() => {
          if (noShow) { const res = moveRespondent(study.id, noShow.id, 'no_show'); toast(res.ok ? `${noShow.name} marked as a no-show` : res.why) }
          setNoShow(null)
        }} />
    </div>
  )
}
