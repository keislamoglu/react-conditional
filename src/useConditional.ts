import { useCallback, useEffect, useRef } from 'react'
import { ConditionalApi, ConditionalWhen, Conditional, ConditionalTeardownFn } from './types'
import { compareArrays } from './utils'

export const useConditional = <ActionType>(): [
  (conditional: Conditional<ActionType>) => void,
  ConditionalApi<ActionType>
] => {
  type ApiType = ConditionalApi<ActionType>
  type ConditionalType = Conditional<ActionType>
  type ConditionalWithTeardownType = ConditionalType & {
    performed: boolean
    teardown?: ConditionalTeardownFn | void
  }
  type ConditionType = ConditionalWhen<ActionType>

  const performedActions = useRef<Set<ActionType>>(new Set())
  const conditionals = useRef<ConditionalWithTeardownType[]>([])

  const compareConditions = useCallback((cond1: Exclude<ConditionType, null>, cond2: Exclude<ConditionType, null>) => {
    const props: Array<keyof typeof cond1> = ['done', 'undone']

    return props.every((prop) => {
      const isConditionsConsistent = !(
        (Array.isArray(cond1[prop]) && cond2[prop] == null) ||
        (Array.isArray(cond2[prop]) && cond1[prop] == null)
      )

      return (
        isConditionsConsistent &&
        (cond1[prop] == null || compareArrays(cond1[prop] as ActionType[], cond2[prop] as ActionType[]))
      )
    })
  }, [])

  const validateActions: ApiType['validateActions'] = useCallback((actions: ActionType[]) => {
    return actions.every((action) => performedActions.current.has(action))
  }, [])

  const checkCondition = useCallback(
    (when: ConditionType) => {
      return (
        when === null ||
        [
          when.done ? validateActions(when.done) : true,
          when.undone ? !when.undone.some((action) => validateActions([action])) : true,
        ].every(Boolean)
      )
    },
    [validateActions]
  )

  const shouldConditionalPerform = useCallback(
    (conditional: ConditionalWithTeardownType) => {
      const isConditionFulfilled = checkCondition(conditional.when)

      if (isConditionFulfilled) {
        if (!conditional.performed) {
          conditional.teardown = conditional.perform()
          conditional.performed = true
        }
      } else if (conditional.performed) {
        conditional.performed = false
        if (conditional.teardown) conditional.teardown()
      }
    },
    [checkCondition]
  )

  const shouldConditionalsPerform = useCallback(() => {
    conditionals.current.forEach(shouldConditionalPerform)
  }, [shouldConditionalPerform])

  const updateActionSet = useCallback(
    (setterCallback: (set: Set<ActionType>) => Set<ActionType>) => {
      performedActions.current = setterCallback(new Set(performedActions.current))
      shouldConditionalsPerform()
    },
    [shouldConditionalsPerform]
  )

  const doAction: ApiType['doAction'] = useCallback(
    (action: ActionType) => {
      updateActionSet((actionSet) => {
        actionSet.add(action)
        return actionSet
      })
    },
    [updateActionSet]
  )

  const undoAction: ApiType['undoAction'] = useCallback(
    (action: ActionType) => {
      updateActionSet((actionSet) => {
        actionSet.delete(action)
        return actionSet
      })
    },
    [updateActionSet]
  )

  const setActions: ApiType['setActions'] = useCallback(
    (actions: ActionType[]) => {
      updateActionSet((actionSet) => {
        actionSet.clear()
        actions.forEach((action) => actionSet.add(action))
        return actionSet
      })
    },
    [updateActionSet]
  )

  const clearActions: ApiType['clearActions'] = useCallback(() => {
    updateActionSet((actionSet) => {
      actionSet.clear()
      return actionSet
    })
  }, [updateActionSet])

  const updateCondition = useCallback(
    (name: string, when: ConditionType) => {
      const conditional = conditionals.current.find(({ name: _name }) => name === _name)

      if (conditional) {
        const hasNullDifference = [conditional.when, when].includes(null) && conditional.when !== when
        const hasNonNullDifference =
          conditional.when != null && when != null && !compareConditions(conditional.when, when)

        if (hasNullDifference || hasNonNullDifference) {
          conditional.when = when
          shouldConditionalPerform(conditional)
        }
      }
    },
    [shouldConditionalPerform, compareConditions]
  )

  const defineConditional = useCallback(
    (conditional: ConditionalType) => {
      let existingConditional: ConditionalWithTeardownType | undefined

      if (conditional.name) {
        existingConditional = conditionals.current.find(({ name }) => conditional.name === name)
        existingConditional != null && updateCondition(conditional.name, conditional.when)
      }

      if (!existingConditional && conditional.when != null) {
        existingConditional = conditionals.current.find(
          ({ name, when }) =>
            !name &&
            when != null &&
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            compareConditions(when, conditional.when!)
        )
      }

      if (existingConditional) {
        if (conditional.perform !== existingConditional.perform) {
          if (existingConditional.performed) {
            existingConditional.teardown && existingConditional.teardown()
            existingConditional.performed = false
          }

          existingConditional.perform = conditional.perform
          shouldConditionalPerform(existingConditional)
        }
      } else {
        const conditionalWithTeardown = {
          ...conditional,
          performed: false,
        }
        conditionals.current.push(conditionalWithTeardown)
        shouldConditionalPerform(conditionalWithTeardown)
      }
    },
    [shouldConditionalPerform, compareConditions, updateCondition]
  )

  useEffect(() => {
    shouldConditionalsPerform()
  }, [shouldConditionalsPerform])

  return [
    defineConditional,
    {
      doAction,
      undoAction,
      setActions,
      clearActions,
      validateActions,
      checkCondition,
    },
  ]
}
