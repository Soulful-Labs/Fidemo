import { useNavigate } from 'react-router-dom'
import EmptyState from '../../components/app/EmptyState'
import { useMemo, useState } from 'react'
import { useStore } from '../../mock/store'
import SearchRow from './SearchRow'
import StudiesTabs from './StudiesTabs'
import StudyList from './StudyList'

/** PRD 6.17. Same cards as Explore with the bookmark filled. */
export default function Saved() {
  const navigate = useNavigate()
  const { studies } = useStore()
  const [query, setQuery] = useState('')
  const saved = useMemo(() => {
    const q = query.trim().toLowerCase()
    return studies.filter((s) => s.saved && (!q || s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)))
  }, [studies, query])

  return (
    <div className="flex min-h-full flex-col gap-4 pb-6">
      <StudiesTabs />
      <SearchRow query={query} onQuery={setQuery} />

      {saved.length === 0 ? (
        <EmptyState
          title="No saved studies yet!"
          body="Tap the bookmark on any study to keep it here."
          actionLabel="Explore studies"
          onAction={() => navigate('/studies')}
        />
      ) : (
        <div className="flex flex-col gap-4 px-4">
          <p className="text-title-s text-text-title">
            {saved.length} {saved.length === 1 ? 'study' : 'studies'} saved
          </p>
          <StudyList
            studies={saved}
            showStatus
            showActions={(s) => !['available', 'scheduled', 'pin_confirmed'].includes(s.status)}
          />
        </div>
      )}
    </div>
  )
}
