import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle } from './icons'

const Ctx = createContext<(message: string) => void>(() => undefined)

/** Confirms an action that has no screen of its own yet. */
export function useToast() {
  return useContext(Ctx)
}

/**
 * The client frames draw no toast, so this is the build's own: one line,
 * bottom centre, three seconds. It exists so that no control is silent while
 * the behaviour behind it is still stage two.
 */
export default function ToastHost({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const show = useCallback((m: string) => setMessage(m), [])

  useEffect(() => {
    if (message === null) return
    const t = setTimeout(() => setMessage(null), 3000)
    return () => clearTimeout(t)
  }, [message])

  return (
    <Ctx.Provider value={show}>
      {children}
      {message !== null && (
        <div role="status" aria-live="polite"
          className="pointer-events-none fixed bottom-6 left-1/2 z-[60] -translate-x-1/2">
          <span className="flex items-center gap-2 rounded-sm bg-text-title px-4 py-3 text-body-regular text-bg-0 shadow-xl">
            <CheckCircle className="h-5 w-5 text-brand-secondary" />{message}
          </span>
        </div>
      )}
    </Ctx.Provider>
  )
}
