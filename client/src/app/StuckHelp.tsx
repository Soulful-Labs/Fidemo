import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/** The two people and a speech bubble, in the brand green (Stuck_ Need Help_, 19 Oct 2026). */
const HELP = (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true" className="shrink-0 text-brand-secondary">
    <circle cx="8" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2.5 20.5c0-3 2.5-4.8 5.5-4.8s5.5 1.8 5.5 4.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M14 3.5h6.5a1 1 0 0 1 1 1V9a1 1 0 0 1-1 1H17l-2.5 2V10H14a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M15.8 6.8h.01M17.8 6.8h.01M19.8 6.8h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

/**
 * Stuck? Need Help? (19 Oct 2026, Sidebar and Stuck_ Need Help_): a card at
 * the foot of the navigation on every screen. It opens three ways to get help:
 * the FAQs, a support ticket, or a call, which is asked for through a ticket
 * because no calendar is drawn.
 */
export default function StuckHelp() {
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const go = (to: string) => () => { setOpen(false); nav(to) }
  const items: [string, string][] = [
    ['FAQs Resources', '/help'],
    ['Create Support Ticket', '/help?panel=ask'],
    ['Book A Call With Us', `/help?panel=ask&subject=${encodeURIComponent('Book a call with the team')}`],
  ]
  return (
    <div className="relative mx-4 mb-3">
      {open && (
        <>
          <div className="fixed inset-0 z-40" role="presentation" onClick={() => setOpen(false)} />
          <div role="menu" className="absolute bottom-full left-0 z-50 mb-1 w-[211px] overflow-hidden rounded-md border-1 border-stroke-input bg-bg-0 py-1.5 shadow-lg">
            {items.map(([label, to]) => (
              <button key={label} type="button" role="menuitem" onClick={go(to)}
                className="flex w-full px-5 py-2 text-left text-body-regular text-text-title hover:bg-bg-1">{label}</button>
            ))}
          </div>
        </>
      )}
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)}
        className="flex h-12 w-full items-center gap-2 rounded-md bg-bg-0 px-3 text-text-medium text-text-title shadow-[0_1px_2px_rgba(32,30,25,0.08)] hover:bg-bg-1">
        {HELP}Stuck? Need Help?
      </button>
    </div>
  )
}
