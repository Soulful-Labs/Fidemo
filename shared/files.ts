/**
 * Real files for the download buttons, with no library: a one-page PDF of
 * text lines, a CSV, or plain text, handed to the browser to save. Nothing
 * here says "downloaded" unless a file was actually produced.
 */

/** PDF's built-in fonts read Latin-1; anything else (bullets, dashes, curly quotes) is written plainly. */
const latin = (s: string) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/•|·/g, '-').replace(/[^\x20-\x7e\xa0-\xff]/g, '')
const esc = (s: string) => latin(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')

/** A line of a document: plain text, or a heading in bold. An empty string is a blank line. */
export type DocLine = string | { heading: string }

/** A one-page A4 PDF: a title, then the lines top to bottom (long lines wrap). */
export function pdf(title: string, lines: DocLine[]): Blob {
  const wrap = (s: string, n = 92) => { const out: string[] = []; let line = ''; for (const w of s.split(' ')) { if ((line + ' ' + w).trim().length > n) { out.push(line); line = w } else line = (line + ' ' + w).trim() } out.push(line); return out }
  let y = 790
  const ops: string[] = [`BT /F2 18 Tf 56 ${y} Td (${esc(title)}) Tj ET`]
  y -= 34
  for (const l of lines) {
    if (typeof l !== 'string') { y -= 6; ops.push(`BT /F2 12 Tf 56 ${y} Td (${esc(l.heading)}) Tj ET`); y -= 20; continue }
    if (l === '') { y -= 10; continue }
    for (const part of wrap(l)) { if (y < 56) break; ops.push(`BT /F1 11 Tf 56 ${y} Td (${esc(part)}) Tj ET`); y -= 16 }
  }
  const stream = ops.join('\n')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ]
  let out = '%PDF-1.4\n'
  const offsets: number[] = []
  objects.forEach((o, i) => { offsets.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n` })
  const xref = out.length
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  // Every character is Latin-1 by now, so one byte each: the offsets above are byte offsets.
  return new Blob([Uint8Array.from(out, (c) => c.charCodeAt(0))], { type: 'application/pdf' })
}

/** A CSV with a header row; every cell quoted. */
export function csv(header: string[], rows: (string | number)[][]): Blob {
  const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
  return new Blob(['﻿' + [header, ...rows].map((r) => r.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' })
}

export const text = (body: string): Blob => new Blob([body], { type: 'text/plain;charset=utf-8' })

/** A file name from a title: letters, digits and dashes. */
export const fileName = (title: string, ext: string) => `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'file'}.${ext}`

/** Hands the file to the browser to save. Returns the name it was saved under. */
export function save(name: string, blob: Blob): string {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = name; a.style.display = 'none'
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 30_000)
  return name
}
