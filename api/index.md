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

# AST (exported binding)

See [AST](/api/ee-types.md#ast-exported-type).

```ts
export { AST };
```

# TransmuteOptions (exported binding)

See [TransmuteOptions](/api/ee-types.md#transmuteoptions-exported-type).

```ts
export { TransmuteOptions };
```

# ParseOptions (exported binding)

See [ParseOptions](/api/ee-types.md#parseoptions-exported-type).

```ts
export { ParseOptions };
```

# PrintOptions (exported binding)

See [PrintOptions](/api/ee-types.md#printoptions-exported-type).

```ts
export { PrintOptions };
```

# TransmuteResult (exported binding)

See [TransmuteResult](/api/ee-types.md#transmuteresult-exported-type).

```ts
export { TransmuteResult };
```

# parse (exported function)

The function `parser.parse` is re-exported as the named export 'parse' for use with AST
tooling that lets you specify a parser module.

```ts
const parse: (source: string, options?: ParseOptions) => any;
```

# print (exported value)

The function `printer.print` is re-exported as the named export 'print' for use with AST
tooling that lets you specify a printer module.

```ts
const print: typeof printer.print;
```

# CodeToAst (interface)

The various call signatures of the [codeToAst](/api/index.md#codetoast-exported-codetoast) function.

```ts
interface CodeToAst {
  (code: string): AST;
  (
    code: string,
    options: TransmuteOptions & {
      expression: true;
    },
  ): types.Node;
  (
    code: string,
    options: TransmuteOptions & {
      expression: false;
    },
  ): AST;
  (
    code: string,
    options: TransmuteOptions & {
      expression: boolean;
    },
  ): types.Node;
  (code: string, options: TransmuteOptions): AST;
}
```

## CodeToAst(...) (call signature)

```ts
(code: string): AST;
```

## CodeToAst(...) (call signature)

```ts
(code: string, options: TransmuteOptions & {
  expression: true;
}): types.Node;
```

## CodeToAst(...) (call signature)

```ts
(code: string, options: TransmuteOptions & {
  expression: false;
}): AST;
```

## CodeToAst(...) (call signature)

```ts
(code: string, options: TransmuteOptions & {
  expression: boolean;
}): types.Node;
```

## CodeToAst(...) (call signature)

```ts
(code: string, options: TransmuteOptions): AST;
```

# codeToAst (exported CodeToAst)

Parses a JavaScript/TypeScript code string into an AST.

This function is used internally by `transmute`.

The options parameter works the same as the options parameter for `transmute`.

```ts
const codeToAst: CodeToAst;
```

# astToCode (exported function)

Converts an AST back into a code string.

This function is used internally by `transmute`.

The options parameter works the same as the options parameter for `transmute`.

```ts
declare function astToCode(
  ast: types.Node,
  options?: TransmuteOptions,
): TransmuteResult;
```

# Clonable (type)

Union of all types supported by the [clone](/api/index.md#clone-exported-function) function.

```ts
type Clonable =
  | {}
  | number
  | string
  | null
  | undefined
  | boolean
  | Array<Clonable>;
```

# clone (exported function)

Deeply-clone the provided object or value. Primitive values are returned
as-is.

This can be useful when you need to clone an AST node.

```ts
declare function clone<T extends Clonable>(input: T): T;
```

# hasShape (exported function)

Function which checks whether `input` is a structural subset of `shape`.

This can be useful when you need to check if an AST node has a set of properties.

```ts
declare function hasShape<Input, Shape>(
  input: Input,
  shape: Shape,
): input is Input & Shape;
```

# Transmute (exported interface)

The interface of the `transmute` function, which has 4 different call signatures.

```ts
interface Transmute {
  (
    code: string,
    transform: (ast: AST) => Promise<void>,
  ): Promise<TransmuteResult>;
  (
    code: string,
    options: TransmuteOptions,
    transform: (ast: types.Node) => Promise<void>,
  ): Promise<TransmuteResult>;
  (code: string, transform: (ast: AST) => void): TransmuteResult;
  (
    code: string,
    options: TransmuteOptions,
    transform: (ast: types.Node) => void,
  ): TransmuteResult;
}
```

## Transmute(...) (call signature)

Parses `code` into an AST, then passes that to `transform`, which
is expected to mutate the AST somehow.

Once the Promise returned by `transform` has resolved, it converts
the AST back into a string, and returns you a `TransmuteResult`,
which has the transformed string on it as its `code` property.

```ts
(code: string, transform: (ast: AST) => Promise<void>): Promise<TransmuteResult>;
```

## Transmute(...) (call signature)

Parses `code` into an AST, then passes that to `transform`, which
is expected to mutate the AST somehow.

Once the Promise returned by `transform` has resolved, it converts
the AST back into a string, and returns you a `TransmuteResult`,
which has the transformed string on it as its `code` property.

The contents of `options` will determine what syntax options to use
to parse the code, and whether to consume/generate source maps.
See the definition for `TransmuteOptions` for more details.

```ts
(code: string, options: TransmuteOptions, transform: (ast: types.Node) => Promise<void>): Promise<TransmuteResult>;
```

## Transmute(...) (call signature)

Parses `code` into an AST, then passes that to `transform`, which
is expected to mutate the AST somehow.

Then, it converts the AST back into a string, and returns you a
`TransmuteResult`, which has the transformed string on it as its
`code` property.

```ts
(code: string, transform: (ast: AST) => void): TransmuteResult;
```

## Transmute(...) (call signature)

Parses `code` into an AST, then passes that to `transform`, which
is expected to mutate the AST somehow.

Then, it converts the AST back into a string, and returns you a
`TransmuteResult`, which has the transformed string on it as its
`code` property.

The contents of `options` will determine what syntax options to use
to parse the code, and whether to consume/generate source maps.
See the definition for `TransmuteOptions` for more details.

```ts
(code: string, options: TransmuteOptions, transform: (ast: types.Node) => void): TransmuteResult;
```

# transmute (exported Transmute)

See [Transmute](/api/index.md#transmute-exported-interface).

```ts
const transmute: Transmute;
```
