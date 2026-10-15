import { useState } from 'react'
import { CheckCircle, Close } from '../../components/ui/icons'
import Pagination from '../../components/client/Pagination'
import { pageLabels, paginate, payoutList } from '@shared/derive'
import type { ClientStudy as Study } from '../../platform'
import { useStudies } from '../../platform'

/**
 * Respondent Payouts, on the Pay tab. **No Figma frame draws it.**
 *
 * The list the platform builds from verification, attendance and completion.
 * The client does not release anything here, and nothing is paid
 * automatically: when the study finishes, the client is notified that these
 * participants will now be paid, and the Focus Insite team processes the
 * payouts by hand in the console. A session without its code confirmed on
 * both sides stays unpaid ("no code, no payment").
 */
export default function PayoutApproval({ study }: { study: Study }) {
  const { state: world } = useStudies()
  const rows = payoutList(world, study)
  const [page, setPage] = useState(1)
  const shown = paginate(rows, page)

  if (rows.length === 0) return null

  const finished = study.state === 'completed'
  const status = (paid: boolean, code: boolean) =>
    paid ? 'Paid' : !code ? 'No code, no payment' : finished ? 'Being paid by the Focus Insite team' : 'Paid by the team when the study finishes'

  return (
    <section className="pt-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-title-s leading-[22px] text-text-title">Respondent Payouts</h3>
        <p className="text-text-regular text-text-subtitle">
          Nothing is paid automatically. When your study finishes you are notified that these participants will be paid,
          and the Focus Insite team processes the payouts.
        </p>
      </div>

      <div className="mt-4 overflow-hidden rounded-md border-1 border-stroke-input">
        <table className="w-full table-fixed border-collapse text-left">
          <thead>
            <tr className="border-b-1 border-stroke-input bg-bg-1">
              <th className="h-row w-[26%] px-[18px] text-text-regular font-normal text-text-subtitle">Name</th>
              <th className="h-row w-[26%] px-[18px] text-text-regular font-normal text-text-subtitle">Role</th>
              <th className="h-row w-[34%] px-[18px] text-text-regular font-normal text-text-subtitle">Payout</th>
              <th className="h-row w-[14%] px-[18px] text-right text-text-regular font-normal text-text-subtitle">Incentive</th>
            </tr>
          </thead>
          <tbody>
            {shown.rows.map((r) => {
              const paid = Boolean(r.person.participation.paidAt)
              return (
                <tr key={r.person.id} className="border-b-1 border-stroke-input last:border-b-0">
                  <td className="h-row px-[18px] text-text-regular text-text-title">{r.person.name}</td>
                  <td className="h-row px-[18px] text-text-regular text-text-title">{r.person.role}</td>
                  <td className="h-row px-[18px]">
                    <span className={`inline-flex items-center gap-1.5 text-text-regular ${paid ? 'text-brand-secondary' : r.codeConfirmed ? 'text-text-subtitle' : 'text-[#d97706]'}`}>
                      {paid ? <CheckCircle className="h-4 w-4" /> : !r.codeConfirmed ? <Close className="h-4 w-4" /> : null}
                      {status(paid, r.codeConfirmed)}
                    </span>
                  </td>
                  <td className="h-row px-[18px] text-right text-text-regular text-text-title">
                    ${r.amount.toLocaleString('en-US')}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {shown.total > 1 && (
        <Pagination page={shown.page} pages={pageLabels(shown.total, shown.page)} onPage={setPage} />
      )}
    </section>
  )
}
