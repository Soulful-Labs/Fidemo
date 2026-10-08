import type { SVGProps } from 'react'
import { cn } from '../../lib/cn'

export type StudyType = 'survey' | 'video' | 'video-group' | 'in-person' | 'in-person-group' | 'diary'

export const STUDY_TYPE_LABEL: Record<StudyType, string> = {
  survey: 'Survey',
  video: 'Video Call',
  'video-group': 'Group Video Call',
  'in-person': 'In-Person',
  'in-person-group': 'In-Person Group',
  diary: 'Diary Study',
}

const base = (p: SVGProps<SVGSVGElement>) => ({ viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, ...p })

/** The type glyph, redrawn on a 16px grid in brand-secondary. */
export function StudyTypeIcon({ type, ...p }: { type: StudyType } & SVGProps<SVGSVGElement>) {
  switch (type) {
    case 'survey':
      return <svg {...base(p)}><path d="M3.5 13V8.5M8 13V3.5M12.5 13V6" strokeWidth={2} /></svg>
    case 'video':
      return <svg {...base(p)}><rect x="2" y="2.5" width="12" height="11" rx="2.5" /><circle cx="8" cy="7" r="1.8" /><path d="M5 11.2c.6-1 1.7-1.6 3-1.6s2.4.6 3 1.6" /></svg>
    case 'video-group':
      return <svg {...base(p)}><rect x="1.5" y="3" width="13" height="10" rx="2.5" /><circle cx="5.5" cy="7" r="1.3" /><circle cx="10.5" cy="7" r="1.3" /><path d="M3.5 10.6c.4-.8 1.1-1.2 2-1.2s1.6.4 2 1.2M8.5 10.6c.4-.8 1.1-1.2 2-1.2s1.6.4 2 1.2" /></svg>
    case 'in-person':
      return <svg {...base(p)}><circle cx="8" cy="6.5" r="4.5" /><circle cx="8" cy="5.5" r="1.5" /><path d="M5.6 9.3c.6-.8 1.4-1.2 2.4-1.2s1.8.4 2.4 1.2M5 14.5h6" /></svg>
    case 'in-person-group':
      return <svg {...base(p)}><circle cx="8" cy="7" r="5.5" /><circle cx="6" cy="6" r="1.2" /><circle cx="10" cy="6" r="1.2" /><path d="M4.4 9.6c.4-.7 1-1 1.6-1s1.2.3 1.6 1M8.4 9.6c.4-.7 1-1 1.6-1s1.2.3 1.6 1" /></svg>
    case 'diary':
      return <svg {...base(p)}><rect x="3" y="1.8" width="10" height="12.4" rx="2" /><path d="M5.5 5.5h5M5.5 8h3M9.5 11.5l1.5-1.5 1 1-1.5 1.5H9.5v-1Z" /></svg>
  }
}

/**
 * "Study Types - Tags" (Studies list, 1978:97400): 32 tall, Radius/Full, a 1px
 * stroke-2 ring, 10 sides; the 16px type glyph in brand-secondary, 6, then
 * the label in Text-Regular subtitle.
 */
export default function StudyTypeTag({ type, className }: { type: StudyType; className?: string }) {
  return (
    <span className={cn('inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border-1 border-stroke-2 px-2.5 text-text-regular text-text-subtitle', className)}>
      <StudyTypeIcon type={type} className="h-4 w-4 text-brand-secondary" />
      {STUDY_TYPE_LABEL[type]}
    </span>
  )
}
