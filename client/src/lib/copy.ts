/**
 * Copies text to the clipboard and says whether it worked.
 *
 * The build called `navigator.clipboard.writeText(...).catch(() => undefined)`
 * in three places, which swallows the failure and shows nothing either way,
 * so Copy looked broken whenever the clipboard API was unavailable — an
 * insecure origin, a denied permission, an embedded frame. This falls back to
 * a hidden textarea and `execCommand`, and returns a boolean so the caller
 * can toast the truth rather than guess.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through to the textarea */
  }
  try {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.top = '-1000px'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(area)
    return ok
  } catch {
    return false
  }
}
