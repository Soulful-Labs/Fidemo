import StudyCard from '../../components/app/StudyCard'
import type { Study } from '../../mock/types'
import { useCardHandlers } from './useCardHandlers'

/** Renders a list of studies with the shared card handlers. */
export default function StudyList({
  studies, showActions = true, showStatus = false, rejectable = false,
}: {
  studies: Study[]
  /** A boolean for every card, or a predicate per study. */
  showActions?: boolean | ((study: Study) => boolean)
  showStatus?: boolean
  rejectable?: boolean
}) {
  const h = useCardHandlers()

  return (
    <div className="flex flex-col gap-4">
      {studies.map((study) => (
        <StudyCard
          key={study.id}
          study={study}
          showActions={typeof showActions === 'function' ? showActions(study) : showActions}
          showStatus={showStatus}
          onOpen={h.open(study)}
          onToggleSave={h.save(study)}
          onPrimary={h.primary(study)}
          onSecondary={h.secondary(study)}
          onReject={rejectable ? h.reject(study) : undefined}
          onMatchScore={h.matchScore()}
        />
      ))}
    </div>
  )
}
