import { useLayoutEffect, useRef } from 'react'
import { cn } from '../../lib/cn'
import { CSS, DUR } from '../../lib/motion'

/** The +X that rises and fades from the figure, or the quieter -X that settles under it. */
export default function FloatDelta({ n, text, delay, into, onDone }: { n: number; text: string; delay: number; into: boolean; onDone: () => void }) {
  const ref = useRef<HTMLSpanElement>(null)
  const done = useRef(onDone)
  done.current = onDone
  const up = n > 0
  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    const a = node.animate(
      up && into
        ? [{ transform: 'translate(-50%, 18px) scale(0.9)', opacity: 0 }, { transform: 'translate(-50%, 8px) scale(1.05)', opacity: 1, offset: 0.3 }, { transform: 'translate(-50%, -6px) scale(0.6)', opacity: 0 }]
        : up
        ? [{ transform: 'translate(-50%, 4px) scale(0.8)', opacity: 0 }, { transform: 'translate(-50%, -14px) scale(1.05)', opacity: 1, offset: 0.25 }, { transform: 'translate(-50%, -34px) scale(1)', opacity: 0 }]
        : [{ transform: 'translateY(-4px)', opacity: 0 }, { transform: 'translateY(4px)', opacity: 0.7, offset: 0.3 }, { transform: 'translateY(10px)', opacity: 0 }],
      { duration: (up ? DUR.slow * 2 : DUR.slow) * 1000, easing: CSS.out, fill: 'both', delay: delay * 1000 },
    )
    a.onfinish = () => done.current()
    return () => a.cancel()
  }, [up, into, delay])
  return (
    <span ref={ref} data-decor aria-hidden="true"
      className={cn('pointer-events-none absolute whitespace-nowrap text-body-large opacity-0',
        up && !into ? 'bottom-full left-1/2 text-brand-secondary' : up ? 'top-full left-1/2 text-brand-secondary' : 'left-full top-0 pl-1 text-text-body')}>
      {up ? '+' : '-'}{text}
    </span>
  )
}
