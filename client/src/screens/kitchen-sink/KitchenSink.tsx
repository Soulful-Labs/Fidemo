import { useState } from 'react'
import AppShell from '../../app/AppShell'
import RespondentCard from '../../components/client/RespondentCard'
import type { Respondent } from '../../components/client/RespondentCard'
import StudyCard from '../../components/client/StudyCard'
import { STUDIES } from '../../mock/db'
import StudyTypeTag from '../../components/client/StudyTypeTag'
import TierChip from '../../components/client/TierChip'
import StatTile from '../../components/client/StatTile'
import FilterBar from '../../components/client/FilterBar'
import PageHead, { SectionHead } from '../../components/client/PageHead'
import Button from '../../components/ui/Button'
import Card, { CardHead } from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Popover, { PopoverItem } from '../../components/ui/Popover'
import Progress from '../../components/ui/Progress'
import Select from '../../components/ui/Select'
import SidePanel from '../../components/ui/SidePanel'
import Table from '../../components/ui/Table'
import Tabs from '../../components/ui/Tabs'
import Tag from '../../components/ui/Tag'
import Toggle from '../../components/ui/Toggle'
import { Clock, Edit, Info, MoneyMark, Plus, Search, Trash, TrustMark, VerifiedMark } from '../../components/ui/icons'
import { STUDY_STATUS, STUDY_TYPE } from '../../lib/studyTypes'
import type { StudyStatus, StudyType } from '../../lib/studyTypes'
import Checkbox from '../../components/ui/Checkbox'
import ViewToggle from '../../components/client/ViewToggle'
import { CompletedMenu, DeleteStudyModal, DraftMenu, OngoingMenu, PauseStudyModal, StudyTypeMenu } from '../studies/StudyMenus'
import Section, { Row } from './Section'

const RESPONDENT: Respondent = { id: 'r1', name: 'Ferry L.', role: 'Physiology Therapist, Orthopedic', score: 95, tier: 'platinum', professionVerified: true }
const STUDY = STUDIES[1]
const ROWS = [
  { id: '1', name: 'About goal-tracking methods', type: 'video_call' as StudyType, required: 40, qualified: 20, completed: 0, created: '30 Jul, 2026' },
  { id: '2', name: 'How Do You Make Your Digital Payments Mostly?', type: 'diary' as StudyType, required: 12, qualified: 8, completed: 3, created: '25 Jul, 2026' },
  { id: '3', name: 'Share About Your Sleep Cycle', type: 'in_person' as StudyType, required: 60, qualified: 64, completed: 60, created: '15 Jul, 2026' },
]

/** Every repeating component in the client file, on one page. */
export default function KitchenSink() {
  const [tab, setTab] = useState('overview')
  const [seg, setSeg] = useState('matched')
  const [panel, setPanel] = useState(false)
  const [modal, setModal] = useState(false)
  const [menu, setMenu] = useState(false)
  const [toggle, setToggle] = useState(true)
  const [view, setView] = useState<'table' | 'grid'>('table')
  const [check, setCheck] = useState(true)
  const [studyMenu, setStudyMenu] = useState<string | null>(null)
  const [pause, setPause] = useState(false)

  return (
    <AppShell crumbs={[{ label: 'Kitchen Sink' }]}>
      <div className="mx-auto flex max-w-page flex-col gap-8">
        <PageHead title="Kitchen Sink" sub="Every component the client file repeats, built from the tokens in tailwind.config.ts." />

        <Section title="Buttons">
          <Row label="Variants">
            <Button>Create Study</Button>
            <Button variant="secondary">Invite To Study</Button>
            <Button variant="tertiary">View Profile</Button>
            <Button variant="danger">Delete</Button>
            <Button variant="ghost">Cancel</Button>
          </Row>
          <Row label="With icons, small, disabled">
            <Button leftIcon={<Plus className="h-4 w-4" />}>Create Study</Button>
            <Button size="sm" variant="tertiary">Edit</Button>
            <Button disabled>Continue</Button>
          </Row>
        </Section>

        <Section title="Tags, type tags and tiers">
          <Row label="Study types">
            {(Object.keys(STUDY_TYPE) as StudyType[]).map((t) => <StudyTypeTag key={t} type={t} />)}
          </Row>
          <Row label="Status">
            {(Object.keys(STUDY_STATUS) as StudyStatus[]).map((s) => <Tag key={s} tone={STUDY_STATUS[s].tone}>{STUDY_STATUS[s].label}</Tag>)}
          </Row>
          <Row label="Tiers and marks">
            <TierChip tier="silver" /><TierChip tier="gold" /><TierChip tier="platinum" />
            <Tag tone="neutral" icon={<VerifiedMark className="h-4 w-4 text-brand-secondary" />}>Profession-Verified</Tag>
            <Tag tone="neutral" icon={<Clock className="h-4 w-4" />}>1 hour</Tag>
            <Tag tone="neutral">Finance</Tag>
          </Row>
        </Section>

        <Section title="Tabs and filters">
          <Row label="Underline tabs, as on a study">
            <Tabs value={tab} onChange={setTab} className="w-full"
              items={[{ key: 'overview', label: 'Overview' }, { key: 'manage', label: 'Manage Study' }, { key: 'matched', label: 'Matched' }, { key: 'recruited', label: 'Recruited' }, { key: 'results', label: 'Results' }, { key: 'pay', label: 'Pay' }]} />
          </Row>
          <Row label="Segmented, as on Matched / Invited">
            <Tabs variant="segmented" value={seg} onChange={setSeg} items={[{ key: 'matched', label: 'Matched' }, { key: 'invited', label: 'Invited' }]} />
          </Row>
          <Row label="Filter bar">
            <FilterBar className="w-full"
              left={<Tabs variant="segmented" value="ongoing" items={[{ key: 'ongoing', label: 'Ongoing' }, { key: 'drafts', label: 'Drafts' }, { key: 'completed', label: 'Completed' }]} />}
              right={<><Select value="Sort: Score" /><Select value="Tier: All" /><Select value="Location: All" /></>} />
          </Row>
        </Section>

        <Section title="Fields">
          <Row label="Input, textarea, search, toggle">
            <div className="w-72"><Input label="Title of your study" placeholder="Enter title of your study" /></div>
            <div className="w-72"><Input label="Tell us about your study" multiline placeholder="Enter study description" /></div>
            <div className="w-72"><Input placeholder="Search" leftIcon={<Search className="h-5 w-5 text-text-body" />} /></div>
            <label className="flex items-center gap-3 text-text-regular text-text-title">
              <Toggle checked={toggle} onChange={setToggle} label="Group session" /> Group session
            </label>
          </Row>
        </Section>

        <Section title="Stat tiles and progress">
          <div className="grid w-full grid-cols-5 gap-4">
            <StatTile tint="yellow" label="Ongoing Studies" value="4" icon={<Clock className="h-5 w-5" />} />
            <StatTile tint="none" label="Completed Studies" value="72" icon={<VerifiedMark className="h-5 w-5" />} />
            <StatTile tint="green" label="Total Respondents Hired" value="1,786" icon={<TrustMark className="h-5 w-5 text-brand-secondary" />} />
            <StatTile tint="purple" label="Avg. Trust Score" value="91" icon={<TrustMark className="h-5 w-5 text-purple-600" />} />
            <StatTile tint="blue" label="Avg. Session Incentive" value="$124.8" icon={<MoneyMark className="h-5 w-5 text-blue-600" />} />
          </div>
          <Row label="Progress">
            <div className="w-72"><Progress value={66} /></div>
            <div className="w-72"><Progress max={12} segments={[{ value: 3, tone: 'green' }, { value: 6, tone: 'yellow' }, { value: 3, tone: 'grey' }]} /></div>
          </Row>
        </Section>

        <Section title="Cards">
          <div className="grid w-full grid-cols-3 gap-4">
            <StudyCard study={STUDY} />
            <RespondentCard respondent={RESPONDENT} saveable />
            <RespondentCard respondent={{ ...RESPONDENT, id: 'r2', name: 'Sophie A.', role: 'Clinical Psychologist', score: 89, tier: 'gold' }}
              actions={<><Button variant="secondary" className="flex-1">Invite To Study</Button><Button variant="tertiary" className="flex-1">View Profile</Button></>} />
          </div>
          <Card>
            <CardHead icon={<Info className="h-5 w-5" />} title="About" action={<Button size="sm" variant="secondary" leftIcon={<Edit className="h-4 w-4" />}>Edit</Button>} />
            <div className="flex flex-col gap-3 text-text-regular">
              <div><span className="text-text-body">Title</span><p className="text-text-title">How do you make your digital payments mostly?</p></div>
              <div><span className="text-text-body">Study Time</span><p className="text-text-title">1 hour</p></div>
            </div>
          </Card>
        </Section>

        <Section title="Table">
          <Table rows={ROWS} onRowClick={() => undefined}
            columns={[
              { key: 'name', header: 'Study Name', sortable: true, render: (r) => r.name },
              { key: 'type', header: 'Type', render: (r) => <StudyTypeTag type={r.type} /> },
              { key: 'required', header: 'Required', sortable: true, render: (r) => r.required },
              { key: 'qualified', header: 'Qualified', sortable: true, render: (r) => r.qualified },
              { key: 'completed', header: 'Completed', sortable: true, render: (r) => r.completed },
              { key: 'created', header: 'Created', sortable: true, render: (r) => r.created },
            ]} />
        </Section>

        <Section title="Side panel, modal and menu">
          <Row label="Open">
            <Button variant="tertiary" onClick={() => setPanel(true)}>Respondent Profile Details (600)</Button>
            <Button variant="tertiary" onClick={() => setModal(true)}>Delete Study? (460)</Button>
            <span className="relative">
              <Button variant="tertiary" onClick={() => setMenu((m) => !m)}>Study options</Button>
              <Popover open={menu} onClose={() => setMenu(false)}>
                <PopoverItem icon={<Edit className="h-4 w-4" />}>Edit Study</PopoverItem>
                <PopoverItem icon={<Clock className="h-4 w-4" />}>Pause Study</PopoverItem>
                <PopoverItem icon={<Trash className="h-4 w-4" />} danger>Delete Study</PopoverItem>
              </Popover>
            </span>
          </Row>
          <SectionHead title="Sections have a heading row too" action={<Button size="sm" variant="ghost">View All</Button>} />
        </Section>

        <Section title="Studies menus and dialogs" node="1518:90959, 1726:57600, 1726:77013, 1518:90965">
          <Row label="Row menus">
            <span className="relative"><Button variant="tertiary" onClick={() => setStudyMenu(studyMenu === 'ongoing' ? null : 'ongoing')}>Ongoing</Button>
              <OngoingMenu open={studyMenu === 'ongoing'} onClose={() => setStudyMenu(null)} onPause={() => { setStudyMenu(null); setPause(true) }} onCopy={() => setStudyMenu(null)} /></span>
            <span className="relative"><Button variant="tertiary" onClick={() => setStudyMenu(studyMenu === 'draft' ? null : 'draft')}>Drafts</Button>
              <DraftMenu open={studyMenu === 'draft'} onClose={() => setStudyMenu(null)} onDelete={() => { setStudyMenu(null); setModal(true) }} /></span>
            <span className="relative"><Button variant="tertiary" onClick={() => setStudyMenu(studyMenu === 'completed' ? null : 'completed')}>Completed</Button>
              <CompletedMenu open={studyMenu === 'completed'} onClose={() => setStudyMenu(null)} onCopy={() => setStudyMenu(null)} /></span>
            <span className="relative"><Button variant="tertiary" onClick={() => setStudyMenu(studyMenu === 'type' ? null : 'type')}>Study Type</Button>
              <StudyTypeMenu open={studyMenu === 'type'} onClose={() => setStudyMenu(null)} value={[]} onChange={() => undefined} /></span>
          </Row>
          <Row label="Checkbox, view toggle, pause dialog">
            <span className="w-48 rounded-sm border-1 border-stroke-input"><Checkbox checked={check} label="All" onChange={() => setCheck((c) => !c)} /></span>
            <ViewToggle view={view} onChange={setView} />
            <Button variant="tertiary" onClick={() => setPause(true)}>Pause Study Participation? (460)</Button>
          </Row>
        </Section>

        <PauseStudyModal open={pause} onClose={() => setPause(false)} onConfirm={() => setPause(false)} />

        <SidePanel open={panel} onClose={() => setPanel(false)} title="Ferry L."
          footer={<div className="flex gap-3"><Button className="flex-1">Invite To Study</Button><Button variant="secondary" className="flex-1">Save To Micropanel</Button></div>}>
          <RespondentCard respondent={RESPONDENT} />
        </SidePanel>

        <DeleteStudyModal open={modal} onClose={() => setModal(false)} onConfirm={() => setModal(false)} name="About goal-tracking methods" />
      </div>
    </AppShell>
  )
}
