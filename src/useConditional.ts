import { useCallback, useEffect, useState } from 'react'
import { ConditionalApi, ICondition, IConditional, TeardownType } from './types'
import { compareArrays } from './utils'

export const useConditional = <ActionType>(): [
  (conditional: IConditional<ActionType>) => void,
  ConditionalApi<ActionType>
] => {
  type ApiType = ConditionalApi<ActionType>
  type ConditionalType = IConditional<ActionType>
  type ConditionalWithTeardownType = ConditionalType & {
    performed: boolean
    teardown?: TeardownType | void
  }
  type ConditionType = ICondition<ActionType>

  const [performedActions, setPerformedActions] = useState<Set<ActionType>>(new Set())
  const [conditionals, setConditionals] = useState<ConditionalWithTeardownType[]>([])

  const compareConditions = useCallback((cond1: Exclude<ConditionType, null>, cond2: Exclude<ConditionType, null>) => {
    const props: Array<keyof typeof cond1> = ['done', 'undone']

    return props.every((prop) => {
      const isConditionsConsistent = !(
        (Array.isArray(cond1[prop]) && cond2[prop] == null) ||
        (Array.isArray(cond2[prop]) && cond1[prop] == null)
      )

      return isConditionsConsistent && compareArrays(cond1[prop] as ActionType[], cond2[prop] as ActionType[])
    })
  }, [])

  const updateActionSet = useCallback((setterCallback: (set: Set<ActionType>) => Set<ActionType>) => {
    setPerformedActions((prevPerformedActions: Set<ActionType>) => setterCallback(new Set(prevPerformedActions)))
  }, [])

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

  const isActionsDone: ApiType['isActionsDone'] = useCallback(
    (actions: ActionType[]) => {
      return actions.every((action) => performedActions.has(action))
    },
    [performedActions]
  )

  const checkCondition = useCallback(
    (when: ConditionType) => {
      return (
        when === null ||
        [
          when.done ? isActionsDone(when.done) : true,
          when.undone ? !when.undone.some((action) => isActionsDone([action])) : true,
        ].every(Boolean)
      )
    },
    [isActionsDone]
  )

  const detectChanges = useCallback(() => {
    conditionals.forEach((conditional) => {
      const isConditionFulfilled = checkCondition(conditional.when)

      if (isConditionFulfilled) {
        conditional.teardown = conditional.perform()
        conditional.performed = true
      } else if (conditional.performed) {
        conditional.performed = false
        if (conditional.teardown) conditional.teardown()
      }
    })
  }, [checkCondition, conditionals])

  const updateCondition = useCallback(
    (name: string, when: ConditionType) => {
      const conditional = conditionals.find(({ name: _name }) => name === _name)
      if (conditional) conditional.when = when
      detectChanges()
    },
    [conditionals, detectChanges]
  )

  const defineConditional = useCallback(
    (conditional: ConditionalType) => {
      const _conditionals = conditionals
      let existingConditional: ConditionalWithTeardownType | undefined

      if (conditional.name) {
        existingConditional = _conditionals.find(({ name }) => conditional.name === name)
        existingConditional != null && updateCondition(conditional.name, conditional.when)
      }

      if (!existingConditional && conditional.when != null) {
        existingConditional = _conditionals.find(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          ({ name, when }) => !name && when != null && compareConditions(when, conditional.when!)
        )
      }

      if (existingConditional) {
        existingConditional.perform = conditional.perform
        existingConditional.performed = false
      } else {
        _conditionals.push({
          ...conditional,
          performed: false,
        })
      }

      setConditionals(_conditionals)
      detectChanges()
    },
    [detectChanges, compareConditions, conditionals, updateCondition]
  )

  useEffect(() => {
    detectChanges()
  }, [detectChanges])

  return [
    defineConditional,
    {
      doAction,
      undoAction,
      setActions,
      clearActions,
      isActionsDone,
      checkCondition,
      updateCondition,
    },
  ]
}
