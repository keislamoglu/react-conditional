import { useCondition, When } from '../index'
import { renderHook } from '@testing-library/react-hooks'

describe('useCondition', () => {
  enum Action {
    Action1,
    Action2,
  }

  it('should call `perform` callback when the condition is fulfilled', () => {
    const mockCallback = jest.fn()
    const when: When<Action> = {
      done: [Action.Action1],
      undone: [Action.Action2],
    }
    const { result } = renderHook(() => useCondition(when, mockCallback))

    result.current.verifyAndPerform([Action.Action1])

    expect(mockCallback).toHaveBeenCalledTimes(1)

    mockCallback.mockReset()

    result.current.verifyAndPerform([])

    expect(mockCallback).not.toHaveBeenCalled()

    result.current.verifyAndPerform([Action.Action1, Action.Action2])

    expect(mockCallback).not.toHaveBeenCalled()
  })

  it('should call teardown function after the condition is not valid once it is valid.', () => {
    const mockTeardownCallback = jest.fn()
    const mockCallback = jest.fn(() => mockTeardownCallback)
    const when: When<Action> = {
      done: [Action.Action1],
      undone: [Action.Action2],
    }
    const { result } = renderHook(() => useCondition(when, mockCallback))

    result.current.verifyAndPerform([Action.Action1])

    expect(mockCallback).toHaveBeenCalledTimes(1)

    result.current.verifyAndPerform([Action.Action1, Action.Action2])

    expect(mockTeardownCallback).toHaveBeenCalledTimes(1)
  })
})
