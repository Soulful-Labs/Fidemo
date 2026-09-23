import Tag from '../ui/Tag'
import { STUDY_TYPE } from '../../lib/studyTypes'
import type { StudyType } from '../../lib/studyTypes'

/** "Diary Study", "In-Person", "Group Video Call" — the tag on every card, row and header. */
export default function StudyTypeTag({ type, className }: { type: StudyType; className?: string }) {
  const meta = STUDY_TYPE[type]
  return <Tag tone={meta.tone} icon={meta.icon} className={className}>{meta.label}</Tag>
}
