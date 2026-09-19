import Button from '../../components/ui/Button'
import Tag from '../../components/ui/Tag'
import { POINTS } from '../../lib/rules'
import { REFERRAL_LINK } from '../../mock/data'
import { useStore } from '../../mock/store'

/** PRD 5.1 Refer & Earn!. Copy is quoted exactly, grammar included. */
export default function ReferEarnCard({ subtitle }: { subtitle?: string }) {
  const { toast } = useStore()

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
    <section className="flex flex-col gap-3 rounded-lg border-1 border-stroke-2 bg-bg-1 bg-yellow-fade p-4">
      <div className="flex items-center gap-2">
        <h2 className="text-title-s text-text-title">Refer &amp; Earn!</h2>
        <Tag tone="yellow" className="ml-auto">{POINTS.REFERRAL} Points</Tag>
      </div>
      <p className="text-text-regular text-text-body">
        {subtitle ?? `Earn ${POINTS.REFERRAL} points when you refer a someone who completes their first study.`}
      </p>
      <div className="flex gap-2">
        <Button size="md" className="flex-1" onClick={invite}>Invite</Button>
        <Button size="md" variant="tertiary" className="flex-1" onClick={copy}>Copy Link</Button>
      </div>
    </section>
  )
}
