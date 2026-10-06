import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUI } from '../../app/ui'
import { CONFETTI, cannons } from '../../components/motion/Confetti'
import Button from '../../components/ui/Button'
import { feedback } from '../../lib/feedback'
import { Mark } from './HeroMark'
import { Heading, Lead, Section, at, useSection } from './shared'

/** The page ends with a salute, once, the first time the last screen arrives. */
function Salute() {
  const { seen } = useSection()
  useEffect(() => {
    if (!seen) return
    const t = window.setTimeout(() => { feedback('celebrate'); cannons(CONFETTI.brand, 44) }, 320)
    return () => window.clearTimeout(t)
  }, [seen])
  return null
}

/**
 * The close. The same three ways on as the Sign Up screen, with its exact
 * strings: Sign Up, Log In, and the researcher client route (which is the
 * app's existing "Client app" sheet, since that app is not part of this one).
 */
export default function CloseSection() {
  const navigate = useNavigate()
  const { openComingSoon } = useUI()
  return (
    <Section id="close" className="justify-end gap-6 bg-bg-0 bg-yellow-fade pt-12">
      <Salute />
      <div className="relative flex min-h-0 flex-1 items-center justify-center">
        <span aria-hidden="true" className="ld-glow ld-breathe absolute left-1/2 top-1/2 -ml-40 -mt-40 h-80 w-80 rounded-full" />
        <span style={at(0)} className="ld-in ld-pop relative"><span data-idle className="block"><Mark className="h-28" /></span></span>
      </div>

      <div className="flex flex-col gap-3">
        <Heading i={1}>Your opinion is worth money.</Heading>
        <Lead i={2}>Join, verify once and take your first study.</Lead>
      </div>

      <div style={at(3)} className="ld-in ld-safe-b flex flex-col gap-4 px-4">
        <Button fullWidth onClick={() => navigate('/signup')}>Sign Up</Button>
        <Button variant="tertiary" fullWidth onClick={() => navigate('/signin')}>
          Already have an account?&nbsp;<span className="text-brand-primary">Log In</span>
        </Button>
        <p className="pt-2 text-center text-body-regular text-text-subtitle">Not a respondent?</p>
        <Button variant="tertiary" fullWidth onClick={() => openComingSoon('Client app')}>
          Sign up as a researcher client
        </Button>
      </div>
    </Section>
  )
}
