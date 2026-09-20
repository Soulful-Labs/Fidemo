import { useNavigate } from 'react-router-dom'
import StudyCard from '../../components/app/StudyCard'
import { isExplorable } from '../../lib/studyState'
import { useStore } from '../../mock/store'
import SectionHeader, { ViewAll } from './SectionHeader'

/**
 * Recommended studies (PRD 5.1): a horizontal rail of 320px cards on the
 * dashboard, or a plain list (`list`) for Trending Studies on Get Started.
 */
export default function RecommendedStudies({
  title = 'Recommended Studies', layout = 'rail', limit = 6,
}: { title?: string; layout?: 'rail' | 'list'; limit?: number }) {
  const navigate = useNavigate()
  const { studies, toggleSaved, toast } = useStore()

  const recommended = studies
    .filter((s) => isExplorable(s.status))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit)

  if (recommended.length === 0) return null

  const cards = recommended.map((study) => (
    <StudyCard
      key={study.id}
      study={study}
      variant={layout === 'rail' ? 'compact' : 'list'}
      showActions={false}
      onOpen={() => navigate(`/studies/${study.id}`)}
      onToggleSave={() => toggleSaved(study.id)}
      onMatchScore={() => toast('Match score shows how relevant this study is to your profile')}
    />
  ))

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader title={title} />
      {layout === 'rail' ? (
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">{cards}</div>
      ) : (
        cards
      )}
      <ViewAll to="/studies" />
    </section>
  )
}
