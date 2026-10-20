import { counts } from '@shared/derive'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CompletedMenu, OngoingMenu, PauseStudyModal, RepublishModal, StopCompleteModal } from '../../screens/studies/StudyMenus'
import { copyText } from '../../lib/copy'
import { useStudies } from '../../platform'
import type { ClientStudy } from '../../platform'
import { useToast } from '../ui/Toast'

type Dialog = null | 'pause' | 'stop' | 'republish'

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
  const { moveStudy, duplicateStudy } = useStudies()
  const [dialog, setDialog] = useState<Dialog>(null)
  const close = () => setDialog(null)
  const left = study ? Math.max(0, study.required - counts(study).completed) : 0

  const act = {
    copy: async () => { if (study) toast(await copyText(study.shareLink ?? '') ? 'Link copied' : 'Could not reach the clipboard') },
    pause: () => setDialog('pause'),
    stop: () => setDialog('stop'),
    resume: () => setDialog('republish'),
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
        if (res.ok) nav(`/studies/${study.id}`)
      }} />
      <RepublishModal open={dialog === 'republish'} onClose={close} onConfirm={() => {
        close(); const res = moveStudy(study.id, 'recruiting')
        toast(res.ok ? 'Study published again' : res.why)
        if (res.ok) nav(`/studies/${study.id}`)
      }} />
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
