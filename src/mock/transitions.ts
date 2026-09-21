import { useEffect, useRef } from 'react'
import type { Actions } from './actions'
import type { AppNotification } from './types'
import type { Action, AppState, PendingTransition } from './storeTypes'

/** Session study types schedule; survey and diary go straight to completing. */
const SESSION_TYPES = ['video_call', 'group_video_call', 'in_person', 'in_person_group']

type Store = Omit<AppState, 'user'> & Actions & {
  user: AppState['user']
  dispatch: React.Dispatch<Action>
  toast: (message: string) => void
  notify: (n: Omit<AppNotification, 'id' | 'at' | 'read'>) => void
}

/** What a pending transition does when it fires. */
function fire(t: PendingTransition, store: Store) {
  const study = store.studies.find((s) => s.id === t.id)
  store.dispatch({ type: 'REMOVE_PENDING', id: t.id, kind: t.kind })
  if (!study) return

  if (t.kind === 'invite') {
    if (study.status !== 'applied') return
    const session = SESSION_TYPES.includes(study.type)
    store.dispatch({
      type: 'SET_STATUS', id: t.id,
      status: session ? 'invited_to_schedule' : 'invited_to_complete',
      timelineLabel: session ? 'Invited to schedule' : 'Invited to complete',
    })
    store.notify({
      kind: 'study',
      title: session ? "You've been selected to complete!" : "Congrats! You're invited to complete study!",
      body: `${study.title} is ready for the next step.`,
      actionLabel: session ? 'Schedule Now' : 'Start Study',
      to: session ? `/studies/${t.id}/schedule` : `/studies/${t.id}`,
    })
    store.toast(session ? 'You are invited to schedule' : 'You are invited to complete')
  }

  if (t.kind === 'pay') {
    if (study.status !== 'in_process') return
    // Workflow 46: the client has approved the payout list; the reward is released.
    store.dispatch({ type: 'PAY_STUDY', id: t.id })
    store.notify({
      kind: 'money',
      title: `You've received $${study.reward}!`,
      body: `The client approved the payout list. Your reward for ${study.title} is in your wallet.`,
      to: '/wallet',
    })
    store.toast(`Paid $${study.reward}, +25 points, +1 Trust Score`)
  }
}

/**
 * Arms a timer for every pending transition in the store. Because the list
 * is persisted with the rest of the state, a transition survives a reload:
 * on mount it is re-armed for whatever time is left.
 */
export function usePendingTransitions(state: AppState, store: Store) {
  const latest = useRef(store)
  latest.current = store
  const armed = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  useEffect(() => {
    const keys = new Set(state.pending.map((t) => `${t.kind}:${t.id}`))
    for (const t of state.pending) {
      const key = `${t.kind}:${t.id}`
      if (armed.current.has(key)) continue
      const timer = setTimeout(() => {
        armed.current.delete(key)
        fire(t, latest.current)
      }, Math.max(0, t.dueAt - Date.now()))
      armed.current.set(key, timer)
    }
    for (const [key, timer] of armed.current) {
      if (!keys.has(key)) { clearTimeout(timer); armed.current.delete(key) }
    }
  }, [state.pending])

  useEffect(() => {
    const map = armed.current
    return () => map.forEach(clearTimeout)
  }, [])
}
