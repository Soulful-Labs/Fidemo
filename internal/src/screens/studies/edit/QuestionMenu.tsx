import { useEffect, useRef, useState } from 'react'
import { IconButton } from '../../../components/ui/Button'
import { Toggle } from '../../../components/ui/controls'
import { DotsIcon } from '../../../components/ui/icons'
import { cn } from '../../../lib/cn'

/**
 * A question's three-dot menu in Edit Study (22 Oct 2026; no frame draws it
 * yet, as in the client): Required as a toggle, Move up, Move down, Add
 * question below and Delete, in that order. Move up is off on the first
 * question, Move down on the last.
 */
export default function QuestionMenu({ label, required, onRequired, onUp, onDown, onAddBelow, onDelete }: {
  label: string; required: boolean; onRequired: (v: boolean) => void
  onUp?: () => void; onDown?: () => void; onAddBelow: () => void; onDelete: () => void
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
      className={cn('flex h-[38px] items-center rounded-sm px-3 text-left text-text-regular', !run ? 'cursor-not-allowed text-text-disabled' : danger ? 'text-state-danger hover:bg-bg-1' : 'text-text-title hover:bg-bg-1')}>
      {text}
    </button>
  )
  return (
    <span ref={box} className="relative flex shrink-0">
      <IconButton label={`Options for ${label}`} size={32} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}><DotsIcon className="h-4 w-4" /></IconButton>
      {open && (
        <span role="menu" aria-label={`${label} options`} className="absolute right-0 top-[calc(100%+4px)] z-30 flex w-[200px] flex-col rounded-md border-1 border-stroke-input bg-bg-0 p-1 shadow-menu">
          <span className="flex h-[38px] items-center justify-between px-3 text-text-regular text-text-title">
            Required
            <Toggle checked={required} onChange={onRequired} />
          </span>
          {item('Move up', onUp)}
          {item('Move down', onDown)}
          {item('Add question below', onAddBelow)}
          {item('Delete', onDelete, true)}
        </span>
      )}
    </span>
  )
}
