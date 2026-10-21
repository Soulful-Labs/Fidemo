import { readPicture } from '@shared/picture'
import type { StudyForm } from '@shared/studyForm'
import { useRef, useState } from 'react'
import { StudyTypeIcon } from '../../../components/app/StudyTypeTag'
import type { StudyType } from '../../../components/app/StudyTypeTag'
import Button, { IconButton } from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { Toggle } from '../../../components/ui/controls'
import { CalendarIcon, ClipboardIcon, ClockIcon, CloseIcon, InfoIcon, UploadIcon } from '../../../components/ui/icons'
import { cn } from '../../../lib/cn'
import { Range, Section } from './EditBits'
import type { SetForm } from './EditSteps'

const TYPES: { key: StudyForm['type']; icon: StudyType; label: string; sub: string; group?: 'groupVideo' | 'groupInPerson' }[] = [
  { key: 'survey', icon: 'survey', label: 'Survey', sub: 'Structured questionnaire with set questions for data at scale.' },
  { key: 'video_call', icon: 'video', label: 'Video Call', sub: 'Live remote conversation using Zoom, Meet, or similar tools.', group: 'groupVideo' },
  { key: 'in_person', icon: 'in-person', label: 'In-Person', sub: 'Face to face interview in a physical location.', group: 'groupInPerson' },
  { key: 'diary', icon: 'diary', label: 'Diary Study', sub: 'Participants log experiences over time' },
]

/**
 * About (2325:214086). The type cards are drawn as on Create, the study's own
 * one selected; "The study type cannot be changed after published", so none
 * can be picked and the group switches are fixed. Duration, end date, title,
 * description and thumbnail can change.
 */
export default function AboutStep({ form, set }: { form: StudyForm; set: SetForm }) {
  const file = useRef<HTMLInputElement>(null)
  const [why, setWhy] = useState('')
  const choose = async (f?: File) => {
    if (!f) return
    const read = await readPicture(f)
    if (!read.ok) { setWhy(read.why); return }
    setWhy(''); set('image', read.dataUrl); set('thumbnail', f.name)
  }
  return (
    <>
      <Section icon={<ClipboardIcon />} title="Select Study Type" sub="The study type cannot be changed after published">
        <div className="flex flex-col gap-2" role="radiogroup" aria-label="Study type" aria-readonly="true">
          {TYPES.map((t) => {
            const on = form.type === t.key
            return (
              <div key={t.key} role="radio" aria-checked={on} aria-disabled="true"
                className={cn('flex flex-col gap-3 rounded-lg border-1 p-3', on ? 'border-stroke-input bg-bg-2' : 'border-stroke-input bg-bg-0')}>
                <div className="flex items-center gap-3">
                  <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-md', on ? 'bg-bg-0' : 'bg-bg-1')}>
                    <StudyTypeIcon type={t.icon} className="h-5 w-5 text-text-title" />
                  </span>
                  <span className="flex flex-col"><span className="text-text-medium text-text-title">{t.label}</span><span className="text-text-regular text-text-subtitle">{t.sub}</span></span>
                </div>
                {t.group && (
                  <div className="ml-14 flex items-center justify-between gap-3 rounded-md bg-bg-1 px-3 py-2">
                    <span className="flex flex-col"><span className="text-text-regular text-text-title">Group session</span>
                      <span className="text-text-regular text-text-subtitle">Schedule sessions with multiple participants at the same time.</span></span>
                    <Toggle checked={on && form[t.group]} disabled />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Section>
      <Section icon={<ClockIcon />} title="Durations" sub="Set the estimated time duration to complete the study">
        <label className="flex flex-col gap-3 rounded-lg bg-bg-1 p-4">
          <span className="flex justify-between text-text-regular text-text-subtitle">Duration<span className="text-body-medium text-text-title">{form.duration} mins</span></span>
          <Range min={5} max={120} step={5} value={form.duration} label="Duration" onChange={(v) => set('duration', v)} />
        </label>
        <div className="flex flex-col gap-1">
          <Input size="sm" label="Study End Date (optional)" placeholder="DD / MM / YYYY" value={form.endDate} onChange={(e) => set('endDate', e.target.value)}
            rightSlot={<CalendarIcon className="h-5 w-5 text-text-subtitle" />} />
          <span className="text-text-regular text-text-subtitle">Study gets ended after 60 days max or when its filled before it</span>
        </div>
      </Section>
      <Section icon={<InfoIcon />} title="About Study" sub="What this study is about and your goals for it">
        <span className="text-text-medium text-text-title">What participants will see</span>
        <Input size="sm" label="Title of your study" value={form.title} onChange={(e) => set('title', e.target.value)} />
        <Input size="sm" label="Tell us about your study" value={form.description} onChange={(e) => set('description', e.target.value)} />
        <div className="flex flex-col gap-1">
          <span className="text-text-regular text-text-subtitle">Thumbnail Image</span>
          <input ref={file} type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => { void choose(e.target.files?.[0]); e.target.value = '' }} />
          {form.image ? (
            <div className="flex items-center gap-3 rounded-md border-1 border-stroke-input p-2">
              <img src={form.image} alt="" className="h-12 w-16 rounded-xs object-cover" />
              <button type="button" onClick={() => file.current?.click()} className="flex-1 truncate text-left text-text-regular text-text-title hover:text-brand-primary" title="Change thumbnail">{form.thumbnail || 'Thumbnail image'}</button>
              <IconButton label="Remove thumbnail" size={32} onClick={() => { set('image', ''); set('thumbnail', '') }}><CloseIcon className="h-4 w-4" /></IconButton>
            </div>
          ) : (
            <Button variant="tertiary" size="md" leftIcon={<UploadIcon className="h-4 w-4" />} onClick={() => file.current?.click()}>Upload Thumbnail</Button>
          )}
          {why && <span className="text-text-regular text-state-danger">{why}</span>}
        </div>
      </Section>
    </>
  )
}
