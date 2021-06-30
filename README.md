# React Conditional Hook

Reduce the complexity of conditional rendering.

```jsx
const teardownFn = useCallback(() => {
  // ...
}, [])

const handleCondition = useCallback(() => {
  // ...
  return teardownFn
})

const conditional = useConditional([
  useCondition(
    { done: ['action1'], undone: ['action2'] },
    handleCondition
  )
])

conditional.doAction('action1'); // `handleCondition` will be executed
conditional.doAction('action2'); // `teardownFn` will be executed
```

## Example

https://codesandbox.io/s/useconditional-rwbgb
