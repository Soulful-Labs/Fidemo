import { useNavigate } from 'react-router-dom'
import Button from '../../../components/ui/Button'
import { Copy } from '../../../components/ui/icons'
import { cn } from '../../../lib/cn'
import { hasTakenPartWith } from '../../../lib/derive'
import { REPEAT_RULE_COPY } from '../../../lib/eligibility'
import { useStore } from '../../../mock/store'
import type { Study } from '../../../mock/types'

function Lock({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" className="shrink-0">
      <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d={open ? 'M8 10V7a4 4 0 0 1 7.5-2' : 'M8 10V7a4 4 0 0 1 8 0v3'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Workflow 17: a premium study is locked until a professional credential is
 * verified. Shown only on premium studies, above the tags.
 */
export function PremiumBanner({ study }: { study: Study }) {
  const navigate = useNavigate()
  const { user } = useStore()
  if (!study.premium) return null
  const unlocked = user.verified.license
  return (
    <div className={cn('flex flex-col gap-2 rounded-lg p-4', unlocked ? 'bg-bg-1 bg-yellow-fade' : 'bg-bg-1')}>
      <p className="flex items-center gap-2 text-body-medium text-tier-gold">
        <Lock open={unlocked} />
        {unlocked ? 'Premium study, unlocked' : 'Premium study, locked'}
      </p>
      <p className="text-text-regular text-text-subtitle">
        {unlocked
          ? 'Premium studies are the highest paid on the platform. Your verified professional credential gives you access.'
          : 'Premium studies are the highest paid on the platform. They need a professional credential, such as a medical or nursing licence, checked against the public register.'}
      </p>
      {!unlocked && (
        <Button size="md" variant="secondary" className="self-start" onClick={() => navigate('/profile/edit?tab=professional')}>
          Add a credential
        </Button>
      )}
    </div>
  )
}

/**
 * Workflow 57: each study sets its own rule on repeats. Shown where it
 * affects eligibility: before applying, with whether it applies to you.
 */
export function RepeatRuleRow({ study }: { study: Study }) {
  const { studies } = useStore()
  const copy = REPEAT_RULE_COPY[study.repeatRule]
  const before = hasTakenPartWith(studies, study.client.id, study.id)
  const blocked = study.repeatRule === 'exclude_previous' && before
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-bg-1 p-4">
      <p className={cn('text-body-medium', blocked ? 'text-state-danger' : 'text-text-title')}>{copy.label}</p>
      <p className="text-text-regular text-text-subtitle">
        {copy.note}{' '}
        {before
          ? blocked
            ? `You have taken part in a study for ${study.client.name} before, so you cannot apply to this one.`
            : `You have taken part in a study for ${study.client.name} before.`
          : `You have not taken part in a study for ${study.client.name} before.`}
      </p>
    </div>
  )
}

/** Workflow 12: every study link is coded, so sharing carries the code. */
export function ShareStudyLink({ study }: { study: Study }) {
  const { toast } = useStore()
  const link = `${window.location.origin}/studies/${study.id}?src=${study.linkCode}`
  const copy = async () => {
    try { await navigator.clipboard.writeText(link) } catch { /* clipboard unavailable outside a secure context */ }
    toast(`Link copied (code ${study.linkCode})`)
  }
  return (
    <button type="button" onClick={copy} className="flex items-center gap-2 self-start text-text-regular text-text-body hover:text-text-title">
      <Copy className="h-4 w-4" />
      Share study link
      <span className="text-text-disabled">{study.linkCode}</span>
    </button>
  )
}
