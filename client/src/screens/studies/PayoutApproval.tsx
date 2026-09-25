import { useState } from 'react'
import Button from '../../components/ui/Button'
import { CheckCircle, Close, ShieldIcon } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import Pagination from '../../components/client/Pagination'
import { pageLabels, paginate, payoutList } from '../../lib/derive'
import type { Study } from '../../mock/db'
import { useStudies } from '../../mock/store'
import { useToast } from '../../components/ui/Toast'

/**
 * Workflow step 46, **which no Figma frame draws**.
 *
 * "The platform builds the payout list from verification, attendance and
 * completion. The client confirms it against their own approved list, so
 * nobody can be added who was not approved into the study. Anyone who
 * completed the study is paid. The tick is a fraud check, not a judgement on
 * their answers. Nothing leaves the account until that is done."
 *
 * It lives on the Pay tab because this is the study's money screen and the
 * approval is per study, and because everything it needs — attendance, the
 * session code and completion — is already counted here. It is built from
 * the existing tokens and table rules rather than invented styling, and it
 * is flagged in docs/Stage-Two-Conflicts.md as an addition the designs will
 * have to catch up with.
 */
export default function PayoutApproval({ study }: { study: Study }) {
  const { approvePayouts } = useStudies()
  const toast = useToast()
  const rows = payoutList(study)
  const [picked, setPicked] = useState<string[]>(() => rows.filter((r) => r.codeConfirmed).map((r) => r.person.id))
  const [page, setPage] = useState(1)
  const shown = paginate(rows, page)

  if (rows.length === 0) return null

  const outstanding = rows.filter((r) => !r.person.participation.payoutApproved)
  const total = picked.reduce((n, id) => n + (rows.find((r) => r.person.id === id)?.amount ?? 0), 0)
  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  const release = () => {
    const res = approvePayouts(study.id, picked)
    toast(res.ok ? `${picked.length} payouts approved for release` : res.why)
  }

  return (
    <section className="pt-6">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-title-s leading-[22px] text-text-title">Approve Respondent Payouts</h3>
          <p className="text-text-regular text-text-subtitle">
            Built from verification, attendance and completion. Nothing leaves your account until you confirm it.
            The tick is a fraud check, not a judgement on anyone&rsquo;s answers.
          </p>
        </div>
        <Button size="none" className="h-[38px] shrink-0 px-4" disabled={picked.length === 0 || outstanding.length === 0}
          onClick={release} leftIcon={<ShieldIcon className="h-4 w-4" />}>
          Approve {picked.length} &middot; ${total.toLocaleString('en-US')}
        </Button>
      </div>

      <div className="mt-4 overflow-hidden rounded-md border-1 border-stroke-input">
        <table className="w-full table-fixed border-collapse text-left">
          <thead>
            <tr className="border-b-1 border-stroke-input bg-bg-1">
              <th className="h-row w-[6%] px-[18px]" />
              <th className="h-row w-[26%] px-[18px] text-text-regular font-normal text-text-subtitle">Name</th>
              <th className="h-row w-[32%] px-[18px] text-text-regular font-normal text-text-subtitle">Role</th>
              <th className="h-row w-[22%] px-[18px] text-text-regular font-normal text-text-subtitle">Session code</th>
              <th className="h-row w-[14%] px-[18px] text-right text-text-regular font-normal text-text-subtitle">Incentive</th>
            </tr>
          </thead>
          <tbody>
            {shown.rows.map((r) => {
              const on = picked.includes(r.person.id)
              const locked = !r.codeConfirmed || r.person.participation.payoutApproved
              return (
                <tr key={r.person.id} className="border-b-1 border-stroke-input last:border-b-0">
                  <td className="h-row px-[18px]">
                    <button type="button" aria-label={`Approve ${r.person.name}`} disabled={locked}
                      aria-pressed={on} onClick={() => toggle(r.person.id)}
                      className={cn('flex h-5 w-5 items-center justify-center rounded-none border-1 transition-colors',
                        locked ? 'border-stroke-input bg-bg-1 text-text-disabled'
                          : on ? 'border-cta-primary bg-cta-primary text-cta-primaryText'
                            : 'border-cta-tertiaryStroke bg-bg-0')}>
                      {(on || r.person.participation.payoutApproved) && <CheckCircle className="h-3.5 w-3.5" />}
                    </button>
                  </td>
                  <td className="h-row px-[18px] text-text-regular text-text-title">{r.person.name}</td>
                  <td className="h-row px-[18px] text-text-regular text-text-title">{r.person.role}</td>
                  <td className="h-row px-[18px]">
                    {r.codeConfirmed ? (
                      <span className="inline-flex items-center gap-1.5 text-text-regular text-brand-secondary">
                        <CheckCircle className="h-4 w-4" />Confirmed both sides
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-text-regular text-[#d97706]">
                        <Close className="h-4 w-4" />No code, no payment
                      </span>
                    )}
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
