import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import { SearchInput, Select } from '../../components/ui/Input'
import { DownloadIcon } from '../../components/ui/icons'
import Table, { Pagination } from '../../components/ui/Table'
import { cn } from '../../lib/cn'
import { ACTIVITIES, FILTER_MODULES, FILTER_PEOPLE, FILTER_PERIOD, SUB_ADMINS } from '../../mock/team'

/**
 * Sub-Admin (2060:197775, named "Pricing & Rewards" in the file): the list of
 * sub-admins ("5 sub-admin members" over six rows) with each one's module
 * access as tags and an Active / Inactive status, and "Add New Sub-Admin";
 * then "Activities / Details of activities logs of sub-admins": a search,
 * three filters (module, person, period), Export, and a global log of
 * Activity, Module Path, Date and Action By.
 */
export default function SubAdmins() {
  const navigate = useNavigate()
  const [f, setF] = useState([FILTER_MODULES[0]!, FILTER_PEOPLE[0]!, FILTER_PERIOD[0]!])
  const pick = (i: number) => (v: string) => setF((all) => all.map((x, j) => (j === i ? v : x)))
  return (
    <AppShell className="pb-8" crumbs={[{ label: 'Sub-Admin' }]}>
      <div className="flex items-start justify-between pb-4">
        <div><h1 className="text-title-s leading-[25px] text-text-title">Sub-Admins List</h1><p className="pt-1 text-text-regular leading-5 text-text-subtitle">5 sub-admin members</p></div>
        <Button className="px-5" onClick={() => navigate('/sub-admin/new')}>+ &nbsp;Add New Sub-Admin</Button>
      </div>
      <Table rowHeight={52} rows={SUB_ADMINS} rowKey={(r) => r.id} onRowClick={(r) => navigate(`/sub-admin/${r.id}`)} columns={[
        { key: 'n', header: 'Name', width: 190, sortable: true, render: (r) => <span className="flex items-center gap-2"><img src={r.photo} alt="" className="h-6 w-6 rounded-full object-cover" />{r.name}</span> },
        { key: 'r', header: 'Role', width: 200, render: (r) => r.role }, { key: 'e', header: 'Email', width: 300, render: (r) => r.email },
        { key: 'a', header: 'Access', width: '1fr', render: (r) => <span className="flex gap-2">{r.access.map((a) => <span key={a} className="flex h-7 items-center rounded-full border-1 border-stroke-3 px-2.5 text-text-subtitle">{a}</span>)}</span> },
        { key: 's', header: 'Status', width: 110, render: (r) => <span className={cn('inline-flex h-7 items-center rounded-full px-2.5', r.active ? 'bg-state-successBg text-state-success' : 'bg-yellow-50 text-brand-primary')}>{r.active ? 'Active' : 'Inactive'}</span> },
      ]} />
      <div className="flex items-start justify-between pb-4 pt-6">
        <div><h2 className="text-title-s leading-[25px] text-text-title">Activities</h2><p className="pt-1 text-text-regular leading-5 text-text-subtitle">Details of activities logs of sub-admins</p></div>
        <Button variant="tertiary" className="px-5" leftIcon={<DownloadIcon className="h-5 w-5" />}>Export</Button>
      </div>
      <div className="flex gap-3 pb-3">
        <SearchInput size="sm" placeholder="Search activities..." />
        <Select size="sm" className="w-[180px] shrink-0" value={f[0]} onChange={pick(0)} options={FILTER_MODULES} />
        <Select size="sm" className="w-[200px] shrink-0" value={f[1]} onChange={pick(1)} options={[...new Set(FILTER_PEOPLE)]} />
        <Select size="sm" className="w-[180px] shrink-0" value={f[2]} onChange={pick(2)} options={FILTER_PERIOD} />
      </div>
      <Table rowHeight={66} rows={ACTIVITIES} rowKey={(r) => r.id} columns={[
        { key: 'w', header: 'Activity', width: '1fr', render: (r) => r.what }, { key: 'p', header: 'Module Path', width: 240, className: 'whitespace-nowrap', render: (r) => r.path },
        { key: 'd', header: 'Date', width: 170, className: 'whitespace-nowrap', render: (r) => r.when },
        { key: 'b', header: 'Action By', width: 240, render: (r) => <span className="flex items-center gap-2"><img src={r.photo} alt="" className="h-8 w-8 rounded-full object-cover" /><span><span className="block">{r.who}</span><span className="block text-text-subtitle">{r.role}</span></span></span> },
      ]} />
      <div className="pt-4"><Pagination page={1} pages={10} /></div>
    </AppShell>
  )
}
