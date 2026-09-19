import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Timeline from '../../../components/app/Timeline'
import StudyTypeTag from '../../../components/app/StudyTypeTag'
import ScoreDial from '../../../components/app/ScoreDial'
import EmptyState from '../../../components/app/EmptyState'
import Tag from '../../../components/ui/Tag'
import TopBar from '../../../components/ui/TopBar'
import { Bookmark, ChevronRight } from '../../../components/ui/icons'
import { useAppNav } from '../../../app/useAppNav'
import { useStore } from '../../../mock/store'
import ClientRow from './ClientRow'
import { CancelStudyModal, RejectModal } from './ConfirmModals'
import DescriptionBlock from './DescriptionBlock'
import DetailActions from './DetailActions'
import DetailTiles from './DetailTiles'
import HowItWorks from './HowItWorks'
import StateBanner, { bannerFor, diaryBannerFor } from './StateBanner'
import StudyLocations from './StudyLocations'
import { useDetailActions } from './useDetailActions'

/** PRD 6.6. One screen, switching on study type and status. */
export default function StudyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { back } = useAppNav()
  const { studyById, toggleSaved, cancelStudy, rejectInvitation, toast } = useStore()
  const [reject, setReject] = useState(false)
  const [cancel, setCancel] = useState(false)

  const study = studyById(id)
  const actions = useDetailActions(study)

  if (!study) {
    return (
      <div className="flex min-h-full flex-col">
        <TopBar title="Study Details" onBack={() => navigate('/studies')} />
        <EmptyState
          title="Study not found"
          body="This study is no longer available."
          actionLabel="Back to Explore"
          onAction={() => navigate('/studies')}
        />
      </div>
    )
  }

  const banner = bannerFor(study)
  const diaryBanner = diaryBannerFor(study)

  return (
    <div className="flex min-h-full flex-col">
      <TopBar
        title="Study Details"
        onBack={back}
        right={
          <button
            type="button"
            onClick={() => toggleSaved(study.id)}
            aria-label={study.saved ? 'Remove from saved' : 'Save study'}
            className={study.saved ? 'text-brand-primary' : 'text-text-body'}
          >
            <Bookmark filled={study.saved} />
          </button>
        }
      />

      <div className="flex flex-1 flex-col gap-4 px-4 pb-6">
        {banner && <StateBanner content={banner} />}
        {diaryBanner && <StateBanner content={diaryBanner} />}

        <div className="flex flex-wrap items-center gap-2">
          <StudyTypeTag type={study.type} />
          <Tag tone="neutral">{study.industry}</Tag>
          <button type="button" onClick={actions.matchScore} aria-label={`Match score ${study.matchScore}`} className="ml-auto">
            <ScoreDial score={study.matchScore} compact />
          </button>
        </div>

        <img src={study.image} alt="" className="h-40 w-full rounded-lg border-1 border-stroke-2 object-cover" />

        <DescriptionBlock study={study} />
        <ClientRow study={study} />
        <DetailTiles study={study} />
        <StudyLocations study={study} />
        <HowItWorks />

        <button
          type="button"
          onClick={actions.getSupport}
          className="flex items-center gap-3 rounded-lg border-1 border-stroke-2 bg-bg-1 p-4 text-left"
        >
          <span className="text-body-medium text-text-title">Get Support</span>
          <ChevronRight className="ml-auto text-text-body" />
        </button>

        {study.timeline.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-title-s text-text-title">Updates</h2>
            <div className="rounded-lg border-1 border-stroke-2 bg-bg-1 p-4">
              <Timeline entries={study.timeline} />
            </div>
          </section>
        )}
      </div>

      <DetailActions
        study={study}
        onPrimary={actions.primary}
        onSecondary={actions.secondary}
        onReject={() => setReject(true)}
        onReschedule={() => navigate(`/studies/${study.id}/reschedule`)}
        onCancel={() => setCancel(true)}
        onBlockedReschedule={(reason) => toast(reason)}
      />

      <RejectModal
        open={reject}
        onClose={() => setReject(false)}
        isInvitation={study.status === 'invited_to_apply' || study.status === 'invited_to_schedule'}
        onConfirm={() => { rejectInvitation(study.id); setReject(false); toast('Invitation rejected'); navigate('/studies') }}
      />

      <CancelStudyModal
        open={cancel}
        onClose={() => setCancel(false)}
        onConfirm={() => { cancelStudy(study.id); setCancel(false); navigate('/studies') }}
      />
    </div>
  )
}
