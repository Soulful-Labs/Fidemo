import { useState } from 'react'
import Pill from '../../components/app/Pill'
import Button, { IconButton } from '../../components/ui/Button'
import { Chip } from '../../components/ui/controls'
import { Select } from '../../components/ui/Input'
import type { AddOnParameter, FeeAddOn } from '@shared/types'
import { PARAMETERS, PARAMETER_LABEL, addOnPills, parameterOf } from '../../mock/pricing'
import { Edit, Pencil } from './parts'

const Trash = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l.800 11a2 2 0 0 0 2 2h4.400a2 2 0 0 0 2-2L17 7M10.500 11v5M13.500 11v5" /></svg>
)

/** The Create Add-on card (2056:192920), also used to edit one: an amount and the parameters it is charged for. */
function AddOnForm({ title, start, onDone, onCancel }: { title: string; start: FeeAddOn; onDone: (a: FeeAddOn) => void; onCancel: () => void }) {
  const [amount, setAmount] = useState(String(start.amount))
  const [on, setOn] = useState<AddOnParameter[]>(start.on)
  const value = Number(amount.replace(/[$,\s+]/g, ''))
  const why = !Number.isFinite(value) || value < 0 ? 'Enter an amount of 0 or more' : on.length === 0 ? 'Choose at least one parameter' : ''
  return (
    <div className="rounded-md border-1 border-stroke-1 bg-bg-0 p-4">
      <div className="flex items-center justify-between pb-3"><h4 className="text-title-s text-text-title">{title}</h4>
        <div className="flex gap-3"><Button size="md" className="px-3" disabled={!!why} onClick={() => onDone({ ...start, amount: value, on })}>{title.startsWith('Edit') ? 'Save' : 'Create'}</Button><Button variant="secondary" size="md" className="px-3" onClick={onCancel}>Cancel</Button></div></div>
      <div className="grid grid-cols-2 gap-5 [&_label]:text-text-regular [&_label]:text-text-subtitle">
        <Edit plain label="Add-on Amount" value={amount} unit="USD" onValue={setAmount} />
        <div><Select label="For Parameter" placeholder="Choose parameters to add" options={PARAMETERS.filter((p) => !on.includes(parameterOf(p)!))} onChange={(v) => { const k = parameterOf(v); if (k) setOn((c) => (c.includes(k) ? c : [...c, k])) }} />
          <div className="flex flex-wrap gap-2 pt-2">{on.map((k) => <Chip key={k} onRemove={() => setOn((all) => all.filter((x) => x !== k))}>{PARAMETER_LABEL[k]}</Chip>)}</div></div>
      </div>
      {why && <p className="pt-2 text-text-regular text-text-subtitle">{why}</p>}
    </div>
  )
}

/**
 * The recruitment add-ons on Edit Clients Fees (2056:192920): each row's edit
 * button opens it in the add-on form, its delete button removes it, and Create
 * Add-on adds one (22 Oct 2026). Nothing is saved until Save Changes.
 */
export function AddOns({ addOns, onChange }: { addOns: FeeAddOn[]; onChange: (a: FeeAddOn[]) => void }) {
  const [editing, setEditing] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  return (
    <>
      {addOns.map((a, i) => editing === a.id ? (
        <AddOnForm key={a.id} title={`Edit Add-on ${i + 1}`} start={a} onCancel={() => setEditing(null)} onDone={(next) => { onChange(addOns.map((x) => (x.id === a.id ? next : x))); setEditing(null) }} />
      ) : (
        <div key={a.id} className="flex items-center justify-between rounded-md border-1 border-stroke-1 px-3 py-2.5">
          <div><p className="text-body-regular text-text-subtitle">Add-on {i + 1}</p>
            <p className="flex items-center gap-2 pt-1.5 text-text-regular text-text-subtitle"><span className="text-title-s text-text-title">+${a.amount}</span><span aria-hidden="true">•</span>For{addOnPills(a).map(([l, v]) => <Pill key={v} label={l} className="h-7 px-2.5">{v}</Pill>)}</p></div>
          <div className="flex gap-3">
            <IconButton label={`Edit Add-on ${i + 1}`} className="h-12 w-12 rounded-md" onClick={() => { setCreating(false); setEditing(a.id) }}><Pencil /></IconButton>
            <IconButton label={`Delete Add-on ${i + 1}`} className="h-12 w-12 rounded-md" onClick={() => onChange(addOns.filter((x) => x.id !== a.id))}><Trash /></IconButton>
          </div>
        </div>
      ))}
      {addOns.length === 0 && <p className="text-text-regular text-text-subtitle">No add-ons: every study is charged the base recruitment fee.</p>}
      {!creating && <Button variant="secondary" size="md" className="self-start px-3" onClick={() => { setEditing(null); setCreating(true) }}>+ Create Add-on</Button>}
      {creating && <AddOnForm title="Create Add-on" start={{ id: `ao-${Date.now().toString(36)}`, amount: 0, on: [] }} onCancel={() => setCreating(false)} onDone={(a) => { onChange([...addOns, a]); setCreating(false) }} />}
    </>
  )
}
