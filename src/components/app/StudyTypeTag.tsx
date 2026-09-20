import Tag from '../ui/Tag'
import type { StudyType } from '../../mock/types'

/** The six study types, with the label shown on cards and detail (PRD 6.1). */
export const STUDY_TYPE_LABEL: Record<StudyType, string> = {
  survey: 'Survey',
  video_call: 'Video Call',
  group_video_call: 'Group Video Call',
  in_person: 'In-Person',
  in_person_group: 'In-Person Group',
  diary: 'Diary Study',
}

const PATHS: Record<StudyType, string> = {
  survey: 'M5 14v6M12 4v16M19 9v11M5 14h0M12 4h0',
  video_call: 'M4 5h16v10H4zM9 20h6M12 15v5M12 8.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM9.5 13.5c.5-1 1.4-1.5 2.5-1.5s2 .5 2.5 1.5',
  group_video_call: 'M3 6h18v11H3zM8 20h8M8 9.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm8 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM5.5 15c.5-1 1.4-1.5 2.5-1.5s2 .5 2.5 1.5m3 0c.5-1 1.4-1.5 2.5-1.5s2 .5 2.5 1.5',
  in_person: 'M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10ZM12 8.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-3 6.5c.6-1 1.7-1.5 3-1.5s2.4.5 3 1.5',
  in_person_group: 'M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10ZM9.5 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm5 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM7 15c.5-1 1.4-1.5 2.5-1.5s2 .5 2.5 1.5m0 0c.5-1 1.4-1.5 2.5-1.5s2 .5 2.5 1.5',
  diary: 'M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4ZM9 8h6M9 12h6M9 16h3',
}

export function StudyTypeIcon({ type, className }: { type: StudyType; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" className={`shrink-0 ${className ?? ''}`}>
      <path d={PATHS[type]} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Grey pill with a green type icon, as on every study card in Figma. */
export default function StudyTypeTag({ type, size = 'md' }: { type: StudyType; size?: 'sm' | 'md' }) {
  return (
    <Tag tone="neutral" size={size} icon={<StudyTypeIcon type={type} className="text-brand-secondary" />}>
      {STUDY_TYPE_LABEL[type]}
    </Tag>
  )
}
