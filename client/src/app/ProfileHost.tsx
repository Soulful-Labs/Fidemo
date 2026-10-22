import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { personById, sharedPhoto, shortName, trustScoreOf } from '@shared/derive'
import { tierFor } from '@shared/rules'
import type { Respondent } from '../components/client/RespondentCard'
import RespondentPanel from '../screens/dashboard/RespondentPanel'
import { InvitePanel, ReviewsPanel } from '../screens/pool/PoolPanels'
import { SentModal } from '../screens/pool/PoolModals'
import { cn } from '../lib/cn'
import { usePlatform } from '../platform'

type Page = 'profile' | 'reviews' | 'invite' | 'sent'
const Open = createContext<(personId: string) => void>(() => undefined)

/** The card a profile panel is drawn from, read from the shared platform for any person. */
export function respondentFor(state: ReturnType<typeof usePlatform>, personId: string): Respondent | null {
  const p = personById(state, personId)
  if (!p) return null
  const score = trustScoreOf(state, p.id)
  return { id: p.id, name: shortName(p.name), role: p.profile.occupation, score, tier: tierFor(score), professionVerified: p.profession.state === 'verified', photo: sharedPhoto(p) }
}

/**
 * One profile for every participant name in the client (22 Oct 2026): wherever
 * a name is drawn in a list, session, result or row, it opens Respondent
 * Profile Details (1704:141690), whose Reviews link opens Reviews (1645:163046)
 * and whose Invite To Study opens the invite panel.
 */
export function ProfileHost({ children }: { children: ReactNode }) {
  const state = usePlatform()
  const [who, setWho] = useState<string | null>(null)
  const [page, setPage] = useState<Page>('profile')
  const open = useCallback((personId: string) => { setWho(personId); setPage('profile') }, [])
  const r = useMemo(() => (who ? respondentFor(state, who) : null), [state, who])
  const close = () => setWho(null)
  return (
    <Open.Provider value={open}>
      {children}
      <RespondentPanel open={!!r && page === 'profile'} respondent={r} onClose={close}
        onReviews={() => setPage('reviews')} onInvite={() => setPage('invite')} />
      <ReviewsPanel open={!!r && page === 'reviews'} respondent={r} onClose={close}
        onBack={() => setPage('profile')} onInvite={() => setPage('invite')} />
      <InvitePanel open={!!r && page === 'invite'} name={r?.name.split(' ')[0]} personId={r?.id} onClose={close} onSent={() => setPage('sent')} />
      <SentModal open={!!r && page === 'sent'} name={r?.name} onClose={close} />
    </Open.Provider>
  )
}

/** Opens a participant's profile panel. */
export const useOpenProfile = () => useContext(Open)

/**
 * A participant's name that opens their profile. Inside a clickable row it
 * stops the row's own click, so the name always means the person.
 */
export function PersonName({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  const open = useOpenProfile()
  return (
    <button type="button" onClick={(e) => { e.stopPropagation(); open(id) }}
      className={cn('cursor-pointer text-left hover:text-brand-primary hover:underline', className)}>
      {children}
    </button>
  )
}
