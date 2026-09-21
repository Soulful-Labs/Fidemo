import Button from '../../components/ui/Button'
import { Copy, PointsCoin, Share } from '../../components/ui/icons'
import { POINTS } from '../../lib/rules'
import { referralLink } from '../../lib/profile'
import { useStore } from '../../mock/store'

function ReferIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="24" height="24" className="shrink-0">
      <circle cx="10" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 20c0-3.5 2.9-5.5 6.5-5.5s6.5 2 6.5 5.5M18 9v6M15 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/** A small gift-box illustration standing in for the one drawn in Figma. */
function Gift() {
  return (
    <svg viewBox="0 0 96 80" width="96" height="80" aria-hidden="true" className="shrink-0">
      <rect x="30" y="30" width="52" height="42" rx="4" className="fill-green-700" />
      <rect x="26" y="22" width="60" height="14" rx="3" className="fill-green-600" />
      <rect x="52" y="22" width="8" height="50" className="fill-brand-primary" />
      <path d="M56 22c-6-10-16-10-14-2 1 4 8 4 14 2Zm0 0c6-10 16-10 14-2-1 4-8 4-14 2Z" className="fill-brand-primary" />
      <circle cx="22" cy="60" r="14" className="fill-green-500" />
      <path d="M16 53v14M28 53v14M16 60h12" className="stroke-bg-0" strokeWidth="3" strokeLinecap="round" />
      <path d="M8 18l1.5 3.5L13 23l-3.5 1.5L8 28l-1.5-3.5L3 23l3.5-1.5L8 18Zm80 24 1.2 2.8 2.8 1.2-2.8 1.2L88 50l-1.2-2.8L84 46l2.8-1.2L88 42Z" className="fill-brand-primary" />
    </svg>
  )
}

/** PRD 5.1 Refer & Earn!, Figma 918:69716. Copy is quoted exactly, grammar included. */
export default function ReferEarnCard({ subtitle }: { subtitle?: string }) {
  const { toast, user } = useStore()
  const REFERRAL_LINK = referralLink(user.name, user.email)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(REFERRAL_LINK)
    } catch {
      // Clipboard is unavailable outside a secure context; the toast still
      // confirms the action so the control is never dead.
    }
    toast('Link copied')
  }

  const invite = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Join HumanLayer', url: REFERRAL_LINK })
        return
      } catch {
        // Share was dismissed or is unavailable; fall back to copying.
      }
    }
    await copy()
  }

  return (
    <section className="flex flex-col gap-4 rounded-lg bg-bg-1 bg-green-fade p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-green-900 text-brand-secondary">
          <ReferIcon />
        </span>
        <h2 className="text-title-m text-brand-secondary">Refer &amp; Earn!</h2>
        <span className="ml-auto flex h-tag items-center gap-2 rounded-full bg-green-900/60 px-3 text-body-medium text-text-title">
          <PointsCoin className="h-5 w-5 text-brand-secondary" />
          {POINTS.REFERRAL} Points
        </span>
      </div>
      <div className="flex items-center gap-3">
        <p className="flex-1 text-body-regular text-text-subtitle">
          {subtitle ?? (
            <>
              Earn <span className="text-body-large text-brand-primary">{POINTS.REFERRAL} points</span> when you
              refer a someone who completes their first study.
            </>
          )}
        </p>
        <Gift />
      </div>
      <div className="flex gap-3">
        <Button className="flex-1" leftIcon={<Share />} onClick={invite}>Invite</Button>
        <Button variant="secondary" className="flex-1" leftIcon={<Copy />} onClick={copy}>Copy Link</Button>
      </div>
    </section>
  )
}
