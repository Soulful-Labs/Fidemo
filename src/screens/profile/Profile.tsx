import RollingNumber from '../../components/motion/RollingNumber'
import { useArrival } from '../../components/motion/useArrival'
import { CSS } from '../../lib/motion'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ScoreDial from '../../components/app/ScoreDial'
import TierChip from '../../components/app/TierChip'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { ChevronRight } from '../../components/ui/icons'
import { tierFor } from '../../lib/rules'
import { useStore } from '../../mock/store'
import { CertificateIcon, ReferIcon, SettingsIcon, SignOutIcon, SupportIcon } from './profileIcons'

/** Initials avatar inside the green progress ring drawn on the profile card. */
export function Avatar({ name, completion, size = 80 }: { name: string; completion?: number; size?: number }) {
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('')
  const r = 46
  const c = 2 * Math.PI * r
  const base = useRef<SVGCircleElement>(null)
  const piece = useRef<SVGCircleElement>(null)

  // Moment D for the completion ring, opacity only: the newly earned arc glows
  // in over the old one, or the lost arc fades out, then the ring settles.
  useArrival(completion ?? 0, completion == null ? undefined : 'profile-ring', (from, to) => {
    const b = base.current, p = piece.current
    if (!b || !p) return
    const arc = (pct: number) => String(c * (1 - pct / 100))
    if (from === undefined || from === to) { b.setAttribute('stroke-dashoffset', arc(to)); p.style.opacity = '0'; return }
    const lo = Math.min(from, to), hi = Math.max(from, to)
    b.setAttribute('stroke-dashoffset', arc(lo))
    p.setAttribute('stroke-dasharray', `${(c * (hi - lo)) / 100} ${c}`)
    p.setAttribute('stroke-dashoffset', String((-c * lo) / 100))
    const gain = to > from
    const a = p.animate(gain ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }],
      { duration: gain ? CSS.slow : CSS.base, easing: CSS.out, fill: 'forwards' })
    a.onfinish = () => { b.setAttribute('stroke-dashoffset', arc(to)); a.cancel(); p.style.opacity = '0' }
    return () => a.cancel()
  })

  return (
    <span className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      {completion != null && (
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" strokeWidth="4" stroke="currentColor" className="text-green-900" />
          <circle ref={base} cx="50" cy="50" r={r} fill="none" strokeWidth="4" stroke="currentColor" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - completion / 100)} className="text-brand-secondary" />
          <circle ref={piece} cx="50" cy="50" r={r} fill="none" strokeWidth="4" stroke="currentColor" strokeLinecap="round" style={{ opacity: 0 }} className="text-brand-secondary" />
        </svg>
      )}
      <span className="flex h-[80%] w-[80%] items-center justify-center rounded-full bg-bg-2 text-title-m text-text-title">
        {initials || <svg viewBox="0 0 24 24" fill="none" width="40%" height="40%"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" /><path d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>}
      </span>
    </span>
  )
}

const ROWS = [
  { label: 'Human Certificate', to: '/profile/certificate', Icon: CertificateIcon },
  { label: 'Refer & Earn', to: '/profile/referrals', Icon: ReferIcon },
  { label: 'Account Settings', to: '/profile/settings', Icon: SettingsIcon },
  { label: 'Help & Support', to: '/support', Icon: SupportIcon },
]

/** PRD 12, Figma 979:74082. */
export default function Profile() {
  const navigate = useNavigate()
  const { user, signOut } = useStore()
  const [logout, setLogout] = useState(false)
  const tier = tierFor(user.trustScore)

  const row = (label: string, Icon: typeof CertificateIcon, onClick: () => void) => (
    <button key={label} type="button" onClick={onClick} className="flex h-14 w-full items-center gap-3 rounded-lg bg-bg-1 px-4 text-left">
      <Icon className="text-brand-primary" />
      <span className="text-body-medium text-text-title">{label}</span>
      <ChevronRight className="ml-auto text-text-body" />
    </button>
  )

  return (
    <div className="flex min-h-full flex-col gap-3 px-4 pb-6 pt-4">
      <section className="flex items-center gap-4 rounded-lg bg-bg-1 bg-green-fade p-4">
        <Avatar name={user.name} completion={user.profileCompletion} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {user.name && <p className="truncate text-body-medium text-text-title">{user.name}</p>}
          <p className="text-text-regular text-brand-secondary"><RollingNumber value={user.profileCompletion} format={String} memory="profile-pct" />% completed</p>
          <Button size="md" variant="tertiary" rightIcon={<ChevronRight className="h-4 w-4" />} onClick={() => navigate('/profile/edit')}>
            Complete Profile
          </Button>
        </div>
      </section>

      <button type="button" onClick={() => navigate('/trust-score')} className="flex items-center gap-3 rounded-lg bg-bg-1 bg-yellow-fade p-4 text-left">
        <div className="flex flex-1 flex-col gap-3">
          <span className="flex items-center gap-1 text-body-regular text-text-subtitle">Trust Score &amp; Tier <ChevronRight className="h-4 w-4" /></span>
          <TierChip tier={tier} />
        </div>
        <ScoreDial score={user.trustScore} size="sm" memory="trust-profile" />
      </button>

      {ROWS.map((r) => row(r.label, r.Icon, () => navigate(r.to)))}
      {row('Sign Out', SignOutIcon, () => setLogout(true))}

      <Modal open={logout} onClose={() => setLogout(false)} showClose={false}
        footer={
          <div className="flex gap-3">
            <Button variant="tertiary" className="flex-1" onClick={() => setLogout(false)}>Cancel</Button>
            <Button className="flex-1" onClick={() => { signOut(); navigate('/signin', { replace: true }) }}>Logout</Button>
          </div>
        }>
        <div className="flex flex-col gap-2 text-center">
          <h2 className="text-title-l text-text-title">Logout?</h2>
          <p className="text-body-regular text-text-subtitle">Are you sure you want to logout of your account?</p>
        </div>
      </Modal>
    </div>
  )
}
