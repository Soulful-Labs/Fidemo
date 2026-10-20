import { useRef, useState } from 'react'
import Button from '../../components/ui/Button'
import { Close, NoteIcon, Upload } from '../../components/ui/icons'
import { useToast } from '../../components/ui/Toast'
import { audienceFromPrompt, saysNothing, screenerFromPrompt } from '../../lib/fromPrompt'
import { useDraft } from '../../mock/createStore'
import { buildScreener } from '@shared/questions'

const SPARKLE = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
    <path d="m12 3 1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3Zm7 10 .8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z"
      stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
)

/** Brief files the browser can read as text. Anything else is attached by name only. */
const READABLE = /\.(txt|md|csv)$/i

/**
 * New Study (19 Oct 2026 export, New Study and New Study States): where Create
 * Study starts. The client describes the study, and can attach a brief; a
 * text brief is read into the description. Generate and Fill reads it all
 * (lib/fromPrompt.ts, no model) and fills the About description, the Audience
 * and the Screener with only what the text says. Fill from scratch skips it.
 */
export default function NewStudyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast()
  const { draft, set } = useDraft()
  const [text, setText] = useState('')
  const [brief, setBrief] = useState<{ name: string; body: string } | null>(null)
  const file = useRef<HTMLInputElement>(null)
  if (!open) return null

  const attach = (f: File | undefined) => {
    if (!f) return
    if (!READABLE.test(f.name)) { setBrief({ name: f.name, body: '' }); toast('Only a text brief (.txt, .md, .csv) can be read here. Describe what it says in the box.'); return }
    f.text().then((body) => setBrief({ name: f.name, body }))
  }
  const all = [text.trim(), brief?.body.trim() ?? ''].filter(Boolean).join('\n')

  const generate = () => {
    if (!all || saysNothing(all)) { toast('Your description does not say what the study is about or who it is for, so nothing was filled'); return }
    set('aiPrompt', all)
    const audience = audienceFromPrompt(all, draft)
    for (const [k, v] of Object.entries(audience.patch)) set(k as keyof typeof audience.patch, v as never)
    const made = screenerFromPrompt(all, 1)
    const screened = made.length > 0 && buildScreener(made).ok
    if (screened) set('questions', made)
    toast(`Filled ${audience.filled.length} field${audience.filled.length === 1 ? '' : 's'}${screened ? ` and ${made.length} screener questions` : ''} from your description`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-title/25 px-4" role="presentation" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="New Study" onClick={(e) => e.stopPropagation()}
        className="flex w-panel flex-col overflow-hidden rounded-lg bg-bg-0 shadow-xl">
        <div className="flex h-14 items-center justify-between border-b-1 border-stroke-1 px-4">
          <span className="text-title-m text-text-title">New Study</span>
          <button type="button" aria-label="Close" onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-sm border-1 border-stroke-input text-text-title hover:bg-bg-1">
            <Close className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-title-s text-text-title">Tell us about your study</h2>
            <p className="text-body-regular text-text-subtitle">Describe your project and we&apos;ll set it up for you.</p>
          </div>
          <div className="flex flex-col gap-3 rounded-lg border-1 border-stroke-2 bg-bgAlt-1 p-3">
            {brief && (
              <span className="flex items-center gap-2 self-start rounded-md bg-bg-2 px-2.5 py-1.5 text-body-regular text-text-title">
                {brief.name}
                <button type="button" aria-label="Remove brief" onClick={() => setBrief(null)} className="text-text-body hover:text-text-title"><Close className="h-4 w-4" /></button>
              </span>
            )}
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} aria-label="Describe your study"
              placeholder="We're a healthcare company exploring how patients over 50 navigate telehealth platforms and what frustrations they encounter..."
              className="w-full resize-none bg-transparent text-body-regular text-text-title outline-none placeholder:text-text-body" />
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => file.current?.click()} className="flex items-center gap-2 text-body-regular text-text-title hover:text-brand-primary">
                <Upload className="h-5 w-5" />Upload a brief
              </button>
              <input ref={file} type="file" accept=".txt,.md,.csv,.doc,.docx,.pdf" className="hidden" onChange={(e) => { attach(e.target.files?.[0]); e.target.value = '' }} />
              <Button size="none" className="h-[38px] px-4" leftIcon={SPARKLE} disabled={!all} onClick={generate}>Generate and Fill</Button>
            </div>
          </div>
          <Button variant="tertiary" size="none" className="h-[38px] self-start px-3" leftIcon={<NoteIcon className="h-5 w-5" />} onClick={onClose}>
            Fill from scratch instead
          </Button>
        </div>
      </div>
    </div>
  )
}
