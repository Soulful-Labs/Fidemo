import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EmptyState from '../../components/app/EmptyState'
import BottomSheet from '../../components/ui/BottomSheet'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import TabBar from '../../components/ui/TabBar'
import Toggle from '../../components/ui/Toggle'
import { useStore } from '../../mock/store'
import { Group, Play, Plays, Stage } from './LabBits'

/** J: the small stuff. Every control here is the app's own component, with its motion. */
export function SmallStuffSection() {
  const navigate = useNavigate()
  const { toast } = useStore()
  const [modal, setModal] = useState(false)
  const [sheet, setSheet] = useState(false)
  const [locked, setLocked] = useState(true)
  const [on, setOn] = useState(false)
  const [tab, setTab] = useState('a')

  return (
    <Group letter="J" title="The small stuff">
      <Plays>
        <Play onClick={() => setModal(true)}>Modal</Play>
        <Play onClick={() => setSheet(true)}>Sheet</Play>
        <Play onClick={() => toast('Saved')}>Toast</Play>
        <Play onClick={() => navigate('/studies')}>Route forward</Play>
      </Plays>
      <Stage>
        <Button fullWidth disabled={locked} onBlocked={() => toast('Locked: tap Unlock first')} onClick={() => toast('Unlocked and working')}>A locked button</Button>
        <Plays><Play onClick={() => setLocked((l) => !l)}>{locked ? 'Unlock it' : 'Lock it again'}</Play></Plays>
        <Toggle checked={on} onChange={setOn} label="A toggle" description="The knob slides by transform." />
        <TabBar items={[{ key: 'a', label: 'Explore' }, { key: 'b', label: 'My Studies' }, { key: 'c', label: 'Saved' }]} value={tab} onChange={setTab} />
      </Stage>
      <EmptyState title="Nothing saved yet" body="An empty state breathes gently while it waits." />
      <Modal open={modal} onClose={() => setModal(false)} title="A modal" footer={<Button fullWidth onClick={() => setModal(false)}>Got It!</Button>}>
        It springs in from slightly small, and plays out with its content on close.
      </Modal>
      <BottomSheet open={sheet} onClose={() => setSheet(false)} title="A sheet" footer={<Button fullWidth onClick={() => setSheet(false)}>Got It!</Button>}>
        It rises on a spring and sinks away on close.
      </BottomSheet>
    </Group>
  )
}
