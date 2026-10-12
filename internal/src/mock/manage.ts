import { useMemo } from 'react'
import { clientById, counts, daysRemaining, durationLabel, progressPct, shareLink, studyById, targetMet } from '@shared/derive'
import { longDateTime, money } from '@shared/format'
import { STUDY_TAG } from '@shared/lifecycle'
import type { PlatformState, Study } from '@shared/types'
import type { StudyType } from '../components/app/StudyTypeTag'
import { consoleType, studyPictures, usePlatform } from '../platform'
import { clientPhoto } from './clients'

/**
 * A managed study as the Manage screens read it (the six Manage sections),
 * built from the shared platform. Every figure on the header, the Overview
 * tiles and Manage Study is shared/derive.ts; the words are the study's own.
 */
export interface ManagedStudy {
  id: string
  type: StudyType
  title: string
  image: string
  thumbnail: string
  time: string
  industry: string
  description: string
  tileQualified: [string, string]
  about: { title: string; description: string; time: string }
  roles: string
  summary: [string, string]
  /** The tabs that carry the "Congrats!" banner: shown once the study has met its target. */
  congrats?: string[]
  /** Every video 1:1 frame sits 16 inside the shell; the rest 24. */
  tight?: boolean
  /** The diary section's options menu shows two more items. */
  fullMenu?: boolean
  figures: {
    status: string; completed: [string, string]; qualified: [string, string]; daysRemaining: string; progress: string
    shareLink: string; activeSince: string; estimatedAudience: string; screening: string; incentive: string; required: number
  }
  client: { id: string; name: string; role: string; email: string; avatar: string; rows: [string, string][] }
  audience: { label?: string; value: string; icon?: 'users' | 'pin' }[]
  paused: boolean
  completed: boolean
  raw: Study
}

export function managedStudy(state: PlatformState, s: Study): ManagedStudy {
  const c = counts(s)
  const pics = studyPictures(s.id, s.image)
  const client = clientById(state, s.clientId)
  const roles = s.setup?.audience.find((a) => a.label === 'Roles')?.value ?? s.targetProfession
  const summary = s.setup?.studySummary
  const met = targetMet(s)
  return {
    id: s.id, type: consoleType(s.type), title: s.title, image: pics.image, thumbnail: pics.thumb, time: durationLabel(s.durationMins), industry: s.industry,
    description: s.description, tileQualified: [String(c.everQualified), `/${c.everApplied} applied`],
    about: { title: s.title, description: s.description, time: durationLabel(s.durationMins) },
    roles, summary: [summary ? `${summary.label}:` : '', summary?.value ?? ''],
    congrats: met ? ['overview', 'manage', 'recruited', 'results'] : undefined,
    tight: s.id === 'st-goal', fullMenu: s.type === 'diary',
    figures: {
      status: STUDY_TAG[s.state], completed: [String(c.completed), `/${s.required}`], qualified: [String(c.everQualified), `/${c.everApplied} applied`],
      daysRemaining: String(daysRemaining(s)), progress: `${progressPct(s)}%`, shareLink: shareLink(s), activeSince: longDateTime(s.approvedAt),
      estimatedAudience: s.setup?.estimatedAudience ?? '—', screening: s.setup?.screenerSummary ?? `${s.preScreener.length + s.screener.length} inputs`,
      incentive: money(s.rates.incentivePer), required: s.required,
    },
    client: {
      id: s.clientId, name: client?.name ?? '', role: client?.role ?? '', email: client?.email ?? '', avatar: clientPhoto(state, s.clientId),
      rows: [['Company', client?.company ?? ''], ['Website', client?.website ?? ''], ['Industry', client?.industry ?? ''], ['Location', client?.location ?? '']],
    },
    audience: (s.setup?.audience ?? [{ value: String(s.required), icon: 'people' }, { label: 'Roles', value: roles }]).map((a) => ({
      label: a.label ? `${a.label}:` : undefined, value: a.value, icon: a.icon === 'people' ? 'users' as const : a.icon === 'pin' ? 'pin' as const : undefined,
    })),
    paused: s.state === 'paused', completed: s.state === 'completed', raw: s,
  }
}

/** The study a Manage route is on. */
export function useManagedStudy(id?: string): ManagedStudy {
  const state = usePlatform()
  return useMemo(() => {
    const s = studyById(state, id) ?? state.studies.find((x) => x.state === 'recruiting')!
    return managedStudy(state, s)
  }, [state, id])
}
