/**
 * The one picture reader: the respondent's profile picture and the console's
 * study thumbnail both use it (21 Oct 2026).
 */
/** "A real image, JPEG or PNG, up to 2MB, kept at no more than 640 by 480." */
export const PICTURE_MAX_BYTES = 2 * 1024 * 1024
export const PICTURE_BOX = { w: 640, h: 480 } as const

/**
 * Reads a chosen picture, checks it, and scales it down to fit inside 640 by
 * 480 (never up), keeping its proportions. A JPEG stays a JPEG and a PNG a PNG.
 * Resolves to a data URL, or to the reason it cannot be used.
 */
export async function readPicture(file: File): Promise<{ ok: true; dataUrl: string } | { ok: false; why: string }> {
  if (file.type !== 'image/jpeg' && file.type !== 'image/png') return { ok: false, why: 'Choose a JPEG or PNG picture' }
  if (file.size > PICTURE_MAX_BYTES) return { ok: false, why: `That picture is ${(file.size / 1024 / 1024).toFixed(1)} MB. Pictures can be up to 2 MB.` }
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('unreadable'))
      i.src = url
    })
    const scale = Math.min(1, PICTURE_BOX.w / img.naturalWidth, PICTURE_BOX.h / img.naturalHeight)
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
    canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height)
    return { ok: true, dataUrl: canvas.toDataURL(file.type, 0.85) }
  } catch {
    return { ok: false, why: 'That picture could not be read' }
  } finally {
    URL.revokeObjectURL(url)
  }
}
