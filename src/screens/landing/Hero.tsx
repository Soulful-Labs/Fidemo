import { useState } from 'react'
import HeroMark from './HeroMark'
import { Coin, Section, at } from './shared'

/**
 * Coins adrift around the mark. Each sits in a corner of the mark's stage, well
 * clear of the mark in the middle and of the stage's own edges, so its small
 * drift never carries it over the mark, the name, or out of the stage.
 */
const COINS = [
  { at: 'left-6 top-5', size: 'h-9 w-9 text-body-large', delay: '0s' },
  { at: 'right-6 top-8', size: 'h-11 w-11 text-title-m', delay: '-2.5s' },
  { at: 'left-8 bottom-10', size: 'h-11 w-11 text-title-m', delay: '-4s' },
  { at: 'right-9 bottom-12', size: 'h-8 w-8 text-body-large', delay: '-1.2s' },
]

const HEADLINE = [['Get', 'paid'], ['for', 'what'], ['you', 'think.']]

/** Light rays behind the mark, swaying. Decorative, and inside the mark's stage. */
function Rays() {
  return (
    <svg data-decor aria-hidden="true" viewBox="-100 -100 200 200" className="hl-sway absolute inset-0 h-full w-full text-brand-primary">
      <defs>
        <radialGradient id="ld-rays">
          <stop offset="0.12" stopColor="currentColor" stopOpacity="0.3" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      {Array.from({ length: 12 }, (_, i) => <path key={i} d="M0 0 L-8 -100 L8 -100 Z" transform={`rotate(${i * 30})`} fill="url(#ld-rays)" />)}
    </svg>
  )
}

/**
 * The first screen. The top part is a stage: the mark assembles itself in the
 * middle of it over a glow and rays, with a coin in each corner. Under the
 * stage the headline lands word by word, then one supporting line. The stage
 * takes whatever height is left, so on a short phone it shrinks and the type
 * stays whole.
 */
export default function Hero() {
  const [run, setRun] = useState(0)
  return (
    <Section id="hero" className="justify-between gap-4">
      <div className="relative flex min-h-56 flex-1 items-center justify-center overflow-hidden">
        <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 aspect-square h-full max-h-80 -translate-x-1/2 -translate-y-1/2">
          <span className="ld-glow absolute inset-0 rounded-full" />
          <Rays />
        </span>
        {COINS.map((c) => (
          <span key={c.at} data-decor aria-hidden="true" className={`pf-drift pointer-events-none absolute ${c.at}`} style={{ animationDelay: c.delay }}><Coin className={c.size} /></span>
        ))}
        <div className="relative flex flex-col items-center gap-3">
          <button type="button" aria-label="Play the logo again" onClick={() => setRun((n) => n + 1)} className="rounded-xl p-1">
            <HeroMark key={run} />
          </button>
          <span style={at(0, 1100)} className="ld-in text-title-l text-text-title">HumanLayer</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4">
        <h1 className="text-display text-text-title">
          {HEADLINE.map((line, i) => (
            <span key={i} className="block">
              {line.map((word, k) => (
                <span key={word} style={at(0, 500 + (i * 2 + k) * 110)}
                  className={`ld-in ld-slam inline-block origin-bottom-left whitespace-pre ${word === 'paid' ? 'text-brand-primary' : ''}`}>{word} </span>
              ))}
            </span>
          ))}
        </h1>
        <p style={at(0, 1300)} className="ld-in text-title-s text-text-body">Take part in research studies and get paid into your bank.</p>
      </div>
    </Section>
  )
}
