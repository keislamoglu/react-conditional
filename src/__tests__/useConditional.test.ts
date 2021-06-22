import { useConditional } from '../index'
import { act, renderHook } from '@testing-library/react-hooks'
import { ConditionalApi, ICondition, IConditional } from '../types'

describe('useConditional', () => {
  enum Action {
    Action1,
    Action2,
  }

  let defineConditional: (conditional: IConditional<Action>) => void, conditionalApi: ConditionalApi<Action>

  beforeEach(() => {
    const { result } = renderHook(() => useConditional<Action>())

    ;[defineConditional, conditionalApi] = result.current
  })

  it('should call `perform` callback when the condition is fulfilled', () => {
    const mockCallback = jest.fn()
    const condition: ICondition<Action> = {
      done: [Action.Action1, Action.Action2],
    }

    defineConditional({
      when: condition,
      perform: mockCallback,
    })

    act(() => {
      conditionalApi.doAction(Action.Action1)
      conditionalApi.doAction(Action.Action2)
    })

    expect(mockCallback).toHaveBeenCalledTimes(1)
  })

  it('should call teardown function after the condition is not valid once it is valid.', () => {
    const mockTeardownCallback = jest.fn()
    const mockCallback = jest.fn(() => mockTeardownCallback)
    const condition: ICondition<Action> = {
      done: [Action.Action1, Action.Action2],
    }

    defineConditional({
      when: condition,
      perform: mockCallback,
    })

    act(() => {
      conditionalApi.doAction(Action.Action1)
      conditionalApi.doAction(Action.Action2)
    })

    expect(mockCallback).toHaveBeenCalledTimes(1)

    act(() => {
      conditionalApi.undoAction(Action.Action1)
    })

    expect(mockTeardownCallback).toHaveBeenCalledTimes(1)
  })

  it('should update the existing condition when it is redefined', () => {
    const mockCallback1 = jest.fn()
    const mockCallback2 = jest.fn()
    const condition: ICondition<Action> = {
      done: [Action.Action1],
    }

    defineConditional({
      when: condition,
      perform: mockCallback1,
    })
    defineConditional({
      when: condition,
      perform: mockCallback2,
    })

    act(() => {
      conditionalApi.doAction(Action.Action1)
      conditionalApi.doAction(Action.Action2)
    })

    expect(mockCallback1).not.toHaveBeenCalled()
    expect(mockCallback2).toHaveBeenCalledTimes(1)
  })

  test('setActions', () => {
    const mockCallback = jest.fn()
    const condition: ICondition<Action> = {
      done: [Action.Action1, Action.Action2],
    }

    defineConditional({
      when: condition,
      perform: mockCallback,
    })

    act(() => {
      conditionalApi.setActions(condition.done)
    })

    expect(mockCallback).toHaveBeenCalledTimes(1)
  })
})
