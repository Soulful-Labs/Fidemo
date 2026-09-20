import { cn } from '../../lib/cn'
import { passwordRules } from '../../lib/validation'

/**
 * The four live rules from PRD 4.11, drawn as a bulleted list (Figma
 * 915:50217). A rule turns green once the password meets it.
 */
export default function PasswordRules({ password }: { password: string }) {
  return (
    <ul className="flex flex-col gap-0.5 pl-2">
      {passwordRules(password).map((rule) => (
        <li
          key={rule.label}
          className={cn(
            'flex items-center gap-2 text-label',
            rule.ok ? 'text-state-success' : 'text-text-subtitle',
          )}
        >
          <span className="h-1 w-1 rounded-full bg-current" aria-hidden="true" />
          {rule.label}
        </li>
      ))}
    </ul>
  )
}
