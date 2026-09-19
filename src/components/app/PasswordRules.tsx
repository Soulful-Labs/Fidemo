import { cn } from '../../lib/cn'
import { Check } from '../ui/icons'
import { passwordRules } from '../../lib/validation'

/** The four live rules from PRD 4.11, ticking as they are met. */
export default function PasswordRules({ password }: { password: string }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1">
      {passwordRules(password).map((rule) => (
        <li
          key={rule.label}
          className={cn(
            'flex items-center gap-1 text-label',
            rule.ok ? 'text-state-success' : 'text-text-disabled',
          )}
        >
          <Check className={cn('h-3 w-3', !rule.ok && 'opacity-40')} />
          {rule.label}
        </li>
      ))}
    </ul>
  )
}
