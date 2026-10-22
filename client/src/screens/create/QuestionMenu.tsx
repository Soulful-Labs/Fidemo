import { useEffect, useRef, useState } from 'react'
import { MoreVertical } from '../../components/ui/icons'
import Toggle from '../../components/ui/Toggle'
import { cn } from '../../lib/cn'
import type { Question } from '../../mock/createStore'

/** What a question's menu can do. Move up is absent on the first question, Move down on the last. */
export interface QuestionActions {
  onRequired: (required: boolean) => void
  onUp?: () => void
  onDown?: () => void
  onAddBelow: () => void
  onDelete: () => void
}

/**
 * The actions for question `i` of `list`, among those `same` keeps (a diary
 * question moves within its own day). Every change goes back through `write`.
 */
export function listActions(list: Question[], i: number, write: (next: Question[]) => void, fresh: () => Question, same: (q: Question) => boolean = () => true): QuestionActions {
  const q = list[i]!
  const peers = list.map((x, k) => [x, k] as const).filter(([x]) => same(x)).map(([, k]) => k)
  const at = peers.indexOf(i)
  const swap = (k: number) => { const next = [...list]; [next[i], next[k]] = [next[k]!, next[i]!]; write(next) }
  return {
    onRequired: (required) => write(list.map((x) => (x.id === q.id ? { ...x, required: required ? undefined : false } : x))),
    onUp: at > 0 ? () => swap(peers[at - 1]!) : undefined,
    onDown: at >= 0 && at < peers.length - 1 ? () => swap(peers[at + 1]!) : undefined,
    onAddBelow: () => write([...list.slice(0, i + 1), fresh(), ...list.slice(i + 1)]),
    onDelete: () => write(list.filter((x) => x.id !== q.id)),
  }
}

/**
 * The question's three-dot menu (22 Oct 2026; no frame draws it yet): Required
 * as a toggle, Move up, Move down, Add question below and Delete, in that order.
 * Delete asks first (`onAskDelete`), as the bin it replaces did.
 */
export default function QuestionMenu({ label, required, actions, onAskDelete }: {
  label: string; required: boolean; actions: QuestionActions; onAskDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!open) return
    const away = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', away); document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', esc) }
  }, [open])
  const item = (text: string, run: (() => void) | undefined, danger?: boolean) => (
    <button type="button" role="menuitem" disabled={!run} onClick={() => { setOpen(false); run?.() }}
      className={cn('flex h-[38px] items-center rounded-sm px-3 text-left text-text-regular', !run ? 'cursor-not-allowed text-text-disabled' : danger ? 'text-red-600 hover:bg-bg-1' : 'text-text-title hover:bg-bg-1')}>
      {text}
    </button>
  )
  return (
    <span ref={box} className="relative flex shrink-0">
      <button type="button" aria-label={`Options for ${label}`} aria-haspopup="menu" aria-expanded={open} title="Question options" onClick={() => setOpen((o) => !o)}
        className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-sm border-1 border-stroke-input bg-bg text-text-subtitle hover:text-text-title">
        <MoreVertical className="h-5 w-5" />
      </button>
      {open && (
        <span role="menu" aria-label={`${label} options`} className="absolute right-0 top-[calc(100%+4px)] z-30 flex w-[200px] flex-col rounded-md border-1 border-stroke-input bg-bg-0 p-1 shadow-menu">
          <span className="flex h-[38px] items-center justify-between px-3 text-text-regular text-text-title">
            Required
            <Toggle checked={required} label={`${label} required`} onChange={(v) => actions.onRequired(v)} />
          </span>
          {item('Move up', actions.onUp)}
          {item('Move down', actions.onDown)}
          {item('Add question below', actions.onAddBelow)}
          {item('Delete', () => onAskDelete(), true)}
        </span>
      )}
    </span>
  )
}
