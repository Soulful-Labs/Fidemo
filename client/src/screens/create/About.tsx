import NewStudyDialog from './NewStudyDialog'
import { useSearchParams } from 'react-router-dom'
import Toggle from '../../components/ui/Toggle'
import Button from '../../components/ui/Button'
import { Calendar, Clock, DiaryBookIcon, InPersonIcon, Info, SurveyIcon, TaskIcon, Upload, VideoIcon } from '../../components/ui/icons'
import { cn } from '../../lib/cn'
import { useDraft } from '../../mock/createStore'
import { useToast } from '../../components/ui/Toast'
import type { CreateType } from '../../mock/createStore'
import CreateShell, { useEditing } from './CreateShell'
import { useState } from 'react'
import { AboutPreview, PreviewButton, PreviewPanel } from './ScreenerPreview'
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
  /** A submitted study keeps its type: the other cards are greyed and do nothing. */
  const locked = useEditing()
  return (
    <div className={cn('flex flex-col rounded-lg border-1',
      on ? (locked ? 'border-stroke-1 bg-bg-1' : 'border-brand-primary bg-yellow-30') : 'border-stroke-1 bg-bg-0', locked && !on && 'opacity-60')}>
      <button type="button" disabled={locked} onClick={() => set('type', t.key)} aria-pressed={on}
        className="flex items-start gap-3 p-[11px] text-left">
        <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-md [&>svg]:h-5 [&>svg]:w-5',
          on ? 'bg-yellow-40 text-brand-primary' : 'bg-bg-1 text-text-subtitle')}>
          <t.Icon />
        </span>
        <span className="flex flex-col">
          <span className={cn('text-text-medium', on ? 'text-brand-primary' : 'text-text-title')}>{t.label}</span>
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
/** The frame's own limits: a JPEG or PNG of 2 MB at most. */
const MAX_BYTES = 2 * 1024 * 1024
/** Thumbnails are drawn at 4:3 and never wider than 243px, so the picture is kept at 640 by 480 at most. */
async function readPicture(file: File): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    await new Promise<void>((done, fail) => { img.onload = () => done(); img.onerror = () => fail(new Error('unreadable')); img.src = url })
    const scale = Math.min(1, 640 / img.naturalWidth, 480 / img.naturalHeight)
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.85)
  } finally { URL.revokeObjectURL(url) }
}

export default function About() {
  const { draft, set } = useDraft()
  const [params, setParams] = useSearchParams()
  const editing = useEditing()
  const toast = useToast()
  /** The participant preview (15 Oct 2026): closed until the client opens it. */
  const [preview, setPreview] = useState(false)
  const choose = async (file: File | undefined) => {
    if (!file) return
    if (!/^image\/(jpeg|png)$/.test(file.type)) { toast('The thumbnail has to be a .jpeg or .png file'); return }
    if (file.size > MAX_BYTES) { toast('The thumbnail can be 2 MB at most'); return }
    try { set('image', await readPicture(file)); set('thumbnail', file.name) } catch { toast(`${file.name} could not be read as a picture`) }
  }

  return (
    <CreateShell step="about">
      <div className={cn('relative min-h-[1242px] rounded-lg bg-bg-0 px-6 pt-[9px]', preview && 'flex items-start gap-12 py-6 min-[1600px]:justify-center')}>
        {!preview && <span className="absolute right-6 top-6"><PreviewButton onClick={() => setPreview(true)} /></span>}
        <div className={cn('flex w-[600px] flex-col', !preview && 'mx-auto')}>
          <Section icon={<TaskIcon className="h-5 w-5" />} title="Select Study Type" sub={editing ? 'The study type cannot be changed after published' : 'Choose the study type suitable to your research needs'}>
            <div className="flex flex-col gap-2">
              {TYPES.map((t) => <TypeCard key={t.key} t={t} />)}
            </div>
          </Section>

          <Section icon={<Clock className="h-5 w-5" />} title="Set Durations" sub="How long the study is expected to take, and when it closes">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2 rounded-md bg-bg-1 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-regular text-text-subtitle">Expected time to complete</span>
                  <span className="text-body-medium text-text-title">About {draft.duration} mins</span>
                </div>
                <input type="range" min={5} max={120} step={5} value={draft.duration} aria-label="Duration"
                  onChange={(e) => set('duration', Number(e.target.value))} className="slider w-full"
                  style={{ ['--slider-track' as string]: `linear-gradient(to right, #fca311 0 ${((draft.duration - 5) / 115) * 100}%, #eeedec ${((draft.duration - 5) / 115) * 100}% 100%)` }} />
                <span className="text-text-regular text-text-subtitle">An estimate shown to participants, not a time limit. Nobody has to finish within it.</span>
              </div>
              <span className="flex flex-col gap-0.5">
                <span className="text-text-regular text-text-subtitle">
                  Study End Date, the deadline <span className="text-text-body">(optional)</span>
                </span>
                <span className="relative flex">
                  <TextBox value={draft.endDate} placeholder="DD / MM / YYYY" onChange={(v) => set('endDate', v)} className="h-[38px] pr-11" />
                  <Calendar className="pointer-events-none absolute right-4 top-[9px] h-5 w-5 text-text-subtitle" />
                </span>
              </span>
              <p className="pt-[5px] text-text-regular text-text-subtitle">Participants must finish by the end date. The study ends then, after 60 days at most, or sooner if it fills.</p>
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
                {/* The picture is read here and kept with the study (shared/studyForm.ts `image`); it is the study's image in all three apps. */}
                <input id="thumbnail-file" type="file" accept="image/jpeg,image/png" className="sr-only"
                  onChange={(e) => { void choose(e.target.files?.[0]); e.target.value = '' }} />
                {draft.image ? (
                  <div className="flex h-[100px] items-center gap-4 rounded-sm border-1 border-stroke-input bg-bg px-4">
                    <img src={draft.image} alt="Study thumbnail" className="h-[72px] w-24 shrink-0 rounded-sm object-cover" />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-body-medium text-text-title">{draft.thumbnail || 'Thumbnail image'}</span>
                      <span className="text-text-regular text-text-subtitle">.jpeg or .png file&nbsp; |&nbsp; 2 MB max.</span>
                    </span>
                    <Button variant="tertiary" size="row" className="px-3" onClick={() => document.getElementById('thumbnail-file')?.click()}>Change</Button>
                    <Button variant="tertiary" size="row" className="px-3" onClick={() => { set('image', ''); set('thumbnail', ''); toast('Thumbnail removed') }}>Remove</Button>
                  </div>
                ) : (
                <button type="button" onClick={() => document.getElementById('thumbnail-file')?.click()}
                  className="flex h-[100px] flex-col items-center justify-center gap-1 rounded-sm border-1 border-stroke-input bg-bg">
                  <span className="flex items-center gap-2 text-body-medium text-text-title">
                    <Upload className="h-5 w-5" />Upload Thumbnail Image
                  </span>
                  <span className="text-text-regular text-text-subtitle">Keep image in 4:3 aspect ratio</span>
                  <span className="text-text-regular text-text-subtitle">.jpeg or .png file&nbsp; |&nbsp; 2 MB max.</span>
                </button>
                )}
              </Field>
            </div>
          </Section>
        </div>
        {preview && (
          <PreviewPanel onClose={() => setPreview(false)} onRefresh={() => { setPreview(false); requestAnimationFrame(() => setPreview(true)) }}>
            <AboutPreview />
          </PreviewPanel>
        )}
      </div>
    <NewStudyDialog open={params.get('start') === '1'} onClose={() => setParams({}, { replace: true })} />
    </CreateShell>
  )
}
