# Parse (exported interface)

The various call signatures of the [parse](/api/index.md#parse-exported-function) function. When option
`parseOptions.expression` is true, it returns a `types.Node`, but when it
isn't, it returns an `AST`, which is an alias for `types.File`.

```ts
interface Parse {
  (code: string): AST;
  (
    code: string,
    options: Options & {
      parseOptions: {
        expression: true;
      };
    },
  ): types.Node;
  (
    code: string,
    options: Options & {
      parseOptions: {
        expression: false;
      };
    },
  ): AST;
  (
    code: string,
    options: Options & {
      parseOptions: {
        expression: boolean;
      };
    },
  ): types.Node;
  (code: string, options: Options): AST;
}
```

## Parse(...) (call signature)

```ts
(code: string): AST;
```

## Parse(...) (call signature)

```ts
(code: string, options: Options & {
  parseOptions: {
    expression: true;
  };
}): types.Node;
```

## Parse(...) (call signature)

```ts
(code: string, options: Options & {
  parseOptions: {
    expression: false;
  };
}): AST;
```

## Parse(...) (call signature)

```ts
(code: string, options: Options & {
  parseOptions: {
    expression: boolean;
  };
}): types.Node;
```

## Parse(...) (call signature)

```ts
(code: string, options: Options): AST;
```

# parse (exported Parse)

Parses a JavaScript/TypeScript code string into an AST.

This function is used internally by [transmute](/api/index.md#transmute-exported-function).

The options parameter is the same type as the options parameter for `transmute`.

```ts
const parse: Parse;
```
