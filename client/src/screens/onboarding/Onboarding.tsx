import { NavLink, useNavigate } from 'react-router-dom'
import OnboardShell from './OnboardShell'
import Button from '../../components/ui/Button'
import { CheckCircle, ChevronDown, Eye, MessageIcon } from '../../components/ui/icons'
import { cn } from '../../lib/cn'

/** A labelled field, as every onboarding form draws it. */
function Field({ label, placeholder, eye, check, select, short }: {
  label: string; placeholder: string; eye?: boolean; check?: boolean; select?: boolean
  /** The centred steps draw a 38px box; the split ones draw 48. */
  short?: boolean
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-text-regular text-text-subtitle">{label}</span>
      <span className={cn('flex items-center justify-between gap-3 rounded-sm border-1 border-stroke-input px-4 text-body-regular text-text-body',
        short ? 'h-[38px]' : 'h-12')}>
        {placeholder}
        {eye && <Eye className="h-5 w-5 text-text-subtitle" />}
        {check && <CheckCircle className="h-5 w-5 text-text-subtitle" />}
        {select && <ChevronDown className="h-5 w-5 text-text-subtitle" />}
      </span>
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
  const nav = useNavigate()
  return (
    <OnboardShell split>
      <Head title="Join as Researcher" sub="Get verified and highly trusted participants quickly!" />
      <div className="flex flex-col gap-4 pt-[34px]">
        <Field label="Full Name" placeholder="E.g. John Doe" />
        <Field label="Work Email" placeholder="Enter work email address" />
        <Field label="Password" placeholder="Enter your password" eye />
      </div>
      <label className="flex items-center gap-3 pt-4 text-body-regular text-text-title">
        <span className="h-[18px] w-[18px] shrink-0 rounded-none border-1 border-cta-tertiaryStroke" />
        I agree to Focus Insite's Terms of use and Privacy policy
      </label>
      <Button fullWidth size="none" className="mt-[34px] h-12 text-body-medium" onClick={() => nav('/check-email')}>Sign Up</Button>
      <NavLink to="/signin" className="mt-3 flex h-12 items-center justify-center rounded-sm border-1 border-cta-tertiaryStroke text-body-regular text-text-title hover:bg-bg-1">
        Already have an account?&nbsp;<span className="text-body-medium">Log In</span>
      </NavLink>
      <p className="pt-4 text-center text-body-regular text-text-title">Are you a participant, looking to earn?</p>
      <button type="button" className="mt-3 flex h-12 w-full items-center justify-center rounded-sm border-1 border-cta-tertiaryStroke text-body-medium text-text-title hover:bg-bg-1">
        Sign up as a Participant
      </button>
    </OnboardShell>
  )
}

/** Sign In (1484:81364). */
export function SignIn() {
  const nav = useNavigate()
  return (
    <OnboardShell split>
      <Head title="Login" sub="Please enter details below to resume" />
      <div className="flex flex-col gap-4 pt-[34px]">
        <Field label="Email" placeholder="Enter email address" />
        <Field label="Password" placeholder="Enter your password" />
      </div>
      <p className="pt-2 text-right text-body-medium text-text-title">Forgot Password?</p>
      <Button fullWidth size="none" className="mt-6 h-12 text-body-medium" onClick={() => nav('/dashboard')}>Login</Button>
      <NavLink to="/signup" className="mt-3 flex h-12 items-center justify-center rounded-sm border-1 border-cta-tertiaryStroke text-body-regular text-text-title hover:bg-bg-1">
        Don't have an account?&nbsp;<span className="text-body-medium">Sign Up</span>
      </NavLink>
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
  return (
    <OnboardShell split>
      <div className="flex flex-col items-center pt-[20px] text-center">
        <Seal />
        <h1 className="pt-6 text-[26px] font-semibold leading-[34px] tracking-[-0.02em] text-text-title">Check Email!</h1>
        <p className="pt-3 text-body-regular leading-[22px] text-text-subtitle">
          Click on the link sent to your email<br />
          <span className="text-body-medium text-text-title">emailaddress@domain.com</span><br />
          to verify your account and get started
        </p>
        <Button variant="secondary" fullWidth size="none" className="mt-6 h-12 text-body-medium">Open My Email</Button>
        <p className="pt-3 text-text-regular text-text-body">
          Demo build: no email is sent. Use code 123456 wherever one is asked for.
        </p>
      </div>
    </OnboardShell>
  )
}

/** Organization Details (1484:81382). */
export function OrganizationDetails() {
  const nav = useNavigate()
  return (
    <OnboardShell>
      <Head title="Organization Details" sub="Let's setup your account" />
      <div className="flex flex-col gap-4 pt-[32px]">
        <Field label="Your Role" placeholder="Enter your role" />
        <Field label="Company Name" placeholder="Enter organization name" />
        <Field label="VAT (Tax) Number" placeholder="Enter registered TAX number" />
        <Field label="Company Website" placeholder="https://" check />
        <Field label="Industry" placeholder="Select company industry" select />
        <Field label="Location" placeholder="City, State, Country" />
      </div>
      <Button fullWidth size="none" className="mt-8 h-12 text-body-medium" onClick={() => nav('/payment-method')}>Continue</Button>
    </OnboardShell>
  )
}

/** Payment Method (1512:68177). */
export function PaymentMethod() {
  const nav = useNavigate()
  return (
    <OnboardShell>
      <Head title="Payment Method" sub="Set payment method for easy payments" />
      <div className="flex flex-col gap-4 pt-[32px]">
        <Field label="Card Number" placeholder="0000  0000  0000  0000" short />
        <div className="grid grid-cols-2 gap-[19px]">
          <Field label="Expiry Date" placeholder="MM / YYYY" short />
          <Field label="CVV" placeholder="000" short />
        </div>
        <Field label="Name on Card" placeholder="Enter name" short />
        <Field label="Billing Address" placeholder="Enter street or area" short />
        <Field label="Zip Code" placeholder="Enter zip code" short />
      </div>
      <Button fullWidth size="none" className="mt-8 h-12 text-body-medium" onClick={() => nav('/in-review')}>Continue</Button>
    </OnboardShell>
  )
}

/** In Review (1484:81502). */
export function InReview() {
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
        <Button fullWidth size="none" className="mt-8 h-12 text-body-medium" onClick={() => nav('/dashboard')}>Let's Get Started!</Button>
      </div>
    </OnboardShell>
  )
}
