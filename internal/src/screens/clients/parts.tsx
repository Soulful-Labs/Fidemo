import type { ReactNode } from 'react'
import Button, { IconButton } from '../../components/ui/Button'
import { ChevronRight, DotsIcon, LinkIcon } from '../../components/ui/icons'
import { Pagination } from '../../components/ui/Table'
import { ACCOUNT, CLIENT_REVIEWS } from '../../mock/clients'
import { Stars } from '../participants/panels'
import { Card, Field } from '../participants/profile/AboutTab'

/**
 * The client header (2051:129453): an 84px photo, name, role, place and a
 * certificate id, "Last active on Oct 5, 2026"; on the right Reviews (profile
 * only), copy link and options. The same header heads a client verification.
 */
export function ClientHeader({ reviews, onReviews, menu }: { reviews?: boolean; onReviews?: () => void; menu?: ReactNode }) {
  return (
    <header className="flex gap-3 rounded-lg bg-bgAlt-1 p-4">
      <img src="/img/clients/jennifer.png" alt="" className="h-[84px] w-[84px] rounded-sm object-cover" />
      <div className="min-w-0 flex-1">
        <h1 className="text-title-s leading-[25px] text-text-title">Jennifer Lee</h1>
        <p className="flex items-center gap-2 pt-1.5 text-text-regular leading-[22px] text-text-subtitle"><span className="text-body-regular">UX Researcher</span><span aria-hidden="true">•</span>New York, USA<span aria-hidden="true">•</span>Cert. ID: HL-R-9F2A-3K7P</p>
        <p className="pt-1.5 text-text-regular leading-5 text-text-body">Last active on Oct 5, 2026</p>
      </div>
      <div className="relative flex items-start gap-3">
        {reviews && <Button variant="tertiary" size="md" className="bg-bgAlt-1 px-3 text-text-regular" rightIcon={<ChevronRight className="h-4 w-4" />} onClick={onReviews}>Reviews</Button>}
        <IconButton label="Copy link" className="ml-1" onClick={() => { void navigator.clipboard?.writeText(window.location.href) }}><LinkIcon className="h-5 w-5" /></IconButton>
        {menu ?? <IconButton label="Client options"><DotsIcon className="h-5 w-5" /></IconButton>}
      </div>
    </header>
  )
}

/** Account Details beside Reviews: the two cards of the client's About tab and of a verification's Profile Details. */
export function ClientAbout() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card title="Account Details">{ACCOUNT.map(([l, v]) => <Field key={l} label={l!} value={v!} />)}</Card>
      <Card title="Reviews">
        <p className="-mt-1 flex h-12 items-center gap-2 rounded-md bg-bg-0 px-3 text-text-regular text-text-subtitle"><Stars value={1} size="h-6 w-6 [&:nth-child(n+2)]:hidden" /><span className="text-title-l text-brand-secondary">4.5</span>of 1,468 reviews</p>
        {CLIENT_REVIEWS.map((r, i) => (
          <article key={i} className="border-b-1 border-stroke-input pb-4 pt-1 text-text-regular leading-5 last-of-type:border-b-1">
            <h3 className="text-body-medium leading-[22px] text-text-title">{r.study}</h3>
            <p className="flex items-center gap-2 pt-1.5 text-text-body"><Stars value={r.stars} size="h-6 w-6" /><span className="text-text-medium text-text-title">{r.score}</span><span>•&nbsp; April 10, 2026</span></p>
            {r.text && <p className="pt-1 text-text-subtitle">{r.text}</p>}
            <p className="flex items-center gap-1 pt-1.5 text-text-subtitle"><span>To participant:</span><span className="text-text-medium text-text-title">{r.to}</span>
              <Stars value={r.back} size="h-5 w-5" /><span className="text-text-medium">{r.backScore}</span><span className="min-w-0 flex-1 truncate text-text-body">{r.reply}</span></p>
          </article>
        ))}
        <Pagination page={1} pages={80} />
      </Card>
    </div>
  )
}
