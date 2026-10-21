import { useState } from 'react'
import Button from '../../components/ui/Button'
import { Upload } from '../../components/ui/icons'
import { useDraft } from '../../mock/createStore'
import PromptDialog from './PromptDialog'

const SPARKLE = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
    <path d="m12 3 1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3Zm7 10 .8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z"
      stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
)

/**
 * The composer's context box (15 Oct 2026): what is typed here is the
 * description Generate writes from. Empty, Generate asks for one. Upload File
 * hands the chosen file to `onFile`; nothing is sent anywhere.
 */
export default function ComposerContext({ file, what, onFile, onGenerate, compact }: {
  file: string | null; what: string; onFile: (f: File | undefined) => void; onGenerate: (text: string) => void
  /** The diary form's box (1518:94904): one line of text, 24 above the buttons. */
  compact?: boolean
}) {
  const { draft, set } = useDraft()
  const [asking, setAsking] = useState(false)
  return (
    <>
      <div className={`flex flex-col rounded-md border-1 border-stroke-2 bg-bgAlt-1 p-3 ${compact ? 'gap-6' : 'gap-3'}`}>
        <textarea value={draft.aiPrompt ?? ''} onChange={(e) => set('aiPrompt', e.target.value)} rows={compact ? 1 : 2} aria-label="Survey context"
          placeholder="Enter survey context/questions or upload file to let our AI-assitant generate questions"
          className="w-full resize-none bg-transparent text-text-regular text-text-title outline-none placeholder:text-text-body" />
        <div className="flex items-center justify-between gap-3">
          <input id="questions-file" type="file" accept=".txt,.csv,text/plain,text/csv" className="sr-only"
            onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = '' }} />
          <Button variant="tertiary" size="row" leftIcon={<Upload className="h-4 w-4" />} onClick={() => document.getElementById('questions-file')?.click()}>{file ?? 'Upload File'}</Button>
          <Button variant="secondary" size="row" leftIcon={SPARKLE} onClick={() => (draft.aiPrompt?.trim() ? onGenerate(draft.aiPrompt.trim()) : setAsking(true))}>Generate</Button>
        </div>
      </div>
      <PromptDialog open={asking} onClose={() => setAsking(false)} onGenerate={onGenerate} action="Write Questions"
        lead={`Describe your ${what}: what it is about and what you want to learn. Any question you write here, ending in a question mark, is added as it is.`} />
    </>
  )
}
