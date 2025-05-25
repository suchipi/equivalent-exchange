# transmute (exported Transmute)

The transmute function; star of the library. See [Transmute](/api/index.md#transmute-exported-interface).

```ts
const transmute: Transmute;
```

# Transmute (exported interface)

The interface of the `transmute` function, which has 4 different call signatures.

```ts
interface Transmute {
  (code: string, transform: (ast: AST) => Promise<void>): Promise<Result>;
  (
    code: string,
    options: Options,
    transform: (ast: types.Node) => Promise<void>,
  ): Promise<Result>;
  (code: string, transform: (ast: AST) => void): Result;
  (
    code: string,
    options: Options,
    transform: (ast: types.Node) => void,
  ): Result;
}
```

## Transmute(...) (call signature)

Parses `code` into an AST, then passes that to `transform`, which is
expected to mutate the AST somehow.

Once the Promise returned by `transform` has resolved, it converts the AST
back into a string, and returns you a [Result](/api/ee-types.md#result-exported-type), which has
the transformed string on it as its `code` property.

```ts
(code: string, transform: (ast: AST) => Promise<void>): Promise<Result>;
```

## Transmute(...) (call signature)

Parses `code` into an AST, then passes that to `transform`, which is
expected to mutate the AST somehow.

Once the Promise returned by `transform` has resolved, it converts the AST
back into a string, and returns you a [Result](/api/ee-types.md#result-exported-type), which has
the transformed string on it as its `code` property.

The contents of `options` will determine what syntax options to use to
parse the code, and whether to consume/generate source maps. See
[Options](/api/ee-types.md#options-exported-type) for more details.

```ts
(code: string, options: Options, transform: (ast: types.Node) => Promise<void>): Promise<Result>;
```

## Transmute(...) (call signature)

Parses `code` into an AST, then passes that to `transform`, which
is expected to mutate the AST somehow.

Then, it converts the AST back into a string, and returns you a
[Result](/api/ee-types.md#result-exported-type), which has the transformed string on it as its
`code` property.

```ts
(code: string, transform: (ast: AST) => void): Result;
```

## Transmute(...) (call signature)

Parses `code` into an AST, then passes that to `transform`, which is
expected to mutate the AST somehow.

Then, it converts the AST back into a string, and returns you a
[Result](/api/ee-types.md#result-exported-type), which has the transformed string on it as its
`code` property.

The contents of `options` will determine what syntax options to use to
parse the code, and whether to consume/generate source maps. See
[Options](/api/ee-types.md#options-exported-type) for more details.

```ts
(code: string, options: Options, transform: (ast: types.Node) => void): Result;
```

# parse (exported binding)

Parser (code-to-AST) function used by `transmute`. See [parse](/api/parser.md#parse-exported-function).

```ts
export { parse };
```

# Parse (exported binding)

Type of the `parse` function. See [Parse](/api/parser.md#parse-exported-interface).

```ts
export { Parse };
```

# print (exported binding)

Printer (AST-to-code) function used by `transmute`. See [print](/api/printer.md#print-exported-function).

```ts
export { print };
```

# traverse (exported binding)

Re-export of `@babel/traverse`'s default export.

```ts
export { traverse };
```

# types (exported binding)

Contains the named exports of both `@babel/types` and `@babel/traverse`.

```ts
export { types };
```

# template (exported binding)

Re-export of `@babel/template`'s default export.

```ts
export { template };
```

# AST (exported type)

Type returned by [parse](/api/parser.md#parse-exported-function). See [AST](/api/ee-types.md#ast-exported-type).

```ts
export { type AST };
```

# Options (exported type)

Type used by [transmute](/api/index.md#transmute-exported-function), [parse](/api/parser.md#parse-exported-function), and [print](/api/printer.md#print-exported-function). See
[Options](/api/ee-types.md#options-exported-type).

```ts
export { type Options };
```

# Result (exported type)

Type returned by [print](/api/printer.md#print-exported-function). See [Result](/api/ee-types.md#result-exported-type).

```ts
export { type Result };
```

# clone (exported binding)

AST node cloner utility function. See [clone](/api/utils.md#clone-exported-function).

```ts
export { clone };
```

# hasShape (exported binding)

Deep object property comparison checker utility function. See
[hasShape](/api/utils.md#hasshape-exported-function).

```ts
export { hasShape };
```
