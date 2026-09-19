import { useCallback, useState } from 'react'
import ButtonsSection from './ButtonsSection'
import FormsSection from './FormsSection'
import NavSection from './NavSection'
import OverlaysSection from './OverlaysSection'
import TagsSection from './TagsSection'

/**
 * Renders every variant of the 10 UI primitives. Each control does something
 * real, per hard rule 1. The local toast here is a stand-in; the shared toast
 * host arrives with the app shell in turn 5.
 */
export default function KitchenSink() {
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([])

  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, msg }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000)
  }, [])

  return (
    <div className="min-h-screen bg-bg-0">
      {/* Phone shell: a 375px frame centred on wider screens. */}
      <div className="mx-auto min-h-screen w-full max-w-frame bg-bg-0">
        <div className="flex flex-col gap-6 px-4 py-6">
          <header className="flex flex-col gap-1">
            <h1 className="text-title-l text-text-title">Kitchen Sink</h1>
            <p className="text-text-regular text-text-body">
              The 10 UI primitives and every variant. Tap anything.
            </p>
          </header>

          <ButtonsSection toast={toast} />
          <FormsSection toast={toast} />
          <TagsSection toast={toast} />
          <NavSection toast={toast} />
          <OverlaysSection toast={toast} />

          <p className="pb-6 text-label text-text-disabled">
            Button · Input · Tag · Toggle · Modal · BottomSheet · TopBar · TabBar · Picker · Stepper
          </p>
        </div>
      </div>

      {/* Toasts: three seconds, bottom, above where the nav will sit. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-toast flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="w-full max-w-content rounded-md border-1 border-stroke-3 bg-bg-2 px-4 py-3 text-text-medium text-text-title shadow-lg"
          >
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  )
}
