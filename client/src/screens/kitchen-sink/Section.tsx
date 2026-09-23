import type { ReactNode } from 'react'

export default function Section({ title, node, children }: { title: string; node?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-b-1 border-stroke-input pb-8">
      <div className="flex items-baseline gap-3">
        <h2 className="text-title-s text-text-title">{title}</h2>
        {node && <span className="text-label text-text-body">{node}</span>}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}

export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-label uppercase tracking-wide text-text-body">{label}</span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}
