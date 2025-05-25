# print (exported function)

Converts an AST back into a code string.

This function is used internally by [transmute](/api/index.md#transmute-exported-function).

The options parameter is the same type as the options parameter for `transmute`.

```ts
declare function print(ast: types.Node, options?: Options): Result;
```
