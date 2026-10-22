import type { StudyType } from '@shared/types'

/**
 * Where a group session opens. A group video call has its session page
 * (1627:105750 before it runs, 1627:106074 after); every other study still
 * opens its Recruited tab.
 */
export const sessionPath = (s: { id: string; type: StudyType }, sessionId: string, from?: 'results'): string =>
  s.type === 'group_video_call' ? `/studies/${s.id}/sessions/${sessionId}${from ? `?from=${from}` : ''}` : `/studies/${s.id}/recruited`
