import { dispatch } from './toast-store'

export const TOAST_LIMIT = 1
export const TOAST_REMOVE_DELAY = 1000000

export const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

let count = 0

export function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

export const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}