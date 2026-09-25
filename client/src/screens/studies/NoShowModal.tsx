import { useEffect } from 'react'
import Button from '../../components/ui/Button'
import { Close } from '../../components/ui/icons'

/**
 * Mark [individual] as No-show (1697:63643) and Mark all as No-show
 * (1697:63580). The second frame is switched off in the file: its title bar,
 * heading and geometry come from `get_metadata`, but its two body strings
 * cannot be read, so they are left to be filled from the frame when it is
 * turned back on rather than invented.
 */
export default function NoShowModal({
  open, onClose, scope = 'one', name = 'Jenna', full = 'Jenna T.',
}: { open: boolean; onClose: () => void; scope?: 'one' | 'all'; name?: string; full?: string }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null

  const one = scope === 'one'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-title/25 px-4" role="presentation" onClick={onClose}>
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}
        className="flex w-modal flex-col rounded-lg bg-bg-0 shadow-xl">
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 px-4">
          <h2 className="text-title-s text-text-title">{one ? `Mark ${name} as No-show` : 'Mark all as No-show'}</h2>
          <button type="button" aria-label="Close" onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-sm border-1 border-stroke-input text-text-subtitle hover:text-text-title">
            <Close className="h-4 w-4" />
          </button>
        </header>

        <div className="flex flex-col px-4 pb-[21px] pt-4">
          <h3 className="text-title-s leading-[26px] text-text-title">
            {one ? `Didn’t ${full} attend?` : 'Didn’t everyone attend?'}
          </h3>
          {one && (
            <>
              <p className="pt-4 text-text-regular leading-5 text-text-subtitle">
                Are you sure <span className="text-text-large text-text-title">{full} has not attended</span> the study
                session that failed to attend the study and want to mark them absent as no-show?
              </p>
              <p className="mt-4 rounded-md bg-[#fee9e7] p-3 text-text-regular leading-5 text-[#e33a38]">
                This will not allow {name} to get paid for this study and will be confirmed{'  '}by our team
                further from {name} as well.
              </p>
            </>
          )}
          {!one && (
            /* The frame is hidden: its body and warning strings are unreadable. */
            <>
              <p className="pt-4 text-text-regular leading-5 text-text-subtitle">&nbsp;</p>
              <p className="mt-4 h-16 rounded-md bg-[#fee9e7]" />
            </>
          )}
        </div>

        <div className="flex h-20 items-center gap-4 px-4">
          <Button variant="tertiary" size="none" className="h-12 w-[206px]" onClick={onClose}>
            <span className="text-body-medium text-[#e33a38]">Mark as No-Show</span>
          </Button>
          <Button size="none" className="h-12 w-[206px]" onClick={onClose}>
            <span className="text-body-medium">Cancel</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
