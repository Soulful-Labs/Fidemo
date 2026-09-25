import { useSession } from './session'

/**
 * The seeded lists belong to the demo account.
 *
 * Everything the frames were drawn around — the panels, the tickets, the
 * notifications, the saved cards, the reviews — is that one account's data.
 * A client who signs up starts with none of it, which is what makes the empty
 * states real rather than routes nobody can reach.
 *
 * The participant pool itself is *not* seeded data: it is the platform's, and
 * every client sees it. So are the featured public panels.
 */
export function useSeeded<T>(rows: T[]): T[] {
  const { account } = useSession()
  return account?.seeded ? rows : []
}

/** True when the signed-in account is the populated demo one. */
export function useIsSeeded() {
  const { account } = useSession()
  return Boolean(account?.seeded)
}
