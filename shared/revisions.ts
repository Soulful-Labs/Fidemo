import type { FormQuestion, StudyForm } from './studyForm'
import type { FieldChange, Study, StudyEdit } from './types'

/**
 * Revisions History (client 2322:211934): what changed on a study after it
 * was first submitted, field by field, and who changed it. Every entry is
 * worked out from the two forms either side of a save, so nothing on the
 * screen is written by hand.
 */

const list = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

/** Two lists: what the second adds to the first, and what it drops. */
function lists(path: string[], before: string[], after: string[]): FieldChange[] {
  const added = after.filter((x) => !before.includes(x))
  const removed = before.filter((x) => !after.includes(x))
  return added.length || removed.length ? [{ path, ...(added.length ? { added } : {}), ...(removed.length ? { removed } : {}) }] : []
}

function value(path: string[], before: string, after: string): FieldChange[] {
  return before === after ? [] : [{ path, from: before, to: after }]
}

/** One builder's questions, matched by id: a question added or removed, its text changed, its options added or removed. */
function questions(step: string, before: FormQuestion[], after: FormQuestion[]): FieldChange[] {
  const real = (qs: FormQuestion[]) => qs.filter((q) => q.text.trim())
  const b = real(before), a = real(after)
  const out: FieldChange[] = []
  // The same question, by id, or by its words when it was rebuilt with a new id.
  const twin = (q: FormQuestion) => b.find((x) => x.id === q.id) ?? b.find((x) => x.text.trim() === q.text.trim())
  const kept = new Set<string>()
  a.forEach((q, i) => {
    const label = `Q${i + 1}`
    const was = twin(q)
    if (was) kept.add(was.id)
    if (!was) { out.push({ path: [step, label], added: [q.text.trim()] }); return }
    out.push(...value([step, label, 'Question'], was.text.trim(), q.text.trim()))
    out.push(...lists([step, label, 'Option'], was.options.map((o) => o.text.trim()).filter(Boolean), q.options.map((o) => o.text.trim()).filter(Boolean)))
  })
  b.filter((q) => !kept.has(q.id)).forEach((q) => out.push({ path: [step, 'Question'], removed: [q.text.trim()] }))
  return out
}

const CONDITION: Record<StudyForm['condition'], string> = { na: 'Not applicable', fresh: 'Prefer fresh people', never: 'Never taken part before' }

/** Every field one save changed, in the order of the Create steps. */
export function diffForms(before: StudyForm, after: StudyForm): FieldChange[] {
  const mins = (n: number) => `${n} minutes`
  return [
    ...value(['About', 'Title'], before.title.trim(), after.title.trim()),
    ...value(['About', 'Description'], before.description.trim(), after.description.trim()),
    ...value(['About', 'Study Time'], mins(before.duration), mins(after.duration)),
    ...value(['About', 'End Date'], before.endDate, after.endDate),
    ...(before.image !== after.image ? [{ path: ['About', 'Thumbnail'], to: after.thumbnail || (after.image ? 'New picture' : 'Removed') }] : []),
    ...value(['Audience', 'Participants'], before.participants, after.participants),
    ...lists(['Audience', 'Countries'], before.countries, after.countries),
    ...lists(['Audience', 'Genders'], before.gender, after.gender),
    ...lists(['Audience', 'Education'], before.education, after.education),
    ...lists(['Audience', 'Age'], before.ageRanges, after.ageRanges),
    ...lists(['Audience', 'Roles'], list(before.roles), list(after.roles)),
    ...lists(['Audience', 'Work Functions'], list(before.functions), list(after.functions)),
    ...lists(['Audience', 'Skills'], list(before.skills), list(after.skills)),
    ...lists(['Audience', 'Industries'], list(before.industries), list(after.industries)),
    ...lists(['Audience', 'Experience'], before.experience ?? [], after.experience ?? []),
    ...lists(['Audience', 'Household Income'], before.income ?? [], after.income ?? []),
    ...lists(['Audience', 'Profile Tiers'], list(before.tiers), list(after.tiers)),
    ...value(['Audience', 'Condition'], CONDITION[before.condition], CONDITION[after.condition]),
    ...questions('Screener', before.questions, after.questions),
    ...value(['Study', 'Incentive'], `$${before.incentive}`, `$${after.incentive}`),
    ...questions('Study', before.tasks, after.tasks),
    ...value(['Study', 'Duration'], before.studyDuration, after.studyDuration),
    ...value(['Study', 'Frequency'], before.frequency, after.frequency),
    ...value(['Study', 'Minimum Required'], before.minimumRequired, after.minimumRequired),
    ...value(['Study', 'Seats'], before.seats, after.seats),
    ...lists(['Study', 'Addresses'], before.addresses.map((x) => x.title), after.addresses.map((x) => x.title)),
    ...lists(['Study', 'Sessions'], before.sessions.map((x) => `${x.date} ${x.time}`), after.sessions.map((x) => `${x.date} ${x.time}`)),
    ...(!same(before.hours, after.hours) || !same(before.overrides, after.overrides) ? [{ path: ['Study', 'Availability'], to: 'Updated' }] : []),
  ]
}

/** A round of changes, or nothing when the save changed nothing. */
export function editOf(before: StudyForm | undefined, after: StudyForm, by: StudyEdit['by'], at: string, byId?: string): StudyEdit | null {
  if (!before) return null
  const changes = diffForms(before, after)
  return changes.length ? { at, by, byId, changes } : null
}

export type HistoryEntry =
  | { kind: 'edit'; at: string; by: StudyEdit['by']; byId?: string; changes: FieldChange[] }
  | { kind: 'requested'; at: string; byId: string; text: string }
  | { kind: 'submitted'; at: string }

/** The whole history, newest first, ending with the study's first submission. */
export function studyHistory(study: Study): HistoryEntry[] {
  const edits: HistoryEntry[] = (study.edits ?? []).map((e) => ({ kind: 'edit', ...e }))
  const asked: HistoryEntry[] = study.revisions.map((r) => ({ kind: 'requested', at: r.at, byId: r.by, text: r.text }))
  const firstAt = study.firstSubmittedAt ?? study.submittedAt
  const first: HistoryEntry[] = firstAt ? [{ kind: 'submitted', at: firstAt }] : []
  return [...edits, ...asked].sort((a, b) => b.at.localeCompare(a.at)).concat(first)
}
