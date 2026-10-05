import { motion } from 'framer-motion'
import { useRef } from 'react'
import { cn } from '../../lib/cn'
import { HAPTIC, SPRING, haptic } from '../../lib/motion'
import { Check, Upload } from '../ui/icons'

export interface FileFieldProps {
  label: string
  /** e.g. ".mp4 file | 50 MB max." or ".jpg or .png" */
  hint?: string
  description?: string
  accept?: string
  fileName?: string
  onPick: (fileName: string) => void
  /** Label above the field, e.g. "Intro Video (optional)". */
  fieldLabel?: string
}

/**
 * The centred upload box from Figma (915:50254): upload icon and label on one
 * line, then the description and hint. Opens the real file picker and shows
 * the chosen file name; nothing uploads because there is no backend.
 */
export default function FileField({
  label, hint, description, accept, fileName, onPick, fieldLabel,
}: FileFieldProps) {
  const input = useRef<HTMLInputElement>(null)
  const chosen = Boolean(fileName)
  // A file picked on this visit ticks in (moment I); one already on file just shows.
  const initial = useRef(fileName)
  const fresh = chosen && fileName !== initial.current

  return (
    <div className="flex flex-col gap-1">
      {fieldLabel && <span className="text-text-regular text-text-subtitle">{fieldLabel}</span>}
      <button
        type="button"
        onClick={() => input.current?.click()}
        className={cn(
          'flex w-full flex-col items-center gap-1 rounded-md border-1 bg-transparent px-4 py-4 text-center transition-colors',
          chosen ? 'border-brand-secondary' : 'border-stroke-3 hover:border-cta-tertiaryStroke',
        )}
      >
        <span className={cn('flex max-w-full items-center gap-2 text-text-medium', chosen ? 'text-brand-secondary' : 'text-text-title')}>
          {chosen ? (
            <motion.span key={fileName} className="flex" initial={fresh ? { scale: 0.2, rotate: -40, opacity: 0 } : false}
              animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={SPRING.snappy} onAnimationComplete={() => fresh && haptic(HAPTIC.press)}>
              <Check className="h-5 w-5" />
            </motion.span>
          ) : <Upload className="h-5 w-5" />}
          <span className="truncate">{fileName ?? label}</span>
        </span>
        {description && !chosen && <span className="text-text-regular text-text-body">{description}</span>}
        {hint && <span className="text-text-regular text-text-body">{hint}</span>}
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
