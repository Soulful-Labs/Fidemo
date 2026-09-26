import Toggle from '../../components/ui/Toggle'
import { Calendar, Clock, DiaryBookIcon, InPersonIcon, Info, SurveyIcon, TaskIcon, Upload, VideoIcon } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { useDraft } from '../../mock/createStore'
import type { CreateType } from '../../mock/createStore'
import CreateShell from './CreateShell'
import { Field, Section, TextBox } from './CreateBits'

/** The four study types the step offers, with the frame's own wording. */
const TYPES: { key: CreateType; label: string; sub: string; Icon: typeof Info; group?: 'groupVideo' | 'groupInPerson' }[] = [
  { key: 'survey', label: 'Survey', sub: 'Structured questionnaire with set questions for data at scale.', Icon: SurveyIcon },
  { key: 'video_call', label: 'Video Call', sub: 'Live remote conversation using Zoom, Meet, or similar tools.', Icon: VideoIcon, group: 'groupVideo' },
  { key: 'in_person', label: 'In-Person', sub: 'Face to face interview in a  physical location.', Icon: InPersonIcon, group: 'groupInPerson' },
  { key: 'diary', label: 'Diary Study', sub: 'Participants log experiences over time', Icon: DiaryBookIcon },
]

/** One study type: a card that carries a nested Group session row on the two session types. */
function TypeCard({ t }: { t: (typeof TYPES)[number] }) {
  const { draft, set } = useDraft()
  const on = draft.type === t.key
  return (
    <div className={cn('flex flex-col rounded-lg border-1',
      on ? 'border-brand-primary bg-yellow-30' : 'border-stroke-1 bg-bg-0')}>
      <button type="button" onClick={() => set('type', t.key)} aria-pressed={on}
        className="flex items-start gap-3 p-[11px] text-left">
        <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-md [&>svg]:h-5 [&>svg]:w-5',
          on ? 'bg-yellow-40 text-brand-primary' : 'bg-bg-1 text-text-subtitle')}>
          <t.Icon />
        </span>
        <span className="flex flex-col">
          <span className={cn('text-body-medium', on ? 'text-brand-primary' : 'text-text-title')}>{t.label}</span>
          <span className="text-text-regular text-text-subtitle">{t.sub}</span>
        </span>
      </button>
      {t.group && (
        <div className={cn('mb-[11px] ml-[62px] mr-[11px] -mt-[5px] flex items-center justify-between gap-4 rounded-md px-3 py-[9px]', on ? 'bg-bg-0' : 'bg-bg-1')}>
          <span className="flex flex-col">
            <span className="text-body-medium text-text-title">Group session</span>
            <span className="text-text-regular text-text-subtitle">Schedule sessions with multiple participants at the same time.</span>
          </span>
          <Toggle checked={draft[t.group]} onChange={(v) => set(t.group!, v)} label="Group session" />
        </div>
      )}
    </div>
  )
}

/**
 * 2.1.0 About, New Study (1622:81504): the step that chooses the study type,
 * its duration and what participants will see. One centred 600px column.
 */
export default function About() {
  const { draft, set } = useDraft()

  return (
    <CreateShell step="about">
      <div className="min-h-[1242px] rounded-lg bg-bg-0 px-6 pt-[9px]">
        <div className="mx-auto flex w-[600px] flex-col">
          <Section icon={<TaskIcon className="h-5 w-5" />} title="Select Study Type" sub="Choose the study type suitable to your research needs">
            <div className="flex flex-col gap-2">
              {TYPES.map((t) => <TypeCard key={t.key} t={t} />)}
            </div>
          </Section>

          <Section icon={<Clock className="h-5 w-5" />} title="Set Durations" sub="Set the estimated time duration to complete the study">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2 rounded-md bg-bg-1 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-regular text-text-subtitle">Duration</span>
                  <span className="text-body-medium text-text-title">{draft.duration} mins</span>
                </div>
                <input type="range" min={5} max={120} step={5} value={draft.duration} aria-label="Duration"
                  onChange={(e) => set('duration', Number(e.target.value))} className="slider w-full"
                  style={{ ['--slider-track' as string]: `linear-gradient(to right, #fca311 0 ${((draft.duration - 5) / 115) * 100}%, #eeedec ${((draft.duration - 5) / 115) * 100}% 100%)` }} />
              </div>
              <span className="flex flex-col gap-0.5">
                <span className="text-text-regular text-text-subtitle">
                  Study End Date <span className="text-text-body">(optional)</span>
                </span>
                <span className="relative flex">
                  <TextBox value={draft.endDate} placeholder="DD / MM / YYYY" onChange={(v) => set('endDate', v)} className="h-[38px] pr-11" />
                  <Calendar className="pointer-events-none absolute right-4 top-[9px] h-5 w-5 text-text-subtitle" />
                </span>
              </span>
              <p className="pt-[5px] text-text-regular text-text-subtitle">Study gets ended after 60 days max or when its filled before it</p>
            </div>
          </Section>

          <Section icon={<Info className="h-5 w-5" />} title="About Study" sub="What this study is about and your goals for it">
            <div className="flex flex-col gap-3.5">
              <p className="text-text-medium text-text-title">What participants will see:</p>
              <Field label="Title of your study">
                <TextBox value={draft.title} placeholder="Enter title of your study" onChange={(v) => set('title', v)} />
              </Field>
              <Field label="Tell us about your study">
                <textarea value={draft.description} placeholder="Enter study description" onChange={(e) => set('description', e.target.value)}
                  className="h-[90px] w-full resize-none rounded-sm border-1 border-stroke-input bg-bg px-4 py-3 text-body-regular text-text-title placeholder:text-text-body" />
              </Field>
              <Field label="Thumbnail Image">
                <button type="button" onClick={() => set('thumbnail', 'thumbnail.jpg')}
                  className="flex h-[100px] flex-col items-center justify-center gap-1 rounded-sm border-1 border-stroke-input bg-bg">
                  <span className="flex items-center gap-2 text-body-medium text-text-title">
                    <Upload className="h-5 w-5" />{draft.thumbnail || 'Upload Thumbnail Image'}
                  </span>
                  <span className="text-text-regular text-text-subtitle">Keep image in 4:3 aspect ratio</span>
                  <span className="text-text-regular text-text-subtitle">.jpeg or .png file&nbsp; |&nbsp; 2 MB max.</span>
                </button>
              </Field>
            </div>
          </Section>
        </div>
      </div>
    </CreateShell>
  )
}
