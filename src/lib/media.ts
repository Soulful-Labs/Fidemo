import { useEffect, useState } from 'react'
import { loadVideo } from '@shared/media'

export { PICTURE_BOX, PICTURE_MAX_BYTES, readPicture } from '@shared/picture'

/** A playable URL for a kept video, or undefined while it loads or when there is none. */
export function useVideoUrl(id?: string): string | undefined {
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    setUrl(undefined)
    if (!id) return
    let made: string | undefined
    let live = true
    void loadVideo(id).then((blob) => { if (live && blob) { made = URL.createObjectURL(blob); setUrl(made) } })
    return () => { live = false; if (made) URL.revokeObjectURL(made) }
  }, [id])
  return url
}
