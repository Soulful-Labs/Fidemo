import { useState } from 'react'
import StudyTypeTag from '../../../components/app/StudyTypeTag'
import { IconButton } from '../../../components/ui/Button'
import { ClockIcon, DotsIcon, LinkIcon } from '../../../components/ui/icons'
import { FIGURES as F } from '../../../mock/manage'
import type { ManagedStudy } from '../../../mock/manage'

const Stat = ({ label, value, rest }: { label: string; value: string; rest?: string }) => (
  <div className="w-40">
    <p className="text-text-regular leading-5 text-text-subtitle">{label}</p>
    <p className="flex items-baseline gap-0.5 pt-0.5 text-title-l leading-[31px] text-text-title">
      {value}{rest && <span className="text-body-medium leading-[22px]">{rest}</span>}
    </p>
  </div>
)

const MENU = ['Copy Study Link', 'Pause Study', 'Stop-complete Study', 'Edit', 'Duplicate to Drafts']

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
export default function StudyHeader({ study, onPause }: { study: ManagedStudy; onPause: () => void }) {
  const [menu, setMenu] = useState(false)
  const copy = () => { void navigator.clipboard?.writeText(F.shareLink) }
  const items = study.fullMenu ? MENU : MENU.filter((m) => m !== 'Stop-complete Study' && m !== 'Edit')
  const pick = (item: string) => {
    setMenu(false)
    if (item === 'Copy Study Link') copy()
    if (item === 'Pause Study') onPause()
  }
  return (
    <header className="flex gap-6 rounded-lg bg-bgAlt-1 p-4">
      <img src={study.image} alt="" className="h-[182px] w-[243px] shrink-0 rounded-md object-cover" />
      <div className="min-w-0 flex-1">
        <div className="flex h-[38px] items-center">
          <StudyTypeTag type={study.type} filled />
          <div className="relative ml-auto flex items-center gap-3">
            <span className="flex h-8 items-center rounded-full bg-bgAlt-2 px-[14px] text-text-regular text-text-title">{F.status}</span>
            <IconButton label="Copy study link" onClick={copy}><LinkIcon className="h-5 w-5" /></IconButton>
            <IconButton label="Study options" aria-expanded={menu} onClick={() => setMenu((m) => !m)}><DotsIcon className="h-5 w-5" /></IconButton>
            {menu && (
              <ul role="menu" className="absolute right-0 top-[46px] z-30 w-[220px] rounded-lg bg-bg-0 p-2 shadow-[0_4px_16px_rgba(32,30,25,0.12)]">
                {items.map((item) => (
                  <li key={item} role="none" className={item === 'Duplicate to Drafts' || item === 'Edit' ? 'border-t-1 border-stroke-1' : undefined}>
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
          <Stat label="Completed" value={F.completed[0]!} rest={F.completed[1]} />
          <Stat label="Qualified" value={F.qualified[0]!} rest={F.qualified[1]} />
          <Stat label="Days Remaining" value={F.daysRemaining} />
          <Stat label="Progress" value={F.progress} />
        </div>
      </div>
    </header>
  )
}
