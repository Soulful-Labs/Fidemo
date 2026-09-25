import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import { Check, Close, Eye, Info } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { ACCOUNT_DIALOGS, CHANGE_PASSWORD, DEACTIVATE } from '../../mock/account'

/** A password box with its reveal eye, as both forms draw it. */
function Secret({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-text-regular text-text-subtitle">{label}</span>
      <span className="flex h-12 items-center justify-between gap-3 rounded-sm border-1 border-stroke-input px-4 text-body-regular text-text-body">
        {placeholder}<Eye className="h-5 w-5 text-text-subtitle" />
      </span>
    </label>
  )
}

/** The dialog shell the two account forms share: a title bar, not a centred title. */
function FormDialog({
  open, onClose, title, children, onSubmit,
}: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; onSubmit?: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-title/25 px-4" role="presentation" onClick={onClose}>
      <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}
        className="flex w-modal flex-col rounded-lg bg-bg-0 shadow-xl">
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 px-4">
          <h2 className="text-title-s text-text-title">{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-sm border-1 border-stroke-input text-text-subtitle hover:text-text-title">
            <Close className="h-4 w-4" />
          </button>
        </header>
        <div className="flex flex-col gap-3 px-4 pb-3">{children}</div>
        <div className="flex gap-4 border-t-1 border-stroke-1 px-4 py-4 [&_button]:h-12 [&_button]:flex-1 [&_button]:text-body-medium">
          <Button variant="tertiary" onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit}>Submit</Button>
        </div>
      </div>
    </div>
  )
}

/** Change Password (1663:104917). */
export function ChangePasswordModal({
  open, onClose, onDone,
}: { open: boolean; onClose: () => void; onDone?: () => void }) {
  const c = CHANGE_PASSWORD
  return (
    <FormDialog open={open} onClose={onClose} title={c.title} onSubmit={onDone}>
      <Secret {...c.fields[0]} />
      <div className="flex flex-col gap-2">
        <Secret {...c.fields[1]} />
        <p className="text-text-regular text-text-title">{c.rule}</p>
      </div>
      <Secret {...c.confirm} />
    </FormDialog>
  )
}

/** Deactivate Account (1663:104938). */
export function DeactivateModal({
  open, onClose, onDone,
}: { open: boolean; onClose: () => void; onDone?: () => void }) {
  return (
    <FormDialog open={open} onClose={onClose} title={DEACTIVATE.title} onSubmit={onDone}>
      <div className="flex flex-col gap-2 border-t-1 border-stroke-1 pt-4">
        <p className="text-text-large text-text-title underline">{DEACTIVATE.note}</p>
        <p className="text-text-regular leading-5 text-text-title">{DEACTIVATE.body}</p>
        <p className="pt-2 text-text-regular text-text-subtitle">{DEACTIVATE.ask}</p>
      </div>
      <Secret {...DEACTIVATE.field} />
    </FormDialog>
  )
}

/** The three account dialogs that only report an outcome. */
export function OutcomeModal({
  open, onClose, kind,
}: { open: boolean; onClose: () => void; kind: 'passwordUpdated' | 'deactivated' | 'activeStudies' }) {
  const d = ACCOUNT_DIALOGS[kind]
  const alert = kind === 'activeStudies'
  return (
    <Modal open={open} onClose={onClose} wide title={d.title} body={d.body}
      footer={<Button fullWidth onClick={onClose}>{'cta' in d ? d.cta : 'Done'}</Button>}>
      <span className={cn('mx-auto -order-1 mb-1 flex h-[160px] w-[160px] items-center justify-center rounded-full',
        alert ? 'bg-[#ffdcc4]' : 'bg-[#fee2b5]')}>
        <span className={cn('flex h-[92px] w-[92px] items-center justify-center rounded-full border-b-4 text-bg-0',
          alert ? 'border-[#c24a00] bg-[#e85d04]' : 'border-yellow-700 bg-cta-primary')}>
          {alert ? <Info className="h-12 w-12" /> : <Check className="h-12 w-12 [&>path]:stroke-[3]" />}
        </span>
      </span>
    </Modal>
  )
}

/** Logout (1663:104959): no title bar, a red glyph tile above the question. */
export function LogoutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const d = ACCOUNT_DIALOGS.logout
  return (
    <Modal open={open} onClose={onClose} compact wide title={d.title} body={d.body}
      footer={
        <>
          <Button variant="tertiary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={onClose}>Logout</Button>
        </>
      }>
      <span className="mx-auto -order-1 mb-1 flex h-[72px] w-[72px] items-center justify-center rounded-lg bg-[#fdecec] text-[#e33a38]">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
          <path d="M15 12H10m5 0-3-3m3 3-3 3" transform="translate(5 0)" />
        </svg>
      </span>
    </Modal>
  )
}
