import { useRef, useState } from 'react'
import { POINTS } from '@shared/rules'
import { deleteVideo, saveVideo } from '@shared/media'
import Button from '../../components/ui/Button'
import Toggle from '../../components/ui/Toggle'
import { readPicture, useVideoUrl } from '../../lib/media'
import { useStore } from '../../mock/store'
import { Avatar } from './Profile'

/**
 * The participant's picture and intro video, each with its own consent to
 * show clients, off until they turn it on. Changes save as they are made,
 * like the email toggles: turning consent off reaches every client screen at
 * once, because those read only what sharedPhoto and sharedVideo allow.
 */
export default function MediaFields() {
  const { user, pointsHistory, setPicture, setVideo, setMediaConsent, toast } = useStore()
  const pictureInput = useRef<HTMLInputElement>(null)
  const videoInput = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState<'photo' | 'video' | null>(null)
  const videoUrl = useVideoUrl(user.video?.id)
  const earned = (id: string) => pointsHistory.some((p) => p.id === id)

  const pickPicture = async (file?: File) => {
    if (!file) return
    setBusy('photo')
    const read = await readPicture(file)
    setBusy(null)
    if (!read.ok) { toast(read.why); return }
    if (setPicture(read.dataUrl)) toast(user.photoConsent ? 'Picture updated, clients see the new one' : 'Picture added')
  }

  const pickVideo = async (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('video/')) { toast('Choose a video file'); return }
    setBusy('video')
    const id = `vid-${Date.now().toString(36)}`
    const kept = await saveVideo(id, file)
    setBusy(null)
    if (!kept.ok) { toast(kept.why); return }
    const old = user.video?.id
    if (setVideo({ id, name: file.name, type: file.type, bytes: file.size })) {
      if (old) void deleteVideo(old)
      toast('Video added')
    } else void deleteVideo(id)
  }

  const removeVideo = () => {
    const old = user.video?.id
    if (setVideo(null)) { if (old) void deleteVideo(old); toast('Video removed') }
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3 rounded-lg bg-bg-1 p-4">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} photo={user.photo} size={64} />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-body-medium text-text-title">Profile Picture</span>
            <span className="text-text-regular text-text-body">JPEG or PNG, up to 2 MB</span>
            {!earned('pt-picture') && <span className="text-text-regular text-brand-secondary">Add one to earn {POINTS.PROFILE_PICTURE} points</span>}
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="md" className="flex-1" loading={busy === 'photo'} onClick={() => pictureInput.current?.click()}>{user.photo ? 'Change Picture' : 'Upload Picture'}</Button>
          {user.photo && <Button variant="tertiary" size="md" className="flex-1" onClick={() => { if (setPicture(null)) toast('Picture removed') }}>Remove</Button>}
        </div>
        <Toggle label="Show my picture to clients" checked={Boolean(user.photoConsent)} disabled={!user.photo}
          onBlocked={() => toast('Add a picture first')} onChange={(on) => { if (setMediaConsent('photo', on)) toast(on ? 'Clients can now see your picture' : 'Clients now see your initial') }}
          description="On: researchers who see your profile see this picture. Off: they see only your initial. You can turn it off at any time." />
        <input ref={pictureInput} type="file" accept="image/jpeg,image/png" className="hidden" aria-label="Choose a profile picture"
          onChange={(e) => { void pickPicture(e.target.files?.[0]); e.target.value = '' }} />
      </section>

      <section className="flex flex-col gap-3 rounded-lg bg-bg-1 p-4">
        <div className="flex flex-col gap-1">
          <span className="text-body-medium text-text-title">Intro Video</span>
          <span className="text-text-regular text-text-body">Share about you, what you do, your interests, etc. Kept in this browser, up to 50 MB.</span>
          {!earned('pt-video') && <span className="text-text-regular text-brand-secondary">Add one to earn {POINTS.INTRO_VIDEO} points</span>}
        </div>
        {user.video && (videoUrl
          ? <video src={videoUrl} controls playsInline className="max-h-56 w-full rounded-md bg-bg-0" aria-label="Your intro video" />
          : <p className="text-text-regular text-text-body">{user.video.name}</p>)}
        <div className="flex gap-3">
          <Button variant="secondary" size="md" className="flex-1" loading={busy === 'video'} onClick={() => videoInput.current?.click()}>{user.video ? 'Change Video' : 'Upload Short Video'}</Button>
          {user.video && <Button variant="tertiary" size="md" className="flex-1" onClick={removeVideo}>Remove</Button>}
        </div>
        <Toggle label="Show my video to clients" checked={Boolean(user.videoConsent)} disabled={!user.video}
          onBlocked={() => toast('Add a video first')} onChange={(on) => { if (setMediaConsent('video', on)) toast(on ? 'Clients can now watch your video' : 'Clients can no longer see your video') }}
          description="On: researchers who see your profile can watch this video. Off: they cannot see it at all. You can turn it off at any time." />
        <input ref={videoInput} type="file" accept="video/*" className="hidden" aria-label="Choose an intro video"
          onChange={(e) => { void pickVideo(e.target.files?.[0]); e.target.value = '' }} />
      </section>
    </div>
  )
}
