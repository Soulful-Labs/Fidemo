import SidePanel from '../../components/ui/SidePanel'
import Button from '../../components/ui/Button'
import { Download } from '../../components/ui/icons'
import { recruits, sessionSeats } from '@shared/derive'
import { csv, fileName, save } from '@shared/files'
import { usePlatform } from '../../platform'
import { slotDay } from '@shared/format'
import type { Study } from '@shared/types'
import { useToast } from '../../components/ui/Toast'

/**
 * Download Sessions Results (1627:110569 in-person group, 1627:107040 group
 * video call). The frames offer each session's Notes, or Recordings and a
 * Transcript. None of those exist on the platform yet (no video service, and
 * notes are not kept), so each session gives what does: who was booked into
 * it and whether they attended, as a real CSV. `artefact` is no longer shown.
 */
export default function DownloadSessionsPanel({
  open, onClose, study,
}: { open: boolean; onClose: () => void; artefact?: string; study: Study }) {
  const toast = useToast()
  const world = usePlatform()
  const names = new Map(recruits(world, study).map((r) => [r.id, r]))
  const STATE: Record<string, string> = { scheduled: 'Booked', completed: 'Attended', no_show: 'No-show' }
  /** The study's own sessions, each with the people who were booked into it. */
  const SESSION_FILES = sessionSeats(study).map((x, i) => ({ title: `Session ${i + 1}`, at: `${slotDay(x.date)}, ${x.slot}`, participants: `${x.taken} participants`, people: x.people }))
  return (
    <SidePanel open={open} onClose={onClose} title="Download Sessions Results"
      headerClassName="h-14 border-b-1 border-bgAlt-2" bodyClassName="flex flex-col gap-[15px] p-4"
      className="h-fit">
      {SESSION_FILES.map((s) => (
        <div key={s.title} className="flex h-[76px] items-center justify-between gap-4 rounded-md bg-bg-1 px-4">
          <span className="flex flex-col gap-1">
            <span className="text-body-medium text-text-title">
              {s.title} <span className="px-1 text-text-subtitle">&bull;</span> {s.at}
            </span>
            <span className="text-text-regular leading-5 text-text-subtitle">
              {s.participants} <span className="px-1">&bull;</span> Attendance list
            </span>
          </span>
          <Button size="none" className="h-[38px] px-4" onClick={() => {
            const rows = s.people.map((id) => { const r = names.get(id); const p = study.participations.find((x) => x.personId === id); return [s.title, s.at, r?.name ?? id, r?.role ?? '', STATE[p?.state ?? ''] ?? p?.state ?? '', p?.code?.byParticipant ? 'Yes' : 'No'] })
            toast(`Saved ${save(fileName(`${study.title} ${s.title} attendance`, 'csv'), csv(['Session', 'Date and time', 'Participant', 'Role', 'Attendance', 'Entered the session code'], rows))}`)
          }} leftIcon={<Download className="h-4 w-4" />}>
            Download List
          </Button>
        </div>
      ))}
    </SidePanel>
  )
}
