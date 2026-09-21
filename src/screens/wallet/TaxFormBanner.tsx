import FileField from '../../components/app/FileField'
import { TAX_FORM_THRESHOLD } from '../../lib/derive'
import { money } from '../../lib/format'
import { useStore } from '../../mock/store'

/**
 * Workflow 49: asked for at $600 earned in a year. Earning carries on, but
 * withdrawing waits until the form is on file. The team collects the form
 * off the platform for now; the upload here stands in for sending it.
 */
export default function TaxFormBanner() {
  const { user, taxFormDone, toast } = useStore()
  const year = new Date().getFullYear()

  if (user.taxFormDone) {
    return (
      <p className="flex items-center gap-2 text-text-regular text-text-body">
        <svg viewBox="0 0 24 24" fill="none" width="16" height="16" className="shrink-0 text-brand-secondary"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" /><path d="m8.5 12.5 2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Tax form for {year} on file
      </p>
    )
  }
  if (!user.taxFormRequired) return null

  return (
    <div className="flex flex-col gap-3 rounded-lg border-1 border-yellow-700 bg-bgAlt-2 bg-yellow-fade p-4">
      <p className="text-body-medium text-brand-primary">Tax form needed before you withdraw</p>
      <p className="text-text-regular text-text-subtitle">
        You have earned {money(user.yearEarned)} on HumanLayer in {year}, past the {money(TAX_FORM_THRESHOLD)} point where a tax form is
        required. You can keep earning, and withdrawals open again as soon as the signed form is with the team.
      </p>
      <FileField
        label="Upload signed tax form"
        hint=".pdf, .jpg or .png"
        accept="application/pdf,image/jpeg,image/png"
        onPick={() => { taxFormDone(); toast('Form received. Withdrawals are open again') }}
      />
    </div>
  )
}
