import BottomSheet from '../../components/ui/BottomSheet'
import Button from '../../components/ui/Button'
import Toggle from '../../components/ui/Toggle'
import { useStore } from '../../mock/store'

/**
 * PRD 4.9, Figma 915:50322. Four toggles, essential cookies locked on, with
 * hairlines between the sharing pair and each cookie row.
 *
 * Conflict 2 notes that workflow step 21 describes a single consent at
 * registration, which is a different model; the four toggles are built as
 * drawn pending that decision (open item 2).
 */
export default function ConsentModal({
  open, onClose, onSave,
}: { open: boolean; onClose: () => void; onSave: () => void }) {
  const { user, setConsent, toast } = useStore()
  const { consent } = user

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Consent"
      footer={<Button fullWidth onClick={onSave}>Save &amp; Continue</Button>}
    >
      <div className="flex flex-col gap-4">
        <Toggle
          checked={consent.shareProfession}
          onChange={(v) => setConsent('shareProfession', v)}
          label="Share profession with study clients"
          description="To match with relevant studies, share your professional details"
        />
        <Toggle
          checked={consent.shareProfile}
          onChange={(v) => setConsent('shareProfile', v)}
          label="Share profile details with platform"
          description="This helps us personalize your study exploration to find you most relevant studies"
        />
        <span className="h-px w-full bg-stroke-3" />
        <Toggle
          checked
          locked
          onChange={() => undefined}
          onBlocked={() => toast('Essential cookies are required for the site to function')}
          label="Essential cookies"
          description="These are essential for site to function fully."
        />
        <span className="h-px w-full bg-stroke-3" />
        <Toggle
          checked={consent.performanceCookie}
          onChange={(v) => setConsent('performanceCookie', v)}
          label="Performance cookie"
          description="Helps us measures website visits and interactions to improve the site better for you"
        />
      </div>
    </BottomSheet>
  )
}
