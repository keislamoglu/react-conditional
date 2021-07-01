import { useCallback, useEffect, useRef } from 'react'
import { Condition, HandlerFn, TeardownFn, When } from './types'

export const useCondition = <T = string>(when: When<T>, handler: HandlerFn): Condition<T> => {
  const performed = useRef<boolean>(false)
  const teardownFn = useRef<TeardownFn | void>()
  const handlerRef = useRef<HandlerFn>(handler)

  const verify = useCallback(
    (actions: T[]) => {
      return when != null
        ? [
            !when.done || when.done.every((actionShouldDone) => actions.includes(actionShouldDone)),
            !when.undone || !when.undone.some((actionShouldUndone) => actions.includes(actionShouldUndone)),
          ].every(Boolean)
        : true
    },
    [when]
  )

  const perform = useCallback(() => {
    if (performed.current) return

    performed.current = true
    return (teardownFn.current = handler())
  }, [handler])

  const revoke = useCallback(() => {
    if (!performed.current) return

    performed.current = false
    teardownFn.current && teardownFn.current()
  }, [])

  const verifyAndPerform = useCallback(
    (actions: T[]) => {
      if (verify(actions)) {
        perform()
      } else {
        revoke()
      }
    },
    [verify, perform, revoke]
  )

  useEffect(() => {
    if (handler !== handlerRef.current) {
      revoke()
      handlerRef.current = handler
    }
  }, [handler, revoke])

  return {
    verifyAndPerform,
  }
}
