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
  survey: 'M7 4h10v16H7zM9.5 9h5M9.5 13h5',
  video_call: 'M3 7h11v10H3zM14 11l7-4v10l-7-4',
  group_video_call: 'M3 8h9v8H3zM12 11l5-3v8l-5-3M17 4.5a2 2 0 1 1 0 4',
  in_person: 'M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z M12 9.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z',
  in_person_group: 'M9 20s5-4.5 5-9a5 5 0 0 0-10 0c0 4.5 5 9 5 9ZM17 4a4 4 0 0 1 0 8',
  diary: 'M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4ZM9 8h6M9 12h6',
}

export function StudyTypeIcon({ type }: { type: StudyType }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="14" height="14" className="shrink-0">
      <path d={PATHS[type]} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function StudyTypeTag({ type, size = 'sm' }: { type: StudyType; size?: 'sm' | 'md' }) {
  return (
    <Tag tone="neutral" size={size} icon={<StudyTypeIcon type={type} />}>
      {STUDY_TYPE_LABEL[type]}
    </Tag>
  )
}
