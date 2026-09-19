import { useState } from 'react'
import { cn } from '../../../lib/cn'
import type { Study } from '../../../mock/types'

/** Title and description with the "View more" expander (PRD 6.6). */
export default function DescriptionBlock({ study }: { study: Study }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-title-m text-text-title">{study.title}</h1>
      <p className={cn('text-text-regular text-text-body', !expanded && 'line-clamp-3')}>
        {study.description}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="self-start text-text-medium text-brand-primary"
      >
        {expanded ? 'View less' : 'View more'}
      </button>

      <div className="mt-2 flex flex-col gap-1">
        <span className="text-label text-text-body">Target profession</span>
        <span className="text-text-regular text-text-subtitle">{study.targetProfession}</span>
      </div>
    </section>
  )
}
