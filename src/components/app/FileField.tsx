import { useRef } from 'react'
import { cn } from '../../lib/cn'
import { Check } from '../ui/icons'

export interface FileFieldProps {
  label: string
  /** e.g. ".mp4 file | 50 MB max." or ".jpg or .png" */
  hint?: string
  description?: string
  accept?: string
  fileName?: string
  onPick: (fileName: string) => void
}

/**
 * Opens the real file picker and shows the chosen file name. Nothing uploads;
 * there is no backend.
 */
export default function FileField({
  label, hint, description, accept, fileName, onPick,
}: FileFieldProps) {
  const input = useRef<HTMLInputElement>(null)
  const chosen = Boolean(fileName)

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => input.current?.click()}
        className={cn(
          'flex w-full items-center gap-3 rounded-md border-1 border-dashed px-4 py-3 text-left transition-colors',
          chosen ? 'border-brand-secondary bg-bg-1' : 'border-cta-tertiaryStroke bg-bg-1 hover:border-cta-primary',
        )}
      >
        <span className={cn('flex h-6 w-6 items-center justify-center rounded-full', chosen ? 'bg-green-900 text-brand-secondary' : 'bg-bg-2 text-text-body')}>
          {chosen ? <Check className="h-4 w-4" /> : '+'}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-body-medium text-text-title">{fileName ?? label}</span>
          {description && !chosen && <span className="text-label text-text-body">{description}</span>}
          {hint && <span className="text-label text-text-disabled">{hint}</span>}
        </span>
      </button>
      <input
        ref={input}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onPick(file.name)
        }}
      />
    </div>
  )
}
