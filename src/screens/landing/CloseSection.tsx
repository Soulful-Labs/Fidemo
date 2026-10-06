import { useNavigate } from 'react-router-dom'
import { useUI } from '../../app/ui'
import StudyCard from '../../components/app/StudyCard'
import Button from '../../components/ui/Button'
import { STUDIES } from '../../mock/data'
import type { Study } from '../../mock/types'
import { Heading, Section, at } from './shared'

/** One of the app's own seeded studies, shown as it would be listed in Explore. An example, and labelled as one. */
const SEED = STUDIES.find((s) => s.id === 'st-02')!
/** The card clamps a description to two lines; the seed's own runs longer, so here it is the same sentence, shortened to fit whole. */
const SAMPLE: Study = { ...SEED, status: 'available', saved: false, description: 'A short survey on inclusive teaching practices.' }

/**
 * The close: proof and the way in. The proof is the same StudyCard every list
 * in the app uses, with a seeded study in it; the whole card is one big target
 * that goes to sign up, and its small inner controls (bookmark, match score)
 * are switched off, since nobody is signed in to use them. Sign Up and Log In
 * are the pinned pair below; the researcher client route sits above them.
 */
export default function CloseSection() {
  const navigate = useNavigate()
  const { openComingSoon } = useUI()
  return (
    <Section id="close" className="gap-3">
      <Heading>What a study looks like</Heading>
      <div style={at(1)} className="ld-in ld-pop flex flex-col gap-3 px-4">
        <span className="flex h-9 items-center self-start rounded-full bg-yellow-1000/70 px-4 text-body-medium text-brand-primary">Sample study</span>
        <div role="link" tabIndex={0} aria-label={`Sample study: ${SAMPLE.title}. Sign up to apply.`}
          onClick={() => navigate('/signup')} onKeyDown={(e) => { if (e.key === 'Enter') navigate('/signup') }}>
          <div inert className="pointer-events-none"><StudyCard study={SAMPLE} showActions={false} /></div>
        </div>
      </div>
      <div style={at(2)} className="ld-in flex flex-col gap-2 px-4 pt-1">
        <p className="text-center text-body-regular text-text-subtitle">Not a respondent?</p>
        <Button variant="tertiary" fullWidth onClick={() => openComingSoon('Client app')}>Sign up as a researcher client</Button>
      </div>
    </Section>
  )
}
