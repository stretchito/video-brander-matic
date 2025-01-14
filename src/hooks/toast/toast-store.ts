import { State, Action } from './toast-types'
import { reducer } from './toast-reducer'

const listeners: Array<(state: State) => void> = []

export let memoryState: State = { toasts: [] }

export function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

export function subscribe(listener: (state: State) => void) {
  listeners.push(listener)
  return () => {
    const index = listeners.indexOf(listener)
    if (index > -1) {
      listeners.splice(index, 1)
    }
  }
}