import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '../lib/cn'
import { DUR, EASE } from '../lib/motion'
import { useStore } from '../mock/store'

/**
 * Global interaction rule 3: toasts sit at the bottom, above the nav, and
 * clear after three seconds. The timer lives in the store (TIMINGS.toast).
 * They rise in on a spring and drop away when they clear.
 */
export default function ToastHost({ navVisible }: { navVisible: boolean }) {
  const { toasts, dismissToast } = useStore()

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 z-toast flex flex-col items-center gap-2 px-4',
        // Above the nav on tab screens; above the CTA bar everywhere else, so a toast never covers the primary button.
        navVisible ? 'bottom-nav' : 'bottom-cta',
      )}
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.button
            key={toast.id}
            type="button"
            // A toast follows a tap that already moved something, so it only fades in (one tap, one motion).
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.14, ease: EASE.out } }}
            exit={{ opacity: 0, y: 10, transition: { duration: DUR.fast, ease: EASE.in } }}
            onClick={() => dismissToast(toast.id)}
            role="status"
            className="pointer-events-auto w-full max-w-content rounded-md border-1 border-stroke-3 bg-bg-2 px-4 py-3 text-left text-text-medium text-text-title shadow-lg"
          >
            {toast.message}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  )
}
