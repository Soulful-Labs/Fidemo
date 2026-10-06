import { STUDY_TYPE_LABEL, StudyTypeIcon } from '../../components/app/StudyTypeTag'
import { prefersReduced } from '../../lib/motion'
import type { StudyType } from '../../mock/types'
import { Coin, Heading, Lead, Section, at } from './shared'

const TYPES = Object.keys(STUDY_TYPE_LABEL) as StudyType[]

/** A row of the six study types, crossing the frame edge to edge and looping. */
function TypeRow({ back = false, i }: { back?: boolean; i: number }) {
  const group = (hidden: boolean) => (
    <span aria-hidden={hidden || undefined} className="flex gap-3 pr-3">
      {(back ? [...TYPES].reverse() : TYPES).map((t) => (
        <span key={t} className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-bg-2 px-4 text-body-medium text-text-subtitle">
          <StudyTypeIcon type={t} className="text-brand-secondary" />
          {STUDY_TYPE_LABEL[t]}
        </span>
      ))}
    </span>
  )
  return (
    <div style={at(i)} className="ld-in ld-pop overflow-hidden py-2">
      <div className={`flex w-max ${back ? 'ld-marquee-back' : 'ld-marquee'}`}>{group(false)}{group(true)}</div>
    </div>
  )
}

function Bubble({ className }: { className?: string }) {
  return (
    <span className={`flex items-center justify-center rounded-full bg-brand-secondary text-green-900 ${className ?? ''}`}>
      <svg viewBox="0 0 48 48" fill="none" className="h-3/5 w-3/5" aria-hidden="true">
        <path d="M8 10h32a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H22l-10 8v-8H8a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4Z" fill="currentColor" />
        <circle cx="15" cy="22" r="3" className="fill-brand-secondary" />
        <circle cx="24" cy="22" r="3" className="fill-brand-secondary" />
        <circle cx="33" cy="22" r="3" className="fill-brand-secondary" />
      </svg>
    </span>
  )
}

/**
 * The idea in one object: a token that is an opinion on one face and a coin on
 * the other, turning over. Under reduced motion both faces are shown side by
 * side with an arrow between them, which says the same thing without moving.
 */
function Token() {
  if (prefersReduced()) {
    return (
      <div className="flex items-center justify-center gap-4">
        <Bubble className="h-24 w-24" />
        <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-text-body" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <Coin className="h-24 w-24 text-display-s" />
      </div>
    )
  }
  return (
    <div className="ld-stage relative flex justify-center">
      <span aria-hidden="true" className="ld-glow-green ld-breathe absolute left-1/2 top-1/2 -ml-36 -mt-36 h-72 w-72 rounded-full" />
      <span className="ld-flip relative block h-36 w-36 will-change-transform [transform-style:preserve-3d]">
        <Bubble className="absolute inset-0 [backface-visibility:hidden]" />
        <Coin className="absolute inset-0 text-display [backface-visibility:hidden] [transform:rotateY(180deg)]" />
      </span>
    </div>
  )
}

/** What this is: the opinion-to-money token between two rows of the kinds of study there are. */
export default function WhatSection() {
  return (
    <Section id="what" className="justify-center gap-8 bg-bg-0 bg-green-fade pb-28 pt-12">
      <div className="flex flex-col gap-6">
        <TypeRow i={0} />
        <div style={at(1)} className="ld-in ld-pop"><Token /></div>
        <TypeRow back i={2} />
      </div>
      <div className="flex flex-col gap-3">
        <Heading i={3}>Companies pay to hear from real people.</Heading>
        <Lead i={4}>Answer their questions in a survey, on a call or in person. They pay you for your time.</Lead>
      </div>
    </Section>
  )
}
