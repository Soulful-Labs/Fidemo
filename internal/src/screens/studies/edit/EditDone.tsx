import { studyById } from '@shared/derive'
import { useNavigate, useParams } from 'react-router-dom'
import AppShell from '../../../app/AppShell'
import Button from '../../../components/ui/Button'
import { CheckIcon, ChevronRight } from '../../../components/ui/icons'
import { usePlatform } from '../../../platform'

/** Changes Published (2325:215424): the end of Edit Study, and the way back to the study. Copy as drawn. */
export default function EditDone() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const study = studyById(usePlatform(), id)!
  return (
    <AppShell crumbs={[{ label: 'Edit Study', to: `/studies/${id}` }, { label: study.title }]}>
      <div className="flex flex-col items-center gap-4 pt-[103px]">
        <span className="flex h-40 w-40 items-center justify-center rounded-full bg-green-100">
          <span className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-state-success text-bg-0"><CheckIcon className="h-11 w-11 [&>path]:stroke-[2.6]" /></span>
        </span>
        <div className="flex max-w-[400px] flex-col items-center gap-1 text-center">
          <h1 className="text-title-s text-text-title">Your changes has been published!</h1>
          <p className="text-text-regular text-text-subtitle">It will be updated and applicable to new upcoming participants.</p>
        </div>
        <Button variant="secondary" size="lg" className="px-6" rightIcon={<ChevronRight className="h-4 w-4" />} onClick={() => nav(`/studies/${id}?tab=revisions`)}>Done! View Details</Button>
      </div>
    </AppShell>
  )
}
