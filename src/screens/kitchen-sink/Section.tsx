import type { ReactNode } from 'react'

/** Labelled group used to lay out the kitchen sink. */
export default function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-b-1 border-stroke-2 pb-6">
      <h2 className="text-label uppercase tracking-widest text-text-disabled">{title}</h2>
      {children}
    </section>
  )
}

export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-label text-text-disabled">{label}</p>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}
