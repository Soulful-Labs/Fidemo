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
import BannerActions, { PinNote } from './BannerActions'
import { CancelStudyModal, RejectModal } from './ConfirmModals'
import DescriptionBlock from './DescriptionBlock'
import DetailActions from './DetailActions'
import DetailTiles from './DetailTiles'
import HowItWorks from './HowItWorks'
import ReviewBlock from './ReviewBlock'
import StateBanner, { bannerFor, diaryBannerFor } from './StateBanner'
import StudyLocations from './StudyLocations'
import { useDetailActions } from './useDetailActions'
import { LocationsModal } from '../questions/ScreenerModals'
import Button from '../../../components/ui/Button'
import { resumeLabel } from '../complete/DiaryOverview'
import { PremiumBanner, RepeatRuleRow, ShareStudyLink } from './EligibilityRows'

/** Statuses drawn with the thumbnail-left layout and the Get Support row. */
const AFTER_APPLY = ['applied', 'in_process', 'paid', 'rejected', 'no_show', 'late_show', 'not_needed', 'draft']

function SupportIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="24" height="24" className="shrink-0">
      <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 20c0-3.5 2.7-5.5 6-5.5s6 2 6 5.5M16 4.5h5v4h-3l-2 2v-2h0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** PRD 6.6, Figma 919:73900 and siblings. One screen, switching on study type and status. */
export default function StudyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { back } = useAppNav()
  const { studyById, toggleSaved, cancelStudy, rejectInvitation, toast } = useStore()
  const [reject, setReject] = useState(false)
  const [cancel, setCancel] = useState(false)
  const [locations, setLocations] = useState(false)

  const study = studyById(id)
  const actions = useDetailActions(study, () => setLocations(true))

  if (!study) {
    return (
      <div className="flex min-h-full flex-col">
        <TopBar title="Study Details" onBack={back} />
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
  const afterApply = AFTER_APPLY.includes(study.status)
  // A diary that is open to fill in shows its days banner alone (919:74201).
  const showBanner = banner && !(diaryBanner && study.status === 'invited_to_complete')

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
            className={study.saved ? 'text-brand-primary' : 'text-text-title'}
          >
            <Bookmark filled={study.saved} className="h-6 w-6" />
          </button>
        }
      />

      <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
        {showBanner && (
          <StateBanner content={banner}>
            <BannerActions
              study={study}
              onSchedule={actions.primary}
              onReject={() => setReject(true)}
              onReschedule={() => navigate(`/studies/${study.id}/reschedule`)}
              onCancel={() => setCancel(true)}
              onBlockedReschedule={(reason) => toast(reason)}
            />
            {study.status === 'scheduled' && <PinNote />}
            {(study.status === 'paid' || study.status === 'late_show') && <ReviewBlock study={study} />}
          </StateBanner>
        )}
        {diaryBanner && (
          <StateBanner content={diaryBanner}>
            {study.diary && study.status === 'invited_to_complete' && (
              <Button variant="tertiary" fullWidth rightIcon={<ChevronRight className="h-5 w-5" />} onClick={() => navigate(`/studies/${study.id}/diary`)}>
                {resumeLabel(study.diary.completedDays, study.diary.totalDays)}
              </Button>
            )}
          </StateBanner>
        )}

        <PremiumBanner study={study} />

        <div className="flex items-center gap-2">
          <StudyTypeTag type={study.type} />
          <Tag tone="outline" size="md" className="ml-auto">{study.industry}</Tag>
          <button type="button" onClick={actions.matchScore} aria-label={`Match score ${study.matchScore}`}>
            <ScoreDial score={study.matchScore} compact />
          </button>
        </div>

        <DescriptionBlock study={study} thumbnail={afterApply} />
        <ShareStudyLink study={study} />
        <StudyLocations study={study} />
        <DetailTiles study={study} />
        {!afterApply && <RepeatRuleRow study={study} />}

        {afterApply && (
          <button
            type="button"
            onClick={actions.getSupport}
            className="flex h-btn items-center gap-3 rounded-lg bg-bg-1 px-4 text-left text-text-title"
          >
            <SupportIcon />
            <span className="text-body-medium">Get Support</span>
            <ChevronRight className="ml-auto" />
          </button>
        )}

        <HowItWorks defaultOpen={!afterApply || study.status === 'applied'} />

        {study.timeline.length > 0 && <Timeline entries={study.timeline} />}
      </div>

      <DetailActions study={study} onPrimary={actions.primary} onSecondary={actions.secondary} />

      <RejectModal
        open={reject}
        onClose={() => setReject(false)}
        isInvitation={study.status === 'invited_to_apply' || study.status === 'invited_to_schedule'}
        onConfirm={() => { rejectInvitation(study.id); setReject(false); toast('Invitation rejected'); navigate('/studies') }}
      />

      <LocationsModal
        open={locations}
        locations={study.locations ?? []}
        onClose={() => { setLocations(false); navigate(`/studies/${study.id}/screener`) }}
      />

      <CancelStudyModal
        open={cancel}
        onClose={() => setCancel(false)}
        onConfirm={() => { cancelStudy(study.id); setCancel(false); navigate('/studies') }}
      />
    </div>
  )
}
