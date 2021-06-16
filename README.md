# React Conditional Hook

Reduce the complexity of conditional rendering.


```jsx
const [define, cond] = useConditional();

useEffect(() => {
    define({
        when: {
            done: ['action1'],
            undone: ['action2']
        },
        perform: () => {
            handleCondition();
            
            return () => teardownFn();
        }
    })
}, []);

cond.doAction('action1'); // `handleCondition` will be executed
cond.doAction('action2'); // `teardownFn` will be executed
```

## Example

https://codesandbox.io/s/useconditional-rwbgb
