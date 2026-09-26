import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import StudyTypeTag from './StudyTypeTag'
import Tag from '../ui/Tag'
import { Clock, DiaryBookIcon, LinkIcon, MoreVertical } from '../ui/icons'
import { cn } from '../../lib/cn'
import { useToast } from '../ui/Toast'
import type { Study } from '../../mock/db'
import { counts, progressPct, statusTag } from '../../lib/derive'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { copyText } from '../../lib/copy'

/**
 * Every screen under this shell reads its study from the store and its
 * figures from `lib/derive`. The header used to carry its own strings —
 * "20", "/30", "35", "/60 applied", "66%" — beside a Studies list that
 * printed 12, 8 and 3 for the same study. Both are now one count.
 */

/**
 * The four figures under the title on the study header (1627:95956).
 *
 * Measured off 1777:96829: a 20px label box, a 2px gap, then a 31px box
 * holding a 24px figure with a 16px suffix baseline-aligned inside it.
 */
export function HeadStat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-text-regular text-text-subtitle">{label}</span>
      <span className="flex items-baseline gap-1 text-title-l text-text-title">
        {value}{suffix && <span className="text-body-regular text-text-subtitle">{suffix}</span>}
      </span>
    </div>
  )
}

/**
 * The study header every Manage screen sits under (1627:95956, and the same
 * card on the paused study at 1704:143783): thumbnail, type tag, status,
 * title, duration and industry, and the four figures.
 */
export function StudyHeader({ study }: { study: Study }) {
  const toast = useToast()
  const nav = useNavigate()
  const [menu, setMenu] = useState(false)
  const c = counts(study)
  const status = statusTag(study)
  return (
    <section className="rounded-lg bg-bgAlt-1 p-4">
      <div className="flex items-start gap-6">
        <span className="h-[182px] w-[240px] shrink-0 overflow-hidden rounded-md bg-bg-2">
          <img src={study.image} alt="" className="h-full w-full object-cover" />
        </span>
        {/*
          * 1777:96814: the content column is three rows at y 0, 50 and 129
          * inside 182px. Row one is 38 tall with the type tag centred in it,
          * row two is the 31px title and the 28px tag row 8px under it, and
          * row three is the 53px figure block. Twelve between the rows.
          */}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex h-[38px] items-center justify-between gap-4">
            {/* the Manage and Create frames draw Diary as a book; only the
                Studies cards frame draws it as bars */}
            <StudyTypeTag type={study.type} className="h-8"
              icon={study.type === 'diary' ? <DiaryBookIcon className="h-4 w-4" /> : undefined} />
            <div className="flex items-center gap-2">
              <Tag tone={status.tone}>{status.label}</Tag>
              <button type="button" aria-label="Copy study link"
                onClick={async () => toast(await copyText(study.shareLink ?? '') ? 'Link copied' : 'Could not reach the clipboard')}
                className="flex h-btn w-btn items-center justify-center rounded-full border-1 border-stroke-input text-text-subtitle hover:text-text-title">
                <LinkIcon className="h-4 w-4" />
              </button>
              <span className="relative flex">
                <button type="button" aria-label="Study options" onClick={() => setMenu((m) => !m)}
                  className="flex h-btn w-btn items-center justify-center rounded-full border-1 border-stroke-input text-text-subtitle hover:text-text-title">
                  <MoreVertical className="h-4 w-4" />
                </button>
                {menu && (
                  <span className="absolute right-0 top-full z-30 mt-1 flex w-[200px] flex-col rounded-sm border-1 border-stroke-input bg-bg-0 py-1 shadow-lg">
                    <button type="button" onClick={() => { setMenu(false); nav(`/studies/${study.id}/manage`) }}
                      className="px-3 py-2 text-left text-text-regular text-text-title hover:bg-bg-1">Edit study</button>
                    <button type="button" onClick={() => { setMenu(false); nav(`/studies/${study.id}/pay`) }}
                      className="px-3 py-2 text-left text-text-regular text-text-title hover:bg-bg-1">View billing</button>
                    <button type="button" onClick={() => { setMenu(false); nav('/studies') }}
                      className="px-3 py-2 text-left text-text-regular text-text-title hover:bg-bg-1">Back to all studies</button>
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-title-l text-text-title">{study.title}</h1>
            <div className="flex items-center gap-2">
              <Tag tone="neutral" icon={<Clock className="h-4 w-4" />}>{study.duration}</Tag>
              <Tag tone="neutral">{study.industry}</Tag>
            </div>
          </div>

          <div className="grid grid-cols-[repeat(4,158px)] gap-6">
            <HeadStat label="Completed" value={String(c.completed)} suffix={`/${study.required}`} />
            <HeadStat label="Qualified" value={String(c.everQualified)} suffix={`/${c.everApplied} applied`} />
            <HeadStat label="Days Remaining" value={String(study.daysRemaining)} />
            <HeadStat label="Progress" value={`${progressPct(study)}%`} />
          </div>
        </div>
      </div>
    </section>
  )
}

/** The six tabs, in the frames' order. */
export const STUDY_TABS = [
  { key: 'overview', label: 'Overview', path: '' },
  { key: 'manage', label: 'Manage Study', path: '/manage' },
  { key: 'matched', label: 'Matched', path: '/matched' },
  { key: 'recruited', label: 'Recruited', path: '/recruited' },
  { key: 'results', label: 'Results', path: '/results' },
  { key: 'pay', label: 'Pay', path: '/pay' },
] as const

export type StudyTab = (typeof STUDY_TABS)[number]['key']

/**
 * The study tab bar. Every tab after Overview is drawn greyed while a study
 * is paused (1704:143783); on a running study they are all live.
 *
 * Measured off the Tabs instance (1627:96023): a 44px bar holding 40px tabs
 * that sit flush against each other, each with 16px of its own padding and
 * no gap between them, and 16px text 2px above the tab's centre so the
 * underline has its room. It was drawn with a 24px gap and 4px of padding,
 * which put every label in the wrong place.
 */
export function StudyTabs({ id, active, muted }: { id: string; active: StudyTab; muted?: boolean }) {
  return (
    <div className="flex h-11 items-end rounded-t-lg border-b-1 border-neutral-500 bg-bg-1" role="tablist">
      {STUDY_TABS.map((t) => {
        const on = t.key === active
        /* Sampled from both frames: an inactive tab is #9d9d9d (text-body)
           whether the study is running or paused, so `muted` changes nothing
           about how it looks and the tabs stay navigable. */
        void muted
        const inner = cn('-mb-px flex h-10 items-center border-b-1 px-4 pb-1 text-body-regular transition-colors',
          on ? 'border-cta-primary text-brand-primary'
            : 'border-transparent text-text-body hover:text-text-title')
        return <NavLink key={t.key} to={`/studies/${id}${t.path}`} role="tab" aria-selected={on} className={inner}>{t.label}</NavLink>
      })}
    </div>
  )
}

/** The page a Manage screen renders into: header, tabs, then its own body. */
export function StudyFrame({ study, active, muted, banner, children, minH = 'min-h-[874px]', bodyMinH = 'min-h-[616px]' }: {
  study: Study; active: StudyTab; muted?: boolean
  banner?: ReactNode; children: ReactNode; minH?: string; bodyMinH?: string
}) {
  return (
    <div className={cn(minH, 'rounded-lg bg-bg-0 p-4')}>
      <div className="flex flex-col gap-3">
        {banner}
        <StudyHeader study={study} />
        <section className={cn(bodyMinH, 'overflow-hidden rounded-lg border-1 border-stroke-1')}>
          <StudyTabs id={study.id} active={active} muted={muted} />
          {children}
        </section>
      </div>
    </div>
  )
}
