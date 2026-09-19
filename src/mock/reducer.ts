import { accountReducer } from './reducers/account'
import { studyReducer } from './reducers/studies'
import type { Action, AppState } from './storeTypes'

/**
 * Composes the domain reducers. Each returns null for actions it does not
 * handle, so the next one gets a turn.
 */
export function reducer(state: AppState, action: Action): AppState {
  return studyReducer(state, action) ?? accountReducer(state, action) ?? state
}
