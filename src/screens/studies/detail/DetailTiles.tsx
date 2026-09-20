import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Calendar, ChevronRight, Clock, Star } from '../../../components/ui/icons'
import { dateLong, duration, money } from '../../../lib/format'
import type { Study } from '../../../mock/types'

function Banknote() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="22" height="22" className="shrink-0">
      <rect x="2.5" y="6" width="19" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2.8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 9.5h.5M17.5 14.5h.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function Tile({ icon, label, children, to }: { icon: ReactNode; label: string; children: ReactNode; to?: string }) {
  const body = (
    <>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-yellow-1000/60 text-brand-primary">
        {icon}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-text-regular text-text-body">{label}</span>
        <span className="flex items-center gap-1 whitespace-nowrap text-body-large text-text-title">{children}</span>
      </span>
    </>
  )
  return to ? (
    <Link to={to} className="flex items-center gap-3">{body}</Link>
  ) : (
    <div className="flex items-center gap-3">{body}</div>
  )
}

/**
 * The four tiles: Reward, Duration, Rating, Ends (PRD 6.6, Figma 919:73900).
 * Rating is the client's and opens Client Ratings.
 */
export default function DetailTiles({ study }: { study: Study }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-4">
      <Tile icon={<Banknote />} label="Reward">
        <span className="text-brand-secondary">{money(study.reward)}</span>
      </Tile>
      <Tile icon={<Clock className="h-5 w-5" />} label="Duration">{duration(study.durationMins)}</Tile>
      <Tile icon={<Star filled={false} className="h-5 w-5" />} label="Rating" to={`/clients/${study.client.id}/ratings`}>
        {study.client.rating}
        <span className="text-text-regular text-text-body">({study.client.reviewCount})</span>
        <ChevronRight className="h-4 w-4 text-text-title" />
      </Tile>
      <Tile icon={<Calendar className="h-5 w-5" />} label="Ends">{dateLong(study.endsAt)}</Tile>
    </div>
  )
}
