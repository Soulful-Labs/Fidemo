import StudyCard from '../../components/app/StudyCard'
import type { Study } from '../../mock/types'
import { useCardHandlers } from './useCardHandlers'

export interface StudyListProps {
  studies: Study[]
  /** A boolean for every card, or a predicate per study. */
  showActions?: boolean | ((study: Study) => boolean)
  showStatus?: boolean
  /** Cards get a Reject button (Invites). */
  rejectable?: boolean
  onReject?: (study: Study) => void
  footnoteFor?: (study: Study) => string | undefined
}

/** Renders a list of studies with the shared card handlers. */
export default function StudyList({
  studies, showActions = true, showStatus = false, rejectable = false, onReject, footnoteFor,
}: StudyListProps) {
  const h = useCardHandlers()

  return (
    <div data-stagger className="flex flex-col gap-4">
      {studies.map((study) => (
        <StudyCard
          key={study.id}
          study={study}
          showActions={typeof showActions === 'function' ? showActions(study) : showActions}
          showStatus={showStatus}
          footnote={footnoteFor?.(study)}
          onOpen={h.open(study)}
          onToggleSave={h.save(study)}
          onPrimary={h.primary(study)}
          onSecondary={h.secondary(study)}
          onReject={rejectable ? (onReject ? () => onReject(study) : h.reject(study)) : undefined}
          onMatchScore={h.matchScore()}
        />
      ))}
    </div>
  )
}
