import { useEffect, useRef, useState } from 'react'
import { feedback } from '../../lib/feedback'
import { DUR, TIER, play, prefersReduced } from '../../lib/motion'
import { usePlayful } from '../../lib/playful'

const PULL_TRIGGER = 90
/** Rubber banding: the further you pull, the less it gives (as iOS does). */
const rubber = (d: number, span = 420) => (1 - 1 / ((Math.abs(d) * 0.55) / span + 1)) * span * Math.sign(d)

/**
 * PLAYFUL: lists rubber-band at both ends, and pulling down from the top
 * stretches the pull indicator; let go past the line and it spins for a
 * moment (nothing to fetch, there is no backend) before snapping back. Touch
 * drives it on phones; the wheel nudges it on a laptop.
 */
export function useElastic(main: React.RefObject<HTMLElement | null>) {
  const playful = usePlayful()
  const [pull, setPull] = useState(0)
  const [spinning, setSpinning] = useState(false)

  useEffect(() => {
    const el = main.current
    if (!playful || !el || prefersReduced()) return
    const content = () => el.firstElementChild as HTMLElement | null
    let startY = 0
    let edge: 'top' | 'bottom' | null = null
    let offset = 0
    let wheelTimer = 0

    const atTop = () => el.scrollTop <= 0
    const atBottom = () => el.scrollTop + el.clientHeight >= el.scrollHeight - 1
    const set = (d: number) => {
      offset = d
      const c = content()
      if (c) c.style.transform = d ? `translateY(${d}px)` : ''
      setPull(d > 0 ? d : 0)
    }
    const release = () => {
      const c = content()
      const from = offset
      if (edge === 'top' && from > PULL_TRIGGER) {
        feedback('select')
        setSpinning(true)
        window.setTimeout(() => setSpinning(false), DUR.slow * 1000)
      }
      set(0)
      // Tier 1: the list settles home, no spring past it.
      if (c && from) play(c, [{ transform: `translateY(${from}px)` }, { transform: 'none' }], TIER.around.ms + 60, TIER.around.easing)
      edge = null
    }

    const onStart = (e: TouchEvent) => { startY = e.touches[0].clientY; edge = null }
    const onMove = (e: TouchEvent) => {
      const dy = e.touches[0].clientY - startY
      if (!edge) edge = dy > 0 && atTop() ? 'top' : dy < 0 && atBottom() ? 'bottom' : null
      if (edge === 'top' && dy > 0) set(rubber(dy))
      else if (edge === 'bottom' && dy < 0) set(rubber(dy))
    }
    const onWheel = (e: WheelEvent) => {
      const push = (e.deltaY < 0 && atTop()) ? -e.deltaY : (e.deltaY > 0 && atBottom()) ? -e.deltaY : 0
      if (!push) return
      edge = push > 0 ? 'top' : 'bottom'
      set(rubber(offset / 0.6 + push * 0.6, 160))
      window.clearTimeout(wheelTimer)
      wheelTimer = window.setTimeout(release, 140)
    }
    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: true })
    el.addEventListener('touchend', release)
    el.addEventListener('touchcancel', release)
    el.addEventListener('wheel', onWheel, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onStart); el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', release); el.removeEventListener('touchcancel', release)
      el.removeEventListener('wheel', onWheel); window.clearTimeout(wheelTimer); set(0)
    }
  }, [main, playful])

  return { pull, spinning, trigger: PULL_TRIGGER }
}

const CARD = 'article, .rounded-lg.bg-bg-1, .rounded-lg.bg-bg-2, .rounded-lg.bg-bgAlt-2, .rounded-xl.bg-bg-1'

/**
 * PLAYFUL: holding a card down makes it swell slowly, with a soft haptic; let
 * go and it springs back. A long press is not a tap, so the click it would
 * have made is swallowed.
 */
export function useLongPressSwell() {
  const playful = usePlayful()
  const swallow = useRef(false)
  useEffect(() => {
    if (!playful || prefersReduced()) return
    let timer = 0
    let card: HTMLElement | null = null
    let anim: Animation | undefined
    let x = 0, y = 0
    const down = (e: PointerEvent) => {
      swallow.current = false
      card = (e.target as Element | null)?.closest<HTMLElement>(CARD) ?? null
      if (!card) return
      x = e.clientX; y = e.clientY
      const target = card
      timer = window.setTimeout(() => {
        feedback('swell')
        swallow.current = true
        anim = target.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.04)' }], { duration: DUR.slow * 1.4, easing: 'ease-out', fill: 'forwards' })
      }, 420)
    }
    const move = (e: PointerEvent) => { if (card && Math.hypot(e.clientX - x, e.clientY - y) > 8) window.clearTimeout(timer) }
    const up = () => {
      window.clearTimeout(timer)
      if (anim && card) { anim.cancel(); play(card, [{ transform: 'scale(1.04)' }, { transform: 'none' }], TIER.around.ms, TIER.around.easing) }
      anim = undefined; card = null
    }
    const click = (e: MouseEvent) => { if (swallow.current) { e.stopPropagation(); e.preventDefault(); swallow.current = false } }
    document.addEventListener('pointerdown', down, { passive: true })
    document.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerup', up)
    document.addEventListener('pointercancel', up)
    document.addEventListener('click', click, true)
    return () => {
      document.removeEventListener('pointerdown', down); document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', up)
      document.removeEventListener('click', click, true)
    }
  }, [playful])
}
