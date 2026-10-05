import { useState } from 'react'
import CertificateUnlock from '../../app/CertificateUnlock'
import { useStore } from '../../mock/store'
import { Group, Play, Plays, useBeforeAfter } from './LabBits'

/** C: the certificate being issued. Stamped, not faded. Tap to skip. */
export function CertificateSection() {
  const { user } = useStore()
  const [open, setOpen] = useState(false)
  const ba = useBeforeAfter()
  return (
    <Group letter="C" title="Certificate unlock">
      <p className="text-text-regular text-text-body">Plays the moment an ID check passes. Tap while it plays to skip.</p>
      <Plays><Play onClick={() => setOpen(true)}>Issue the certificate</Play></Plays>
      <Plays>
        <Play onClick={() => { ba.start(false); setOpen(true) }}>Before (PLAYFUL off)</Play>
        <Play onClick={() => { ba.start(true); setOpen(true) }}>After (PLAYFUL on)</Play>
      </Plays>
      <CertificateUnlock email={open ? user.email : null} onClose={() => { setOpen(false); ba.end() }} />
    </Group>
  )
}
