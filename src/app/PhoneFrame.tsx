import type { ReactNode } from 'react'
import StatusBar from './StatusBar'

/**
 * Global interaction rule 9: above 420px, centre a 375px frame with rounded
 * corners on a plain dark background so the prototype demos well on a laptop.
 * Below that it fills the screen like a normal mobile web app.
 */
export default function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full justify-center bg-bgAlt-0">
      <div className="relative flex h-screen w-full max-w-frame flex-col overflow-hidden bg-bg-0 frame:my-4 frame:h-shell frame:rounded-xl frame:border-1 frame:border-stroke-3">
        <StatusBar />
        {children}
      </div>
    </div>
  )
}
