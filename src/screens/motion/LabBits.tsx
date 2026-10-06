import type { ReactNode } from 'react'
import Button from '../../components/ui/Button'

/** One lettered group on /motion. */
export function Group({ letter, title, children }: { letter: string; title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-b-1 border-stroke-2 pb-6">
      <h2 className="flex items-center gap-2 text-title-s text-text-title">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cta-secondary text-text-medium text-cta-secondaryText">{letter}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

/** A row of play buttons. */
export function Plays({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>
}

export function Play({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return <Button size="md" variant="secondary" onClick={onClick}>{children}</Button>
}

/** A framed stage the demo plays on. */
export function Stage({ children, alt = false }: { children: ReactNode; alt?: boolean }) {
  return <div className={alt ? 'flex flex-col gap-3 rounded-lg bg-bgAlt-2 bg-green-fade p-4' : 'flex flex-col gap-3 rounded-lg bg-bg-1 p-4'}>{children}</div>
}
