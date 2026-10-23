import { useRef, useState } from 'react'
import Button from '../../components/ui/Button'
import { Modal } from '../../components/ui/Overlay'
import { previewUpload, readTable } from '@shared/ratecard'
import type { ReadTable, UploadPreview } from '@shared/ratecard'
import { readTableFile } from '@shared/tableFiles'
import type { RateCard } from '@shared/types'

/**
 * Upload file and fill (Edit Clients Fees, 24 Oct 2026): a CSV, Excel or PDF
 * of the rate card. The file is read and matched to the card by row labels
 * (shared/ratecard.ts); a preview shows what was read, which rows matched,
 * which did not, the cells it could not read (left blank and marked in the
 * form), and every value about to change. "Use these values" puts them in the
 * form; nothing is saved until Save Changes, and then as a version recorded
 * with who, when and the file's name.
 */
export function UploadFill({ card, onFill }: { card: RateCard; onFill: (next: RateCard, flags: Set<string>, source: string) => void }) {
  const input = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState('')
  const [problem, setProblem] = useState('')
  const [preview, setPreview] = useState<UploadPreview | null>(null)
  const read = async (f?: File) => {
    if (!f) return
    setFile(f.name); setProblem(''); setPreview(null)
    const got = await readTableFile(f.name, new Uint8Array(await f.arrayBuffer()))
    const tables = got.tables.map((t) => readTable(t)).filter((t): t is ReadTable => t !== null)
    if (got.problem) { setProblem(got.problem); return }
    if (tables.length === 0) { setProblem('No rate card table was found in this file. The first row must be the column names, as in rate-card.csv or rate-card-fees.csv.'); return }
    setPreview(previewUpload(card, tables))
  }
  const use = () => {
    if (!preview) return
    onFill(preview.next, new Set(preview.unreadable.map((u) => `${u.label}|${u.field}`)), `the upload ${file}`)
    setPreview(null)
  }
  const changed = preview?.matched.filter((m) => m.changes.length > 0) ?? []
  return (
    <>
      <Button variant="tertiary" size="md" className="mb-3 self-start px-3" leftIcon={
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 15V4m0 0L8 8m4-4 4 4M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" /></svg>
      } onClick={() => input.current?.click()}>Upload file and fill</Button>
      <input ref={input} type="file" accept=".csv,.xlsx,.xls,.pdf,text/csv,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="hidden" aria-label="Upload file and fill"
        onChange={(e) => { void read(e.target.files?.[0]); e.target.value = '' }} />
      <Modal open={Boolean(problem)} onClose={() => setProblem('')} layout="titled" title={`Could not read ${file}`}
        footer={<Button onClick={() => setProblem('')}>Close</Button>}>
        <p className="text-text-regular leading-5 text-text-title">{problem}</p>
      </Modal>
      <Modal open={preview !== null} onClose={() => setPreview(null)} layout="titled" title={`Read from ${file}`} className="w-[720px]"
        footer={<><Button variant="tertiary" onClick={() => setPreview(null)}>Cancel</Button><Button onClick={use}>Use these values</Button></>}>
        {preview && (
          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto text-text-regular leading-5 text-text-title">
            <p>{preview.matched.length} row{preview.matched.length === 1 ? '' : 's'} matched the rate card, {changed.length} with changes; {preview.added.length} new row{preview.added.length === 1 ? '' : 's'}; {preview.unreadable.length} cell{preview.unreadable.length === 1 ? '' : 's'} could not be read. Nothing is saved until you press Save Changes.</p>
            {preview.unreadable.length > 0 && (
              <section role="alert" className="rounded-md border-1 border-state-danger p-3">
                <h4 className="pb-1 text-text-medium text-state-danger">Could not be read: left blank for you to fill in</h4>
                {preview.unreadable.map((u) => <p key={u.label + u.field}>{u.label}, {u.field.replace(/_/g, ' ')}: &ldquo;{u.raw}&rdquo;</p>)}
              </section>
            )}
            {changed.length > 0 && (
              <section><h4 className="pb-1 text-text-medium">About to change</h4>
                {changed.map((m) => <p key={m.label}><span className="text-text-medium">{m.label}</span>: {m.changes.map((c) => `${c.field} was ${c.from}, now ${c.to}`).join('; ')}</p>)}</section>
            )}
            {preview.added.length > 0 && (
              <section><h4 className="pb-1 text-text-medium">Not on the rate card yet: will be added</h4>{preview.added.map((a) => <p key={a}>{a}</p>)}</section>
            )}
            {preview.matched.length > 0 && (
              <section><h4 className="pb-1 text-text-medium">Matched</h4><p className="text-text-subtitle">{preview.matched.map((m) => m.label).join(' · ')}</p></section>
            )}
            {preview.untouched.length > 0 && (
              <section><h4 className="pb-1 text-text-medium">On the rate card, not in the file: kept as they are</h4><p className="text-text-subtitle">{preview.untouched.join(' · ')}</p></section>
            )}
            {preview.skipped.length > 0 && (
              <section><h4 className="pb-1 text-text-medium">Rows with no label to match: not used</h4>{preview.skipped.map((x) => <p key={x}>{x}</p>)}</section>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
