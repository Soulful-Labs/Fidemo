import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppShell from '../../app/AppShell'
import Button from '../../components/ui/Button'
import Tag from '../../components/ui/Tag'
import { MarkSolvedModal } from './HelpPanels'
import { ChevronLeft, Info, LinkIcon, Star } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { THREAD } from '../../mock/help'

/** A bubble and the time under it, left for support and right for the client. */
function Bubble({ mine, children, at, after }: {
  mine?: boolean; children: React.ReactNode; at: string; after?: React.ReactNode
}) {
  return (
    <div className={cn('flex flex-col gap-1', mine ? 'items-end' : 'items-start')}>
      <div className={cn('max-w-[600px] rounded-lg px-4 py-[17px]', mine ? 'bg-bg-1' : 'bg-yellow-30')}>
        {children}
      </div>
      {after}
      <span className="text-label text-text-body">{at}</span>
    </div>
  )
}

/**
 * Ticket Chat (1663:104436 open, 1663:104484 solved). The two frames differ
 * in 0.40% of pixels, in two places: the status tag in the title bar, and
 * whether the composer is drawn at all. A solved ticket cannot be replied to.
 */
export default function TicketChat() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const solved = params.get('state') === 'solved'
  const [ask, setAsk] = useState(params.get('modal') === 'solved')
  const t = THREAD

  return (
    <AppShell hideCreate crumbs={[
      { label: 'Help', to: '/help' },
      { label: 'Support Ticket', to: '/help?tab=tickets' },
      { label: 'Study results not acces…' },
    ]}>
      <div className="min-h-[939px] rounded-lg bg-bg-0 p-4">
        <section className="flex min-h-[916px] flex-col overflow-hidden rounded-lg border-1 border-stroke-input">
          <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b-1 border-stroke-1 px-4">
            <span className="flex items-center gap-2">
              <button type="button" aria-label="Back" onClick={() => nav('/help?tab=tickets')}
                className="flex h-8 w-8 items-center justify-center text-text-subtitle hover:text-text-title">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-title-s leading-[25px] text-text-title">{t.subject}</span>
            </span>
            <span className="flex items-center gap-4">
              <span className="text-body-regular text-text-subtitle">{t.number}</span>
              <Tag tone="grey" className={cn('h-7 px-2.5',
                solved ? 'bg-green-50 text-brand-secondary' : 'bg-yellow-30 text-brand-primary')}>
                {solved ? 'Solved' : 'Open'}
              </Tag>
              <button type="button" aria-label="Ticket info" onClick={() => setAsk(true)}
                className="flex h-8 w-8 items-center justify-center text-text-subtitle hover:text-text-title">
                <Info className="h-6 w-6" />
              </button>
            </span>
          </header>

          <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-4">
            <p className="pb-2 text-center text-text-regular text-text-subtitle">{t.day}</p>

            <Bubble mine at={t.info.at}
              after={<span className="mt-1 h-[128px] w-[170px] rounded-md bg-[#20242c]" aria-label="Attachment" />}>
              <p className="inline-flex items-center gap-2 text-text-regular text-text-subtitle">
                <Info className="h-5 w-5" />{t.info.heading}
              </p>
              <p className="pt-3 text-text-regular leading-5 text-text-subtitle">{t.info.subjectLabel}</p>
              <p className="text-text-regular leading-5 text-text-title">{t.info.subject}</p>
              <p className="pt-3 text-text-regular leading-5 text-text-subtitle">{t.info.messageLabel}</p>
              <p className="text-text-regular leading-5 text-text-title">{t.info.lines[0]}</p>
              <p className="text-text-regular leading-5 text-text-title">&nbsp;</p>
              <p className="text-text-regular leading-5 text-text-title">{t.info.lines[1]}</p>
              <p className="text-text-regular leading-5 text-text-title">{t.info.lines[2]}</p>
            </Bubble>

            <Bubble at={t.reply.at}>
              {t.reply.lines.map((l, i) => (
                <p key={l} className={cn('text-text-regular leading-5 text-text-title', i > 0 && 'pt-5')}>{l}</p>
              ))}
              <span className="mt-3 inline-flex h-7 items-center gap-1.5 rounded-full border-1 border-cta-primary bg-bg-0 px-2.5 text-text-regular text-text-title">
                <Star className="h-4 w-4 text-brand-primary" />{t.reply.badge}
              </span>
            </Bubble>

            <Bubble mine at={t.answer.at}>
              <p className="text-text-regular leading-5 text-text-title">{t.answer.text}</p>
            </Bubble>
          </div>

          {!solved && (
            <div className="flex h-20 shrink-0 items-center gap-4 border-t-1 border-stroke-1 px-4">
              <button type="button" aria-label="Attach a file"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border-1 border-stroke-input text-text-subtitle hover:text-text-title">
                <LinkIcon className="h-5 w-5" />
              </button>
              <span className="flex h-12 flex-1 items-center rounded-sm border-1 border-stroke-input px-4 text-body-regular text-text-body">
                {t.composer}
              </span>
              <Button size="none" className="h-12 w-[103px]" leftIcon={<Star className="h-4 w-4" />}>
                <span className="text-body-medium">Send</span>
              </Button>
            </div>
          )}
        </section>
      </div>

      <MarkSolvedModal open={ask} onClose={() => setAsk(false)} />
    </AppShell>
  )
}
