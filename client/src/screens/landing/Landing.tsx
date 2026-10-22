import type { ComponentType, ReactNode, SVGProps } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import {
  Calendar, CheckCircle, InvoiceIcon, NoteIcon, ShieldIcon, StudiesIcon, TaskIcon, UsersIcon, VerifiedMark, VideoIcon,
} from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { LogoMark } from '../../components/ui/Logo'

/**
 * The client landing page, served at /client to a signed-out visitor.
 * Desktop only, 1440. No frame draws it: it is built from the client app's
 * own tokens, type scale and Button, and every picture on it is a capture of
 * the app itself with its demo data (public/img/landing).
 *
 * One primary action, Sign Up, in the header, the hero and the close. Every
 * claim is something the client app does; no customer names, counts or
 * quotes are shown because none are real yet.
 */
type Glyph = ComponentType<SVGProps<SVGSVGElement>>

/** A captured screen in a browser-less frame: the hairline, radius and tint the app's own cards use. */
const Shot = ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
  <div className={cn('overflow-hidden rounded-lg border-1 border-stroke-2 bg-bg-0', className)}>
    <img src={src} alt={alt} width={1440} height={900} className="block h-auto w-full" />
  </div>
)

const Section = ({ id, tint, children }: { id?: string; tint?: boolean; children: ReactNode }) => (
  <section id={id} className={cn('scroll-mt-[70px] px-6 py-16', tint && 'bg-bgAlt-1')}>
    <div className="mx-auto w-[1120px]">{children}</div>
  </section>
)

const Eyebrow = ({ children }: { children: string }) => <p className="text-text-medium text-brand-primary">{children}</p>
const H2 = ({ children }: { children: string }) => <h2 className="pt-2 text-heading text-text-title">{children}</h2>

/** The four steps, in the app's own words: Create Study, Screener, Matched, Recruited, Results. */
const STEPS: { n: string; title: string; body: string; src: string; alt: string }[] = [
  { n: '1', title: 'Create a study', body: 'Pick the study type, describe it, set your audience and write the screener. Publish it for review.', src: '/img/landing/create.png', alt: 'The Create Study screen in the client app' },
  { n: '2', title: 'Screen and match participants', body: 'Matched respondents are surfaced from the Pool. Invite the ones you want, then Qualify or Disqualify each application on its screener.', src: '/img/landing/matched.png', alt: 'The Matched Respondents tab of a study' },
  { n: '3', title: 'Run sessions', body: 'Qualified respondents book a slot from your availability. Each session has a verification PIN, and you mark it completed or no-show.', src: '/img/landing/sessions.png', alt: 'The Recruited tab of a study with scheduled sessions' },
  { n: '4', title: 'Get results', body: 'See who completed, read their answers, rate each respondent and download the study verification certificate.', src: '/img/landing/results.png', alt: 'The Results tab of a study' },
]

/** What a client gets. Each one is a screen that exists in the app. */
const FEATURES: { Icon: Glyph; title: string; body: string }[] = [
  { Icon: StudiesIcon, title: 'Six study types', body: 'Survey, Video Call, Group Video Call, In‑Person, In‑Person Group and Diary Study, all from one Create Study flow.' },
  { Icon: TaskIcon, title: 'Your own screener', body: 'Write the questions, then decide each applicant yourself. A decision can be undone within one hour.' },
  { Icon: UsersIcon, title: 'A participant Pool', body: 'Search respondents by role, industry, location and tier, open a profile, and invite anyone to a study.' },
  { Icon: Calendar, title: 'Scheduling built in', body: 'Set your weekly hours once. Respondents pick a slot, and group studies fill seats session by session.' },
  { Icon: NoteIcon, title: 'Results in one place', body: 'Answers, session notes, activity and your rating for every respondent, kept with the study.' },
  { Icon: InvoiceIcon, title: 'Clear payments', body: 'An itemised bill for every study, with invoices and receipts under Payments.' },
]

/** Real parts of the platform: identity checks, the screener, and the Trust Score with its three tiers. */
const TRUST: { Icon: Glyph; title: string; body: string }[] = [
  { Icon: VerifiedMark, title: 'Verified participants', body: 'Every respondent passes an identity check before they can apply. Professional credentials are verified separately and shown on the profile.' },
  { Icon: TaskIcon, title: 'Screening on every study', body: 'Nobody reaches your study without answering your screener, and you choose who qualifies.' },
  { Icon: ShieldIcon, title: 'Trust Scores', body: 'Each respondent carries a Trust Score from 50 to 100, built from completed studies and client ratings, in Silver, Gold and Platinum tiers.' },
]

export default function Landing() {
  const navigate = useNavigate()
  const signUp = () => navigate('/signup')
  const logIn = () => navigate('/signin')
  return (
    <div className="min-h-full min-w-[1440px] bg-bg-0 text-text-title">
      {/* 1. Sticky at every scroll position: nothing on the page is allowed to cover or move it. */}
      <header className="sticky top-0 z-40 border-b-1 border-stroke-input bg-yellow-20">
        <div className="mx-auto flex h-topbar w-[1120px] items-center justify-between">
          <Link to="/" className="flex items-center gap-[14px] text-title-l text-text-wordmark" aria-label="HumanLayer, home"><LogoMark className="h-8 w-[26px]" />HumanLayer</Link>
          <nav className="flex items-center gap-3" aria-label="Account">
            <Button variant="tertiary" onClick={logIn}>Log In</Button>
            <Button onClick={signUp}>Sign Up</Button>
          </nav>
        </div>
      </header>

      <main>
        {/* 2. The hero: complete above the fold at 1440 x 900. */}
        <section className="scroll-mt-[70px] px-6 pb-10 pt-16">
          <div className="mx-auto flex w-[1120px] flex-col items-center text-center">
            <p className="flex h-8 items-center gap-1.5 rounded-full bg-yellow-40 px-3 text-text-medium text-yellow-700"><VerifiedMark className="h-4 w-4" />Research with verified participants</p>
            <h1 className="max-w-[920px] pt-5 text-display text-text-title">Recruit verified participants and run your research studies in one place</h1>
            <p className="max-w-[620px] pt-4 text-body-regular text-text-subtitle">Create a study, screen and match participants, run your sessions and get results. Surveys, video calls, in-person interviews and diary studies, without leaving the app.</p>
            <div className="flex items-center gap-3 pt-7">
              <Button size="none" className="h-12 px-8 text-body-medium" onClick={signUp}>Sign Up</Button>
              <Button variant="tertiary" size="none" className="h-12 px-8 text-body-medium" onClick={logIn}>Log In</Button>
            </div>
          </div>
        </section>

        {/* 3. The product itself, straight after the hero. */}
        <section className="scroll-mt-[70px] px-6 pb-16">
          <div className="mx-auto w-[1120px]">
            <Shot src="/img/landing/dashboard.png" alt="The HumanLayer client dashboard: ongoing studies, recommended respondents and study figures" className="shadow-[0_8px_32px_0_rgb(32_30_25/0.08)]" />
            <p className="pt-3 text-center text-text-regular text-text-body">The client dashboard, shown with demo data.</p>
          </div>
        </section>

        {/* 4. How it works. */}
        <Section id="how-it-works" tint>
          <Eyebrow>How it works</Eyebrow>
          <H2>From a new study to results in four steps</H2>
          <ol className="grid grid-cols-2 gap-6 pt-8">
            {STEPS.map((s) => (
              <li key={s.n} className="flex flex-col rounded-lg border-1 border-stroke-1 bg-bg-0 p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cta-secondary text-text-large text-cta-secondaryText">{s.n}</span>
                  <h3 className="text-title-s text-text-title">{s.title}</h3>
                </div>
                <p className="min-h-[66px] pt-3 text-body-regular text-text-subtitle">{s.body}</p>
                <Shot src={s.src} alt={s.alt} className="mt-4" />
              </li>
            ))}
          </ol>
        </Section>

        {/* 5. What you get. */}
        <Section id="what-you-get">
          <Eyebrow>What you get</Eyebrow>
          <H2>Everything a study needs</H2>
          <ul className="grid grid-cols-3 gap-6 pt-8">
            {FEATURES.map(({ Icon, title, body }) => (
              <li key={title} className="rounded-lg bg-bg-1 p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-yellow-40 text-brand-primary"><Icon className="h-5 w-5" /></span>
                <h3 className="pt-4 text-title-s text-text-title">{title}</h3>
                <p className="pt-2 text-body-regular text-text-subtitle">{body}</p>
              </li>
            ))}
          </ul>
        </Section>

        {/* 6. The trust strip. */}
        <Section id="trust" tint>
          <Eyebrow>Who you are talking to</Eyebrow>
          <H2>Real people, checked before they reach you</H2>
          <ul className="grid grid-cols-3 gap-6 pt-8">
            {TRUST.map(({ Icon, title, body }) => (
              <li key={title} className="rounded-lg border-1 border-stroke-2 bg-bgAlt-0 p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-green-50 text-brand-secondary"><Icon className="h-5 w-5" /></span>
                <h3 className="pt-4 text-title-s text-text-title">{title}</h3>
                <p className="pt-2 text-body-regular text-text-subtitle">{body}</p>
              </li>
            ))}
          </ul>
          <p className="flex items-center gap-2 pt-6 text-text-regular text-text-subtitle"><VideoIcon className="h-4 w-4 text-brand-secondary" />Session attendance is confirmed with a verification PIN, entered by the respondent.<CheckCircle className="ml-4 h-4 w-4 text-brand-secondary" />A respondent marked no-show is not paid.</p>
        </Section>

        {/* 7. The close: the one primary action again. */}
        <section className="scroll-mt-[70px] px-6 py-16">
          <div className="mx-auto flex w-[1120px] flex-col items-center rounded-xl bg-yellow-30 px-10 py-14 text-center">
            <h2 className="text-heading text-text-title">Start your first study</h2>
            <p className="max-w-[520px] pt-3 text-body-regular text-text-subtitle">Create your account, tell us about your organization, and publish a study for review.</p>
            <div className="flex items-center gap-3 pt-7">
              <Button size="none" className="h-12 px-8 text-body-medium" onClick={signUp}>Sign Up</Button>
              <Button variant="tertiary" size="none" className="h-12 px-8 text-body-medium" onClick={logIn}>Log In</Button>
            </div>
          </div>
        </section>
      </main>

      {/* 8. Footer: only links that go somewhere. */}
      <footer className="border-t-1 border-stroke-input bg-yellow-20 px-6">
        <div className="mx-auto flex h-20 w-[1120px] items-center justify-between text-text-regular text-text-subtitle">
          <p className="flex items-center gap-4"><span className="flex items-center gap-[14px] text-title-l text-text-wordmark"><LogoMark className="h-8 w-[26px]" />HumanLayer</span><span>Research with verified participants.</span></p>
          <nav className="flex items-center gap-6" aria-label="Footer">
            <Link to="/signin" className="hover:text-text-title">Log In</Link>
            <Link to="/signup" className="hover:text-text-title">Sign Up</Link>
            {/* The participant app lives at the root of the same origin, outside this app's router. */}
            <a href="/" className="hover:text-text-title">Taking part in studies? Participant app</a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
