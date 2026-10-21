import CheckPicker from '../../components/ui/CheckPicker'
import { Chip, Field } from './CreateBits'

/**
 * One audience criterion picked from a list, its picks as chips under it, as
 * Age Range, Ethnicity and Area Type are drawn (1518:91112, 1645:133969):
 * "2 ethnicities selected  •  Select ethnicity...". Nothing ticked means any.
 */
export default function ListCriterion({ label, options, picked, one, many, prompt, verb = 'selected', onChange }: {
  label: string; options: readonly string[]; picked: string[]
  /** The counted word, singular and plural: "ethnicity" / "ethnicities". */
  one: string; many: string
  prompt: string
  /** "selected", or "added" as Experience and Household Income are drawn. */
  verb?: string
  onChange: (next: string[]) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <Field label={label}>
        <CheckPicker label={label} all="All" picked={picked} options={options.map((value) => ({ value }))}
          value={picked.length ? `${picked.length} ${picked.length === 1 ? one : many} ${verb}  •  ${prompt}` : prompt}
          onChange={onChange} />
      </Field>
      {picked.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {picked.map((v) => <Chip key={v} onRemove={() => onChange(picked.filter((x) => x !== v))}>{v}</Chip>)}
        </div>
      )}
    </div>
  )
}
