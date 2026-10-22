import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import NewStudyDialog from '../screens/create/NewStudyDialog'
import { NewStudyCtx, useStartStudy } from '../screens/create/useNewStudy'

/**
 * New Study opens on the screen Create Study was pressed on (22 Oct 2026),
 * not after moving to the study form. Closing it leaves the client where they
 * were; Generate and Fill or Fill from scratch start the study (anything in
 * progress goes to Drafts first) and open its About step.
 */
export function NewStudyHost({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const start = useStartStudy()
  const navigate = useNavigate()
  return (
    <NewStudyCtx.Provider value={() => setOpen(true)}>
      {children}
      <NewStudyDialog open={open} onClose={() => setOpen(false)} onStart={start}
        onDone={() => { setOpen(false); navigate('/studies/create/about') }} />
    </NewStudyCtx.Provider>
  )
}
