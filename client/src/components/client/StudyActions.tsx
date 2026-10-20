import { counts } from '@shared/derive'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CompletedMenu, OngoingMenu, PauseStudyModal, RepublishModal, StopCompleteModal } from '../../screens/studies/StudyMenus'
import { copyText } from '../../lib/copy'
import { useStudies } from '../../platform'
import type { ClientStudy } from '../../platform'
import { useToast } from '../ui/Toast'
import Button from '../ui/Button'
import { UsersIcon } from '../ui/icons'
import { DoneModal } from './ReportParticipant'

type Dialog = null | 'pause' | 'stop' | 'republish' | 'recruit' | 'republished'

/**
 * The common study actions (19 Oct 2026, every study type): Copy Study Link,
 * Pause Study, Stop-complete Study and Duplicate to Drafts, each going through
 * the store and its own confirmation. The study header, the Studies rows and
 * the paused banner all use this, so the same action reads and behaves the
 * same everywhere.
 */
export function useStudyActions(study: ClientStudy | null) {
  const nav = useNavigate()
  const toast = useToast()
  const { moveStudy, duplicateStudy, recruitMore } = useStudies()
  const [dialog, setDialog] = useState<Dialog>(null)
  const close = () => setDialog(null)
  const left = study ? Math.max(0, study.required - counts(study).completed) : 0

  const act = {
    copy: async () => { if (study) toast(await copyText(study.shareLink ?? '') ? 'Link copied' : 'Could not reach the clipboard') },
    pause: () => setDialog('pause'),
    stop: () => setDialog('stop'),
    resume: () => setDialog('republish'),
    /** The target is met: keep recruiting (the same Re-Publish confirmation, as its note describes). */
    recruitMore: () => setDialog('recruit'),
    duplicate: () => {
      if (!study) return
      const res = duplicateStudy(study.id)
      toast(res.ok ? `Copied to Drafts as “${study.title} (copy)”` : res.why ?? 'Could not copy that study')
      if (res.ok) nav('/studies/drafts')
    },
  }

  const dialogs = study && (
    <>
      <PauseStudyModal open={dialog === 'pause'} onClose={close} onConfirm={() => {
        close(); const res = moveStudy(study.id, 'paused')
        if (res.ok) nav(`/studies/${study.id}/paused`); else toast(res.why)
      }} />
      <StopCompleteModal open={dialog === 'stop'} left={left} onClose={close} onConfirm={() => {
        close(); const res = moveStudy(study.id, 'completed')
        toast(res.ok ? `${study.title} marked completed` : res.why)
        // The balance falls due on stopping, and Pay is where it is shown and paid (1645:132608).
        if (res.ok) nav(`/studies/${study.id}/pay`)
      }} />
      <RepublishModal open={dialog === 'republish'} onClose={close} onConfirm={() => {
        const res = moveStudy(study.id, 'recruiting')
        if (res.ok) setDialog('republished'); else { close(); toast(res.why) }
      }} />
      <RepublishModal open={dialog === 'recruit'} onClose={close} onConfirm={() => {
        const res = recruitMore(study.id)
        if (res.ok) setDialog('republished'); else { close(); toast(res.why) }
      }} />
      <DoneModal open={dialog === 'republished'} onClose={() => { close(); nav(`/studies/${study.id}`) }} title="Study has been re-published!"
        body="Your study has been published live for participants and you will keep receiving the participants until you stop the study or it expires by validity." />
    </>
  )
  return { act, dialogs }
}

/**
 * The study's menu as the frames draw it. A running study gets Ongoing Study
 * options; a paused one the same rows with Resume Study where Pause is (not
 * drawn); a finished one the completed menu. The drawn Edit row is left out:
 * the client cannot edit a live study.
 */
export function StudyMenu({ study, open, onClose, act }: {
  study: ClientStudy; open: boolean; onClose: () => void; act: ReturnType<typeof useStudyActions>['act']
}) {
  const run = (f: () => void) => () => { onClose(); f() }
  if (study.state === 'completed' || study.state === 'cancelled') {
    return <CompletedMenu open={open} onClose={onClose} onCopy={run(act.copy)} onDuplicate={run(act.duplicate)} />
  }
  return (
    <OngoingMenu open={open} onClose={onClose} paused={study.state === 'paused'}
      onPause={run(study.state === 'paused' ? act.resume : act.pause)} onCopy={run(act.copy)}
      onComplete={run(act.stop)} onDuplicate={run(act.duplicate)} />
  )
}

/**
 * "Congrats!" (1645:132015, 1645:132108): a running study has met its target.
 * Recruit more keeps it live past the target; Mark Completed stops it, which
 * makes the balance due. Drawn on Recruited and Results; shown on every tab.
 */
export function TargetBanner({ study }: { study: ClientStudy }) {
  const { act, dialogs } = useStudyActions(study)
  return (
    <div className="flex items-center justify-between gap-6 rounded-lg border-1 border-yellow-300/70 bg-yellow-40 px-4 py-[13px]">
      <div className="flex flex-col gap-1">
        <p className="text-body-medium text-text-title"><span className="text-brand-secondary">Congrats!</span> Your {study.required} required participants are fulfilled and completed now!</p>
        <p className="text-text-regular text-text-subtitle">You have received the target of {study.required} participants results. Complete the study by a payment or get more participants if needed.</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Button variant="secondary" size="none" className="h-9 px-3" leftIcon={<UsersIcon className="h-4 w-4" />} onClick={act.recruitMore}>Recruit more</Button>
        <Button size="none" className="h-9 px-3" onClick={act.stop}>Mark Completed</Button>
      </div>
      {dialogs}
    </div>
  )
}
