import Tag from '../ui/Tag'
import { STUDY_TYPE } from '../../lib/studyTypes'
import type { StudyType } from '../../lib/studyTypes'

/** "Diary Study", "In-Person", "Group Video Call" — the tag on every card, row and header. */
export default function StudyTypeTag({ type }: { type: StudyType }) {
  const meta = STUDY_TYPE[type]
  return <Tag tone={meta.tone} icon={meta.icon}>{meta.label}</Tag>
}
