import { copyText } from '../../../components/app/Notice'
import { useState } from 'react'
import StudyTypeTag from '../../../components/app/StudyTypeTag'
import { IconButton } from '../../../components/ui/Button'
import { ClockIcon, DotsIcon, LinkIcon } from '../../../components/ui/icons'
import type { ManagedStudy } from '../../../mock/manage'

const Stat = ({ label, value, rest }: { label: string; value: string; rest?: string }) => (
  <div className="w-40">
    <p className="text-text-regular leading-5 text-text-subtitle">{label}</p>
    <p className="flex items-baseline gap-0.5 pt-0.5 text-title-l leading-[31px] text-text-title">
      {value}{rest && <span className="text-body-medium leading-[22px]">{rest}</span>}
    </p>
  </div>
)

/**
 * What the menu can actually do. The frames also draw Edit and Duplicate to
 * Drafts: the team does not edit a client's study, and a draft is the client's
 * own, which the console never lists, so neither is offered. Stop-complete
 * Study is drawn on the diary menu only; it works the same for any running
 * study, so it is on all of them.
 */
const MENU = ['Copy Study Link', 'Pause Study', 'Stop-complete Study']

/**
 * The header of a managed study (1952:76685), 1162 x 214 on bgAlt-1: the
 * 243 x 182 image, then the type tag with the status tag and two 38px icon
 * buttons (copy link, options) on the right; the title in Title-L; the
 * duration and industry as 28px ringed tags; and four figures 184 apart:
 * Completed, Qualified, Days Remaining, Progress.
 *
 * The options menu ("Ongoing Study options", 1932:109518) is 220 wide: Copy
 * Study Link, Pause Study, a rule, Duplicate to Drafts. The diary section's
 * copy (1961:182276) also shows Stop-complete Study and Edit, which the other
 * five switch off.
 */
export default function StudyHeader({ study, onPause, onComplete, onResume }: { study: ManagedStudy; onPause: () => void; onComplete: () => void; onResume?: () => void }) {
  const [menu, setMenu] = useState(false)
  const copy = () => { void copyText(study.figures.shareLink, 'Study link') }
  /** The common actions on every study type (19 Oct 2026); a paused study offers Resume Study where Pause is. */
  const items = study.paused ? MENU.map((m) => (m === 'Pause Study' ? 'Resume Study' : m)) : MENU
  const pick = (item: string) => {
    setMenu(false)
    if (item === 'Copy Study Link') copy()
    if (item === 'Pause Study') onPause()
    if (item === 'Resume Study') onResume?.()
    if (item === 'Stop-complete Study') onComplete()
  }
  return (
    <header className="flex gap-6 rounded-lg bg-bgAlt-1 p-4">
      <img src={study.image} alt="" className="h-[182px] w-[243px] shrink-0 rounded-md object-cover" />
      <div className="min-w-0 flex-1">
        <div className="flex h-[38px] items-center">
          <StudyTypeTag type={study.type} filled />
          <div className="relative ml-auto flex items-center gap-3">
            <span className="flex h-8 items-center rounded-full bg-bgAlt-2 px-[14px] text-text-regular text-text-title">{study.figures.status}</span>
            <IconButton label="Copy study link" onClick={copy}><LinkIcon className="h-5 w-5" /></IconButton>
            <IconButton label="Study options" aria-expanded={menu} onClick={() => setMenu((m) => !m)}><DotsIcon className="h-5 w-5" /></IconButton>
            {menu && (
              <ul role="menu" className="absolute right-0 top-[46px] z-30 w-[220px] rounded-lg bg-bg-0 p-2 shadow-[0_4px_16px_rgba(32,30,25,0.12)]">
                {items.map((item) => (
                  <li key={item} role="none" className={item === 'Stop-complete Study' ? 'border-t-1 border-stroke-1' : undefined}>
                    <button role="menuitem" type="button" onClick={() => pick(item)}
                      className="flex h-[38px] w-full items-center rounded-sm px-3 text-body-regular text-text-title hover:bg-bg-1">{item}</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <h1 className="pt-3 text-title-l leading-[31px] text-text-title">{study.title}</h1>
        <div className="flex gap-2 pt-2">
          <span className="flex h-7 items-center gap-1 rounded-full border-1 border-stroke-3 px-2 text-text-regular text-text-subtitle">
            <ClockIcon className="h-4 w-4 text-text-title" />{study.time}
          </span>
          <span className="flex h-7 items-center rounded-full border-1 border-stroke-3 px-2 text-text-regular text-text-subtitle">{study.industry}</span>
        </div>
        <div className="flex gap-6 pt-3">
          <Stat label="Completed" value={study.figures.completed[0]!} rest={study.figures.completed[1]} />
          <Stat label="Qualified" value={study.figures.qualified[0]!} rest={study.figures.qualified[1]} />
          <Stat label="Days Remaining" value={study.figures.daysRemaining} />
          <Stat label="Progress" value={study.figures.progress} />
        </div>
      </div>
    </header>
  )
}
