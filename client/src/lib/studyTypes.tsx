import type { ReactNode } from 'react'
import { DiaryIcon, GroupVideoIcon, InPersonGroupIcon, InPersonIcon, SurveyIcon, VideoIcon } from '../components/ui/icons'
import type { TagTone } from '../components/ui/Tag'

/** The six study types, exactly as the type tag draws them across the file. */
export type StudyType = 'survey' | 'video_call' | 'group_video_call' | 'in_person' | 'in_person_group' | 'diary'

export const STUDY_TYPE: Record<StudyType, { label: string; icon: ReactNode; tone: TagTone }> = {
  survey: { label: 'Survey', icon: <SurveyIcon className="h-4 w-4" />, tone: 'type' },
  video_call: { label: 'Video Call', icon: <VideoIcon className="h-4 w-4" />, tone: 'type' },
  group_video_call: { label: 'Group Video Call', icon: <GroupVideoIcon className="h-4 w-4" />, tone: 'type' },
  in_person: { label: 'In-Person', icon: <InPersonIcon className="h-4 w-4" />, tone: 'type' },
  in_person_group: { label: 'In-Person Group', icon: <InPersonGroupIcon className="h-4 w-4" />, tone: 'type' },
  diary: { label: 'Diary Study', icon: <DiaryIcon className="h-4 w-4" />, tone: 'type' },
}

/** Study lifecycle, as the status pill and the Studies tabs draw it. */
export type StudyStatus = 'draft' | 'recruiting' | 'ongoing' | 'billing' | 'completed' | 'paused'
export const STUDY_STATUS: Record<StudyStatus, { label: string; tone: TagTone }> = {
  draft: { label: 'Draft', tone: 'grey' },
  recruiting: { label: 'Recruiting', tone: 'neutral' },
  ongoing: { label: 'Ongoing', tone: 'neutral' },
  billing: { label: 'Billing', tone: 'neutral' },
  completed: { label: 'Completed', tone: 'green' },
  paused: { label: 'Paused', tone: 'yellow' },
}

/** Respondent tiers, as the tier chip draws them. */
export type Tier = 'silver' | 'gold' | 'platinum'
export const TIER: Record<Tier, { label: string; tone: TagTone }> = {
  silver: { label: 'Silver', tone: 'grey' },
  gold: { label: 'Gold', tone: 'yellow' },
  platinum: { label: 'Platinum', tone: 'purple' },
}
