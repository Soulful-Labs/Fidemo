import { useState } from 'react'
import CertificateUnlock from '../../app/CertificateUnlock'
import { useStore } from '../../mock/store'
import { Group, Play, Plays } from './LabBits'

/** C: the certificate being issued. Stamped, not faded. Tap to skip. */
export function CertificateSection() {
  const { user } = useStore()
  const [open, setOpen] = useState(false)
  return (
    <Group letter="C" title="Certificate unlock">
      <p className="text-text-regular text-text-body">Plays the moment an ID check passes. Tap while it plays to skip.</p>
      <Plays><Play onClick={() => setOpen(true)}>Issue the certificate</Play></Plays>
      <CertificateUnlock email={open ? user.email : null} onClose={() => setOpen(false)} />
    </Group>
  )
}
