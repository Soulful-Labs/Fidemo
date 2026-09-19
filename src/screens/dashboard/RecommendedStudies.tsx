import { useNavigate } from 'react-router-dom'
import StudyCard from '../../components/app/StudyCard'
import { isExplorable } from '../../lib/studyState'
import { useStore } from '../../mock/store'
import SectionHeader from './SectionHeader'

/** Horizontal rail of recommended studies (PRD 5.1). */
export default function RecommendedStudies({ title = 'Recommended Studies' }: { title?: string }) {
  const navigate = useNavigate()
  const { studies, toggleSaved, toast } = useStore()

  const recommended = studies
    .filter((s) => isExplorable(s.status))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6)

  if (recommended.length === 0) return null

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader title={title} viewAllTo="/studies" />
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
        {recommended.map((study) => (
          <StudyCard
            key={study.id}
            study={study}
            variant="compact"
            showActions={false}
            onOpen={() => navigate(`/studies/${study.id}`)}
            onToggleSave={() => toggleSaved(study.id)}
            onMatchScore={() => toast('Match score shows how relevant this study is to your profile')}
          />
        ))}
      </div>
    </section>
  )
}
