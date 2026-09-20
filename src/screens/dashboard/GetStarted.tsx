import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { Play, Star } from '../../components/ui/icons'
import { LEARN_VIDEO_IMAGE } from '../../mock/data'
import { useStore } from '../../mock/store'
import DashboardHeader from './DashboardHeader'
import RecommendedStudies from './RecommendedStudies'
import ReferEarnCard from './ReferEarnCard'
import SectionHeader from './SectionHeader'

/**
 * PRD 5.2, Figma 918:70874 ("Home - Non-registered User"), shown when the
 * user has zero completed studies: Get Started in the header, the Learn
 * video card, Trending Studies, then Refer & Earn.
 *
 * Conflict 18: the drawn frame shows "Profile Score 70 /100" next to "Total
 * Studies 0". A new account starts at 50, Silver, so no score is shown here;
 * Get Started leads to the profile instead.
 */
export default function GetStarted() {
  const navigate = useNavigate()
  const { referrals, toast } = useStore()

  return (
    <div className="flex min-h-full flex-col">
      <DashboardHeader
        right={
          <Button size="md" className="ml-auto" onClick={() => navigate('/profile/edit')}>
            Get Started
          </Button>
        }
      />

      <div className="flex flex-col gap-6 px-4 pb-6 pt-2">
        <section className="flex flex-col gap-4">
          <SectionHeader title="Learn about HumanLayer" />
          <div className="flex flex-col gap-3 rounded-lg bg-bg-1 p-3">
            <button
              type="button"
              onClick={() => toast('Video player is not part of this prototype')}
              aria-label="Play the HumanLayer introduction"
              className="relative aspect-video w-full overflow-hidden rounded-md bg-bg-2"
            >
              <img src={LEARN_VIDEO_IMAGE} alt="" className="h-full w-full object-cover" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-secondary text-bg-0">
                  <Play />
                </span>
              </span>
            </button>
            <Button
              variant="tertiary"
              fullWidth
              leftIcon={<Star filled={false} className="h-5 w-5" />}
              onClick={() => toast('Video player is not part of this prototype')}
            >
              Watch in full-screen
            </Button>
          </div>
        </section>

        <RecommendedStudies title="Trending Studies" layout="list" limit={3} />

        <ReferEarnCard subtitle={referrals.length === 0 ? '0 referrals yet' : undefined} />
      </div>
    </div>
  )
}
