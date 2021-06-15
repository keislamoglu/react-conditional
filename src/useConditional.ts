import { useCallback, useEffect, useState } from 'react'

export type ICondition<ActionType> =
  | {
      done: ActionType[]
      notDone?: ActionType[]
    }
  | {
      done?: ActionType[]
      notDone: ActionType[]
    }
  | null
export type TeardownType = () => void

export interface IConditional<ActionType> {
  name?: string
  when: ICondition<ActionType>
  perform: () => TeardownType | void
}

export interface ConditionalApi<ActionType> {
  doAction: (action: ActionType) => void
  undoAction: (action: ActionType) => void
  setActions: (actions: ActionType[]) => void
  clearActions: () => void
  isActionsDone: (actions: ActionType[]) => boolean
  checkCondition: (when: ICondition<ActionType>) => boolean
  updateCondition: (name: string, when: ICondition<ActionType>) => void
}

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

  const updateActionSet = useCallback(
    (callback: (set: Set<ActionType>) => void) => {
      const set = new Set(performedActions)
      callback(set)
      setPerformedActions(set)
    },
    [performedActions]
  )

  const doAction: ApiType['doAction'] = useCallback(
    (action: ActionType) => {
      updateActionSet((set) => set.add(action))
    },
    [updateActionSet]
  )

  const undoAction: ApiType['undoAction'] = useCallback(
    (action: ActionType) => {
      updateActionSet((set) => set.delete(action))
    },
    [updateActionSet]
  )

  const setActions: ApiType['setActions'] = useCallback(
    (actions: ActionType[]) => {
      updateActionSet((set) => {
        set.clear()
        actions.forEach((action) => set.add(action))
      })
    },
    [updateActionSet]
  )

  const clearActions: ApiType['clearActions'] = useCallback(() => {
    updateActionSet((set) => {
      set.clear()
    })
  }, [updateActionSet])

  const isActionsDone: ApiType['isActionsDone'] = useCallback(
    (actions: ActionType[]) => {
      return actions.every((action) => performedActions.has(action))
    },
    [performedActions]
  )

  const defineConditional = useCallback(
    (conditional: ConditionalType) => {
      const _conditionals = conditionals
      _conditionals.push({
        ...conditional,
        performed: false,
      })
      setConditionals(_conditionals)
    },
    [conditionals]
  )

  const checkCondition = useCallback(
    (when: ConditionType) => {
      return (
        when === null ||
        [
          when.done ? isActionsDone(when.done) : true,
          when.notDone ? !when.notDone.some((action) => isActionsDone([action])) : true,
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
