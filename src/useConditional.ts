import { Condition, Conditional, When } from './types'
import { useCallback, useEffect, useRef } from 'react'

export const useConditional = <T>(conditions: Condition<T>[]): Conditional<T> => {
  const actions = useRef<Set<T>>(new Set())

  const verifyAndPerformConditions = useCallback(() => {
    const _actions = Array.from(actions.current)

    conditions.forEach((condition) => {
      condition.verifyAndPerform(_actions)
    })
  }, [conditions])

  const doAction = useCallback(
    (action: T) => {
      actions.current.add(action)
      verifyAndPerformConditions()
    },
    [verifyAndPerformConditions]
  )

  const undoAction = useCallback(
    (action: T) => {
      actions.current.delete(action)
      verifyAndPerformConditions()
    },
    [verifyAndPerformConditions]
  )

  const clearActions = useCallback(() => {
    actions.current.clear()
    verifyAndPerformConditions()
  }, [verifyAndPerformConditions])

  const setActions = useCallback(
    (_actions: T[]) => {
      actions.current.clear()
      _actions.forEach((action) => actions.current.add(action))
      verifyAndPerformConditions()
    },
    [verifyAndPerformConditions]
  )

  const verifyCondition = useCallback((when: When<T>) => {
    return when != null
      ? [
          !when.done || when.done.every((actionShouldDone) => actions.current.has(actionShouldDone)),
          !when.undone || !when.undone.some((actionShouldUndone) => actions.current.has(actionShouldUndone)),
        ].every(Boolean)
      : true
  }, [])

  useEffect(() => {
    verifyAndPerformConditions()
  }, [verifyAndPerformConditions])

  return {
    doAction,
    undoAction,
    clearActions,
    setActions,
    verifyCondition,
  }
}
