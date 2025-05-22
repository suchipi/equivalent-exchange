# print (exported function)

Converts an AST back into a code string.

This function is used internally by `transmute`.

The options parameter works the same as the options parameter for `transmute`.

```ts
declare function print(
  ast: types.Node,
  options?: PrintOptions,
): TransmuteResult;
```
