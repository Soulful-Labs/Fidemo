import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import Toggle from '../../components/ui/Toggle'
import Pagination from '../../components/client/Pagination'
import { ChangePasswordModal, DeactivateModal, LogoutModal, OutcomeModal } from './AccountModals'
import { Check, CheckCircle, ChevronDown, ChevronRight, Star, StarFilled, Trash, UsersIcon, VerifiedMark } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { CERTIFICATE, CLIENT_RATING, CLIENT_REVIEWS, EMAIL_PREFS, PROFILE_FIELDS } from '../../mock/account'
import { useToast } from '../../components/ui/Toast'

const NAV = [
  { key: 'profile', label: 'Profile' },
  { key: 'reviews', label: 'Rating & Reviews' },
  { key: 'certificate', label: 'Certificate' },
  { key: 'settings', label: 'Settings' },
  { key: 'logout', label: 'Logout' },
]

/** One labelled field of the profile form. */
function Field({ label, value, locked, verified, select }: {
  label: string; value: string; locked?: boolean; verified?: boolean; select?: boolean
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-text-regular text-text-subtitle">{label}</span>
      <span className={cn('flex h-12 items-center justify-between gap-3 rounded-sm border-1 border-stroke-input px-4 text-body-regular',
        locked ? 'bg-bg-1 text-text-body' : 'text-text-title')}>
        {value}
        {verified && <CheckCircle className="h-5 w-5 text-text-subtitle" />}
        {select && <ChevronDown className="h-5 w-5 text-text-subtitle" />}
      </span>
    </label>
  )
}

/** Five stars with the number beside them, as the reviews list draws them. */
function Stars({ n }: { n: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        i <= n ? <StarFilled key={i} className="h-5 w-5 text-brand-primary" />
          : <Star key={i} className="h-5 w-5 text-text-disabled" />
      ))}
    </span>
  )
}

/**
 * Account (1663:104600 profile, 104635 reviews, 104813 certificate, 104876
 * settings). One screen: a 197px sub-navigation and a 600px column. Logout is
 * the fifth item and raises a dialog rather than changing the column.
 */
export default function Account() {
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'profile'
  const [modal, setModal] = useState(params.get('modal') ?? '')
  const go = (k: string) => {
    if (k === 'logout') { setModal('logout'); return }
    const n = new URLSearchParams(params); n.set('tab', k); setParams(n)
  }

  return (
    <AppShell hideCreate crumbs={[{ label: 'Account' }]}>
      <div className="min-h-[941px] rounded-lg bg-bg-0 p-4">
        <div className="flex gap-[78px]">
          <nav className="h-fit w-[197px] shrink-0 rounded-lg border-1 border-stroke-input p-2">
            {NAV.map((n) => (
              <button key={n.key} type="button" onClick={() => go(n.key)}
                className={cn('flex h-[42px] w-full items-center gap-3 rounded-sm px-3 text-body-regular',
                  n.key === tab ? 'bg-yellow-30 text-brand-primary' : 'text-text-title hover:bg-bg-1')}>
                {n.key === 'reviews' ? <Star className="h-5 w-5" />
                  : n.key === 'certificate' ? <VerifiedMark className="h-5 w-5" />
                    : n.key === 'settings' ? <CheckCircle className="h-5 w-5" />
                      : n.key === 'logout' ? <Trash className="h-5 w-5" />
                        : <UsersIcon className="h-5 w-5" />}
                {n.label}
              </button>
            ))}
          </nav>

          <div className="w-[600px]">
            {tab === 'profile' && (
              <>
                {[PROFILE_FIELDS.about, PROFILE_FIELDS.workspace].map((b, i) => (
                  <div key={b.label} className={cn('flex flex-col gap-3', i > 0 && 'pt-8')}>
                    <p className="text-title-s leading-[22px] text-text-title">{b.label}</p>
                    {b.fields.map((f) => <Field key={f.label} {...f} />)}
                  </div>
                ))}
                <Button fullWidth className="mt-8 h-12 text-body-medium" onClick={() => toast('Saved')}>Save Changes</Button>
              </>
            )}

            {tab === 'reviews' && (
              <>
                <div className="flex h-[74px] items-center gap-3 rounded-lg bg-bgAlt-1 px-4">
                  <StarFilled className="h-8 w-8 text-brand-primary" />
                  <span className="text-title-l text-brand-secondary">{CLIENT_RATING.score}</span>
                  <span className="text-body-regular text-text-subtitle">{CLIENT_RATING.of}</span>
                </div>
                {CLIENT_REVIEWS.map((r, i) => (
                  <div key={i} className="flex flex-col gap-1.5 border-b-1 border-stroke-1 py-3">
                    <p className="text-body-medium text-text-title">{r.study}</p>
                    <p className="flex items-center gap-2">
                      <Stars n={r.stars} />
                      <span className="text-body-medium text-text-title">{r.rating}</span>
                      <span className="text-text-body">&bull;</span>
                      <span className="text-text-regular text-text-subtitle">{r.at}</span>
                    </p>
                    {r.body && <p className="text-text-regular leading-5 text-text-subtitle">{r.body}</p>}
                    <p className="flex items-center gap-2 truncate">
                      <span className="shrink-0 text-text-regular text-text-subtitle">To participant:</span>
                      <span className="shrink-0 text-body-medium text-text-title">{r.to}</span>
                      <Stars n={r.toStars} />
                      <span className="shrink-0 text-body-medium text-text-title">{r.toRating}</span>
                      {r.toBody && <span className="truncate text-text-regular text-text-body">{r.toBody}</span>}
                    </p>
                  </div>
                ))}
                <Pagination pages={[1, 2, '…', 79, 80]} />
              </>
            )}

            {tab === 'certificate' && (
              <>
                <div className="flex h-[86px] items-center gap-3 rounded-lg border-1 border-stroke-input px-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-green-50 text-brand-secondary">
                    <CheckCircle className="h-6 w-6" />
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-body-medium text-text-title">{CERTIFICATE.banner}</span>
                    <span className="text-text-regular text-text-subtitle">{CERTIFICATE.since}</span>
                  </span>
                </div>
                <div className="mt-3 flex flex-col gap-4 rounded-lg bg-bgAlt-1 p-4">
                  <p className="text-title-s leading-[22px] text-text-title">{CERTIFICATE.title}</p>
                  <span className="flex flex-col gap-1">
                    <span className="text-text-regular text-text-subtitle">{CERTIFICATE.idLabel}</span>
                    <span className="text-body-large text-text-title">{CERTIFICATE.id}</span>
                  </span>
                  <span className="flex flex-col gap-3">
                    <span className="text-text-regular text-text-subtitle">{CERTIFICATE.verifiedLabel}</span>
                    {CERTIFICATE.verified.map((v) => (
                      <span key={v} className="inline-flex items-center gap-2 text-text-regular text-text-title">
                        <CheckCircle className="h-[18px] w-[18px] text-brand-secondary" />{v}
                      </span>
                    ))}
                  </span>
                </div>
              </>
            )}

            {tab === 'settings' && (
              <>
                <p className="text-title-s leading-[22px] text-text-title">Email Notifications</p>
                {EMAIL_PREFS.map((p) => (
                  <div key={p.label} className="flex items-center justify-between gap-4 border-b-1 border-stroke-1 py-3">
                    <span className="flex flex-col gap-1">
                      <span className="text-body-regular text-text-title">{p.label}</span>
                      <span className="text-text-regular text-text-subtitle">{p.sub}</span>
                    </span>
                    <Toggle checked onChange={() => undefined} />
                  </div>
                ))}
                <p className="pt-6 text-title-s leading-[22px] text-text-subtitle">Manage Account</p>
                {[['Change Password', 'password'], ['Deactivate Account', 'deactivate']].map(([label, key]) => (
                  <button key={key} type="button" onClick={() => setModal(key)}
                    className="mt-3 flex h-14 w-full items-center gap-3 rounded-lg bg-bg-1 px-4 text-body-regular text-text-title hover:bg-bg-2">
                    {key === 'password' ? <Check className="h-5 w-5 text-text-subtitle" /> : <Trash className="h-5 w-5 text-text-subtitle" />}
                    <span className="flex-1 text-left">{label}</span>
                    <ChevronRight className="h-5 w-5 text-text-subtitle" />
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <ChangePasswordModal open={modal === 'password'} onClose={() => setModal('')} onDone={() => setModal('pwddone')} />
      <DeactivateModal open={modal === 'deactivate'} onClose={() => setModal('')} onDone={() => setModal('active')} />
      <OutcomeModal open={modal === 'pwddone'} onClose={() => setModal('')} kind="passwordUpdated" />
      <OutcomeModal open={modal === 'deactivated'} onClose={() => setModal('')} kind="deactivated" />
      <OutcomeModal open={modal === 'active'} onClose={() => setModal('')} kind="activeStudies" />
      <LogoutModal open={modal === 'logout'} onClose={() => setModal('')} />
    </AppShell>
  )
}
