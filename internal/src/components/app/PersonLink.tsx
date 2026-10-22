import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../lib/cn'

/**
 * A participant's name that opens their full profile (22 Oct 2026): wherever a
 * name is drawn in a list, session, result or row, it goes to
 * `/participants/:id`. Inside a clickable row it stops the row's own click,
 * so the name always means the person.
 */
export default function PersonLink({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  const nav = useNavigate()
  return (
    <button type="button" onClick={(e) => { e.stopPropagation(); nav(`/participants/${id}`) }}
      className={cn('cursor-pointer text-left hover:text-brand-primary hover:underline', className)}>
      {children}
    </button>
  )
}
