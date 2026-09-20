import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from '../../../components/ui/icons'
import { cn } from '../../../lib/cn'
import type { Study } from '../../../mock/types'

/**
 * Title and description with the "View more" expander (PRD 6.6). Before an
 * application the image runs full width above; once applied the layout
 * switches to the thumbnail-left arrangement drawn in 919:74597.
 */
export default function DescriptionBlock({ study, thumbnail = false }: { study: Study; thumbnail?: boolean }) {
  const [expanded, setExpanded] = useState(false)

  const text = (
    <div className="flex min-w-0 flex-col gap-2">
      <h1 className={cn('text-text-title', thumbnail ? 'text-title-s' : 'text-title-l leading-tight')}>{study.title}</h1>
      <p className={cn('text-body-regular text-text-body', !expanded && 'line-clamp-2')}>{study.description}</p>
      {expanded && (
        <p className="text-text-regular text-text-body">
          For{' '}
          <Link to={`/clients/${study.client.id}/ratings`} className="text-text-subtitle underline-offset-2 hover:underline">
            {study.client.name}
          </Link>
          . Looking for {study.targetProfession}.
        </p>
      )}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-1 self-start text-body-regular text-text-body"
      >
        {expanded ? 'View less' : 'View more'}
        <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
      </button>
    </div>
  )

  if (thumbnail) {
    return (
      <section className="flex gap-3">
        <img src={study.image} alt="" className="h-thumb w-thumb shrink-0 rounded-md object-cover" />
        {text}
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-4">
      <img src={study.image} alt="" className="aspect-video w-full rounded-lg object-cover" />
      {text}
    </section>
  )
}
