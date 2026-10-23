/**
 * Reading tables out of the files a team uploads (24 Oct 2026): CSV, Excel
 * (.xlsx) and PDF, with no library, using the platform's own decompression
 * (DecompressionStream, in every current browser and in Node). Each file
 * comes back as tables of text cells; shared/ratecard.ts decides what they
 * are. Nothing here guesses: a file it cannot read gives no tables and says
 * why.
 */
import { parseCsv } from './ratecard'

export interface FileTables { tables: string[][][]; problem?: string }

async function inflate(bytes: Uint8Array, format: 'deflate' | 'deflate-raw'): Promise<Uint8Array> {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream(format))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

const utf8 = (b: Uint8Array) => new TextDecoder('utf-8').decode(b)
const latin1 = (b: Uint8Array) => { let s = ''; for (let i = 0; i < b.length; i += 1) s += String.fromCharCode(b[i]!); return s }
const xmlText = (s: string) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).replace(/&amp;/g, '&')

// ----------------------------------------------------------------- zip (xlsx)

/** The files inside a zip archive, by name, inflated. */
async function unzip(buf: Uint8Array): Promise<Map<string, Uint8Array>> {
  const v = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
  let end = -1
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 66000); i -= 1) if (v.getUint32(i, true) === 0x06054b50) { end = i; break }
  if (end < 0) throw new Error('not a zip archive')
  const count = v.getUint16(end + 10, true)
  let at = v.getUint32(end + 16, true)
  const out = new Map<string, Uint8Array>()
  for (let k = 0; k < count; k += 1) {
    if (v.getUint32(at, true) !== 0x02014b50) break
    const method = v.getUint16(at + 10, true), size = v.getUint32(at + 20, true)
    const nameLen = v.getUint16(at + 28, true), extraLen = v.getUint16(at + 30, true), commentLen = v.getUint16(at + 32, true)
    const local = v.getUint32(at + 42, true)
    const name = utf8(buf.subarray(at + 46, at + 46 + nameLen))
    const dataAt = local + 30 + v.getUint16(local + 26, true) + v.getUint16(local + 28, true)
    const data = buf.subarray(dataAt, dataAt + size)
    if (method === 0) out.set(name, data)
    else if (method === 8) out.set(name, await inflate(data, 'deflate-raw'))
    at += 46 + nameLen + extraLen + commentLen
  }
  return out
}

const colIndex = (ref: string) => { let n = 0; for (const ch of ref.replace(/\d+/g, '')) n = n * 26 + (ch.charCodeAt(0) - 64); return n - 1 }

/** Every sheet of an .xlsx workbook as a table of text cells, in sheet order. */
export async function readXlsx(buf: Uint8Array): Promise<string[][][]> {
  const files = await unzip(buf)
  const shared = files.get('xl/sharedStrings.xml')
  const strings = shared ? [...utf8(shared).matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => [...m[1]!.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => xmlText(t[1]!)).join('')) : []
  const sheets = [...files.keys()].filter((n) => /^xl\/worksheets\/sheet\d+\.xml$/.test(n)).sort((a, b) => Number(/\d+/.exec(a.slice(14))![0]) - Number(/\d+/.exec(b.slice(14))![0]))
  return sheets.map((name) => {
    const xml = utf8(files.get(name)!)
    const rows: string[][] = []
    for (const r of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
      const row: string[] = []
      for (const c of r[1]!.matchAll(/<c([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
        const attrs = c[1]!, body = c[2] ?? ''
        const ref = /r="([A-Z]+\d+)"/.exec(attrs)?.[1]
        const type = /t="(\w+)"/.exec(attrs)?.[1]
        const raw = /<v>([\s\S]*?)<\/v>/.exec(body)?.[1]
        const value = type === 's' ? strings[Number(raw)] ?? '' : type === 'inlineStr' ? [...body.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => xmlText(t[1]!)).join('') : xmlText(raw ?? '')
        const i = ref ? colIndex(ref) : row.length
        while (row.length < i) row.push('')
        row[i] = value
      }
      if (row.some((x) => x.trim() !== '')) rows.push(row)
    }
    return rows
  })
}

// ------------------------------------------------------------------------ pdf

/** ASCII85 (the encoding many PDF writers wrap their compressed streams in), to bytes. */
function ascii85(data: Uint8Array): Uint8Array {
  const text = latin1(data).replace(/^\s*<~/, '').replace(/~>[\s\S]*$/, '').replace(/\s+/g, '')
  const out: number[] = []
  let group: number[] = []
  const flush = (n: number) => {
    while (group.length < 5) group.push(84)
    let v = 0; for (const c of group) v = v * 85 + c
    const bytes = [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255]
    out.push(...bytes.slice(0, n))
    group = []
  }
  for (const ch of text) {
    if (ch === 'z' && group.length === 0) { out.push(0, 0, 0, 0); continue }
    group.push(ch.charCodeAt(0) - 33)
    if (group.length === 5) flush(4)
  }
  if (group.length) flush(group.length - 1)
  return new Uint8Array(out)
}

/** A PDF string literal's text, with its escapes. */
function pdfLiteral(s: string): string {
  return s.replace(/\\([nrtbf()\\]|[0-7]{1,3})/g, (_, e: string) => (/^[0-7]/.test(e) ? String.fromCharCode(parseInt(e, 8)) : ({ n: '\n', r: '\r', t: '\t', b: '\b', f: '\f' } as Record<string, string>)[e] ?? e))
}

/**
 * The text runs of a PDF, placed: every string drawn, at its position. Runs
 * on one line (the same height) become one row, each run one cell, left to
 * right. A PDF that draws each cell as its own run (most generated tables)
 * reads as a table; one that draws a line as one run does not, and is
 * reported rather than guessed at.
 */
export async function readPdf(buf: Uint8Array): Promise<string[][][]> {
  const raw = latin1(buf)
  const contents: string[] = []
  const re = /<<([\s\S]*?)>>\s*stream\r?\n/g
  let m: RegExpExecArray | null
  while ((m = re.exec(raw))) {
    const start = m.index + m[0].length
    const stop = raw.indexOf('endstream', start)
    if (stop < 0) break
    let data = buf.subarray(start, stop)
    const filters = [...(/\/Filter\s*(\[[^\]]*\]|\/\w+)/.exec(m[1]!)?.[1] ?? '').matchAll(/\/(\w+)/g)].map((f) => f[1])
    if (filters.some((f) => f !== 'FlateDecode' && f !== 'ASCII85Decode')) continue
    try {
      for (const f of filters) data = f === 'ASCII85Decode' ? ascii85(data) : await inflate(data, 'deflate')
    } catch { continue }
    const text = latin1(data)
    if (/\bBT\b/.test(text)) contents.push(text)
    re.lastIndex = stop
  }
  const runs: { x: number; y: number; text: string }[] = []
  for (const c of contents) {
    let x = 0, y = 0, lx = 0, ly = 0, leading = 0
    const tokens = c.match(/\((?:\\.|[^\\)])*\)|<[0-9A-Fa-f\s]*>|\[|\]|-?\d*\.?\d+|\/[^\s/[\]()<>]+|[A-Za-z'"*]+/g) ?? []
    const stack: string[] = []
    for (const t of tokens) {
      if (t === 'BT') { x = y = lx = ly = 0; stack.length = 0; continue }
      if (t === 'Tm') { const [, , , , e, f] = stack.slice(-6).map(Number); x = lx = e!; y = ly = f!; stack.length = 0; continue }
      if (t === 'Td' || t === 'TD') { const [tx, ty] = stack.slice(-2).map(Number); lx += tx!; ly += ty!; x = lx; y = ly; if (t === 'TD') leading = -ty!; stack.length = 0; continue }
      if (t === 'TL') { leading = Number(stack.at(-1)); stack.length = 0; continue }
      if (t === 'T*') { ly -= leading; x = lx; y = ly; stack.length = 0; continue }
      if (t === 'Tj' || t === "'" || t === '"' || t === 'TJ') {
        if (t === "'" || t === '"') { ly -= leading; x = lx; y = ly }
        const parts = stack.filter((s) => s.startsWith('(')).map((s) => pdfLiteral(s.slice(1, -1)))
        const s = parts.join('')
        if (s.trim()) runs.push({ x, y, text: s.trim() })
        stack.length = 0; continue
      }
      stack.push(t)
    }
  }
  if (runs.length === 0) return []
  const lines = new Map<number, typeof runs>()
  for (const r of runs) { const k = Math.round(r.y); lines.set(k, [...(lines.get(k) ?? []), r]) }
  const placed = [...lines.entries()].sort((a, b) => b[0] - a[0]).map(([, rs]) => rs.sort((a, b) => a.x - b.x))
  // A blank cell is not drawn at all, so cells are placed under the header by where they start, not by their order.
  const anchors = placed[0]!.map((r) => r.x)
  const rows = placed.map((rs, i) => {
    if (i === 0) return rs.map((r) => r.text)
    const row = anchors.map(() => '')
    for (const r of rs) {
      let col = 0
      anchors.forEach((x, k) => { if (x <= r.x + 2) col = k })
      row[col] = row[col] ? `${row[col]} ${r.text}` : r.text
    }
    return row
  })
  return [rows]
}

// ------------------------------------------------------------------ any file

/** The tables in an uploaded file, by its name: .csv, .xlsx or .pdf. */
export async function readTableFile(name: string, bytes: Uint8Array): Promise<FileTables> {
  const ext = name.toLowerCase().split('.').pop() ?? ''
  try {
    if (ext === 'csv' || ext === 'txt') return { tables: [parseCsv(utf8(bytes))] }
    if (ext === 'xlsx') return { tables: await readXlsx(bytes) }
    if (ext === 'xls') return { tables: [], problem: 'This is the older Excel format (.xls). Save it as .xlsx or CSV and upload it again.' }
    if (ext === 'pdf') {
      const tables = await readPdf(bytes)
      return tables.length ? { tables } : { tables: [], problem: 'No text could be read from this PDF. It may be a scanned image. Upload the CSV or Excel file instead.' }
    }
    return { tables: [], problem: 'Upload a CSV, Excel (.xlsx) or PDF file.' }
  } catch (e) {
    return { tables: [], problem: `This file could not be read (${e instanceof Error ? e.message : 'unknown reason'}).` }
  }
}
