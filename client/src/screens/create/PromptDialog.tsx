import { useEffect, useState } from 'react'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { useDraft } from '../../mock/createStore'

/**
 * Generate with AI: the box the client describes their study in. What they
 * type is kept with the study being built, so the Audience, Screener and
 * survey steps all start from the same description. There is no model: the
 * step reads the text (lib/fromPrompt.ts) and fills only what it says.
 */
export default function PromptDialog({ open, onClose, onGenerate, lead, action = 'Generate' }: {
  open: boolean; onClose: () => void; onGenerate: (text: string) => void
  /** The line telling the client what to describe for this step. */
  lead: string
  action?: string
}) {
  const { draft, set } = useDraft()
  const [text, setText] = useState(draft.aiPrompt ?? '')
  useEffect(() => { if (open) setText(draft.aiPrompt ?? '') }, [open, draft.aiPrompt])
  const go = () => {
    if (!text.trim()) return
    set('aiPrompt', text.trim())
    onGenerate(text.trim())
    onClose()
  }
  return (
    <Modal open={open} onClose={onClose} title="Generate with AI" wide
      footer={
        <>
          <Button variant="tertiary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" disabled={!text.trim()} onClick={go}>{action}</Button>
        </>
      }>
      <div className="flex w-full flex-col gap-2 text-left">
        <label htmlFor="ai-prompt" className="text-text-regular text-text-subtitle">{lead}</label>
        <textarea id="ai-prompt" autoFocus value={text} onChange={(e) => setText(e.target.value)} rows={5}
          placeholder="e.g. We want to talk to 12 nurses in US hospitals, aged 25 to 45, about how they use telehealth apps on night shifts. What slows them down?"
          className="w-full resize-none rounded-sm border-1 border-stroke-input bg-bg px-4 py-3 text-body-regular text-text-title placeholder:text-text-body" />
        <p className="text-text-regular text-text-body">Only what your text mentions is filled in. Anything it does not mention is left as it is.</p>
      </div>
    </Modal>
  )
}
