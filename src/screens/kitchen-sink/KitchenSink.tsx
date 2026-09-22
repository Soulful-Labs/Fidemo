import AppBitsSection from './AppBitsSection'
import ButtonsSection from './ButtonsSection'
import CelebrationsSection from './CelebrationsSection'
import FormsSection from './FormsSection'
import NavSection from './NavSection'
import OverlaysSection from './OverlaysSection'
import StudyCardSection from './StudyCardSection'
import TagsSection from './TagsSection'
import { useStore } from '../../mock/store'

/**
 * Renders every variant of the 10 UI primitives and the 7 app components.
 * Each control does something real, per hard rule 1. Toasts go through the
 * shell's shared host, so this doubles as a check that it works.
 */
export default function KitchenSink() {
  const { toast } = useStore()

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-title-l text-text-title">Kitchen Sink</h1>
        <p className="text-text-regular text-text-body">
          The 10 UI primitives and the 7 app components. Tap anything.
        </p>
      </header>

      <ButtonsSection toast={toast} />
      <FormsSection toast={toast} />
      <TagsSection toast={toast} />
      <NavSection toast={toast} />
      <OverlaysSection toast={toast} />
      <CelebrationsSection />
      <StudyCardSection toast={toast} />
      <AppBitsSection toast={toast} />

      <p className="pb-6 text-label text-text-disabled">
        Button · Input · Tag · Toggle · Modal · BottomSheet · TopBar · TabBar · Picker · Stepper
        <br />
        StudyCard · ScoreDial · StatTile · NotificationRow · EmptyState · ProgressBar · Timeline
      </p>
    </div>
  )
}
