export type ICondition<ActionType> =
  | {
      done: ActionType[]
      undone?: ActionType[]
    }
  | {
      done?: ActionType[]
      undone: ActionType[]
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
