import SidePanel from '../../components/ui/SidePanel'
import Button from '../../components/ui/Button'
import { Download } from '../../components/ui/icons'
import { sessionSeats } from '@shared/derive'
import { slotDay } from '@shared/format'
import type { Study } from '@shared/types'
import { useToast } from '../../components/ui/Toast'

/**
 * Download Sessions Results (1627:110569 in-person group, 1627:107040 group
 * video call). One panel: the only difference between the two frames is what
 * each session yields, Notes or Recordings + Transcript.
 */
export default function DownloadSessionsPanel({
  open, onClose, artefact = 'Notes', study,
}: { open: boolean; onClose: () => void; artefact?: string; study: Study }) {
  const toast = useToast()
  /** The study's own sessions, each with the people who were booked into it. */
  const SESSION_FILES = sessionSeats(study).map((x, i) => ({ title: `Session ${i + 1}`, at: `${slotDay(x.date)}, ${x.slot}`, participants: `${x.taken} participants` }))
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
              {s.participants} <span className="px-1">&bull;</span> {artefact}
            </span>
          </span>
          <Button size="none" className="h-[38px] px-4" onClick={() => toast('Session files downloaded')} leftIcon={<Download className="h-4 w-4" />}>
            Download Files
          </Button>
        </div>
      ))}
    </SidePanel>
  )
}
