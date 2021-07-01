import { Condition, Conditional, When } from './types'
import { useCallback, useEffect, useState } from 'react'

export const useConditional = <T>(conditions: Condition<T>[]): Conditional<T> => {
  const [actions, _setActions] = useState<Set<T>>(new Set())

  const verifyAndPerformConditions = useCallback(() => {
    const _actions = Array.from(actions)

    conditions.forEach((condition) => {
      condition.verifyAndPerform(_actions)
    })
  }, [actions, conditions])

  const doAction = useCallback((action: T) => {
    _setActions((actions) => {
      if (actions.has(action)) {
        return actions
      }

      actions.add(action)
      return new Set(actions)
    })
  }, [])

  const undoAction = useCallback((action: T) => {
    _setActions((actions) => {
      if (!actions.has(action)) {
        return actions
      }

      actions.delete(action)
      return new Set(actions)
    })
  }, [])

  const clearActions = useCallback(() => {
    _setActions((actions) => {
      if (actions.size === 0) {
        return actions
      }

      actions.clear()
      return new Set(actions)
    })
  }, [])

  const setActions = useCallback((_actions: T[]) => {
    _setActions((actions) => {
      if (_actions.length === actions.size && _actions.every((action) => actions.has(action))) {
        return actions
      }

      actions.clear()
      _actions.forEach((action) => actions.add(action))
      return new Set(actions)
    })
  }, [])

  const verifyCondition = useCallback(
    (when: When<T>) => {
      return (
        when == null ||
        [
          !when.done || when.done.every((actionShouldDone) => actions.has(actionShouldDone)),
          !when.undone || !when.undone.some((actionShouldUndone) => actions.has(actionShouldUndone)),
        ].every(Boolean)
      )
    },
    [actions]
  )

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
