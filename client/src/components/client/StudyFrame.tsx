import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import StudyTypeTag from './StudyTypeTag'
import Tag from '../ui/Tag'
import { Clock, DiaryBookIcon, LinkIcon, MoreVertical } from '../ui/icons'
import { cn } from '../../lib/cn'
import { useToast } from '../ui/Toast'
import type { ClientStudy as Study } from '../../platform'
import { counts, progressPct, statusTag } from '@shared/derive'
import { useState } from 'react'
import { StudyMenu, useStudyActions } from './StudyActions'
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
    <div className="flex flex-col gap-1">
      <span className="text-text-regular text-text-body">{label}</span>
      <span className="flex items-baseline gap-1 text-title-m leading-[26px] text-text-title">
        {value}{suffix && <span className="text-body-regular">{suffix}</span>}
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
  const [menu, setMenu] = useState(false)
  const { act, dialogs } = useStudyActions(study)
  const c = counts(study)
  const status = statusTag(study)
  return (
    <section className="rounded-lg bg-bgAlt-1 p-4">
      <div className="flex items-start gap-6">
        {/* 228 by 171 in the 13 Oct 2026 export, on a card 203 tall. */}
        <span className="h-[171px] w-[228px] shrink-0 overflow-hidden rounded-md bg-bg-2">
          {study.image && <img src={study.image} alt="" className="h-full w-full object-cover" />}
        </span>
        {/*
          * 1777:96814: the content column is three rows at y 0, 50 and 129
          * inside 182px. Row one is 38 tall with the type tag centred in it,
          * row two is the 31px title and the 28px tag row 8px under it, and
          * row three is the 53px figure block. Twelve between the rows.
          */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-[38px] items-center justify-between gap-4">
            {/* the Manage and Create frames draw Diary as a book; only the
                Studies cards frame draws it as bars */}
            <StudyTypeTag type={study.type} className="h-8"
              icon={study.type === 'diary' ? <DiaryBookIcon className="h-4 w-4" /> : undefined} />
            <div className="flex items-center gap-3">
              <Tag tone={status.tone} className="h-8 border-0 bg-bgAlt-2 px-3">{status.label}</Tag>
              <button type="button" aria-label="Copy study link"
                onClick={async () => toast(await copyText(study.shareLink ?? '') ? 'Link copied' : 'Could not reach the clipboard')}
                className="flex h-[38px] w-[38px] items-center justify-center rounded-md border-1 border-stroke-input text-text-title hover:bg-bg-0">
                <LinkIcon className="h-5 w-5" />
              </button>
              <span className="relative flex">
                <button type="button" aria-label="Study options" onClick={() => setMenu((m) => !m)}
                  className="flex h-[38px] w-[38px] items-center justify-center rounded-md border-1 border-stroke-input text-text-title hover:bg-bg-0">
                  <MoreVertical className="h-5 w-5" />
                </button>
                <StudyMenu study={study} open={menu} onClose={() => setMenu(false)} act={act} />
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-[13px]">
            <h1 className="text-title-l font-medium text-text-title">{study.title}</h1>
            <p className="flex items-center gap-1 text-body-regular text-text-subtitle">
              <Clock className="h-5 w-5 text-text-title" />{study.duration}
              {study.industry && <><span className="px-2 text-text-title">&bull;</span>{study.industry}</>}
            </p>
          </div>

          <div className="grid grid-cols-[repeat(4,160px)] gap-6 pt-[11px]">
            <HeadStat label="Completed" value={String(c.completed)} suffix={`/${study.required}`} />
            <HeadStat label="Qualified" value={String(c.everQualified)} suffix={`/${c.everApplied} applied`} />
            <HeadStat label="Days Remaining" value={String(study.daysRemaining)} />
            <HeadStat label="Progress" value={`${progressPct(study)}%`} />
          </div>
        </div>
      </div>
      {dialogs}
    </section>
  )
}

/** The seven tabs, in the frames' order (Revisions History added 19 Oct 2026, 2322:211934). */
export const STUDY_TABS = [
  { key: 'overview', label: 'Overview', path: '' },
  { key: 'manage', label: 'Manage Study', path: '/manage' },
  { key: 'matched', label: 'Matched', path: '/matched' },
  { key: 'recruited', label: 'Recruited', path: '/recruited' },
  { key: 'results', label: 'Results', path: '/results' },
  { key: 'revisions', label: 'Revisions History', path: '/revisions' },
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
        /* The tab you are on is the current one, not a link back to itself. */
        return on
          ? <span key={t.key} role="tab" aria-selected aria-current="page" className={inner}>{t.label}</span>
          : <NavLink key={t.key} to={`/studies/${id}${t.path}`} role="tab" aria-selected={false} className={inner}>{t.label}</NavLink>
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
