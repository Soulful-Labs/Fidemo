import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import OnboardShell from './OnboardShell'
import Button from '../../components/ui/Button'
import { CheckCircle, ChevronDown, Eye, MessageIcon } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { useToast } from '../../components/ui/Toast'
import { DEMO_ACCOUNT, useSession } from '../../mock/session'
import { nextOnboardingStep } from '../../app/Guards'

/**
 * The onboarding flow, and the only way into the app.
 *
 * The fields are real inputs now: what is typed is validated on the step, and
 * saved onto the account, so signing up creates an account that exists and
 * signing in finds it. Appearance is unchanged — the same 48px boxes on the
 * split steps, the same 38px boxes on the centred ones, the frames' own
 * labels and placeholders.
 */

/** A labelled field, as every onboarding form draws it. */
function Field({ label, placeholder, value, onChange, type, eye, check, select, short, error, onSelect }: {
  label: string; placeholder: string
  value?: string; onChange?: (v: string) => void; type?: string
  eye?: boolean; check?: boolean; select?: boolean
  /** The centred steps draw a 38px box; the split ones draw 48. */
  short?: boolean
  error?: string
  onSelect?: () => void
}) {
  const [reveal, setReveal] = useState(false)
  return (
    <label className="flex flex-col gap-1">
      <span className="text-text-regular text-text-subtitle">{label}</span>
      <span className={cn('flex items-center justify-between gap-3 rounded-sm border-1 px-4 text-body-regular',
        error ? 'border-[#e33a38]' : 'border-stroke-input',
        short ? 'h-[38px]' : 'h-12')}>
        <input
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          type={eye && !reveal ? 'password' : type ?? 'text'}
          readOnly={Boolean(select)}
          onClick={select ? onSelect : undefined}
          className={cn('min-w-0 flex-1 bg-transparent text-body-regular text-text-title outline-none placeholder:text-text-body',
            select && 'cursor-pointer')}
        />
        {eye && (
          <button type="button" aria-label={reveal ? 'Hide password' : 'Show password'} onClick={() => setReveal((r) => !r)}>
            <Eye className={cn('h-5 w-5', reveal ? 'text-text-title' : 'text-text-subtitle')} />
          </button>
        )}
        {check && value && <CheckCircle className="h-5 w-5 text-brand-secondary" />}
        {check && !value && <CheckCircle className="h-5 w-5 text-text-subtitle" />}
        {select && <ChevronDown className="h-5 w-5 text-text-subtitle" />}
      </span>
      {error && <span className="text-text-regular text-[#e33a38]">{error}</span>}
    </label>
  )
}

/** The heading pair every step opens with. */
function Head({ title, sub, centred }: { title: string; sub: string; centred?: boolean }) {
  return (
    <div className={cn('flex flex-col gap-2', centred && 'items-center text-center')}>
      <h1 className="text-[32px] font-semibold leading-[42px] tracking-[-0.02em] text-text-title">{title}</h1>
      <p className="text-body-regular text-text-subtitle">{sub}</p>
    </div>
  )
}

/** Sign Up (1484:81319). */
export function SignUp() {
  const toast = useToast()
  const nav = useNavigate()
  const { signUp } = useSession()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState<{ field?: string; why: string } | null>(null)

  const submit = () => {
    if (!name.trim()) return setError({ field: 'name', why: 'Please enter your full name' })
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError({ field: 'email', why: 'Please enter a valid email address' })
    if (password.length < 8) return setError({ field: 'password', why: 'Use at least 8 characters' })
    if (!agreed) return setError({ why: 'Please accept the terms of use and privacy policy' })
    const res = signUp({ name, email, password })
    if (!res.ok) return setError({ field: 'email', why: res.why ?? 'Could not create that account' })
    setError(null)
    nav('/check-email')
  }

  return (
    <OnboardShell split>
      <Head title="Join as Researcher" sub="Get verified and highly trusted participants quickly!" />
      <div className="flex flex-col gap-4 pt-[34px]">
        <Field label="Full Name" placeholder="E.g. John Doe" value={name} onChange={(v) => { setName(v); setError(null) }}
          error={error?.field === 'name' ? error.why : undefined} />
        <Field label="Work Email" placeholder="Enter work email address" value={email} onChange={(v) => { setEmail(v); setError(null) }}
          error={error?.field === 'email' ? error.why : undefined} />
        <Field label="Password" placeholder="Enter your password" eye value={password} onChange={(v) => { setPassword(v); setError(null) }}
          error={error?.field === 'password' ? error.why : undefined} />
      </div>
      <button type="button" onClick={() => { setAgreed((a) => !a); setError(null) }}
        className="flex items-center gap-3 pt-4 text-left text-body-regular text-text-title">
        <span className={cn('flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-none border-1',
          agreed ? 'border-cta-primary bg-cta-primary text-cta-primaryText' : 'border-cta-tertiaryStroke')}>
          {agreed && <CheckCircle className="h-3 w-3" />}
        </span>
        I agree to Focus Insite&rsquo;s Terms of use and Privacy policy
      </button>
      {error && !error.field && <p className="pt-2 text-text-regular text-[#e33a38]">{error.why}</p>}
      <Button fullWidth size="none" className="mt-[34px] h-12 text-body-medium" onClick={submit}>Sign Up</Button>
      <NavLink to="/signin" className="mt-3 flex h-12 items-center justify-center rounded-sm border-1 border-cta-tertiaryStroke text-body-regular text-text-title hover:bg-bg-1">
        Already have an account?&nbsp;<span className="text-body-medium">Log In</span>
      </NavLink>
      <p className="pt-4 text-center text-body-regular text-text-title">Are you a participant, looking to earn?</p>
      <button type="button" onClick={() => toast('The participant app is a separate build')} className="mt-3 flex h-12 w-full items-center justify-center rounded-sm border-1 border-cta-tertiaryStroke text-body-medium text-text-title hover:bg-bg-1">
        Sign up as a Participant
      </button>
    </OnboardShell>
  )
}

/** Sign In (1484:81364). */
export function SignIn() {
  const nav = useNavigate()
  const location = useLocation() as { state?: { from?: string } }
  const { signIn } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = () => {
    const res = signIn(email, password)
    if (!res.ok) return setError(res.why ?? 'Could not sign in')
    setError(null)
    nav(location.state?.from ?? '/dashboard', { replace: true })
  }

  const useDemo = () => {
    setEmail(DEMO_ACCOUNT.email)
    setPassword(DEMO_ACCOUNT.password)
    const res = signIn(DEMO_ACCOUNT.email, DEMO_ACCOUNT.password)
    if (res.ok) nav(location.state?.from ?? '/dashboard', { replace: true })
  }

  return (
    <OnboardShell split>
      <Head title="Login" sub="Please enter details below to resume" />
      <div className="flex flex-col gap-4 pt-[34px]">
        <Field label="Email" placeholder="Enter email address" value={email} onChange={(v) => { setEmail(v); setError(null) }} />
        <Field label="Password" placeholder="Enter your password" eye value={password} onChange={(v) => { setPassword(v); setError(null) }} />
      </div>
      {error && <p className="pt-2 text-text-regular text-[#e33a38]">{error}</p>}
      <p className="pt-2 text-right text-body-medium text-text-title">Forgot Password?</p>
      <Button fullWidth size="none" className="mt-6 h-12 text-body-medium" onClick={submit}>Login</Button>
      <NavLink to="/signup" className="mt-3 flex h-12 items-center justify-center rounded-sm border-1 border-cta-tertiaryStroke text-body-regular text-text-title hover:bg-bg-1">
        Don&rsquo;t have an account?&nbsp;<span className="text-body-medium">Sign Up</span>
      </NavLink>
      {/* Not in the frame. A demo needs a way into the populated account. */}
      <button type="button" onClick={useDemo}
        className="mt-4 text-center text-text-regular text-text-body hover:text-text-subtitle">
        Demo build: open the populated account ({DEMO_ACCOUNT.email} / {DEMO_ACCOUNT.password})
      </button>
    </OnboardShell>
  )
}

/** The green disc the confirmation steps open with. */
function Seal({ size = 160, icon = 'mail' }: { size?: number; icon?: 'mail' | 'check' }) {
  return (
    <span className="mx-auto flex items-center justify-center rounded-full bg-bgAlt-1 text-brand-secondary"
      style={{ width: size, height: size }}>
      {icon === 'mail' ? <MessageIcon className="h-[72px] w-[72px]" /> : <CheckCircle className="h-[72px] w-[72px]" />}
    </span>
  )
}

/** Check Email (1484:81337). No code is asked for; the link is in the email. */
export function CheckEmail() {
  const nav = useNavigate()
  const { account } = useSession()
  return (
    <OnboardShell split>
      <div className="flex flex-col items-center pt-[20px] text-center">
        <Seal />
        <h1 className="pt-6 text-[26px] font-semibold leading-[34px] tracking-[-0.02em] text-text-title">Check Email!</h1>
        <p className="pt-3 text-body-regular leading-[22px] text-text-subtitle">
          Click on the link sent to your email<br />
          <span className="text-body-medium text-text-title">{account?.email ?? 'emailaddress@domain.com'}</span><br />
          to verify your account and get started
        </p>
        <Button variant="secondary" fullWidth size="none" className="mt-6 h-12 text-body-medium" onClick={() => nav('/organization')}>Open My Email</Button>
        <p className="pt-3 text-text-regular text-text-body">
          Demo build: no email is sent. Use code 123456 wherever one is asked for.
        </p>
      </div>
    </OnboardShell>
  )
}

const INDUSTRIES = ['Healthcare', 'Pharma', 'Finance', 'Consumer', 'Technology', 'Education', 'Travel']

/** Organization Details (1484:81382). */
export function OrganizationDetails() {
  const nav = useNavigate()
  const { account, update } = useSession()
  const [role, setRole] = useState(account?.role ?? '')
  const [company, setCompany] = useState(account?.company ?? '')
  const [vat, setVat] = useState(account?.vat ?? '')
  const [website, setWebsite] = useState(account?.website ?? '')
  const [industry, setIndustry] = useState(account?.industry ?? '')
  const [location, setLocation] = useState(account?.location ?? '')
  const [picker, setPicker] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = () => {
    if (!role.trim() || !company.trim()) return setError('Your role and company name are both needed')
    update({ role, company, vat, website, industry, location })
    nav('/payment-method')
  }

  return (
    <OnboardShell>
      <Head title="Organization Details" sub="Let's setup your account" />
      <div className="flex flex-col gap-4 pt-[32px]">
        <Field label="Your Role" placeholder="Enter your role" value={role} onChange={(v) => { setRole(v); setError(null) }} />
        <Field label="Company Name" placeholder="Enter organization name" value={company} onChange={(v) => { setCompany(v); setError(null) }} />
        <Field label="VAT (Tax) Number" placeholder="Enter registered TAX number" value={vat} onChange={setVat} />
        <Field label="Company Website" placeholder="https://" check value={website} onChange={setWebsite} />
        <div className="relative">
          <Field label="Industry" placeholder="Select company industry" select value={industry} onSelect={() => setPicker((p) => !p)} />
          {picker && (
            <ul className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-sm border-1 border-stroke-input bg-bg-0 shadow-lg">
              {INDUSTRIES.map((i) => (
                <li key={i}>
                  <button type="button" onClick={() => { setIndustry(i); setPicker(false) }}
                    className="flex h-10 w-full items-center px-4 text-left text-body-regular text-text-title hover:bg-bg-1">
                    {i}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Field label="Location" placeholder="City, State, Country" value={location} onChange={setLocation} />
      </div>
      {error && <p className="pt-2 text-text-regular text-[#e33a38]">{error}</p>}
      <Button fullWidth size="none" className="mt-8 h-12 text-body-medium" onClick={submit}>Continue</Button>
    </OnboardShell>
  )
}

/** Payment Method (1512:68177). */
export function PaymentMethod() {
  const nav = useNavigate()
  const { update } = useSession()
  const [card, setCard] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [zip, setZip] = useState('')
  const [error, setError] = useState<string | null>(null)

  const digits = card.replace(/\D/g, '')
  const submit = () => {
    if (digits.length < 12) return setError('Please enter a full card number')
    if (!/^\d{2}\s*\/\s*\d{2,4}$/.test(expiry)) return setError('Expiry should be MM / YYYY')
    if (!/^\d{3,4}$/.test(cvv)) return setError('CVV should be three or four digits')
    if (!name.trim()) return setError('Please enter the name on the card')
    /** Step 1: a card is kept on file at sign-up. Nothing is charged yet. */
    update({ cardLast4: digits.slice(-4) })
    nav('/in-review')
  }

  return (
    <OnboardShell>
      <Head title="Payment Method" sub="Set payment method for easy payments" />
      <div className="flex flex-col gap-4 pt-[32px]">
        <Field label="Card Number" placeholder="0000  0000  0000  0000" short value={card} onChange={(v) => { setCard(v); setError(null) }} />
        <div className="grid grid-cols-2 gap-[19px]">
          <Field label="Expiry Date" placeholder="MM / YYYY" short value={expiry} onChange={(v) => { setExpiry(v); setError(null) }} />
          <Field label="CVV" placeholder="000" short value={cvv} onChange={(v) => { setCvv(v); setError(null) }} />
        </div>
        <Field label="Name on Card" placeholder="Enter name" short value={name} onChange={(v) => { setName(v); setError(null) }} />
        <Field label="Billing Address" placeholder="Enter street or area" short value={address} onChange={setAddress} />
        <Field label="Zip Code" placeholder="Enter zip code" short value={zip} onChange={setZip} />
      </div>
      {error && <p className="pt-2 text-text-regular text-[#e33a38]">{error}</p>}
      <Button fullWidth size="none" className="mt-8 h-12 text-body-medium" onClick={submit}>Continue</Button>
    </OnboardShell>
  )
}

/** In Review (1484:81502). */
export function InReview() {
  const nav = useNavigate()
  const { account } = useSession()
  /**
   * Steps 2 and 3: the checks run, and a person approves anything they cannot
   * resolve. Nothing here approves an account, so it advances after a beat.
   */
  useEffect(() => {
    if (!account) return
    const t = setTimeout(() => nav('/welcome'), 5000)
    return () => clearTimeout(t)
  }, [nav, account])
  return (
    <OnboardShell>
      <div className="flex flex-col items-center pt-[254px] text-center">
        <Seal />
        <h1 className="pt-6 text-[32px] font-semibold leading-[42px] tracking-[-0.02em] text-text-title">Submitted to review!</h1>
        <p className="pt-3 text-body-regular leading-[22px] text-text-subtitle">
          Our team will just review your account credentials quickly<br />and confirm through email within few hours!
        </p>
      </div>
    </OnboardShell>
  )
}

/** Welcome (1484:81512), the one green page. */
export function Welcome() {
  const nav = useNavigate()
  const { account, finishOnboarding } = useSession()

  /** Somebody who lands here without having walked the steps goes back to them. */
  useEffect(() => {
    if (account && !account.company) nav(nextOnboardingStep(account), { replace: true })
  }, [account, nav])

  const start = () => {
    finishOnboarding()
    nav('/dashboard', { replace: true })
  }

  return (
    <OnboardShell green>
      <div className="flex flex-col items-center pt-[208px] text-center">
        <span className="mx-auto flex h-[160px] w-[160px] items-center justify-center rounded-full bg-bg-0 text-brand-secondary">
          <CheckCircle className="h-[84px] w-[84px]" />
        </span>
        <h1 className="pt-6 text-[32px] font-semibold leading-[42px] tracking-[-0.02em] text-text-title">Welcome To Focus Insite!</h1>
        <p className="pt-3 text-body-regular leading-[22px] text-text-subtitle">
          You are now verified and ready to start<br />your research studies now!
        </p>
        <Button fullWidth size="none" className="mt-8 h-12 text-body-medium" onClick={start}>Let&rsquo;s Get Started!</Button>
      </div>
    </OnboardShell>
  )
}
