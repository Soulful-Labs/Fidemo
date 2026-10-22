import type { StudyType } from '@shared/types'

/**
 * Where a group session opens: its own page (group video call 1627:105750 and
 * 1627:106074, in-person group 1627:109239 and 1627:109586). Any other study
 * opens its Recruited tab.
 */
export const sessionPath = (s: { id: string; type: StudyType }, sessionId: string, from?: 'results'): string =>
  s.type === 'group_video_call' || s.type === 'in_person_group' ? `/studies/${s.id}/sessions/${sessionId}${from ? `?from=${from}` : ''}` : `/studies/${s.id}/recruited`
