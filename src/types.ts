export type Conditional<T> = {
  doAction: (action: T) => void
  undoAction: (action: T) => void
  clearActions: () => void
  setActions: (actions: T[]) => void
  verifyCondition: (when: When<T>) => boolean
}
export type When<ActionType> =
  | {
      done: ActionType[]
      undone?: ActionType[]
    }
  | {
      done?: ActionType[]
      undone: ActionType[]
    }
  | null
export type TeardownFn = () => unknown
export type HandlerFn = () => TeardownFn | void
export type Condition<T> = {
  verifyAndPerform: (actions: T[]) => void
}
