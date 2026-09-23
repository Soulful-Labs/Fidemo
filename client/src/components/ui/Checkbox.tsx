import { cn } from '../../lib/cn'
import { Check } from './icons'

/** The square checkbox drawn in the Study Type menu. */
export default function Checkbox({ checked, label, onChange }: { checked: boolean; label: string; onChange?: () => void }) {
  return (
    <button type="button" role="checkbox" aria-checked={checked} onClick={onChange}
      className={cn('flex w-full items-center gap-3 px-3 py-2.5 text-left text-body-regular transition-colors',
        checked ? 'bg-yellow-40 text-text-title' : 'text-text-title hover:bg-bg-1')}>
      <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-none border-1.5',
        checked ? 'border-cta-primary bg-cta-primary text-cta-primaryText' : 'border-neutral-1000')}>
        {checked && <Check className="h-3.5 w-3.5" />}
      </span>
      {label}
    </button>
  )
}
