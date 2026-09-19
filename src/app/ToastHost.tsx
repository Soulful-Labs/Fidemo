import { cn } from '../lib/cn'
import { useStore } from '../mock/store'

/**
 * Global interaction rule 3: toasts sit at the bottom, above the nav, and
 * clear after three seconds. The timer lives in the store (TIMINGS.toast).
 */
export default function ToastHost({ navVisible }: { navVisible: boolean }) {
  const { toasts, dismissToast } = useStore()
  if (toasts.length === 0) return null

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 z-toast flex flex-col items-center gap-2 px-4',
        navVisible ? 'bottom-nav' : 'bottom-6',
      )}
    >
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => dismissToast(toast.id)}
          role="status"
          className="pointer-events-auto w-full max-w-content rounded-md border-1 border-stroke-3 bg-bg-2 px-4 py-3 text-left text-text-medium text-text-title shadow-lg"
        >
          {toast.message}
        </button>
      ))}
    </div>
  )
}
