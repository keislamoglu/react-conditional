export type ConditionalWhen<ActionType> =
  | {
      done: ActionType[]
      undone?: ActionType[]
    }
  | {
      done?: ActionType[]
      undone: ActionType[]
    }
  | null
export type ConditionalTeardownFn = () => void
export type ConditionalHandlerFn = () => ConditionalTeardownFn | void

export interface Conditional<ActionType> {
  name?: string
  when: ConditionalWhen<ActionType>
  perform: ConditionalHandlerFn
}

export interface ConditionalApi<ActionType> {
  doAction: (action: ActionType) => void
  undoAction: (action: ActionType) => void
  setActions: (actions: ActionType[]) => void
  clearActions: () => void
  validateActions: (actions: ActionType[]) => boolean
  checkCondition: (when: ConditionalWhen<ActionType>) => boolean
}
