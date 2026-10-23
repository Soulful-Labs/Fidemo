import { useEffect, useState } from 'react'
import type { StudyGroup } from '@shared/types'
import { canGroup } from '@shared/lifecycle'
import Button from '../../components/ui/Button'
import CheckPicker from '../../components/ui/CheckPicker'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import SidePanel from '../../components/ui/SidePanel'
import { useToast } from '../../components/ui/Toast'
import { useStudies } from '../../platform'

/**
 * Create Group and Edit Group (23 Oct 2026): a name, and optionally the
 * studies to put in it (Select Study). Edit adds Ungroup, which asks first
 * (Remove and ungroup the studies?). Every rule is shared/store.ts: a name of
 * its own, submitted studies only, one group per study.
 */
export function GroupDialog({ open, onClose, group }: { open: boolean; onClose: () => void; group?: StudyGroup }) {
  const toast = useToast()
  const { studies, createGroup, updateGroup, ungroup } = useStudies()
  const [name, setName] = useState('')
  const [picked, setPicked] = useState<string[]>([])
  const [error, setError] = useState('')
  const [asking, setAsking] = useState(false)
  useEffect(() => { if (open) { setName(group?.name ?? ''); setPicked(group?.studyIds ?? []); setError('') } }, [open, group])
  const options = studies.filter((s) => canGroup(s.state)).map((s) => ({ value: s.id, label: s.title }))
  const submit = () => {
    const res = group ? updateGroup(group.id, name, picked) : createGroup(name, picked)
    if (!res.ok) { setError(res.why); return }
    toast(group ? 'Group saved' : `${name.trim()} created`)
    onClose()
  }
  return (
    <>
      <SidePanel open={open && !asking} onClose={onClose} title={group ? 'Edit Group' : 'Create Group'} headerClassName="h-14"
        bodyClassName="flex flex-col gap-4 px-4 py-4"
        footer={<Button fullWidth size="none" className="h-12 text-body-medium" onClick={submit}>Submit</Button>}>
        <label className="flex flex-col gap-2">
          <span className="text-text-regular text-text-subtitle">Group Name</span>
          <Input value={name} onChange={(e) => { setName(e.target.value); setError('') }} placeholder="Enter the name of your group" aria-label="Group Name" />
        </label>
        <div className="flex flex-col gap-2">
          <span className="text-text-regular text-text-subtitle">Select Studies To Add <span className="text-label">(optional)</span></span>
          <CheckPicker label="Select studies to add" options={options} picked={picked} onChange={setPicked}
            value={picked.length === 0 ? 'Select studies to add' : `${picked.length} stud${picked.length === 1 ? 'y' : 'ies'} selected`} />
        </div>
        {error && <p role="alert" className="text-text-regular text-red-600">{error}</p>}
        {group && <Button variant="tertiary" size="none" className="h-12 self-start px-4 text-body-medium" onClick={() => setAsking(true)}>Ungroup</Button>}
      </SidePanel>
      <Modal open={asking} onClose={() => setAsking(false)} title="Remove and ungroup the studies?"
        body="The studies of the group will be ungrouped to others and this group will be removed."
        footer={
          <>
            <Button variant="tertiary" className="flex-1" onClick={() => setAsking(false)}>Cancel</Button>
            <Button className="flex-1" onClick={() => {
              setAsking(false)
              if (!group) return
              const res = ungroup(group.id)
              toast(res.ok ? `${group.name} ungrouped` : res.why)
              onClose()
            }}>Ungroup</Button>
          </>
        } />
    </>
  )
}
