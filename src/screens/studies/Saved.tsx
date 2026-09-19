import { useNavigate } from 'react-router-dom'
import EmptyState from '../../components/app/EmptyState'
import { useStore } from '../../mock/store'
import StudiesTabs from './StudiesTabs'
import StudyList from './StudyList'

/** PRD 6.17. Same cards as Explore with the bookmark filled. */
export default function Saved() {
  const navigate = useNavigate()
  const { studies } = useStore()
  const saved = studies.filter((s) => s.saved)

  return (
    <div className="flex min-h-full flex-col gap-3 pb-6">
      <StudiesTabs />

      {saved.length === 0 ? (
        <EmptyState
          title="No saved studies yet!"
          body="Tap the bookmark on any study to keep it here."
          actionLabel="Explore studies"
          onAction={() => navigate('/studies')}
        />
      ) : (
        <div className="flex flex-col gap-3 px-4">
          <p className="text-text-medium text-text-body">
            {saved.length} {saved.length === 1 ? 'study' : 'studies'} saved
          </p>
          <StudyList studies={saved} showStatus />
        </div>
      )}
    </div>
  )
}
