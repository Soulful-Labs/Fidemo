import { useEffect, useSyncExternalStore } from 'react'

/**
 * When the platform refuses a decision it says why (shared/store.ts). No frame
 * draws a toast, so the reason shows in a small bar fixed to the bottom of the
 * window for four seconds, over the page and outside its layout.
 */
let message = ''
const listeners = new Set<() => void>()
const set = (m: string) => { message = m; listeners.forEach((l) => l()) }
export const notice = (m: string) => set(m)

export default function NoticeHost() {
  const m = useSyncExternalStore((l) => { listeners.add(l); return () => { listeners.delete(l) } }, () => message)
  useEffect(() => {
    if (!m) return
    const t = setTimeout(() => set(''), 4000)
    return () => clearTimeout(t)
  }, [m])
  if (!m) return null
  return <p role="status" className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-md bg-text-title px-4 py-3 text-text-regular text-bg-0">{m}</p>
}
