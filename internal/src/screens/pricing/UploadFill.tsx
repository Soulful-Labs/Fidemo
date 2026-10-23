import { useRef } from 'react'
import Button from '../../components/ui/Button'
import { notice } from '../../components/app/Notice'
import type { FeeSettings } from '@shared/types'

/** Which line of a file fills which fee: its label, case and spacing ignored. */
const LABELS: [RegExp, keyof Pick<FeeSettings, 'platform' | 'moderation' | 'recruitmentBase'>][] = [
  [/^platform/, 'platform'], [/^moderation/, 'moderation'], [/^(recruitment|base)/, 'recruitmentBase'],
]

/**
 * Upload file and fill (Edit Clients Fees, 23 Oct 2026). Reads a text or CSV
 * file the team keeps, one fee per line ("Platform Fees, 100" or "Moderation
 * Fees: 5"), and fills the matching fields. Nothing is saved until Save
 * Changes; the add-ons are edited on the screen. Says what it filled and what
 * it could not read.
 */
export function UploadFill({ onFill }: { onFill: (f: Partial<FeeSettings>) => void }) {
  const input = useRef<HTMLInputElement>(null)
  const read = async (file?: File) => {
    if (!file) return
    const text = await file.text()
    const filled: Partial<FeeSettings> = {}
    for (const line of text.split(/\r?\n/)) {
      const [label = '', value = ''] = line.split(/[,:;\t]/).map((x) => x.trim())
      const key = LABELS.find(([re]) => re.test(label.toLowerCase()))?.[1]
      const n = Number(value.replace(/[$\s]/g, ''))
      if (key && value && Number.isFinite(n) && n >= 0) filled[key] = n
    }
    const names = Object.keys(filled).map((k) => ({ platform: 'Platform Fees', moderation: 'Moderation Fees', recruitmentBase: 'Recruitment base' }[k]))
    if (names.length === 0) { notice(`Nothing in ${file.name} matched a fee. Write one per line, for example "Platform Fees, 100".`); return }
    onFill(filled)
    notice(`Filled ${names.join(', ')} from ${file.name}. Check them, then Save Changes.`)
  }
  return (
    <>
      <Button variant="tertiary" size="md" className="mb-3 self-start px-3" leftIcon={
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 15V4m0 0L8 8m4-4 4 4M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" /></svg>
      } onClick={() => input.current?.click()}>Upload file and fill</Button>
      <input ref={input} type="file" accept=".csv,.txt,text/csv,text/plain" className="hidden" aria-label="Upload file and fill"
        onChange={(e) => { void read(e.target.files?.[0]); e.target.value = '' }} />
    </>
  )
}
