import { useState } from 'react'
import type { ReactNode } from 'react'
import AppShell from '../../app/AppShell'
import StudyTypeTag from '../../components/app/StudyTypeTag'
import Button, { IconButton } from '../../components/ui/Button'
import Input, { PasswordInput, SearchInput, Select, TextArea } from '../../components/ui/Input'
import { Checkbox, Chip, OptionTile, Radio, Toggle } from '../../components/ui/controls'
import { BellIcon, DotsIcon, LinkIcon } from '../../components/ui/icons'
import { Modal, SidePanel, SuccessModal } from '../../components/ui/Overlay'
import Table, { Pagination } from '../../components/ui/Table'
import { SegmentedTabs, UnderlineTabs } from '../../components/ui/Tabs'
import Tag, { Avatar, CountBadge } from '../../components/ui/Tag'

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border-1 border-stroke-input bg-bg-0 p-6">
      <h2 className="text-title-s text-text-title">{title}</h2>
      {note && <p className="text-text-regular text-text-body">{note}</p>}
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </section>
  )
}

const ROWS = [
  { id: '1', name: 'About goal-tracking methods', type: 'Video Call', n: '75', on: '30 Jul, 2026' },
  { id: '2', name: 'Share About Your Sleep Cycle', type: 'In-Person', n: '80', on: '15 Jul, 2026' },
]

/**
 * Every primitive in every state, in the real shell, so later turns reuse
 * rather than reinvent. Strings here are the frames' own where a primitive
 * was measured; the section titles are this page's.
 */
export default function KitchenSink() {
  const [seg, setSeg] = useState('review')
  const [tab, setTab] = useState('all')
  const [on, setOn] = useState(true)
  const [check, setCheck] = useState(true)
  const [radio, setRadio] = useState('a')
  const [page, setPage] = useState(1)
  const [sel, setSel] = useState('All Studies')
  const [tile, setTile] = useState('All')
  const [panel, setPanel] = useState(false)
  const [modal, setModal] = useState<null | 'centred' | 'titled' | 'success' | 'success-green'>(null)

  return (
    <AppShell crumbs={[{ label: 'Kitchen Sink' }]} right={<IconButton label="Notifications"><BellIcon className="h-5 w-5" /></IconButton>}>
      <div className="flex flex-col gap-6">
        <Section title="Buttons" note="lg 48, md 38, sm 32; Radius/M">
          {(['primary', 'secondary', 'tertiary', 'danger', 'success'] as const).map((v) => (
            <div key={v} className="flex flex-col gap-2">
              <Button variant={v}>Submit</Button>
              <Button variant={v} size="md">Review</Button>
              <Button variant={v} size="sm">Copy</Button>
              <Button variant={v} disabled>Disabled</Button>
            </div>
          ))}
          <div className="flex gap-2">
            <IconButton label="Copy link"><LinkIcon className="h-5 w-5" /></IconButton>
            <IconButton label="More"><DotsIcon className="h-5 w-5" /></IconButton>
            <IconButton label="Notifications"><BellIcon className="h-5 w-5" /></IconButton>
          </div>
        </Section>

        <Section title="Inputs" note="20px label, 4 gap, 48px box">
          <div className="flex w-[343px] flex-col gap-4">
            <Input label="Email" placeholder="Enter email address" />
            <Input label="Email" defaultValue="peter@focusinsite.com" />
            <Input label="Email" placeholder="Enter email address" error="Enter a valid email address" />
            <PasswordInput label="Password" placeholder="Enter your password" />
          </div>
          <div className="flex w-[343px] flex-col gap-4">
            <SearchInput placeholder="Search studies" />
            <Select value={sel} onChange={setSel} options={['All Studies', 'Video Call', 'Survey']} />
            <Select label="Account Status" value="Active" options={['Active', 'Inactive']} />
            <TextArea label="Message" placeholder="Enter you message in detail" />
          </div>
        </Section>

        <Section title="Toggles, checkboxes, radios">
          <div className="flex flex-col gap-3">
            <Toggle checked={on} onChange={setOn} label="Studies" />
            <Toggle checked={!on} onChange={(v) => setOn(!v)} label="Dashboard" />
            <Toggle checked disabled label="Disabled on" />
            <Toggle checked={false} disabled label="Disabled off" />
          </div>
          <div className="flex flex-col gap-3">
            <Checkbox checked={check} onChange={setCheck} label="Checked" />
            <Checkbox checked={!check} onChange={(v) => setCheck(!v)} label="Unchecked" />
            <Checkbox checked disabled label="Disabled" />
          </div>
          <div className="flex flex-col gap-3">
            <Radio name="ks" checked={radio === 'a'} onChange={() => setRadio('a')} label="Answer A" />
            <Radio name="ks" checked={radio === 'b'} onChange={() => setRadio('b')} label="Answer B" />
            <Radio name="ks2" checked={false} disabled label="Disabled" />
          </div>
        </Section>

        <Section title="Tabs">
          <SegmentedTabs value={seg} onChange={setSeg} items={[{ key: 'review', label: 'To Review' }, { key: 'ongoing', label: 'Ongoing' }, { key: 'completed', label: 'Completed' }]} />
          <UnderlineTabs className="w-full" value={tab} onChange={setTab}
            items={[{ key: 'all', label: 'All', count: 274 }, { key: 'onboarding', label: 'Onboarding', count: 4 }, { key: 'studies', label: 'Studies', count: 264 }, { key: 'support', label: 'Support', count: 3 }, { key: 'manage', label: 'Manage', count: 6 }]} />
        </Section>

        <Section title="Tags, badges, chips, tiles, avatars">
          <Tag tone="success">Verified</Tag>
          <Tag tone="warning">In Review</Tag>
          <Tag tone="danger">Rejected</Tag>
          <Tag tone="neutral">Recruiting</Tag>
          <Tag tone="outline">Healthcare</Tag>
          <Tag tone="info">Video Call</Tag>
          <Tag tone="brand">Profession Verified</Tag>
          <CountBadge>2</CountBadge>
          <CountBadge tone="outline">16</CountBadge>
          <Chip onRemove={() => undefined}>Physician</Chip>
          <Chip onRemove={() => undefined}>Healthcare</Chip>
          <div className="grid w-[428px] grid-cols-3 gap-2">
            {['All', 'Interview', 'Focus Group'].map((t) => <OptionTile key={t} selected={tile === t} onClick={() => setTile(t)}>{t}</OptionTile>)}
          </div>
          <div className="flex items-end gap-3">
            <Avatar name="Peter Devian" src="/img/peter-avatar.png" size={24} />
            <Avatar name="Peter Devian" src="/img/peter-avatar.png" size={40} />
            <Avatar name="Peter Devian" src="/img/peter-avatar.png" size={48} />
            <Avatar name="F" size={64} />
          </div>
        </Section>

        <Section title="Table and pagination" note="52px header on bg-1, 64px rows">
          <Table className="w-full" rows={ROWS} rowKey={(r) => r.id}
            columns={[
              { key: 'name', header: 'Study Name', width: 445, render: (r) => r.name },
              { key: 'type', header: 'Type', width: 200, render: (r) => <Tag tone="info">{r.type}</Tag> },
              { key: 'n', header: 'Participants', width: 140, sortable: true, render: (r) => r.n },
              { key: 'on', header: 'Submitted on', sortable: true, render: (r) => r.on },
            ]} />
          <Pagination page={page} pages={10} onChange={setPage} />
        </Section>

        <Section title="Panels and modals" note="600 side panel, 460 modal">
          <Button variant="tertiary" onClick={() => setPanel(true)}>Side panel</Button>
          <Button variant="tertiary" onClick={() => setModal('centred')}>Centred modal</Button>
          <Button variant="tertiary" onClick={() => setModal('titled')}>Titled modal</Button>
          <Button variant="tertiary" onClick={() => setModal('success')}>Success modal</Button>
          <Button variant="tertiary" onClick={() => setModal('success-green')}>Success modal, green</Button>
        </Section>

        <Section title="Study type tags" note="32 tall; ringed on lists, filled on study screens">
          {(['survey', 'video', 'video-group', 'in-person', 'in-person-group', 'diary'] as const).map((t) => <StudyTypeTag key={t} type={t} />)}
          {(['survey', 'video', 'video-group', 'in-person', 'in-person-group', 'diary'] as const).map((t) => <StudyTypeTag key={t} type={t} filled />)}
        </Section>
      </div>

      <SidePanel open={panel} onClose={() => setPanel(false)} title="Create Ticket"
        footer={<><Button onClick={() => setPanel(false)}>Create and Send</Button><Button variant="secondary" onClick={() => setPanel(false)}>Cancel</Button></>}>
        <div className="flex flex-col gap-4">
          <Input label="Subject" placeholder="Enter subject of the ticket" />
          <Input label="User Email Address" placeholder="Add user email" />
          <TextArea label="Message" placeholder="Enter you message in detail" />
        </div>
      </SidePanel>
      <Modal open={modal === 'centred'} onClose={() => setModal(null)} title="Mark Resolved?"
        footer={<><Button variant="tertiary" onClick={() => setModal(null)}>Cancel</Button><Button onClick={() => setModal(null)}>Mark Resolved</Button></>}>
        <p className="text-body-regular text-text-subtitle">Are you sure you want to mark this ticket as resolved? User won't be able to message further on this ticket.</p>
      </Modal>
      <Modal open={modal === 'titled'} layout="titled" onClose={() => setModal(null)} title="Restrict Maya’s Account"
        footer={<><Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button><Button variant="danger" onClick={() => setModal(null)}>Restrict</Button></>}>
        <p className="text-text-regular text-text-title">This will make Maya&rsquo;s account restricted to participate, withdraw earnings &amp; rewards, for 15 days as for the 1st time.</p>
        <TextArea size="sm" rows={4} label="Restriction Statement*" placeholder="Describe the Restriction reason statement in detail" />
        <div className="flex flex-col gap-2">
          <p className="text-text-regular text-text-title">Enter your account password to confirm this action.</p>
          <PasswordInput size="sm" label="Password" placeholder="Enter password" />
        </div>
      </Modal>
      <SuccessModal open={modal === 'success'} onClose={() => setModal(null)} title="Password has been updated!"
        body="Your new password has been updated with your account which you can use to login from now." action="Go To Login" onAction={() => setModal(null)} />
      <SuccessModal tone="green" open={modal === 'success-green'} onClose={() => setModal(null)} title="This study has been published live!"
        body="It is live on the platform and showing to targeted participants." action="Done! View Details" onAction={() => setModal(null)} />
    </AppShell>
  )
}
