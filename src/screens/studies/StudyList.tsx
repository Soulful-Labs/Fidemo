import StudyCard from '../../components/app/StudyCard'
import type { Study } from '../../mock/types'
import { useCardHandlers } from './useCardHandlers'

/** Renders a list of studies with the shared card handlers. */
export default function StudyList({
  studies, showActions = true, showStatus = false,
}: { studies: Study[]; showActions?: boolean; showStatus?: boolean }) {
  const h = useCardHandlers()

  return (
    <div className="flex flex-col gap-3">
      {studies.map((study) => (
        <StudyCard
          key={study.id}
          study={study}
          showActions={showActions}
          showStatus={showStatus}
          onOpen={h.open(study)}
          onToggleSave={h.save(study)}
          onPrimary={h.primary(study)}
          onSecondary={h.secondary(study)}
          onReject={h.reject(study)}
          onMatchScore={h.matchScore()}
        />
      ))}
    </div>
  )
}
