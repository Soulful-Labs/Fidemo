import type { ReactNode } from 'react'
import StatusBar from './StatusBar'
import { cn } from '../lib/cn'
import { FRAME_ID } from './frame'

/**
 * Global interaction rule 9: above 420px, centre a 375px frame with rounded
 * corners on a plain dark background so the prototype demos well on a laptop.
 * Below that it fills the screen like a normal mobile web app.
 *
 * Its height is 100% of the page (html, body and #root are all height: 100%),
 * never 100vh. On a phone 100vh is the browser's tallest viewport, the one
 * with its toolbars hidden; while the toolbars are showing that is taller
 * than what is visible, so the bottom of the frame, and whatever is pinned
 * there (the landing page's Sign Up and Log In, every CTA bar, the bottom
 * nav), sat below the edge of the screen.
 */
export default function PhoneFrame({ children, alt = false }: { children: ReactNode; alt?: boolean }) {
  return (
    <div className="flex h-full w-full justify-center bg-bgAlt-0">
      {/* The containing block and clip for everything the app draws, fixed layers included (app/frame.ts). */}
      <div id={FRAME_ID} className={cn('relative flex h-full w-full max-w-frame flex-col overflow-hidden [contain:layout_paint] frame:my-4 frame:h-shell frame:rounded-xl frame:border-1 frame:border-stroke-3', alt ? 'bg-bgAlt-0' : 'bg-bg-0')}>
        <StatusBar />
        {children}
      </div>
    </div>
  )
}
