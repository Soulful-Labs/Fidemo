/**
 * A participant's intro video, kept in this browser's IndexedDB. The shared
 * state in localStorage holds only a reference to it (Person.video), because
 * the store writes the whole state on every change and a video would both
 * slow every write and overflow localStorage's few megabytes. All three apps
 * run on one origin, so the client app and the console read the same file.
 *
 * Reading is not consent: a screen outside the respondent's own app asks for
 * a file only when sharedVideo (shared/derive.ts) says it may.
 */
const DB = 'fi-media'
const STORE = 'videos'

/** Larger than this and the browser is unlikely to keep it alongside everything else. */
export const VIDEO_MAX_BYTES = 50 * 1024 * 1024

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('This browser cannot keep files')); return }
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('This browser cannot keep files'))
  })
}

function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return open().then((db) => new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode)
    const req = fn(tx.objectStore(STORE))
    tx.oncomplete = () => { resolve(req.result as T); db.close() }
    tx.onabort = tx.onerror = () => { reject(tx.error ?? req.error ?? new Error('Storage refused the file')); db.close() }
  }))
}

const mb = (n: number) => `${(n / 1024 / 1024).toFixed(n < 10 * 1024 * 1024 ? 1 : 0)} MB`

/**
 * Keeps the file, or says plainly why it cannot: too large, or more than the
 * browser has room for. Resolves to a reason on failure, never throws.
 */
export async function saveVideo(id: string, file: Blob): Promise<{ ok: true } | { ok: false; why: string }> {
  if (file.size > VIDEO_MAX_BYTES) return { ok: false, why: `That video is ${mb(file.size)}. Videos can be up to ${mb(VIDEO_MAX_BYTES)}.` }
  try {
    const est = await navigator.storage?.estimate?.()
    if (est?.quota !== undefined && est.usage !== undefined && est.quota - est.usage < file.size * 1.1) {
      return { ok: false, why: `That video is ${mb(file.size)} and this browser has room for about ${mb(Math.max(0, est.quota - est.usage))}. Try a shorter one.` }
    }
    await run('readwrite', (s) => s.put(file, id))
    return { ok: true }
  } catch (e) {
    const full = e instanceof DOMException && e.name === 'QuotaExceededError'
    return { ok: false, why: full ? `That video will not fit in this browser's storage (${mb(file.size)}). Try a shorter one.` : 'This browser could not keep the video.' }
  }
}

export const loadVideo = (id: string): Promise<Blob | undefined> => run<Blob | undefined>('readonly', (s) => s.get(id)).catch(() => undefined)

export const deleteVideo = (id: string): Promise<void> => run<void>('readwrite', (s) => s.delete(id)).then(() => undefined, () => undefined)
