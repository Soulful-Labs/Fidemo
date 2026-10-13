/**
 * A picture for a seeded person: a drawn figure, not a photograph, made from
 * their id so it is the same every time. It has no face and is modelled on
 * nobody, which is the point: the demo pool is invented people, and a real
 * person's photograph beside an invented name would be neither honest nor
 * safe. The result is an SVG data URL, so all three apps can draw it as an
 * image with no file to ship.
 */
const BACKS = ['#fee2b5', '#c3e9d9', '#ecf6fd', '#f5f2ff', '#fff3e0', '#e7edef', '#fed592', '#a7dfc6']
const SKINS = ['#f6d7b8', '#e9bd98', '#d39c72', '#b07a53', '#8a5a3c', '#f1c9a5']
const HAIRS = ['#201e19', '#5e3b24', '#8a5a3c', '#b3740c', '#9d9d9d', '#3a2a1e']
const TOPS = ['#3fb984', '#42a4ed', '#9780fa', '#e5940f', '#2d835e', '#5e5d5b', '#7f9fb1']

const hash = (s: string) => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h }

export function avatarFor(id: string, gender?: string): string {
  const h = hash(id)
  const pick = <T,>(xs: T[], shift: number) => xs[(h >>> shift) % xs.length]!
  const back = pick(BACKS, 0), skin = pick(SKINS, 4), hair = pick(HAIRS, 9), top = pick(TOPS, 14)
  // Three cuts of hair: short, a longer fall behind the shoulders, or tied up. Chosen by the id, leaning on the recorded gender only for variety.
  const style = ((h >>> 19) + (gender === 'Female' ? 1 : 0)) % 3
  const cut = style === 0
    ? `<path d="M24 34c0-11 7-18 16-18s16 7 16 18c-3-6-8-9-16-9s-13 3-16 9Z" fill="${hair}"/>`
    : style === 1
      ? `<path d="M22 58V36c0-12 8-20 18-20s18 8 18 20v22H50V36H30v22Z" fill="${hair}"/><path d="M26 34c2-9 7-13 14-13s12 4 14 13c-4-4-8-6-14-6s-10 2-14 6Z" fill="${hair}"/>`
      : `<circle cx="40" cy="15" r="6" fill="${hair}"/><path d="M25 35c0-11 6-17 15-17s15 6 15 17c-3-5-8-8-15-8s-12 3-15 8Z" fill="${hair}"/>`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="${back}"/><path d="M12 80c2-16 13-24 28-24s26 8 28 24Z" fill="${top}"/><rect x="35" y="46" width="10" height="12" rx="4" fill="${skin}"/><circle cx="40" cy="36" r="14" fill="${skin}"/>${cut}</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
