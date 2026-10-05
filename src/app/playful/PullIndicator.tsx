import { PointsCoin, Spinner } from '../../components/ui/icons'

/**
 * The thing that stretches when a list is pulled down from the top (PLAYFUL):
 * a coin that drops into view, stretches the further it is pulled, turns once
 * past the line, and spins briefly when let go there.
 */
export default function PullIndicator({ pull, spinning, trigger }: { pull: number; spinning: boolean; trigger: number }) {
  if (pull <= 0 && !spinning) return null
  const stretch = 1 + Math.min(pull, trigger * 1.6) / 110
  const past = pull > trigger
  return (
    <span data-decor aria-hidden="true" className="pointer-events-none absolute left-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-green-900 text-brand-secondary"
      style={{
        top: 50,
        transform: spinning ? 'translate(-50%, 18px)' : `translate(-50%, ${Math.min(pull * 0.45, 70) - 30}px) scale(${1 / Math.sqrt(stretch)}, ${stretch}) rotate(${past ? 180 : 0}deg)`,
        opacity: spinning ? 1 : Math.min(1, pull / 40),
        transition: 'transform 120ms var(--ease-out)',
      }}>
      {spinning ? <Spinner /> : <PointsCoin className="h-6 w-6" />}
    </span>
  )
}
