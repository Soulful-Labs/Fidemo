import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '../lib/cn'
import { DUR, EASE, SPRING } from '../lib/motion'
import { usePlayful } from '../lib/playful'
import { useStore } from '../mock/store'

/**
 * Global interaction rule 3: toasts sit at the bottom, above the nav, and
 * clear after three seconds. The timer lives in the store (TIMINGS.toast).
 * They rise in on a spring and drop away when they clear.
 */
export default function ToastHost({ navVisible }: { navVisible: boolean }) {
  const { toasts, dismissToast } = useStore()
  const playful = usePlayful()

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
            initial={playful ? { opacity: 0, y: 40, scale: 0.6, rotate: -4 } : { opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0, transition: playful ? SPRING.bouncy : SPRING.soft }}
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
