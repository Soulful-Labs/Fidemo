import type { ComponentType, SVGProps } from 'react'
import { cn } from '../../lib/cn'

export interface PanelTab { key: string; label: string; width: string; Icon?: ComponentType<SVGProps<SVGSVGElement>> }

/**
 * The tab strip along the top of a study panel (Review 1982:104845, Manage
 * 1952:76685): 44 tall on bg-1 with a 1px stroke-input baseline; tabs in Body
 * 16 at the widths the frames give, text-body when idle, brand-primary with a
 * 1px underline when active; an optional 16px icon 8 before the label.
 */
export default function PanelTabs({ tabs, value, onChange }: { tabs: readonly PanelTab[]; value: string; onChange: (key: string) => void }) {
  return (
    <div role="tablist" className="flex h-11 border-b-1 border-stroke-input bg-bg-1">
      {tabs.map(({ key, label, width, Icon }) => (
        <button key={key} role="tab" type="button" aria-selected={key === value} onClick={() => onChange(key)}
          className={cn('-mb-px flex items-center justify-center gap-2 border-b-1 text-body-regular', width,
            key === value ? 'border-brand-primary text-brand-primary' : 'border-transparent text-text-body hover:text-text-subtitle')}>
          {Icon && <Icon className="h-4 w-4" />}{label}
        </button>
      ))}
    </div>
  )
}
