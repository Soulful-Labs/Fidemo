import { useRef, useState } from 'react'
import { deleteVideo, saveVideo } from '@shared/media'
import FileField from '../../components/app/FileField'
import Button from '../../components/ui/Button'
import Toggle from '../../components/ui/Toggle'
import { readPicture, useVideoUrl } from '../../lib/media'
import { useStore } from '../../mock/store'

const initials = (name: string) => name.split(' ').map((n) => n[0]).slice(0, 2).join('')

/**
 * The participant's picture, as My Profile draws it (979:74128): the picture,
 * Change Picture and Remove on one row, above Full Name. Its consent switch is
 * kept under it (decided 21 Oct 2026; the frame leaves it out), off until the
 * participant turns it on. Changes save as they are made.
 */
export function PictureField() {
  const { user, setPicture, setMediaConsent, toast } = useStore()
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const pick = async (file?: File) => {
    if (!file) return
    setBusy(true)
    const read = await readPicture(file)
    setBusy(false)
    if (!read.ok) { toast(read.why); return }
    if (setPicture(read.dataUrl)) toast(user.photoConsent ? 'Picture updated, clients see the new one' : 'Picture added')
  }
  return (
    <div className="flex flex-col gap-3">
      <span className="text-text-regular text-text-subtitle">Profile Picture</span>
      <div className="flex items-center gap-4">
        {user.photo
          ? <img src={user.photo} alt="Your profile picture" className="h-[72px] w-[72px] shrink-0 rounded-md object-cover" />
          : <span aria-hidden="true" className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-md bg-bg-2 text-title-m text-text-title">{initials(user.name)}</span>}
        <Button variant="tertiary" size="md" loading={busy} onClick={() => input.current?.click()}>{user.photo ? 'Change Picture' : 'Upload Picture'}</Button>
        {user.photo && <Button variant="ghost" size="md" onClick={() => { if (setPicture(null)) toast('Picture removed') }}>Remove</Button>}
      </div>
      <Toggle label="Show my picture to clients" checked={Boolean(user.photoConsent)} disabled={!user.photo}
        onBlocked={() => toast('Add a picture first')} onChange={(on) => { if (setMediaConsent('photo', on)) toast(on ? 'Clients can now see your picture' : 'Clients now see your initial') }}
        description="On: researchers who see your profile see this picture. Off: they see only your initial." />
      <input ref={input} type="file" accept="image/jpeg,image/png" className="hidden" aria-label="Choose a profile picture"
        onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = '' }} />
    </div>
  )
}

/**
 * The intro video, as drawn: one upload box ("Upload Short Video", ".mp4 file
 * | 50 MB max."), then the video once there is one, with Remove. Its consent
 * switch is kept under it, as with the picture.
 */
/**
 * Keeps an intro video: the file in this browser's media store, its reference
 * on the person (which is what earns its points). One path for My Profile and
 * the About You onboarding step, so a video chosen at either is the same video.
 */
export function useIntroVideo() {
  const { user, setVideo, toast } = useStore()
  const [busy, setBusy] = useState(false)
  const pick = async (file: File): Promise<boolean> => {
    if (!file.type.startsWith('video/')) { toast('Choose a video file'); return false }
    setBusy(true)
    const id = `vid-${Date.now().toString(36)}`
    const kept = await saveVideo(id, file)
    setBusy(false)
    if (!kept.ok) { toast(kept.why); return false }
    const old = user.video?.id
    if (setVideo({ id, name: file.name, type: file.type, bytes: file.size })) { if (old) void deleteVideo(old); toast('Video added'); return true }
    void deleteVideo(id)
    return false
  }
  return { pick, busy }
}

export function VideoField() {
  const { user, setVideo, setMediaConsent, toast } = useStore()
  const { pick, busy } = useIntroVideo()
  const url = useVideoUrl(user.video?.id)
  const remove = () => { const old = user.video?.id; if (setVideo(null)) { if (old) void deleteVideo(old); toast('Video removed') } }
  return (
    <div className="flex flex-col gap-3">
      <FileField fieldLabel="Intro Video" label={busy ? 'Saving video...' : user.video ? 'Change Video' : 'Upload Short Video'} fileName={busy ? undefined : user.video?.name}
        description="Share about you, what you do, your interests, etc." hint=".mp4 file | 50 MB max." accept="video/*" inputLabel="Choose an intro video" onFile={(f) => void pick(f)} />
      {user.video && url && <video src={url} controls playsInline className="max-h-56 w-full rounded-md bg-bg-0" aria-label="Your intro video" />}
      {user.video && <Button variant="ghost" size="md" className="self-start" onClick={remove}>Remove Video</Button>}
      <Toggle label="Show my video to clients" checked={Boolean(user.videoConsent)} disabled={!user.video}
        onBlocked={() => toast('Add a video first')} onChange={(on) => { if (setMediaConsent('video', on)) toast(on ? 'Clients can now watch your video' : 'Clients can no longer see your video') }}
        description="On: researchers who see your profile can watch this video. Off: they cannot see it at all." />
    </div>
  )
}
