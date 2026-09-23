import { cn } from '../../lib/cn'

/** The pill switch drawn on "Group session" and "AutoPay". */
export default function Toggle({
  checked, onChange, label,
}: { checked: boolean; onChange?: (next: boolean) => void; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label}
      onClick={() => onChange?.(!checked)}
      className={cn('flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors', checked ? 'bg-cta-primary' : 'bg-neutral-1000')}>
      <span className={cn('h-5 w-5 rounded-full bg-bg transition-transform', checked && 'translate-x-5')} />
    </button>
  )
}
