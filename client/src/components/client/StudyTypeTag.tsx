import type { ReactNode } from 'react'
import Tag from '../ui/Tag'
import { STUDY_TYPE } from '../../lib/studyTypes'
import type { StudyType } from '../../lib/studyTypes'

/** "Diary Study", "In-Person", "Group Video Call" — the tag on every card, row and header. */
export default function StudyTypeTag({ type, className, icon }: { type: StudyType; className?: string; icon?: ReactNode }) {
  const meta = STUDY_TYPE[type]
  return <Tag tone={meta.tone} icon={icon ?? meta.icon} className={className}>{meta.label}</Tag>
}
