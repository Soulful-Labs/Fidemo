import { useState } from 'react'
import type { CSSProperties } from 'react'
import { ChevronDown } from '../../components/ui/icons'
import HeroMark from './HeroMark'
import { Coin, Section, at } from './shared'

/** Coins adrift behind the mark: where each sits, how big it is, and which depth layer it rides. */
const COINS = [
  { at: 'left-[8%] top-[14%]', size: 'h-9 w-9 text-body-large', near: false, delay: '0s' },
  { at: 'right-[10%] top-[9%]', size: 'h-12 w-12 text-title-m', near: true, delay: '-2.5s' },
  { at: 'left-[14%] top-[44%]', size: 'h-14 w-14 text-title-l', near: true, delay: '-4s' },
  { at: 'right-[6%] top-[38%]', size: 'h-8 w-8 text-body-large', near: false, delay: '-1.2s' },
  { at: 'right-[24%] top-[58%]', size: 'h-10 w-10 text-title-s', near: false, delay: '-5.5s' },
]

const HEADLINE = [['Get', 'paid'], ['for', 'what'], ['you', 'think.']]

/** Light rays behind the mark, swaying. Decorative. */
function Rays() {
  return (
    <svg data-decor aria-hidden="true" viewBox="-100 -100 200 200" className="hl-sway absolute -inset-1/4 h-[150%] w-[150%] text-brand-primary">
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
 * The first screen. The mark assembles itself in the top half over a glow,
 * rays and drifting coins; the headline lands word by word underneath, at the
 * thumb end of the screen. Scrolling away sinks the mark and lifts the coins
 * at two speeds, so the page has depth as it leaves: `ld-par` is a CSS scroll
 * timeline (landing.css), so that depth costs no JavaScript per frame.
 */

/** How far a layer travels, and how much it shrinks, by the time the hero has scrolled away. */
const par = (y: number, scale = 1) => ({ '--par-y': `${y}px`, '--par-s': scale }) as CSSProperties

export default function Hero() {
  const [run, setRun] = useState(0)

  return (
    <Section id="hero" className="bg-bg-0 bg-yellow-fade">
      <div className="ld-safe-t relative flex min-h-0 flex-1 items-center justify-center">
        <div style={par(-70)} aria-hidden="true" className="ld-par pointer-events-none absolute inset-0">
          <span className="ld-glow ld-breathe absolute left-1/2 top-1/2 -ml-48 -mt-48 h-96 w-96 rounded-full" />
          <span className="absolute left-1/2 top-1/2 -ml-48 -mt-48 h-96 w-96"><Rays /></span>
          {COINS.filter((c) => !c.near).map((c) => (
            <span key={c.at} data-decor className={`pf-drift absolute ${c.at}`} style={{ animationDelay: c.delay }}><Coin className={c.size} /></span>
          ))}
        </div>
        <div style={par(-220)} data-decor aria-hidden="true" className="ld-par pointer-events-none absolute inset-0">
          {COINS.filter((c) => c.near).map((c) => (
            <span key={c.at} className={`pf-drift absolute ${c.at}`} style={{ animationDelay: c.delay }}><Coin className={c.size} /></span>
          ))}
        </div>

        <div style={par(140, 0.72)} className="ld-par relative flex flex-col items-center gap-4">
          <button type="button" aria-label="Play the logo again" onClick={() => setRun((n) => n + 1)} className="pf-float rounded-xl p-4">
            <HeroMark key={run} />
          </button>
          <span style={at(0, 1100)} className="ld-in text-title-l text-text-title">HumanLayer</span>
        </div>
      </div>

      <div style={par(-40)} className="ld-par relative flex flex-col gap-3 px-4 pb-36">
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
        <p style={at(0, 1300)} className="ld-in text-title-s text-text-body">
          Take part in research studies. Real money, paid into your bank account.
        </p>
      </div>

      <span data-decor aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-24 flex justify-center text-text-body">
        <span data-idle><ChevronDown className="h-6 w-6" /></span>
      </span>
    </Section>
  )
}
