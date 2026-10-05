import { useStore } from '../../mock/store'

/** Scopes a last-seen key (lib/seen.ts) to the signed-in account. */
export function useSeenKey(name: string | undefined): string | undefined {
  const { user } = useStore()
  return name ? `${user.email}:${name}` : undefined
}
