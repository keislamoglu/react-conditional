# React Conditional Hook

Reduce the complexity of conditional rendering.

## Install
Either `npm` or `yarn` can be used to install the dependency: 
```
npm install @keislamoglu/react-conditional
```

or

```
yarn add @keislamoglu/react-conditional
```

## Usage

```jsx
import { useCondition, useConditional } from '@keislamoglu/react-conditional'

const teardownFn = useCallback(() => {
  // ...
}, [])

const handleCondition = useCallback(() => {
  // ...
  return teardownFn
}, [teardownFn])

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
