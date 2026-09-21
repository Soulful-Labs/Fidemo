import { useNavigate } from 'react-router-dom'
import Toggle from '../../components/ui/Toggle'
import TopBar from '../../components/ui/TopBar'
import { useStore } from '../../mock/store'

/** PRD 12 Email Notifications, Figma 979:74836. Toggles write to the store immediately. */
export function EmailNotifications() {
  const navigate = useNavigate()
  const { user, setEmailPref, toast } = useStore()
  const { emailPrefs } = user
  const set = (key: keyof typeof emailPrefs, label: string) => (value: boolean) => {
    setEmailPref(key, value)
    toast(`${label} ${value ? 'on' : 'off'}`)
  }

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Email Notifications" onBack={() => navigate('/profile/settings')} />
      <div className="flex flex-col gap-4 px-4 pb-6 pt-4">
        <Toggle checked={emailPrefs.dailyDigest} onChange={set('dailyDigest', 'Daily Digest')} label="Daily Digest"
          description="Receive daily updates with a summary of updates and opportunities" />
        <span className="h-px w-full bg-stroke-3" />
        <Toggle checked={emailPrefs.personalizedInvitations} onChange={set('personalizedInvitations', 'Personalized Invitations')} label="Personalized Invitations"
          description="Notify for studies that matches your profile" />
        <span className="h-px w-full bg-stroke-3" />
        <Toggle checked={emailPrefs.newsletter} onChange={set('newsletter', 'Newsletter')} label="Newsletter"
          description="Updates and news about this platform" />
      </div>
    </div>
  )
}

/** PRD 12 Consent & Cookies, Figma 979:74848: the same four toggles as onboarding. */
export function ConsentSettings() {
  const navigate = useNavigate()
  const { user, setConsent, toast } = useStore()
  const { consent } = user

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Consent & Cookies" onBack={() => navigate('/profile/settings')} />
      <div className="flex flex-col gap-4 px-4 pb-6 pt-4">
        <Toggle checked={consent.shareProfession} onChange={(v) => { setConsent('shareProfession', v); toast('Saved') }}
          label="Share profession with study clients" description="To match with relevant studies, share your professional details" />
        <Toggle checked={consent.shareProfile} onChange={(v) => { setConsent('shareProfile', v); toast('Saved') }}
          label="Share profile details with platform" description="This helps us personalize your study exploration to find you most relevant studies" />
        <span className="h-px w-full bg-stroke-3" />
        <Toggle checked locked onChange={() => undefined} onBlocked={() => toast('Essential cookies are required for the site to function')}
          label="Essential cookies" description="These are essential for site to function fully." />
        <span className="h-px w-full bg-stroke-3" />
        <Toggle checked={consent.performanceCookie} onChange={(v) => { setConsent('performanceCookie', v); toast('Saved') }}
          label="Performance cookie" description="Helps us measures website visits and interactions to improve the site better for you" />
      </div>
    </div>
  )
}
