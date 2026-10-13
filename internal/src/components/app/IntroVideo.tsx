import { useEffect, useState } from 'react'
import { loadVideo } from '@shared/media'
import type { Person } from '@shared/types'

/**
 * A participant's intro video, as a client or the console sees it. It is given only what
 * sharedVideo allows, so with consent off there is nothing to give and the
 * block is not drawn at all. The file comes from this browser's IndexedDB,
 * where the respondent app kept it (shared/media.ts).
 */
export default function IntroVideo({ video, compact = false }: { video: NonNullable<Person['video']>; compact?: boolean }) {
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    setUrl(undefined)
    let made: string | undefined
    let live = true
    void loadVideo(video.id).then((blob) => { if (live && blob) { made = URL.createObjectURL(blob); setUrl(made) } })
    return () => { live = false; if (made) URL.revokeObjectURL(made) }
  }, [video.id])
  return (
    <section className={compact ? 'flex flex-col gap-2 py-1' : 'flex flex-col gap-2 rounded-md border-1 border-stroke-1 bg-bg-0 p-2'}>
      <span className="flex items-center justify-between gap-3">
        <span className="text-text-regular text-text-title">Intro Video</span>
        <span className="truncate text-text-regular text-text-body">{video.name}</span>
      </span>
      {url
        ? <video src={url} controls playsInline preload="metadata" aria-label="Intro video" className="max-h-64 w-full rounded-sm bg-bg-2" />
        : <span className="text-text-regular text-text-body">The video is kept in the participant&apos;s browser and is not available here.</span>}
    </section>
  )
}
