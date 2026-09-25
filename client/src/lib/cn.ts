/**
 * Joins class names, dropping falsy values, and lets a later class win over an
 * earlier one that sets the same thing.
 *
 * Every component here takes a `className` so the caller can override what it
 * draws by default, and that only works if the caller's class actually wins.
 * A plain join leaves both in the list and the stylesheet's order decides,
 * which is why a button asking for `h-12 text-body-medium` kept the size
 * primitive's 40px and 14px instead. It cost three separate rounds of
 * chasing before it was named.
 *
 * Only unprefixed classes are resolved: anything carrying a variant
 * (`hover:`, `md:`, `[&_svg]:`) is left exactly as written, because those
 * cascade on their own terms.
 */

/** The font-size utilities, which have to be listed because `text-` is also colour. */
const FONT_SIZE = new Set([
  'text-label',
  'text-text-regular', 'text-text-medium', 'text-text-large',
  'text-body-regular', 'text-body-medium', 'text-body-large',
  'text-title-s', 'text-title-m', 'text-title-l',
])

/** Prefixes where two classes in the same group cannot both apply. */
const GROUPS: [string, RegExp][] = [
  ['h', /^h-/],
  ['w', /^w-/],
  ['min-h', /^min-h-/],
  ['min-w', /^min-w-/],
  ['max-w', /^max-w-/],
  ['p', /^p-/],
  ['px', /^px-/],
  ['py', /^py-/],
  ['pt', /^pt-/],
  ['pr', /^pr-/],
  ['pb', /^pb-/],
  ['pl', /^pl-/],
  ['gap-x', /^gap-x-/],
  ['gap-y', /^gap-y-/],
  ['gap', /^gap-(?!x-|y-)/],
  ['rounded', /^rounded(-|$)/],
  ['leading', /^leading-/],
  ['font', /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/],
]

/** A shorthand also settles the sides it covers, so `p-4` closes `px-3`. */
const COVERS: Record<string, string[]> = {
  p: ['px', 'py', 'pt', 'pr', 'pb', 'pl'],
  px: ['pl', 'pr'],
  py: ['pt', 'pb'],
  gap: ['gap-x', 'gap-y'],
}

function group(cls: string): string | null {
  if (FONT_SIZE.has(cls)) return 'font-size'
  for (const [name, re] of GROUPS) if (re.test(cls)) return name
  return null
}

export function cn(...parts: (string | false | null | undefined)[]): string {
  const classes = parts.filter(Boolean).join(' ').split(/\s+/).filter(Boolean)
  /** Walk backwards so the last of each group is the one that survives. */
  const seen = new Set<string>()
  const kept: string[] = []
  for (let i = classes.length - 1; i >= 0; i -= 1) {
    const cls = classes[i]!
    if (cls.includes(':')) { kept.push(cls); continue }
    const g = group(cls)
    if (g === null) { kept.push(cls); continue }
    if (seen.has(g)) continue
    seen.add(g)
    for (const covered of COVERS[g] ?? []) seen.add(covered)
    kept.push(cls)
  }
  return kept.reverse().join(' ')
}
